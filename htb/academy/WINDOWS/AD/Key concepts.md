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
(Get-ADDomain).DNSRoot #-> Still get DNS name
```

## Computers 
All computers must be connected to a domain controller to belong to that active directory  
1. Domain Controllers. Central servers managing the domain. 
2. Workspace. Personal computers 
3. Servers. Computers hosting services 
## Users 
Active Directory hosts two main user types: `local users`, with access limited to the machines on which they are created, and `domain users`, by default having access to all domain computers.
```powershell
WORKGROUP/iron    #Local User
shadow.local/iron #Domain User
```

