---
title: ATOM
description:  windows machine hosting an electron software with improper signature verification, leading to rce
date: 2026-09-23T22:51:31.000Z
category: htb
tags:
  - windows
  - nmap
  - web
  - rce
difficulty: medium
os: windows
---

## Enumeration

add the IP to hosts 
```bash
echo "ip atom.htb" | sudo tee -a /etc/hosts
```
Run an initial Nmap scan:

```bash
rustscan -a atom.htb -- -sCV
```

### Open ports  (Service)

| port    | service |
| ------- | ------- |
| 80/tcp  | http    |
| 139/tcp |         |


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
