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
rundll32 keymgr.dll,KRShowKey
```
