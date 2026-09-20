---
title: JERRY
description: Windows box with an apache tomcat vuln leading to a NT Authority\SYSTEM shell
date: 2026-09-20T23:13:11.000Z
category: htb
tags:
  - nmap
  - web
  - rce
difficulty: easy
os: windows
---

## Enumeration
Add ip to hosts:
```bash 
echo "10.101.010.10  jerry.htb" | sudo tee -a /etc/hosts
```
make dump dir 
```bash 
mkdir jerry.Info
```
Run an initial Nmap scan:

```bash
nmap -sC -sV -oN nmap/boxname 10.10.10.x
```

### Port XX (Service)

Describe what's running on each interesting port.

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
