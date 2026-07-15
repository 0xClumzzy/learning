# Server Message Block

a client-server protocol that regulates access to files and entire directories and other network resources such as printers, routers, or interfaces released for the network.

An SMB server can provide arbitrary parts of its local file system as shares. Therefore the hierarchy visible to a client is partially independent of the structure on the server. Access rights are defined by `Access Control Lists` (`ACL`). They can be controlled in a fine-grained manner based on attributes such as `execute`, `read`, and `full access` for individual users or user groups. The ACLs are defined based on the shares and therefore do not correspond to the rights assigned locally on the server. 

Samba implements the Common Internet File System (`CIFS`) network protocol. [CIFS](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-cifs/934c2faa-54af-4526-ac74-6a24d126724e) is a dialect of SMB, meaning it is a specific implementation of the SMB protocol originally created by Microsoft.

~ When SMB commands are transmitted over Samba to an older NetBIOS service, connections typically occur over TCP ports `137`, `138`, and `139`

~ CIFS operates over TCP port `445`

Dangerous commnads

| **Setting**                 | **Description**                                                     |
| --------------------------- | ------------------------------------------------------------------- |
| `browseable = yes`          | Allow listing available shares in the current share?                |
| `read only = no`            | Forbid the creation and modification of files?                      |
| `writable = yes`            | Allow users to create and modify files?                             |
| `guest ok = yes`            | Allow connecting to the service without using a password?           |
| `enable privileges = yes`   | Honor privileges assigned to specific SID?                          |
| `create mask = 0777`        | What permissions must be assigned to the newly created files?       |
| `directory mask = 0777`     | What permissions must be assigned to the newly created directories? |
| `logon script = script.sh`  | What script needs to be executed on the user's login?               |
| `magic script = script.sh`  | Which script should be executed when the script gets closed?        |
| `magic output = script.out` | Where the output of the magic script needs to be stored?            |

smb enumeration
```bash
smbclient -N -L //<ip> 
```
or 
with creds
```bash
smbclient -L //<ip> -U 'user%password'
```

| flag | use                           |
| ---- | ----------------------------- |
| -L   | list the shares               |
| -N   | null session(anonymous login) |

get command to download files 

commands within the smb instance are prefixed with '!' eg `!ls`

As admin 

```bash
smbstatus
```

allows to check for connection 

SAMBA + NMAP 

```bash
sudo nmap -sCV -p139,445 10.10.10.10
```

RPCCLIENT 

 Remote Procedure Call (RPC) is a way for a program to run a function on another computer in a network as if it were local.

```bash
rpcclient -U "" 10.10.10.10
```

| feature         | use         |
| --------------- | ----------- |
| srvinfo         | server info |
| enumdomains     |             |
| querydomaininfo |             |
| netshareenumall |             |
| enumdomusers    |             |

RID bruteforcing

```bash
 for i in $(seq 500 1100);do rpcclient -N -U "" 10.129.14.128 -c "queryuser 0x$(printf '%x\n' $i)" | grep "User Name\|user_rid\|group_rid" && echo "";done
```

CRACK MAP 

```bash
crackmapexec smb 10.10.10.10 --shares -u '' -p ''
```

ENUM4LINUX-NG 

```bash
 git clone https://github.com/cddmp/enum4linux-ng.git
```

install requirements 

```bash
./enum4linux-ng.py 10.10.10.10 -A 
```
