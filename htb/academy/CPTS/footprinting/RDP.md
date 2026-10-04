SCENARIO 1:
- ms-wbt-server found on port 3389
# Nmap scan 
```bash
sudo nmap -p 3389 --script "rdp-enum-encryption or rdp-vuln-ms12-020 or rdp-ntlm-info" -T4 <ip>
```

|                       |                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Script                | What it reveals                                                                                                                          |
| `rdp-enum-encryption` | Supported security layers (CredSSP/NLA, RDSTLS, SSL, Native RDP), encryption ciphers (RC4 40/56/128-bit, FIPS), and RDP protocol version |
| `rdp-ntlm-info`       | NetBIOS/DNS domain & computer names, Windows product version (build number), system time                                                 |
| `rdp-vuln-ms12-020`   | Checks for MS12-020 vulnerability (RDP DoS)                                                                                              |
