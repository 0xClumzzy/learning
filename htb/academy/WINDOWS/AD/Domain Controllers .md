Positioned as central servers housing Active Directory Domain Services (AD DS), DCs play a fundamental role in maintaining the New Technologies Directory Services (NTDS) database, The NTDS File [[Attacking AD and NTDS.dit]]

### Discovery of Domain Controllers 
```bash
sudo nmap -sS --open -p389 targewt
```
If u actually compromised an account:
```cmd
nltest /dclist:domain
```

#### Connecting to a DC with Evil-WinRM
```shellsession
evil-winrm -i 10.10.10.10 -u username -p 'P@55w0rd!'
```
#### Checking local group membership
```shellsession
net localgroup
```
We are looking to see if the account has local admin rights. To make a copy of the NTDS.dit file, we need local admin (`Administrators group`) or Domain Admin (`Domain Admins group`) (or equivalent) rights.
#### Checking user account privileges including domain
```shellsession
net user username 
```

