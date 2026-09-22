---
title: MONTEVERDE
description: Azure connect enumeration and exploitation
date: 2026-09-22T07:00:24.000Z
category: htb
tags:
  - HTB
  - windows
  - SAM
  - AD
difficulty: medium
os: windows
---

## Enumeration

Run an initial Nmap scan:

```bash
nmap -sCV --min-rate 5000 10.10.10.10 
```

### Open ports and 

| port    | service                                            |
| ------- | -------------------------------------------------- |
| 53/tcp  | DNS (SRV records, _services, _dns-sd, _udp, local) |
| 88/tcp  | Kerberos(Authentication)                           |
| 389/tcp | LDAP                                               |
| 464/tcp | kpasswd5                                           |
| 445/tcp | smb                                                |
1. LDAP ENUMERATION
- LDAP naming context discovery, to get the AD domain/forest structure 
```bash
ldapsearch -H ldap://10.10.10.10 -x -s base -b "" namingcontexts
```
`-x` - simple authentication 
`-s base ` - query only the root entry 
`-b ""` - empty base DN (RootDSE)
`namingcontexts` - attribute to retrieve 
> namingcontexts: DC=MEGABANK,DC=LOCAL => focus 
> 
> Other contexts are standard AD partitions:
>CN=Configuration,DC=MEGABANK,DC=LOCAL
  CN=Schema,CN=Configuration,DC=MEGABANK,DC=LOCAL
  DC=DomainDnsZones,DC=MEGABANK,DC=LOCAL
  DC=ForestDnsZones,DC=MEGABANK,DC=LOCAL

Establishes AD domain as `MEGABANK.LOCAL`
- Enumerate using domain as base
```bash
ldap -x -H ldap://10.10.10.10 -b "DC=MEGABANK,DC=LOCAL" > enum
```
> DC: MONTEVERDE.MEGABANK.LOCAL
   Users exist under several OUs, including `MegaBank Users` and `Service Accounts`

- Get username list 
```bash 
ldapsearch -x -H ldap://target -b "DC=MEGABANK,DC=LOCAL" "(objectClass=user) sAMAccountName"
```
get only user names
```bash 
ldapsearch -x -H ldap://target -b "DC=MEGABANK,DC=LOCAL" "(objectClass=user) sAMAccountName" | grep '^sAMAccountName:' | cut -d' ' -f2
```
>Guest
AAD_987d7f2f57d2
mhope
SABatchJobs
svc-ata
svc-bexec
svc-netapp
dgalanos
roleary
smorgan
MONTEVERDE$   ← computer account, not a normal user
## Foothold

How you got initial access.

### Exploitation

Step-by-step exploitation.

```bash
# Commands here
```

Got a shell as `username`.

## User Flag

```bash
cat /home/username/user.txt
```

## Privilege Escalation

How you escalated to root/admin.

```bash
# Commands here
```

## Root Flag

```bash
cat /root/root.txt
```

## Lessons Learned

1. Key takeaway one
2. Key takeaway two
3. Key takeaway three
