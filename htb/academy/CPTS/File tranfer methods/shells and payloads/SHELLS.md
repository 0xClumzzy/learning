SHELL BASICS 
- [ ] BIND SHELL 
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
