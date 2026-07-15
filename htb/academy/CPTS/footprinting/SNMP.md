# Simple Network Management Protocol

- The protocol was created to monitor network devices 

- It can also be used to handle configuration tasks and change settings remotely  

- SNMP transmits  `control commands` using agents over `UDP port 161`

- The client can modify `values of settings` using the `control commnads` 

- SNMP enables the use of traps over UDP port 162

- `Traps `are data packets sent from the snmp server to the client without  being explicitly requested

- `A trap` is triggered by a specific event 

- for snmp   server and client to share respective values, `snmp objects`` must have known unique addresses

### Management Information Base

- MIB ensures snmp access works across different manufactures and with different client-server combinations 

- It is an independent format for storing device information 

- It is a text file in which all queryable SNMP objects are stored and listed in a hierachal structure 

- MIB file contains `object identifiers` 

- MIB files are written in the `Abstract Syntax Notation One (ASN1)` based in the ascii text format 

- The MIBs do not contain data, but they explain where to find which information and what it looks like, which returns values for the specific OID, or which data type is used.

### Object Identifier (OID)

- an OID represents a node in a hierachal namespace 

- Theres a sequence of numbers that identifies each node which allows mapping of the nodes

- many nodes in the OID tree contain nothing except references to those below them 

- OIDs consists of dot seperated integers

- The `Object Identifier registry` has many MIBs for the associated OID 

| Feature                  | SNMPv1           | SNMPv2c                                | SNMPv3                      |
| ------------------------ | ---------------- | -------------------------------------- | --------------------------- |
| Release                  | 1988             | 1993                                   | 1998                        |
| Authentication           | Community string | Community string                       | Username + password (USM)   |
| Encryption               | ❌ None           | ❌ None                                 | ✅ Supported (e.g., AES/DES) |
| Data Transmission        | Plain text       | Plain text                             | Encrypted (optional)        |
| Access Control           | Basic            | Basic                                  | Advanced (user-based)       |
| Get/Set Operations       | ✅ Supported      | ✅ Supported                            | ✅ Supported                 |
| Traps/Notifications      | ✅ Supported      | ✅ Supported                            | ✅ Supported                 |
| Performance              | Fast             | Faster than v1                         | Slightly slower             |
| Configuration Complexity | Low              | Low                                    | High                        |
| Security Level           | ❌ Poor           | ❌ Poor                                 | ✅ Strong                    |
| Typical Use              | Legacy systems   | Legacy systems with better performance | Modern secure networks      |

### Community Strings

- There are passwords that can determine if whether requested information can be viewed or not

SMNP daemon config @`/etc/snmp/snmpd.conf`

#### Footprinting the service

SNMP discovery 
```bash
nmap -sUV -p161 10.10.10.10
```

- `Onesixtyone` is for Discovery + brute-force community strings. It  can be used to brute-force the names of the community strings since they can be named arbitrarily by the administrator

- `snmpwalk` for full enumeration

- `braa` for Fast targeted SNMP queries

`Discover SNMP` --> `find the cstring` -> `full enum` -> `query specific OIDs`

tools needed 

- `net-snmp` , `onesixtyone`, `braa` 

Cstring discovery

```bash
onesixtyone -c path/to/wordlist 10.10.10.10
```

Full enum 

```bash
 snmpwalk -v2c -c public 10.10.10.10
```

Query specific OID 

```bash
braa  <cstring>@10.10.10.10:.OID.* 
```
