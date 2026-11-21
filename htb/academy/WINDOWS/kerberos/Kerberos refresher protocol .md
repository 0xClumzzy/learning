Kerberos-authentication is `ticket-based`, all tickets are kept are kept locally and they are used to request for services; `SSO`
In a kerberos network every user
- Auths with `user+pass` -> hashed
- password hash is encrypted with a timestamp 
- The decrypted blob verifies user id's and they can request a TGT 
1. `Ticket Granting Ticket`
- The first ticket obtained 
- Permits obtaining of a `TGS` 
- After blob is decrypted and verified, the `TGT` will be used to request the `TGS` for a specific service
2. `Ticket Granting Service`
- Requested from the `Key Distribution Center(KDC)` using a valid `TGT`
- `TGS` will auth to service and grant access, can be used anytime without reauth, unless otherwise 
