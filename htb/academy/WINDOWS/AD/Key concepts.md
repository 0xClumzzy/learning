AD, windows hell kitchen 
# Active directory 
AD is basically central management platform for windows environments
The word management suggests: 
- There is a central db 
- That has information on a network of compters
- All housed in a domain controller 
## Domains 
The network of computers sharing the same centralized database 
To determine the domain name: 
```powershell 
$env:USERDNSDOMAIN #-> DNS Name 
(Get-ADDomain).DNSRoot
```

