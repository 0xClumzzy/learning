Assuming we compromised an acc with local admin privs 
- Tickets are stored by the LSASS process 
- Communicate with the LSASS process and request the ticket
- Non admin user-> get yo ticket
- Admin user -> every ticket
1. Mimikatz
`serkulsa::tickets` module using the `/export` function resulting in `.kirbi` files -> tickets
```powershell
mimikatz.exe privilege::debug "serkulsa::tickets /export" exit
```
The tickets that end with `$` correspond to the computer account, which needs a ticket to interact with the Active Directory. User tickets have the user's name, followed by an `@` that separates the service name and the domain, for example: `[randomvalue]-username@service-domain.local.kirbi`.
>**Note:** If you pick a ticket with the service krbtgt, it corresponds to the TGT of that account.

2. Rubeus
- Dumps the ticket in b64 
- `/nowrap` function makes it easier to copy and paste
```powershell
Rubeus.exe dump /nowrap 
```
