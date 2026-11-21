---
title: FOREST
description: Forest is an easy Windows machine that showcases a Domain Controller (DC) for a domain in which Exchange Server has been installed
date: 2026-11-17T18:29:22.000Z
category: htb
tags:
  - windows
  - ldap
  - smb
  - ad
difficulty: easy
os: windows
---

## Enumeration
### NMAP scan

**Target:** 10.129.95.210
***COMMAND***
```bash
sudo rustscan -a 10.129.95.210 -- -sCV -oA forest.Nmap/forest
```
##### Open Ports

| Port        | Service            | Version / Notes                                                          |
| ----------- | ------------------ | ------------------------------------------------------------------------ |
| 53          | domain             | Simple DNS Plus                                                          |
| 88          | kerberos-sec       | Microsoft Windows Kerberos (server time 2026-11-17 16:55:37Z)            |
| 135         | msrpc              | Microsoft Windows RPC                                                    |
| 139         | netbios-ssn        | Microsoft Windows netbios-ssn                                            |
| 389         | ldap               | Active Directory LDAP (Domain: htb.local, Site: Default-First-Site-Name) |
| 445         | microsoft-ds       | Windows Server 2016 Standard 14393 (workgroup: HTB)                      |
| 464         | kpasswd5?          | —                                                                        |
| 593         | ncacn_http         | Microsoft Windows RPC over HTTP 1.0                                      |
| 636         | tcpwrapped         | LDAPS (implied)                                                          |
| 3268        | ldap               | AD LDAP Global Catalog (Domain: htb.local)                               |
| 3269        | tcpwrapped         | LDAPS Global Catalog (implied)                                           |
| 5985        | http               | Microsoft HTTPAPI httpd 2.0 — WinRM                                      |
| 9389        | mc-nmf             | .NET Message Framing (AD Web Services)                                   |
| 47001       | http               | Microsoft HTTPAPI httpd 2.0                                              |
| 49664–49700 | msrpc / ncacn_http | Dynamic RPC ports                                                        |

##### Host Script Results

###### OS / SMB Discovery
- **OS:** Windows Server 2016 Standard 14393 (6.3)
- **Computer name:** FOREST
- **NetBIOS name:** FOREST
- **Domain name:** htb.local
- **Forest name:** htb.local
- **FQDN:** FOREST.htb.local
- **System time:** 2026-11-17T08:56:38-08:00

### SMB Security Mode
- SMBv3.1.1: message signing **enabled and required**
- SMBv1: `account_used: guest`, `authentication_level: user`, message signing **required**

### Conficker Check
- Scan initiated, no result captured in output above

## Initial Observations

- Full AD DC fingerprint: Kerberos (88), LDAP/LDAPS (389/636), Global Catalog (3268/3269), SMB (445), WinRM (5985), ADWS (9389) — classic domain controller footprint.
- SMB signing is **required**, ruling out SMB relay attacks.
- WinRM open (5985) — potential lateral movement path once credentials are obtained.
- No anonymous/guest info disclosed yet beyond SMB guest account check — next step: enumerate SMB shares, null-session LDAP queries, and RPC user enumeration (`rpcclient`, `netexec`, `ldapsearch`).

## Next Steps
- [ ] `netexec smb 10.129.95.210 -u '' -p '' --shares`
- [ ] `ldapsearch -x -H ldap://10.129.95.210 -b "dc=htb,dc=local"`
- [ ] RID cycling / user enumeration via `rpcclient` or `netexec --rid-brute`
- [ ] Check for AS-REP roastable accounts with `GetNPUsers.py`


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
