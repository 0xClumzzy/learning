THESE 3 ARE LIKE THE THREE PILLARS BEHIND WINDOWS AUTHENTICATION 

ASSUMING WE HAVE SHELL AS `NT AUTHORITY\SYSTEM` 
	`reg.exe` is a command line registry tool that lets us query,add,delete,recover, save, export, import registry keys and values  from pwsh.  Works on remote machines (HKLM/HKU only).
```cmd 
reg.exe save hklm\sam C:\sam.save 
reg.exe save hklm\system C:\sys.save
reg.exe save hklm\security C:\sec.save
```

- They are `registry hive files`
- They live under `C:\Windows\System32\config`
	- `C:\Windows\System32\config\SAM`
		-> The database of local users and their passwords 
		-> LM and NTLM password hashes, `lm_hash:nt_hash` in the values uner `SAM\Domains\Account\Users`
		-> RIDs(relative identifiers) mapping users to SIDs
		-> Acc attributes: disabled, locked, password-not-required, etc 

	- `C:\Windows\System32\config\SYSTEM`
	- `C:\Windows\System32\config\SECURITY `
