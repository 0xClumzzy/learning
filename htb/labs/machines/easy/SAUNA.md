---
title: SAUNA
description: Sauna is an easy difficulty Windows machine that features Active Directory enumeration and exploitation.
date: 2026-11-14T00:37:35.000Z
category: htb
tags:
  - windows
  - ad
difficulty: easy
os: linux
---

## Enumeration

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
