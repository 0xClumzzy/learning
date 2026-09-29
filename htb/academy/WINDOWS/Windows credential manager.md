# MITRE ATT&CK   
[found at]: : https://attack.mitre.org/techniques/T1555/004/ 

So windows credentials manager is built in to windows since windows 7 and windows server 2008 R2
1. It allows users and applications to securely stop creds
2. Creds are stored in encrypted folders under user and system profiles
		-> `%UserProfile%\AppData\Local\Microsoft\Vault\`
		-> `%UserProfile%\AppData\LocalMicrosoft\Credentials`
		->`%UserProfile%\AppData\Roamimg\Microsoft\Vault`
		->`%ProgramData%\Micoroft\Vault`
	>`%SystemRoot%\System32\config\systemprofile\AppData\Roaming\Microsoft\`

Each vault folder contains a policy `Policy.vpol` file with AES keys(AES-128/256) that is protected  by DPAPI. These AES keys are used to encrypt the credentials. 

Credentials Guard is also used to further protect DPAPI master keys by storing them in secured enclaves, the password stores are referred to as `credential lockers`
- Web credentials 
- Windows credentials 
Exporting windows vaults
```cmd
rundll32 keymgr.dll,KRShowKeyMgr
```
Enumeratimg credentials with `cmdkey`
- Passwords stored in the current user profile
```cmd 
cmdkey /list
```

| Key         | Value                                                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Target      | The resource or account name the credential is for. This could be a computer, domain name, or a special identifier.                                        |
| Type        | The kind of credential. Common types are `Generic` for general credentials, and `Domain Password` for domain user logons.                                  |
| User        | The user account associated with the credential.                                                                                                           |
| Persistence | Some credentials indicate whether a credential is saved persistently on the computer; credentials marked with `Local machine persistence` survive reboots. |
eg:
```cmd
Target: Domain:interactive=SRV01\mcharles
    Type: Domain Password
    User: SRV01\mcharles
```
`Domain:interactive=SRV01\mcharles`, is a domain credential associated with the user SRV01\mcharles. `Interactive` means that the credential is used for interactive logon sessions. Whenever we come across this type of credential, we can use `runas` to impersonate the stored user like so:
```cmd
runas /savecred /user:SRV01\mcharles cmd 
```
syntax: <runas> /savecred  /user:<user> <command>

---

Extracting credentials with mimikatz