# HTB Forest (10.129.95.210) - Reconnaissance & Attack Summary

## Target Overview
- **OS**: Windows Server 2016 Standard 14393 (build 14393)
- **Role**: Domain Controller for `htb.local`
- **Hostname**: FOREST
- **Domain**: htb.local (Forest root domain)
- **Site**: Default-First-Site-Name

## Open Ports & Services
| Port | Service | Details |
|------|---------|---------|
| 53 | DNS | Simple DNS Plus |
| 88 | Kerberos | Microsoft Windows Kerberos |
| 135 | MSRPC | Microsoft Windows RPC |
| 139 | NetBIOS | Microsoft Windows netbios-ssn |
| 389 | LDAP | Microsoft Windows Active Directory LDAP |
| 445 | SMB | Windows Server 2016, signing required |
| 464 | kpasswd5 | Kerberos password change |
| 593 | ncacn_http | RPC over HTTP 1.0 |
| 636 | LDAPS | tcpwrapped |
| 3268 | GC LDAP | Global Catalog |
| 3269 | GC LDAPS | tcpwrapped |
| 5985 | WinRM | Microsoft HTTPAPI 2.0 |
| 9389 | .NET Message Framing | AD Web Services |
| 47001 | WinRM | Microsoft HTTPAPI 2.0 |
| 49664-49700 | MSRPC | Dynamic RPC ports |

## Domain Information
- **Domain**: htb.local
- **Forest**: htb.local
- **Site**: Default-First-Site-Name
- **Computer Name**: FOREST
- **Workgroup**: HTB

## User Enumeration (via Anonymous LDAP Bind)

### Regular Users (5 found)
| sAMAccountName | Last Password Set   | BadPwdCount | Notes               |
| -------------- | ------------------- | ----------- | ------------------- |
| Administrator  | 2021-08-31 02:51:58 | 0           | Built-in admin      |
| Guest          | <never>             | 0           | Disabled            |
| DefaultAccount | <never>             | 0           | System managed      |
| krbtgt         | 2019-09-18 12:53:23 | 0           | KDC service account |
| sebastien      | 2019-09-20 02:29:59 | 12          | Regular user        |
| lucinda        | 2019-09-20 02:44:13 | 11          | Regular user        |
| andy           | 2019-09-23 00:44:16 | 9           | Regular user        |
| mark           | 2019-09-21 00:57:30 | 10          | Regular user        |
| santi          | 2019-09-21 01:02:55 | 10          | Regular user        |

### Service Accounts
| sAMAccountName               | Notes                                       |
| ---------------------------- | ------------------------------------------- |
| svc-alfresco                 | Service account in "Service Accounts" group |
| $331000-VK4ADACQNUCA         | Exchange Online-ApplicationAccount          |
| SM_* (16 accounts)           | Exchange System Mailboxes                   |
| HealthMailbox* (14 accounts) | Exchange Health Mailboxes                   |

### Computer Accounts (2 found)
| sAMAccountName | Notes |
|----------------|-------|
| FOREST$ | Domain Controller (userAccountControl: 532480) |
| EXCH01$ | Exchange Server (userAccountControl: 4096) |

## SPN Enumeration (Kerberoasting Targets)

### Machine Accounts with SPNs
**FOREST$ (DC) - UNCONSTRAINED DELEGATION**
- TERMSRV/FOREST
- TERMSRV/FOREST.htb.local
- exchangeAB/FOREST
- exchangeAB/FOREST.htb.local
- Dfsr-12F9A27C-BF97-4787-9364-D31B6C55EB04/FOREST.htb.local
- ldap/FOREST.htb.local/ForestDnsZones.htb.local
- ldap/FOREST.htb.local/DomainDnsZones.htb.local
- DNS/FOREST.htb.local
- GC/FOREST.htb.local/htb.local
- RestrictedKrbHost/FOREST.htb.local
- RestrictedKrbHost/FOREST
- RPC/236ba33a-7959-4a41-b959-5f82689a0871._msdcs.htb.loca
- HOST/FOREST/HTB
- HOST/FOREST.htb.local/HTB
- HOST/FOREST
- HOST/FOREST.htb.local
- HOST/FOREST.htb.local/htb.local
- E3514235-4B06-11D1-AB04-00C04FC2DCD2/236ba33a-7959-4a41-b959-5f82689a0871/htb.local
- ldap/FOREST/HTB
- ldap/236ba33a-7959-4a41-b959-5f82689a0871._msdcs.htb.loc
- ldap/FOREST.htb.local/HTB
- ldap/FOREST
- ldap/FOREST.htb.local

**EXCH01$ (Exchange Server)**
- IMAP/EXCH01
- IMAP/EXCH01.htb.local
- IMAP4/EXCH01
- IMAP4/EXCH01.htb.local
- POP/EXCH01
- POP/EXCH01.htb.local
- POP3/EXCH01
- POP3/EXCH01.htb.local
- exchangeRFR/EXCH01
- exchangeRFR/EXCH01.htb.local
- exchangeAB/EXCH01
- exchangeAB/EXCH01.htb.local
- exchangeMDB/EXCH01
- exchangeMDB/EXCH01.htb.local
- SMTP/EXCH01
- SMTP/EXCH01.htb.local
- SmtpSvc/EXCH01
- SmtpSvc/EXCH01.htb.local
- WSMAN/EXCH01
- WSMAN/EXCH01.htb.local
- RestrictedKrbHost/EXCH01
- HOST/EXCH01
- RestrictedKrbHost/EXCH01.htb.local
- HOST/EXCH01.htb.local

## Attack Vectors Identified

### 1. Unconstrained Delegation on DC (CRITICAL)
The Domain Controller **FOREST$** has unconstrained delegation enabled (`userAccountControl: 532480` = TRUSTED_FOR_DELEGATION). This allows:
- **Resource-Based Constrained Delegation (RBCD) abuse** if we can modify the DC
- **Kerberos Ticket Granting Ticket (TGT) theft** via coercion attacks (PetitPotam, printer bug, etc.)
- **DCSync attack** after obtaining DC credentials

### 2. Service Account: svc-alfresco
- Member of "Service Accounts" group
- Recently created (2026-11-17 23:25:15)
- No SPN currently assigned
- **Potential target for:**
  - Kerberoasting (if SPN added)
  - Password spraying
  - ACL abuse

### 3. AS-REP Roasting - NOT VULNERABLE
All users require pre-authentication (UF_DONT_REQUIRE_PREAUTH not set)

### 4. Kerberoasting - NO USER SPNs
No user accounts have servicePrincipalName set. Only computer accounts have SPNs.

### 5. SMB Null Session
- Allows anonymous LDAP queries
- Cannot enumerate shares (access denied)
- Guest account disabled

### 6. Password Spraying
Tested common passwords against 5 regular users - all failed
- Passwords tested: Password1, Welcome1, Summer2024, Winter2024, Spring2024, Fall2024, Password123, Welcome123, Passw0rd, P@ssw0rd, Admin123, Test123, etc.

## Next Steps

### Priority 1: Unconstrained Delegation Exploitation
1. **Coerce authentication** to FOREST$ using:
   - PetitPotam (print spooler bug)
   - Printer bug (MS-RPRN)
   - SMB relay attacks
2. **Extract TGT** using Rubeus or mimikatz
3. **DCSync attack** to dump NTDS.dit

### Priority 2: Service Account Compromise
	1. **Password spray svc-alfresco** with common passwords
2. **Check for certificate templates** (Certifried/ESC1-ESC13)
3. **Check for ACLs** allowing delegation modification

### Priority 3: Certificate-Based Attacks
1. Run `certipy find` with anonymous credentials
2. Look for vulnerable certificate templates
3. Check for ESC1-ESC13 misconfigurations

### Priority 4: Additional Enumeration
1. Check for GPOs with delegation rights
2. Enumerate ACLs on service accounts
3. Check for LAPS configuration
4. Enumerate trust relationships

## Commands Used

```bash
# Port scan
sudo rustscan -a 10.129.95.210 -- -sCV -oA forest.Nmap/forest

# LDAP enumeration
ldapsearch -x -H ldap://10.129.95.210 -b "DC=htb,DC=local" "(objectClass=user)" cn sAMAccountName userPrincipalName description
ldapsearch -x -H ldap://10.129.95.210 -b "DC=htb,DC=local" "(servicePrincipalName=*)" cn sAMAccountName servicePrincipalName userAccountControl

# User enumeration
nxc ldap 10.129.95.210 --users -u '' -p ''

# Kerberoasting
GetUserSPNs.py htb.local/ -dc-ip 10.129.95.210 -no-pass -request -machine-only

# AS-REP roasting
GetNPUsers.py htb.local/ -dc-ip 10.129.95.210 -no-pass -usersfile /dev/stdin

# Password spraying
nxc smb 10.129.95.210 -u sebastien lucinda andy mark santi -p 'Password1' 'Welcome1' ...

# SMB enumeration
nxc smb 10.129.95.210 -u '' -p '' --shares
```

## Summary
This is a Windows Server 2016 Domain Controller with a critical misconfiguration: **unconstrained delegation on the DC itself**. Combined with a recently created service account (svc-alfresco), this provides multiple attack paths. The primary exploitation vector should be coercion-based TGT theft from the DC, followed by DCSync to obtain domain admin credentials.