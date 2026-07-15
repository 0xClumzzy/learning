The first server is an internal DNS server that needs to be investigated. In particular, our client wants to know what information we can get out of these services and how this information could be used against its infrastructure. Our goal is to gather as much information as possible about the server and find ways to use that information against the company. However, our client has made it clear that it is forbidden to attack the services aggressively using exploits, as these services are in production.

Additionally, our teammates have found the following credentials "ceil:qwer1234", and they pointed out that some of the company's employees were talking about SSH keys on a forum. ^3c2a9a

The administrators have stored a `flag.txt` file on this server to track our progress and measure success. Fully enumerate the target and submit the contents of this file as proof.
#### Nmap
[[DNS]]
```bash
sudo nmap --min-rate 5000 -sCV -oA scanEasy 10.01.10.10
```

| port | version                                                      |
| ---- | ------------------------------------------------------------ |
| 21   |                                                              |
| 22   | OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0) |
| 53   | ISC BIND 9.16.1 (Ubuntu Linux)                               |
| 2121 | ProFTPD Server (Ceil's FTP)                                  |

Provided creds=> `ceil:qwer1234`

- Try SSH
```bash
ssh ceil@10.129.66.159 
```

> ** The server may need to be upgraded. See https://openssh.com/pq.html
ceil@10.129.66.159: Permission denied (publickey).

That tells us we cant use password to login 
In the lab description, the gave us a hint [[EASY#^3c2a9a]]
Maybe theres ssh keys exposed 

- Try normal FTP, theres nothing
FTP enumeration 
- List all available NSE scripts
```bash
ls /usr/share/nmap/scripts/ftp-*.nse
```
output:
```
/usr/share/nmap/scripts/ftp-anon.nse     /usr/share/nmap/scripts/ftp-proftpd-backdoor.nse
/usr/share/nmap/scripts/ftp-bounce.nse   /usr/share/nmap/scripts/ftp-syst.nse
/usr/share/nmap/scripts/ftp-brute.nse    /usr/share/nmap/scripts/ftp-vsftpd-backdoor.nse
/usr/share/nmap/scripts/ftp-libopie.nse  /usr/share/nmap/scripts/ftp-vuln-cve2010-4221.nse
```

```bash
sudo nmap --min-rate 5000 -sCV -p21,2121 --script "ftp-anon,ftp,syst,tp-vsftpd-backdoor" 10.129.66.202
```
Nothing 

`nc 10.129.66.202 21`
and 
`nc 10.129.66.202 2121`

Finding out that the other ftp daemon is user specific, login 
```bash
sudo ftp ceil@10.129.66.202 2121
```

list all files

Finding out theres ssh keys publicly exposed, download them
```bash
cd .ssh
mget *
```
OR(one shot it)
```bash
wget -r --ftp-user=ceil --ftp-password=qwer1234 ftp://10.129.66.202/.ssh/
```
