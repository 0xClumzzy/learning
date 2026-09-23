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

| port     | service |
| -------- | ------- |
| 80/tcp   | http    |
| 135/tcp  | msrpc   |
| 443/tcp  | https   |
| 445/tcp  | smb     |
| 5985/tcp | winrm   |
| 6379/tcp | redis   |
The webserver is hosted a note taking application, `wappy` tells us about the techstack behind it, get wappy at: https://github.com/gokulapap/wappalyzer-cli 
```shellsession
http://atom.htb  [200]  5 technologies  1007ms
  title Heed Solutions
  Apache HTTP Server 2.4.46 100%  Web servers
  Bootstrap 5.0.0     100%  UI frameworks
  OpenSSL 1.1.1j      100%  Web server extensions
  PHP 7.3.27          100%  Programming languages
  Windows Server      100%  Operating systems
```

There is a download button, with a zip file and extracting, we get an exe file 
```bash
file 'heedv1 Setup 1.0.0.exe'
```
> PE32 executable for MS Windows 4.00 (GUI), Intel i386, Nullsoft Installer self-extracting archive, 5 sections

*self extracting archieve* prompted unpacking the exe using 7zip
```bash
mkdir heed && cd heed && 7z x ../heedv1\ Setup\ 1.0.0.exe 1>/dev/null && ls
```
We will come back for you.....

Learning that `electron builder`,  makes electron distribution software, verifies their  signatures and performs a signature check based on a string comparison between the installed binary's `PublisherName` and  a the certified `CommonName` attribute of the update binary. 

So during an update the application

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
