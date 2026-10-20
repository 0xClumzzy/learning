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

Run an initial Nmap scan:

```bash
nmap -sC -sV -oN nmap/intel 10.10.10.x
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
