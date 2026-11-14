---
title: SAUNA
description: Sauna is an easy difficulty Windows machine that features Active Directory enumeration and exploitation.
date: 2026-11-14T00:37:35.000Z
category: htb
tags:
  - windows
  - ad
  - AES-REP roasting
  - kerberoasting
difficulty: easy
os: windows
---

## Enumeration

Run an initial Nmap scan:

```bash
sudo rustscan -a 10.129.95.180 --ulimit 5000 -- -sCV -oA sauna.Nmap/sauna
```

### Discoverd ports 
```powershell
Open 10.129.95.180:53
Open 10.129.95.180:88
Open 10.129.95.180:80
Open 10.129.95.180:135
Open 10.129.95.180:139
Open 10.129.95.180:389
Open 10.129.95.180:9389
Open 10.129.95.180:49667
Open 10.129.95.180:49673
Open 10.129.95.180:49674
Open 10.129.95.180:49676
Open 10.129.95.180:49685
Open 10.129.95.180:49692
```

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
