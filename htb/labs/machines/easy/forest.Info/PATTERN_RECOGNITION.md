# Pattern Recognition: What to Look For on AD Machines Like Forest

---

## The Universal AD Enum Checklist (Run On Every Windows Box)

```
	PORT 88 (Kerberos) + 389/636/3268/3269 (LDAP) + 445 (SMB) = ACTIVE DIRECTORY 
        │
        ▼
IMMEDIATELY CHECK THESE 5 THINGS:
```

### 1. **Delegation Misconfigurations** (Highest Impact)
```bash
# The money query - run on EVERY domain
ldapsearch -x -H ldap://<DC> -b "DC=domain,DC=local" \
  "(|(userAccountControl:1.2.840.113556.1.4.803:=524288)
       (userAccountControl:1.2.840.113556.1.4.803:=16777216)
       (msDS-AllowedToDelegateTo=*)
       (msDS-AllowedToActOnBehalfOfOtherIdentity=*))" \
  cn sAMAccountName userAccountControl msDS-AllowedToDelegateTo msDS-AllowedToActOnBehalfOfOtherIdentity
```

**What you're hunting:**

| Flag | Value | Name | Why It Matters |
|------|-------|------|----------------|
| **Unconstrained** | `524288` | `TRUSTED_FOR_DELEGATION` | Service caches TGTs for ANY user → coerce → own domain |
| **Constrained** | `16777216` | `TRUSTED_TO_AUTH_FOR_DELEGATION` | Protocol transition (S4U2Self) → if compromised, impersonate any user to specific SPNs |
| **RBCD** | `msDS-AllowedToActOnBehalfOfOtherIdentity` | Resource-based | Write access on target computer = impersonate anyone to that service |

**Forest Pattern:** DC (FOREST$) has **524288** = 🔴 CRITICAL

---

### 2. **Kerberos Pre-Auth Disabled** (AS-REP Roasting)
```bash
# LDAP filter for DONT_REQUIRE_PREAUTH (4194304)
ldapsearch -x -H ldap://<DC> -b "DC=domain,DC=local" \
  "(userAccountControl:1.2.840.113556.1.4.803:=4194304)" \
  cn sAMAccountName userAccountControl
```
**Pattern:** Any user returned = offline hash crack (hashcat -m 7500/18200)

---

### 3. **User SPNs** (Kerberoasting)
```bash
# Any user with servicePrincipalName set
ldapsearch -x -H ldap://<DC> -b "DC=domain,DC=local" \
  "(servicePrincipalName=*)" cn sAMAccountName servicePrincipalName userAccountControl
```
**Pattern:** User (not computer) with SPN = service account = offline crack (hashcat -m 13100/1800)

---

### 4. **Anonymous LDAP Bind** (Info Leak)
```bash
# Test: no -D -w flags = anonymous
ldapsearch -x -H ldap://<DC> -b "DC=domain,DC=local" -s base
ldapsearch -x -H ldap://<DC> -b "DC=domain,DC=local" "(objectClass=user)" cn
```
**Pattern:** Works = full user/group/computer enum without creds (Forest: YES)

---

### 5. **SMB Null Session** (Share/User Enum)
```bash
nxc smb <DC> -u '' -p '' --shares --users --pass-pol
```
**Pattern:** Shares accessible / user enum works = more attack surface

---

## The "Machine Type" Classification

When you see AD, instantly categorize:

| Type | Indicators | Primary Attack Path |
|------|------------|---------------------|
| **DC with Unconstrained** | Port 88 + `userAccountControl=524288` on DC$ | **Coerce → TGT → DCSync** (Forest) |
| **Member Server Unconstrained** | Non-DC computer with 524288 | Coerce → TGT → lateral to DC |
| **Constrained Delegation** | `msDS-AllowedToDelegateTo` set | Compromise service → S4U2Self → impersonate |
| **RBCD Writable** | Write `msDS-AllowedToAct` on computer | Write RBCD → impersonate admin to service |
| **Kerberoastable Users** | User SPNs exist | Request TGS → crack offline |
| **AS-REP Roastable** | `DONT_REQUIRE_PREAUTH` users | Request AS-REP → crack offline |
| **Certificate Vulns** | AD CS running + ESC1-13 | Enroll cert → persistent access |
| **GPO Abuse** | Write access to GPO / SYSVOL | Deploy script → SYSTEM on targets |
| **ACL Abuse** | GenericAll/WriteDacl/AllExtendedRights | Shadow creds / RBCD / reset password |

---

## The "Coercion Decision Matrix"

| Target OS / Patch Level | Best Coercion | Why |
|------------------------|---------------|-----|
| **Server 2016 / 2019 (unpatched)** | **PetitPotam (EFSRPC)** | Anonymous, forces Kerberos, reliable |
| **Server 2016 / 2019 (Print Spooler on)** | **Printer Bug (MS-RPRN)** | Anonymous, forces Kerberos, classic |
| **Server 2022 / Patched 2019** | **Shadow Credentials / Certs** | EFSRPC/Printer patched, need creds |
| **Any with creds** | **RBCD / S4U2Self / DCOM** | Authenticated coercion options |

**Forest = Server 2016 unpatched → PetitPotam/Printer = ✅**

---

## The "Post-Coercion" Checklist

After ANY coercion attempt, verify:

```
□ Did target authenticate to ME? (tcpdump port 88/445)
□ Was it Kerberos (AP-REQ) or NTLM (NTLMSSP)?
□ If Kerberos: Rubeus caught TGT? (monitor output)
□ If NTLM: ntlmrelayx captured hash? (relay to LDAP/SMB)
□ Can I use the ticket/hash? (PTT / Pass-The-Hash)
□ Does it have replication rights? (DCSync test)
```

---

## BloodHound Queries (Run Immediately After Ingest)

```cypher// 1. Unconstrained Delegation (THE FOREST PATTERN)
MATCH (c:Computer {unconstraineddelegation:true}) RETURN c

// 2. Constrained Delegation
MATCH (c:Computer) WHERE c.allowedtodelegate IS NOT NULL RETURN c

// 3. RBCD Targets
MATCH (c:Computer) WHERE c.allowedtoact IS NOT NULL RETURN c

// 4. Kerberoastable Users
MATCH (u:User {hasspn:true}) RETURN u

// 5. AS-REP Roastable
MATCH (u:User {dontreqpreauth:true}) RETURN u

// 6. Shortest Path from ME to Domain Admins
MATCH (u:User {name:'CURRENT_USER'}), (g:Group {name:'DOMAIN ADMINS@DOMAIN'})
MATCH p = shortestPath((u)-[*]->(g)) RETURN p

// 7. Who Can DCSync? (Replication Rights)
MATCH (n) WHERE n.hasmasterkey=true OR n.replicationrights=true RETURN n
```

---

## The "Forest-Like" Machine Cheat Sheet

| Machine | Vuln | Path |
|---------|------|------|
| **Forest** | DC Unconstrained | PetitPotam → Rubeus → DCSync |
| **Cascade** | LDAP creds in description | LDAP enum → reuse creds |
| **Sauna** | AS-REP Roast | GetNPUsers → hashcat → user shell |
| **Monteverde** | Azure AD Connect creds | SMB enum → creds in SYSVOL |
| **Resolute** | Password in LDAP desc | LDAP enum → user shell → privesc |
| **Active** | GPO + SMB share | Write GPO → scheduled task → SYSTEM |
| **Manager** | RBCD on DC | Write RBCD → impersonate admin |
| **Certified** | ESC1 (Certifried) | Certipy enroll → DA cert |

---

## Mental Shortcuts (Memorize These Patterns)

```
SEE: Port 88 + 389 + 445
THINK: "Active Directory"
DO:    ldapsearch anonymous → check delegation → check preauth → check SPNs

SEE: userAccountControl = 532480 on DC$
THINK: "Unconstrained Delegation on DC = Game Over"
DO:    PetitPotam/Printer → Rubeus monitor → PTT → DCSync

SEE: userAccountControl = 4194304 on user
THINK: "AS-REP Roastable"
DO:    GetNPUsers → hashcat -m 18200

SEE: servicePrincipalName on user (not computer)
THINK: "Kerberoastable Service Account"
DO:    GetUserSPNs -request → hashcat -m 13100

SEE: msDS-AllowedToActOnBehalfOfOtherIdentity writable
THINK: "RBCD"
DO:    Add attacker machine → S4U2Self → impersonate admin

SEE: AD CS (ports 80/443 on CA) + low-priv user
THINK: "Certificate Abuse (ESC1-13)"
DO:    certipy find -vulnerable → certipy req → PTT
```

---

## The 30-Second Triage On Any New AD Box

```bash
# 1. Is it AD?
nmap -p 88,389,445,3268 <IP>  # All open = YES

# 2. Anonymous LDAP?
ldapsearch -x -H ldap://<IP> -b "" -s base  # namingContexts returned = YES

# 3. Delegation on DC?
ldapsearch -x -H ldap://<IP> -b "<DN>" "(sAMAccountName=*$)" userAccountControl | grep 524288

# 4. If #3 YES → STOP ENUM, START EXPLOIT
#    Coerce → Capture → DCSync

# 5. If #3 NO → Continue Enum:
#    - AS-REP roast (4194304)
#    - Kerberoast (user SPNs)
#    - RBCD (msDS-AllowedToAct)
#    - Certificates (certipy find)
#    - Password spray (low rate)
#    - GPO/ACL abuse (BloodHound)
```

---

## Forest Pattern = The Template

**Every AD machine follows this logic:**

```
ENUMERATE DELEGATION FIRST
        │
        ├─► DC Unconstrained? → COERCE → DCSYNC (WIN)
        │
        ├─► Member Unconstrained? → COERCE → LATERAL → DC
        │
        ├─► Constrained/RBCD? → COMPROMISE SERVICE → IMPERSONATE
        │
        ├─► User SPNs? → KERBEROAST → CRACK → SERVICE ACCOUNT
        │
        ├─► No Preauth? → AS-REP ROAST → CRACK → USER
        │
        ├─► Certs? → CERTIFY → PERSIST
        │
        └─► Nothing? → PASSWORD SPRAY / GPO / ACL / TRUSTS
```

**Forest is Path #1.** The rest are fallbacks.

---

*Internalize this pattern. On any new AD box, you should hit delegation check within 2 minutes of confirming port 88.*