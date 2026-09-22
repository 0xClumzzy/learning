---
title: MONTEVERDE
description: One-line summary of the box and key vulnerability.
date: 2024-01-15
category: htb
tags:
  - tag1
  - tag2
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
