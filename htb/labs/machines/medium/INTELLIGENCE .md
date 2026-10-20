---
title: INTELLIGENCE
description: A windows machine with active directory  with document bruteforcing for username discovery
date: 2026-10-20T01:46:41.000Z
category: htb
tags:
  - windows
  - nmap
  - ad
difficulty: medium
os: windows 
---

## Enumeration

### Port scan
 Nmap scan:

```bash
nmap --min-rate 5000 -sCV -oX nmap/intel 10.10.10.x
```

| Port     | State | Service              | Version / Notes                            |
| -------- | ----- | -------------------- | ------------------------------------------ |
| 53/tcp   | open  | DNS                  | Simple DNS Plus                            |
| 80/tcp   | open  | HTTP                 | Microsoft IIS 10.0 — Title: `Intelligence` |
| 88/tcp   | open  | Kerberos             | Server time: `2026-10-20 07:27:27Z`        |
| 135/tcp  | open  | MSRPC                | Microsoft Windows RPC                      |
| 139/tcp  | open  | NetBIOS-SSN          | Microsoft Windows                          |
| 389/tcp  | open  | LDAP                 | AD LDAP — Domain: `intelligence.htb`       |
| 445/tcp  | open  | SMB                  | microsoft-ds                               |
| 464/tcp  | open  | kpasswd5             | Kerberos password change                   |
| 593/tcp  | open  | RPC over HTTP        | Microsoft Windows RPC/HTTP 1.0             |
| 636/tcp  | open  | LDAPS                | (SSL)                                      |
| 3268/tcp | open  | Global Catalog LDAP  | AD LDAP                                    |
| 3269/tcp | open  | Global Catalog LDAPS | (SSL)                                      |
| 5985/tcp | open  | WinRM                | Microsoft HTTPAPI 2.0 — `Not Found`        |
### Web enumeration 
The web server has 2 pdfs that reflect at time stamp on it, editing the timestamp to a relative one confirms a hit making an assumption of potential users, all hits have a different creator in their metadata that can be viewed with exiftool. 
- A python script to download every iteration of the date from `2019-01-01` → `2019-12-15` saves the pdfs
- Another script searches for buzzwords like password, and we get a hit 
1. Script for  downloads

2. script for password 
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
