Reading from the NTDS directory using LDAP
# LDAP exploration 
**Light weight directory Access Protocol** 
- A domain user is needed for it to work 
- Port(389)
```bash
ldapsearch -H ldap://192.168.253.130 -x -LLL -W -D "miki@clumzzy.local" \
	-b "dc=shadow,dc=local" "(objectclass=computer)" "DNSHostName" "OperatingSystem"
```
1. `-LLL`- 
2. `-W` - prompt for password 
In some other cases where u dont have a domain user  the `NetBios Name Services protocol` (NBTNS), 
# Navigating NBTNS
**NetBios Name Services protocol**
- Port(137)
- It can translate IPs into hostnames 
- Tools/scripts used- `nbstat`, `nbtscan`
