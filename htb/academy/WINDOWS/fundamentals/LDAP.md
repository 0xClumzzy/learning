	# Light Weight Directory Access Protocol
- A protocol for reading and writing to a directory; *a hierachal, read-optimized database of people, computers, and other objects*
***USE CASES***
- Authentication 
- Authorization 
- Lookup 
**ports** 
- 389(plain/StartTLS)
- 636(LDAPS)
- 3268/3269(AD Global Catalog)
***THE TREE***
Data lives in a *Directory Information Tree*
```
dc=example,dc=com            #root (the "base")
├── ou=People
│   ├── uid=mod
│   └── uid=zinger
└── ou=Groups
    └── cn=admins
```
Each node is an entry and each entry has a unique aadress called a a *Distinguished Name* (DN)

| Term            | Meaning                                              | Example                               |
| --------------- | ---------------------------------------------------- | ------------------------------------- |
| **DN**          | Distinguished Name, the full unique path             | `uid=mod,ou=People,dc=example,dc=com` |
| **RDN**         | Relative DN, the leftmost piece                      | `uid=mod`                             |
| **DC**          | Domain Component                                     | `dc=example,dc=com` = example.com     |
| **OU**          | Organizational Unit (a folder)                       | `ou=People`                           |
| **CN**          | Common Name                                          | `cn=Cap Mod`                          |
| **UID**         | User ID                                              | `uid=mod`                             |
| **Attribute**   | A key with one or more values                        | `mail: mod@example.com`               |
| **objectClass** | The “type” that defines which attributes are allowed | `inetOrgPerson`                       |
| **Schema**      | The rulebook of all objectClasses and attributes     |                                       |

***The operations**

|Operation|Purpose|
|---|---|
|**Bind**|Authenticate (log in)|
|**Search**|Query entries (by far the most common)|
|**Add**|Create an entry|
|**Modify**|Change attributes|
|**Delete**|Remove an entry|
|**ModifyDN**|Rename or move an entry|
|**Compare**|Check if an attribute has a value|
|**Unbind**|Close the connection|
|**StartTLS**|Upgrade to an encrypted connection|
**Bind types:** _anonymous_ (no creds), _simple_ (DN + password, so use TLS!), _SASL_ (Kerberos/GSSAPI, etc.).

***Searching (the skill that matters most)***

Every search has five parts:

1. **Base DN**: where to start
2. **Scope**: `base` (just that entry), `one` (direct children), `sub` (whole subtree)
3. **Filter**: what to match
4. **Attributes**: what to return
5. _(Optional)_ size/time limits, deref options
***Filter syntax***

Filters use **prefix notation** with parentheses:

```
(uid=thegi)                          equality
(mail=*@example.com)                 wildcard
(uid=*)                              presence
(uidNumber>=1000)                    comparison
(&(objectClass=person)(uid=alice))   AND
(|(uid=whois)(uid=ted))              OR
(!(uid=zuur))                       NOT
(&(objectClass=person)(|(ou=IT)(ou=HR))(!(uid=guest)))   nested
```

# PRACTICE 
Install `openldap-clients` (`ldap-utils` on Debian, `openldap` on Arch)

Flag cheat sheet: `-x` simple auth, `-H` server URI, `-b` base DN, `-D` bind DN, `-w` password (`-W` prompts), `-s` scope, `-ZZ` require StartTLS.
1. Anonymous search 
```bash 
ldapsearch -x -H ldap://ldap.forumsys.com \ 
 -b "dc=example,dc=com" \
 "(objectClass=*)"
```
2. Specific user and details: only the user "einstein", return only cn and mail
```bash
ldapsearch -x -H ldap://ldap.forumsys.com \
	-b "dc=example,dc=com" -s sub \
	"(uid=username)" cn mail
	
```
`-s `, the scope flag specifies how for to search 
### The three scopes

|Scope|Flag|What it searches|Folder analogy|
|---|---|---|---|
|**base**|`-s base`|Only the base entry itself|Look at just this one folder’s properties|
|**one**|`-s one`|Only the **direct children** of the base|Look at what’s directly inside this folder, not subfolders|
|**sub**|`-s sub`|The base **and everything beneath it**, however deep|
3. Authenticated bind
```bash 
ldapsearch -x -H ldap://ldap.forumsys.com \
	-b "dc=example,dc=com" "(objectClass=person)" \
	-D "cn=admin,dc=example,dc=com" -w password 
```

### How apps use LDAP for login
The usual pattern:
1. App binds with a **service account**.
2. App searches for the user: `(uid=alice)`, getting back the user’s DN.
3. App **re-binds as that DN with the supplied password**. Success means authenticated.
4. App searches group membership (`memberOf` in AD, or `(&(objectClass=groupOfNames)(member=<userDN>))`).
***Notes***
AD speaks LDAP but has quirks: it uses `sAMAccountName` and `userPrincipalName` instead of `uid`, `memberOf` is built in, and the root is your domain (`dc=corp,dc=local`). 
Useful AD filters:
```
(&(objectCategory=person)(objectClass=user))       all users
(servicePrincipalName=*)                           accounts with SPNs
(userAccountControl:1.2.840.113556.1.4.803:=2)     disabled accounts (bitwise match)
```
