---
title: MANAGEMENT
description: "\n"
date: 2026-09-27T14:48:42.000Z
category: htb
tags:
  - linux
  - windows
  - rce
  - web
  - java-rmi
difficulty: easy
os: linux
---

## Enumeration
add the ip to hosts 
```bash 
echo "<ip> management" | sudo tee -a /etc/hosts 
```
Run an initial Nmap scan:
```bash
nmap -sC -sV -oN nmap/boxname 10.10.10.x
```
---
Open Ports

| Port      | Service       | Notes                                      |
| --------- | ------------- | ------------------------------------------ |
| 22/tcp    | OpenSSH 9.6p1 | Ubuntu 3ubuntu13.19                        |
| 80/tcp    | HTTP (nginx)  | HTTP sever                                 |
| 443/tcp   | HTTPS (nginx) | "Management- Managed IT & Infrastructure"  |
| 1689/tcp  | Java RMI      | JMX stub → org.opends.server.protocols.jmx |
| 4444/tcp  | LDAPS         | CN: sso.management.htb (self-signed)       |
| 46047/tcp | Java RMI      | Dynamic port bound by registry on 1689     |
| 50389/tcp | LDAP          | **Anonymous bind OK**                      |

---
PORT DETAILS
 22 - SSH
- OpenSSH 9.6p1 Ubuntu 3ubuntu13.19
- ECDSA (nistp256) + ED25519 keys
- Low priority until creds/keys are found elsewhere
80 -HTTP
- Redirects to `https://management.htb/`
- Methods: GET HEAD POST OPTIONS
- Nothing here, move to 443
443 - HTTPS
- Title: *Management - Managed IT & Infrastructure*
- Methods: GET HEAD
- Cert CN: `management.htb` · Org: Management Managed Services Ltd
- SAN: `management.htb`, `*.management.htb` → **wildcard, fuzz subdomains**
- Cert validity: 2026-06-02 → 2126-05-09 (self-signed, 100yr)
- RSA 2048-bit, sha256WithRSAEncryption
1689 - Java RMI (JMX)
- Registry stub: `org.opends.server.protocols.jmx.client-unknown`
- RMI stub: `javax.management.remote.rmi.RMIServerImpl_Stub`
- Bound on `127.0.1.1:46047`
- Check for unauthenticated JMX access → remote MBeans → RCE
4444 - LDAPS
- Cert CN: `sso.management.htb` → **add to /etc/hosts**
- Org: Administration Connector RSA Self-Signed Certificate
- Validity: 2026-06-02 → 2046-05-28
- LDAPSearchReq response exposes `ds-root-dse` → confirms OpenDJ
- Enumerate rootDSE for attribute disclosure
46047 - Java RMI (dynamic)
- Actual RMIServer stub endpoint spawned by registry on 1689
- Try `jconsole` or ysoserial if JMX is unauthenticated
50389 -LDAP 
- **Anonymous bind allowed**
- Dump naming contexts first:
```bash
  ldapsearch -x -H ldap://management.htb:50389 -b "" -s base namingContexts
```
- Full tree dump:
```bash
  ldapsearch -x -H ldap://management.htb:50389 -b "dc=management,dc=htb"
```
- Look for: `userPassword`, `uid`, `cn`, `mail` — OpenDJ may expose hashed or cleartext passwords

---

## Discovered Subdomains / Vhosts

| Host | Source | Port |
|------|--------|------|
| `management.htb` | Cert CN / redirect | 443 |
| `*.management.htb` | Cert SAN (wildcard) | 443 |
| `sso.management.htb` | Cert CN on 4444 | 4444 |

---

## High-Value Targets

| Target | Why |
|--------|-----|
| LDAP anon bind (50389) | Passwords / user list
## Foothold

How you got initial access.

### Exploitation

Step-by-step exploitation.

```bash
# Commands here
```

Got a shell as `username`.

## User Flag

```bash
cat /home/username/user.txt
```

## Privilege Escalation

How you escalated to root/admin.

```bash
# Commands here
```

## Root Flag

```bash
cat /root/root.txt
```

## Lessons Learned

1. Key takeaway one
2. Key takeaway two
3. Key takeaway three
