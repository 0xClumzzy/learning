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
	```cmd 
	tasklist /svc
	```
