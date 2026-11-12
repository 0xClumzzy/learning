# Using a stolen hash for authentication 
## 1. Mimikatz 
`serkulsa::pth`
- this module allows us to perform a pth by starting a process using the hash of the user's password
	- `/user` - the username we want to impersonate 
	- `/rc4 or /ntlm` - The hash 
	- `/domain` 