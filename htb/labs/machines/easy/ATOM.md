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
####WEB ENUM
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

So electron is a framework for building desktop applications using JavaScript, HTML, and CSS. By embedding Chromium and Node.js into its binary which  allows you to maintain one JavaScript codebase and create cross-platform apps that work on Windows, macOS, and Linux with no native development experience required.

Learning that `electron builder`,  makes electron distribution software, verifies their  signatures and performs a signature check based on a string comparison between the installed binary's `PublisherName` and  a the certified `CommonName` attribute of the update binary. 

So during an update the application will request  `latest.yaml` file from the update server which contains the definition of the new release - including the binary filename and hashes.


cool...........
Decompiling the exe uncovers a `'$PLUGINSDIR'` containing the source files and in there there is an `app-64.7z` file , prolly the electron app.....

| DLL                | Purpose                                    | Analyst Note                                                      |
| ------------------ | ------------------------------------------ | ----------------------------------------------------------------- |
| `nsis7z.dll`       | 7-zip extraction plugin                    | Unpacks the `app-64.7z` at install time                           |
| `nsProcess.dll`    | Process enumeration/kill                   | Can check running processes, kill them                            |
| `SpiderBanner.dll` | Custom installer UI                        | Cosmetic , prolly just the install screen                         |
| `StdUtils.dll`     | Extended NSIS utilities                    | String ops, execution, env vars                                   |
| `System.dll`       | Low-level Win32 API calls from NSIS script | **Dangerous** — can call arbitrary Windows API functions directly |
| `WinShell.dll`     | Windows Shell integration                  | Start menu, shortcuts, file associations                          |
 Extract the app
 ```bash
 mkdir app-64 && cd app-64 && 7z x ../app-64.7z 1>/dev/null && ls
 ```
 in there is a resources folder
 ```
 app-64/
├── heedv1.exe              ← main executable, loads electron + app
├── resources/
│   ├── app.asar            ← app source 
│   ├── app-update.yml      ← update server config
│   ├── electron.asar       ← electron runtime
│   ├── elevate.exe         ← UAC helper
│   └── inspector/          ← devtools 
├── locales/                ← UI language files 
├── swiftshader/            ← software GPU renderer 
├── *.dll                   ← electron/chromium dependencies 
├── *.pak                   ← chromium resource packs 
└── *.bin                   ← v8/snapshot blobs 
 ```
 Our main attention is on the app source and  update
 ```bash 
 cat resources/app-update.yml
 ```
 > provider: generic
   url: 'http://updates.atom.htb'
   publisherName:
  - HackTheBox
Add the link`updates.atom.htb`to hosts(same site)

Extract the source, get asar `npm install -g asar`
```bash
mkdir app && cd app && asar e ../app.asar . && ls
```
- map the application
```bash 
cat package.json
```
```json
```
---

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
