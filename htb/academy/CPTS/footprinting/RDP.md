SCENARIO 1:
- ms-wbt-server found on port 3389
# Nmap scan 
```bash
sudo nmap -p 3389 --script "rdp-enum-encryption or rdp-vuln-ms12-020 or rdp-ntlm-info"
```