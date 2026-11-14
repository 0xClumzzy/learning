Positioned as central servers housing Active Directory Domain Services (AD DS), DCs play a fundamental role in maintaining the New Technologies Directory Services (NTDS) database, The NTDS File [[Attacking AD and NTDS.dit]]

### Discovery of Domain Controllers 
```bash
sudo nmap -sS --open -p389 targewt
```
If u actually compromised an account:
```cmd
nltest /dclist:domain
```

