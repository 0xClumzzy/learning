Windows auth granyy..........the
# Windows New Technology LAN Manager
- A set of protocols that manages user identity authentication whilst protecting the integrity and confidentiality of their data
- It is a SSO solution that uses a challenge-response handshake to verify user identities 
- The server sends a 16-byte "nonce" challenge, and the client proves knowledge of the password by computing a response based on it, instead of sending the password itself.
Two passwords get hashed/stored in SAM or Active Directory:
1. LAN Manager - case-insensitive, ≤14 chars, DES encryption, 16-byte OWF (old-school, weak)
2. Windows NT - case-sensitive, ≤128 chars, MD4 hash, 16-byte OWF (modern)
Windows tries the Windows password first; falls back to LAN Manager for compatibility.



