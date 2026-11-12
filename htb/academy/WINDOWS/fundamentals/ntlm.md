Windows auth granyy..........the
# Windows New Technology LAN Manager
- A set of protocols that manages user identity authentication whilst protecting the integrity and confidentiality of their data
- It is a SSO solution that uses a challenge-response handshake to verify user identities 
- The server sends a 16-byte "nonce" challenge, and the client proves knowledge of the password by computing a response based on it, instead of sending the password itself.
Two passwords get hashed/stored in SAM or Active Directory:
1. LAN Manager - case-insensitive, ≤14 chars, DES encryption, 16-byte OWF (old-school, weak)
2. Windows NT - case-sensitive, ≤128 chars, MD4 hash, 16-byte OWF (modern)
Windows tries the Windows password first; falls back to LAN Manager for compatibility.
```mermaid
flowchart TD 
	A[Client logs on] --> B[LsaLogonUser API] 
	B --> C[MSS1_0 authentication package] 
		subgraph MSV1_0_Package["MSV1_0 Package"] 
			C1[Compute both OWF hashes]
			C1a[LAN Manager OWF (DES, ≤14 chars)]
			C1b[Windows NT OWF (MD4, ≤128 chars)]
		subgraph Network_Logon["Network Logon — Challenge/Response"]
			S1[Server sends 16-byte challenge nonce] C2[Client computes response with OWF hash] S2[Client sends challenge response] S3[Server queries SAM / Active Directory for OWF hash] S4[Server recomputes response and compares] S5{Authenticated?} S5 -->|Yes| D[Logon granted] S5 -->|No| E[Logon denied] end subgraph Pass_Through["Pass-through Authentication (non-local domain)"] N1[Netlogon selects domain / server] N2[DC Locator resolves DC via NETBIOS / DNS] N3[Netlogon relays request to DC] N4[DC's MSV1_0 part verifies against SAM / AD] N4 --> D end end C --> C1 C1 --> C1a C1 --> C1b C --> Network_Logon C --> Pass_Through
```

