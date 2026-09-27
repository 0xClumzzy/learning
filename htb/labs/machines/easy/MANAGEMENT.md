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
**Open Ports**

| Port      | Service       | Notes                                          |
| --------- | ------------- | ---------------------------------------------- |
| 22/tcp    | OpenSSH 9.6p1 | Ubuntu 3ubuntu13.19                            |
| 80/tcp    | HTTP (nginx)  | HTTP sever                                     |
| 443/tcp   | HTTPS (nginx) | "Management- Managed IT & Infrastructure"      |
| 1689/tcp  | Java RMI      | JMX registry → org.opends.server.protocols.jmx |
| 4444/tcp  | LDAPS         | CN: sso.management.htb (self-signed)           |
| 46047/tcp | Java RMI      | Dynamic port bound by registry on 1689         |
| 50389/tcp | LDAP          | **Anonymous bind OK**                          |

---
**PORT DETAILS**
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
---
NEW PORTS 

**JMX over JAVA RMI**
- Java Management Extensions is a management interface for java apps 
- Remote Method Invocation is how JMX exposes itself to the internet
- REGISTRY(port 1689)- phonebook pointing to MBEAN addresses
- STUB ENDPOINT (port 47047)
If JMX connector has no authentication anyone who can reach the registry can call any MBEAN  onject including `Runtime.exec()`
- MBEAN objects expose attributes(heap size, thread count) and operations
**LDAP**
- A protocol used to communicate with a directory service 
- The `bind` operation authenticates, anonymous bind allowed means we can get access to the DS withouth creds
- The `search` operation can dump users and passowords
- 

---

**Discovered Subdomains / Vhosts** 

| Host                 | Source              | Port |
| -------------------- | ------------------- | ---- |
| `management.htb`     | Cert CN / redirect  | 443  |
| `*.management.htb`   | Cert SAN (wildcard) | 443  |
| `sso.management.htb` | Cert CN on 4444     | 4444 |

---
OpemAM 

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
