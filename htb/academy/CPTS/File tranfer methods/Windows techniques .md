OK lets get started
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

The `Get-FileHash`  