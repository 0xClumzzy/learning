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

1. add the IP to hosts 
```bash
echo "ip atom.htb" | sudo tee -a /etc/hosts
```
2. Run an initial Nmap scan:
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
entry point, app name, version, and dependencies:
```json
{
  "name": "heedv1",
  "version": "1.0.0",
  "main": "main.js",
  "description": "Open Source Application provided by HackTheBox",
  "author": "MrR3boot",
  "dependencies": {
    "electron-log": "^1.3.0",
    "electron-updater": "^2.23.3",
    "url": "^0.11.0"
  }
}
```
information we need got 

| Field              | Value          | Significance         |
| ------------------ | -------------- | -------------------- |
| `name`             | `heedv1`       | app name             |
| `version`          | `1.0.0`        | app version          |
| `main`             | `main.js`      | entry point          |
| `description`      | HackTheBox app | confirms lab binary  |
| `author`           | `MrR3boot`     | HTB challenge author |
| `electron-updater` | `^2.23.3`      | handles auto-updates |
| `electron-log`     | `^1.3.0`       | logging library      |
| `url`              | `^0.11.0`      | URL parsing utility  |
`electron-updater 2.23.3` is old  vulnerabilities exist in early versions around **signature verification bypass**. unsigned updates can be served and executed: 
https://blog.doyensec.com/2020/02/24/electron-updater-update-signature-bypass.html
 we will comeback

 #### SMB ENUM
 
1. Nmap scan 
 ```bash
 sudo nmap --script smb-security-mode -p445 target
 ```
 We want  to check how secure the target is in terms of smb security:
 > 
PORT    STATE SERVICE
445/tcp open  microsoft-ds
Host script results:
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
- `account_used: guest` - Guest account was used. 
- `authentication_level: user` - User-level authentication. 
- `challenge_response: supported` -  NTLM challenge-response is supported. 
- `message_signing: disabled` - SMB signing is disabled.
Key takeways:
- **Message Signing Disabled:** An attacker on the same network can intercept SMB traffic and relay authentication attempts to another machine to gain unauthorized access. (SMB relay attacks)
- **Guest Access Enabled:** The system allowed `guest` enumeration, meaning you can likely list shares without valid domain credentials.
2. SMB host enum
```bash
nxc smb atom.htb
```

| Field       | Value                      |
| ----------- | -------------------------- |
| Host        | `atom.htb`                 |
| IP          | `10.129.9.52`              |
| Port        | `445`                      |
| OS          | `Windows 10 Pro 19042 x64` |
| Hostname    | `ATOM`                     |
| Domain      | `ATOM`                     |
| SMB Signing | `False`                    |
3. Share enumeration 
```
smbclient -N -L //atom.htb
```
>     Sharename  Type      Comment
        ---------       ----        -------
        ADMIN$   Disk       Remote Admin
        C$             Disk        Default share
        IPC$          IPC         Remote IPC
        Software_Updates Disk
4. Share file enumeration
```bash
smbclient -N  //atom.htb/Software_updates
```
- get the pdf file `UAT_Testing_Procedures.pdf`
- `pdftotext UAT_Testing_Procedures.pdf` 
> We follow the below process before releasing our products.
1. Build and install the application to make sure it works as we expect it to be.
2. Make sure that the update server running is in a private hardened instance. To
initiate the QA process, just place the updates in one of the "client" folders, and

 This suggest  we can host a malicious payload and submit an update file `latest.yaml` to one of the client folders in the smb share
---
## Foothold

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
