Assuming we compromised an acc with local admin privs 
- Tickets are stored by the LSASS process 
- Communicate with the LSASS process and request the ticket
- Non admin user-> get yo ticket
- Admin user -> every ticket
`serkulsa::tickets` module using the `/export` function resulting in `.kirbi` files -> tickets
```powershell
mimikatz.exe privilege::debug "" exit
```