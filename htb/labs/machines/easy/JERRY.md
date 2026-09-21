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
mkdir jerry.Info/jerry.Nmap
```
Run an initial Nmap scan:

```bash
nmap --min-rate 5000 -sCXV -oA jerry.Info/jerry.Nmap/ jerry.htb 
```
### Findings 

| port     | service |     |
| -------- | ------- | --- |
| 8080/tcp | http    |     |
The web server is running Apache Tomcat version 7.0.88
it leaks default credentials in the web ui
- user:`tomcat`
- password:`s3cret`
Dicovering file upload capabilities 
Quick google search informs about the *JSP file upload bypass *(`CVE-2017-12617`)
and the server handles JSP files
## Foothold, Exploitation

Metasploit framework 

```bash
search omcat
```

Got a shell as `username`.


## FlagS

```bash
cat /root/root.txt
```

## Lessons Learned

1. Key takeaway one
2. Key takeaway two
3. Key takeaway three
