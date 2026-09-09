So windows is ancient...........
- Windows XP
- Windows Server 2003, 2003 r2
- Windows Vista, server 2008
- Windows 7, server 2008 R2
- Windows 8, Server 2012, Windows 8.1, Sever 2012 R2
- Windows 10, server 2016,19
 All that, powershell comes in handy when it comes to stuff like this 
 `Get-WmiObject` cmdlet in powershell works well
```powershell
Get-WmiObject -Class  win32_OperatingSystem | select Version,BuildNumber
```
Classes:
- `win32_OperatingSystem` - Gets  us info
- `Win32_Process` - Process listing 
- `Win32_Bios` -  Bios information 

ACCESSING WINDOWS
1. RDP
- Windows to windows connection 
- built-in 
- `mstsc.exe` 
- remote access must already be allowed for it work 
- `.rdp` files are gold, they are used to save connection profiles
1. XFREERDP
- Linux to Windows

USING THE DIR AND TREE COMMAND

DIR
1. Wide list just names
```
dir /w
```
1. list files
```
dir /s
```
1. only show an extension
```
dir *.py
```

TREE
```
tree [<drive>:][<path>] [/f] [/a]
```
1. show files too
```
tree /f
```
1. Use ascii chars instead of lines
```
tree /a
```
1. Only go 2 folders deep
```
tree -L 2
```
