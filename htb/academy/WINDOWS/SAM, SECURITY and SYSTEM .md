THESE 3 ARE LIKE THE THREE PILLARS BEHIND WINDOWS AUTHENTICATION 
- They are `registry hive files`
- They live under `C:\Windows\System32\config`
	- `C:\Windows\System32\config\SAM`
		-> The database of local users and their passwords 
		-> LM and NTLM password hashes, `lm_hash:nt_hash` in the values uner `SAM\Domains\Account\Users`
		-> RIDs(relative identifiers) mapping users to SIDs
		-> Acc attributes: disabled, locked,
	- `C:\Windows\System32\config\SYSTEM`
	- `C:\Windows\System32\config\SECURITY `
