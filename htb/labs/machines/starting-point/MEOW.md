---
title: MEOW
description: starting point 1
date: 2026-11-15T20:11:11.000Z
category: htb
tags:
  - windows
  - smb
difficulty: very easy
os: windows
---

## Enumeration

Run an initial Nmap scan:

```bash
nmap -sC -sV -oN nmap/boxname 10.10.10.x
```

### Port 23

Telnet on port 23 
## Foothold

Tested root user, it needed no auth 
```bash 
telnet ip
root
```

