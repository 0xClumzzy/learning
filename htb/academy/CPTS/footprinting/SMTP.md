# Simple Mail Transfer Protocol

Sending emails in an IP network 

- default port on port 25 and 587 

- port 587 is used to received mail from authenticated users//server 

- the `STARTLLS` will start encrypted channel

- SMTP client is known as `Mail USer Agent (MUA)`, it converts the mail to both header and body and uploads to SMTP server 

- The software basis for mail transfer is called `Mail transfer Agent (MTA)`, it checks email for size and spam and stores it 

- The `Mail Submission Agent` validates mails, origin of mail. It is also called relay server  

- Incorrect configs can lead to  open relay attcks 

> | Client (`MUA`) | `âžž` | Submission Agent (`MSA`) | `âžž` | Open Relay (`MTA`) | `âžž` | Mail Delivery Agent (`MDA`) | `âžž` | Mailbox (`POP3`/`IMA |
> | -------------- | ----- | ------------------------ | ----- | ------------------ | ----- | --------------------------- | ----- | -------------------- |

- Domain keys(DKIM) and the Sender Policy Framework(SPF) combat against email attacks,the move them to spam folder
  
  - Extended SMTP uses TLS. It is done after the `EHLO` command by sending `STARTTLS`
  
  - AuthPLAIN extenstion can ne used for authentication 

Default config @`/etc/postfix/main.cf` 

| **Command**  | **Description**                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `AUTH PLAIN` | AUTH is a service extension used to authenticate the client.                                     |
| `HELO`       | The client logs in with its computer name and thus starts the session.                           |
| `MAIL FROM`  | The client names the email sender.                                                               |
| `RCPT TO`    | The client names the email recipient.                                                            |
| `DATA`       | The client initiates the transmission of the email.                                              |
| `RSET`       | The client aborts the initiated transmission but keeps the connection between client and server. |
| `VRFY`       | The client checks if a mailbox is available for message transfer.                                |
| `EXPN`       | The client also checks if a mailbox is available for messaging with this command.                |
| `NOOP`       | The client requests a response from the server to prevent disconnection due to time-out.         |
| `QUIT`       | The client terminates the session                                                                |

Interact with the SMTP server through telnet

We use telnet to initialise a tcp connection with the SMTP server, we use comman `EHLO` or `HELO`

```bash
telnet 10.10.10.10 25 


HELO mail.domain.com
```

> 250 status code 

then `EHLO mail`

- `VRFY` can be used to enumerate users 

- `VRFY root`

Send mail 

`MAIL FROM: <cry0l1t3@inlanefreight.htb>`

`RCPT TO: <mrb3n@inlanefreight.htb> NOTIFY=success,failure`

DNAGEROUS SETTINGS

 Open Relay Configuration 

`mynetworks = 0.0.0.0/0` 

Nmap comon scripts directly on SMTP port 

- script = `--script smtp-open-relay -v` 
  
  USER ENUMERATION 

```bash
nmap -p25 --script smtp-enum-users --script-args smtp-enum-users.methods={VRFY,EXPN,RCPT} 10.129.87.74`
```

- script = `--script smtp-enum-users `

- script args = `--script-args smtp-enum-users.methods={VRFY}`

get tool 

`smtp-user-enum`

```bash
 smtp-user-enum -M VRFY -U ~/SecLists/Usernames/Names/names.txt -t 10.129.87.74
```

Machine to practicee

## Sneaky Mailer

#### Machine(vip)

#### Level: easy

#### OS: Linux

add ip to hosts 

```bash
echo "10.10.10.10      sneaky.htb" | sudo tee -a /etc/hosts
```

PORT SCAN 

get tool

```bash
sudo pacman -Sy rustscan nmap
```

scan 

```bash
sudo rustscan -a 10.10.10.10 -- --min-rate 5000 -sCV -oA sneaky
```

> Open 10.129.2.28:21
> Open 10.129.2.28:22
> Open 10.129.2.28:25
> Open 10.129.2.28:80
> Open 10.129.2.28:143
> Open 10.129.2.28:993
> Open 10.129.2.28:8080

incomplete machine 
