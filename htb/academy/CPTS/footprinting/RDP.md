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
Example output: 
```shellsession
PORT     STATE SERVICE       VERSION
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| rdp-enum-encryption:
|   Security layer
|     CredSSP (NLA): SUCCESS
|     RDSTLS: SUCCESS
|   RDP Encryption level: High
|     128-bit RC4: SUCCESS
| rdp-ntlm-info:
|   Target_Name: SERVER2020-RDP
|   NetBIOS_Domain_Name: OFFICE
|   DNS_Domain_Name: office.local
|   Product_Version: 10.0.17763   
```
what we got: 
```shellsession
PORT     STATE SERVICE
3389/tcp open  ms-wbt-server
| rdp-enum-encryption:
|   Security layer
|     CredSSP (NLA): SUCCESS
|     CredSSP with Early User Auth: SUCCESS
|     Native RDP: SUCCESS
|     RDSTLS: SUCCESS
|     SSL: SUCCESS
|   RDP Encryption level: High
|     128-bit RC4: SUCCESS
|_  RDP Protocol Version:  RDP 5.x, 6.x, 7.x, or 8.x server
```

*MS-WBT-SERVER*

ms-wbt-server is a protocol stack that allows machines to communicate remotely
- RDP 
- MCS
- GCC

REMOTE DESKTOP PROTOCOL
****
Components that manage RDP 
1. Wdtshare.sys
- The rpd driver 
- Responsible for transferring ui , compressing data, encrypting it and and framing it 
- It preps data for transmission 
2. Tdtcp.sys 
- Transport driver
- Packages rdp data and transmits via the underlying protocol, mainly tcp/ip.

MULTIPOINT COMMUNICATION SERVICE
****
It defines how data can be  transmitted to multiple sources  simultaneously 
=> used for point to point communication in RDP scenarios
MCP handles;
- Channel Assignment - It manages virtual channels and directs each type of data to its channel 
- Data segmentation- easir management and transimmition of data via atomity
- Prioritization- Assignment of  priority levels to dofferent data streams
>> MCS essentially abstracts the multiple RDP stacks into a single entity from the perspective of the Generic Conference Control. It’s a way to organize and manage the flow of data efficiently.

GENERIC CONFERENCE CONTROL
****
It manages the overall session
- handles the setup and teardown of sessions
- Controls the resources provided by MCS 
- manages sessions(create,delete,coordinate)
```mermaid 
flowchart  LR
A[]
```

