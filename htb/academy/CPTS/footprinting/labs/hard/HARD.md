[[ Post Office Protocol]]

[[SMB]]

The third server is an **MX** and **management server** for the internal network. Subsequently, this server has the function of a backup server for the internal accounts in the domain. Accordingly, a user named HTB was also created here, whose credentials we need to access.

Enumeratte mail server
##### NMAP 
```bash
sudo nmap --min-rate 5000 -sCV -oA hard.scan 10.10.10.10
```
output:
```
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 3f:4c:8f:10:f1:ae:be:cd:31:24:7c:a1:4e:ab:84:6d (RSA)
|   256 7b:30:37:67:50:b9:ad:91:c0:8f:f7:02:78:3b:7c:02 (ECDSA)
|_  256 88:9e:0e:07:fe:ca:d0:5c:60:ab:cf:10:99:cd:6c:a7 (ED25519)
110/tcp open  pop3     Dovecot pop3d
|_pop3-capabilities: UIDL TOP AUTH-RESP-CODE RESP-CODES SASL(PLAIN) PIPELINING CAPA STLS USER
| ssl-cert: Subject: commonName=NIXHARD
| Subject Alternative Name: DNS:NIXHARD
| Not valid before: 2021-11-10T01:30:25
|_Not valid after:  2031-11-08T01:30:25
|_ssl-date: TLS randomness does not represent time
143/tcp open  imap     Dovecot imapd (Ubuntu)
|_imap-capabilities: more post-login have LOGIN-REFERRALS OK STARTTLS capabilities listed Pre-login IDLE IMAP4rev1 SASL-IR AUTH=PLAINA0001 ID ENABLE LITERAL+
| ssl-cert: Subject: commonName=NIXHARD
| Subject Alternative Name: DNS:NIXHARD
| Not valid before: 2021-11-10T01:30:25
|_Not valid after:  2031-11-08T01:30:25
|_ssl-date: TLS randomness does not represent time
993/tcp open  ssl/imap Dovecot imapd (Ubuntu)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=NIXHARD
| Subject Alternative Name: DNS:NIXHARD
| Not valid before: 2021-11-10T01:30:25
|_Not valid after:  2031-11-08T01:30:25
|_imap-capabilities: more have LOGIN-REFERRALS OK post-login capabilities listed Pre-login IDLE IMAP4rev1 SASL-IR AUTH=PLAINA0001 ID ENABLE LITERAL+
995/tcp open  ssl/pop3 Dovecot pop3d
| ssl-cert: Subject: commonName=NIXHARD
| Subject Alternative Name: DNS:NIXHARD
| Not valid before: 2021-11-10T01:30:25
|_Not valid after:  2031-11-08T01:30:25
|_pop3-capabilities: UIDL SASL(PLAIN) TOP USER CAPA AUTH-RESP-CODE PIPELINING RESP-CODES
|_ssl-date: TLS randomness does not represent time
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Enumerate Management Server ports
- check for hidden ports through udp scan 
```bash
sudo nmap --min-rate 5000 -sUCV -oA hard.scan.udp 101.10.101.01
```