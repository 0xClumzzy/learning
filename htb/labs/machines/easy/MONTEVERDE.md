---
title: MONTEVERDE
description: Azure connect enumeration and exploitation
date: 2026-09-22T07:00:24.000Z
category: htb
tags:
  - HTB
  - windows
  - SAM
  - AD
difficulty: medium
os: windows
---

## Enumeration

Run an initial Nmap scan:

```bash
nmap -sCV --min-rate 5000 10.10.10.10 
```

### Open ports


| port    | service                                            |
| ------- | -------------------------------------------------- |
| 53/tcp  | DNS (SRV records, _services, _dns-sd, _udp, local) |
| 88/tcp  | Kerberos(Authentication)                           |
| 389/tcp | LDAP                                               |


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
