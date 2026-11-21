# Mental Models for AD Delegation & Forest Exploitation

---

## 1. The "Keys to the Kingdom" Model (Delegation Mental Model)

```
┌────────────────────────────────────────────────────────────────────┐
│                    DELEGATION = "IMPERSONATION RIGHTS"             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────┐     requests ticket on behalf of     ┌─────────┐ │
│  │   SERVICE   │ ──────────────────────────────────▶ │  USER   │ │
│  │  (FOREST$)  │          "I am User X"              │  (Admin)│ │
│  └─────────────┘                                     └─────────┘ │
│        │                                                    │      │
│        │  TRUSTED_FOR_DELEGATION                            │      │
│        │  (Unconstrained = ANY service, ANY user)           │      │
│        ▼                                                    ▼      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  KDC ISSUES:  TGT for User X  →  Service gets User X's TGT  │ │
│  │  CACHED IN:   LSASS on FOREST$ (the DC!)                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  💡 MENTAL HOOK: "Unconstrained Delegation = Service holds        │
│     master keys for EVERY user who authenticates to it"           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Key Insight:** On a DC, *every domain admin* authenticates daily → their TGTs live in DC's LSASS. Compromise DC → get all TGTs.

---

## 2. The Kerberos Ticket Flow Model

```
┌────────────────────────────────────────────────────────────────────┐
│                    KERBEROS: THREE LEGS OF TRUST                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   ┌─────────┐     AS-REQ (user + pwd)      ┌─────────┐           │
│   │  USER   │ ────────────────────────────▶ │   KDC   │           │
│   └─────────┘                              │ (DC)    │           │
│        │                                    └────┬────┘           │
│        │                         TGT (encrypted with krbtgt)      │
│        │                                    │                   │
│        │     TGS-REQ (TGT + SPN)            │                   │
│        │ ─────────────────────────────────▶ │                   │
│        │                                    │                   │
│        │              TGS (Service Ticket)  │                   │
│        │ ◀───────────────────────────────── │                   │
│        │                                    │                   │
│        │     AP-REQ (TGS + Authenticator)   │                   │
│        │ ─────────────────────────────────▶ │                   │
│        ▼                                    ▼                   │
│   ┌─────────┐                          ┌─────────┐             │
│   │ SERVICE │                          │  USER   │             │
│   └─────────┘                          └─────────┘             │
│                                                                    │
│  DELEGATION TWISTS THIS:                                          │
│  ─────────────────────                                           │
│  Service says "I'm User X" → KDC gives Service a TGS *for User X* │
│  Service now holds User X's identity to ANY service               │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Mental Model:** Kerberos = **Trusted Third Party (KDC)** issues tickets. Delegation = **Service lies to KDC** saying "I'm the user."

---

## 3. The Coercion → Capture → Exploit Chain (Attack Mental Model)

```
┌────────────────────────────────────────────────────────────────────┐
│              THE 3-STEP DELEGATION EXPLOIT PATTERN                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  STEP 1: COERCE              STEP 2: CAPTURE           STEP 3: USE │
│  ─────────────              ──────────────           ─────────── │
│                                                                    │
│  Make target                Intercept the              Use stolen  │
│  authenticate TO            authentication             cred/ticket │
│  YOU (attacker)             (NTLM relay OR            to escalate  │
│                             Kerberos TGT)                           │
│                                                                    │
│  ┌──────────────┐          ┌──────────────┐          ┌────────┐   │
│  │ PetitPotam   │ ──────▶  │ Rubeus       │ ──────▶  │ DCSync │   │
│  │ Printer Bug  │          │ monitor      │          │ / PTT  │   │
│  │ MS-EFSRPC    │          │ / ntlmrelayx │          │        │   │
│  └──────────────┘          └──────────────┘          └────────┘   │
│        │                         │                        │        │
│        ▼                         ▼                        ▼        │
│  "Hey DC,                  "Got DC's              "DC, give me    │
│   connect to               TGT!"                   all hashes"    │
│   \\attacker\share"                                             │
│                                                                    │
│  💡 MENTAL HOOK: "Authentication is a projectile.                │
│     Coercion aims it. Capture catches it. Exploit fires it."     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Why this works on Forest:**
- DC has unconstrained delegation → **must** accept Kerberos auth from anyone
- PetitPotam/Printer makes DC connect to attacker via SMB/RPC
- DC sends **Kerberos AP-REQ** (contains TGT) to attacker
- Attacker extracts TGT → impersonates DC → DCSync

---

## 4. The "Delegation Hierarchy" Model (Risk Ranking)

```
┌────────────────────────────────────────────────────────────────────┐
│                   DELEGATION RISK LADDER                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  🔴 CRITICAL: Unconstrained on DC (Forest$)                       │
│     │  → Caches EVERY user's TGT                                   │
│     │  → Coercion = instant Domain Admin                           │
│     ▼                                                               │
│  🟠 HIGH: Unconstrained on Member Server                          │
│     │  → Caches users who auth to that server                      │
│     │  → Lateral movement path                                     │
│     ▼                                                               │
│  🟡 MEDIUM: Constrained Delegation (msDS-AllowedToDelegateTo)     │
│     │  → Limited to specific SPNs                                  │
│     │  → Abusable if you compromise the service account            │
│     ▼                                                               │
│  🟢 LOW: Resource-Based Constrained Delegation (RBCD)             │
│     │  → msDS-AllowedToActOnBehalfOfOtherIdentity                  │
│     │  → Controlled by RESOURCE owner, not service                 │
│     │  → Requires write access on target computer object           │
│     ▼                                                               │
│  ⚪ NONE: "Account is sensitive and cannot be delegated"           │
│     │  → Protected Users group / manual flag                       │
│     │  → Blocks ALL delegation for that account                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Forest Lessons:**
- FOREST$ = 🔴 (DC with unconstrained)
- EXCH01$ = 🟡 (Constrained to Exchange SPNs)
- svc-alfresco = 🟢/⚪ (No delegation configured yet - but *writable* by admin)

---

## 5. The "Trust Boundary" Model (Defense Mental Model)

```
┌────────────────────────────────────────────────────────────────────┐
│                  WHERE TO BREAK THE CHAIN                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ATTACK CHAIN:  Coerce → Capture → TGT → DCSync → DA              │
│                 │         │       │        │        │             │
│                 ▼         ▼       ▼        ▼        ▼             │
│  DEFENSE:       │         │       │        │        │             │
│  ─────────────────────────────────────────────────────────         │
│  1. PREVENT     2. DETECT  3. LIMIT  4. PROTECT  5. MONITOR       │
│  COERCION       CAPTURE    DELEGATION  KRBTGT    DCSYNC           │
│                                                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │ Disable     │  │ Event 4624  │  │ "Account    │               │
│  │ Print       │  │ (Logon      │  │ sensitive  │               │
│  │ Spooler /   │  │ Type 3/9)   │  │ cannot be  │               │
│  │ EFSRPC /    │  │ + 4769      │  │ delegated" │               │
│  │ PetitPotam  │  │ (TGS req)   │  │ on admins  │               │
│  │ patches     │  │ from DC     │  │             │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
│                                                                    │
│  💡 MENTAL HOOK: "Defense in depth = break ANY link.              │
│     Best: Prevent coercion (patch). Good: Detect TGT theft.       │
│     Last resort: Protect krbtgt / monitor DCSync."                │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 6. The "Object Identity" Model (BloodHound/Graph Thinking)

```
┌────────────────────────────────────────────────────────────────────┐
│                    AD AS A GRAPH (BloodHound Mental Model)         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  NODES = Identities          EDGES = Permissions/Trust            │
│  ─────────────────           ────────────────────────             │
│  User                        MemberOf                              │
│  Computer                    HasSession                            │
│  Group                       AdminTo                               │
│  GPO                         AllowedToDelegate  ← KEY EDGE        │
│  Domain                      AllowedToAct                         │
│  OU                          CanRDP                                │
│  Container                   CanPSRemote                           │
│  Trust                       ExecuteDCOM                           │
│  ...                         ...                                   │
│                                                                    │
│  FOREST ATTACK PATH:                                              │
│  ─────────────────                                                │
│                                                                    │
│  (Attacker) ──Coerce──▶ [FOREST$] ──UnconstrainedDelegation──▶   │
│                                                     [TGT Cache]   │
│                                                          │        │
│                                                          ▼        │
│  [Administrator] ◀──DCSync── [Domain Admins] ◀──MemberOf──      │
│                                                                    │
│  💡 MENTAL HOOK: "Every AD attack is a GRAPH TRAVERSAL.           │
│     Find the shortest path from YOUR node to Domain Admins."      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 7. Quick Reference Card: Delegation Flags

| `userAccountControl` | Hex | Name | Meaning |
|---------------------|-----|------|---------|
| **524288** | `0x80000` | `TRUSTED_FOR_DELEGATION` | **Unconstrained** - Can delegate to ANY service |
| **16777216** | `0x1000000` | `TRUSTED_TO_AUTH_FOR_DELEGATION` | **Constrained** - Protocol transition (S4U2Self) |
| **8388608** | `0x800000` | `PARTIAL_SECRETS_ACCOUNT` | RODC |
| **4194304** | `0x400000` | `DONT_REQUIRE_PREAUTH` | **AS-REP Roastable** |
| **262144** | `0x40000` | `USE_DES_KEY_ONLY` | Weak crypto |
| **532480** = 524288 + 8192 | | **Forest$ value** | Unconstrained + TrustedToAuth |

**Decode any value:**
```bash
python3 -c "
val = 532480
flags = {
    524288: 'TRUSTED_FOR_DELEGATION (UNCONSTRAINED)',
    16777216: 'TRUSTED_TO_AUTH_FOR_DELEGATION',
    4194304: 'DONT_REQUIRE_PREAUTH (AS-REP)',
    8388608: 'PARTIAL_SECRETS_ACCOUNT (RODC)',
    262144: 'USE_DES_KEY_ONLY',
    8192: 'TRUSTED_TO_AUTH_FOR_DELEGATION (old flag)',
}
for k,v in flags.items():
    if val & k: print(f'  ✓ {v}')
"
```

---

## Summary: 3 Mental Models to Internalize

| Model | One-Liner | Forest Application |
|-------|-----------|-------------------|
| **Delegation = Impersonation Rights** | "Service holds user's keys" | DC holds *everyone's* keys |
| **Coercion → Capture → Exploit** | "Aim, catch, fire" | PetitPotam → Rubeus → DCSync |
| **AD = Graph** | "Shortest path to DA" | FOREST$ → TGT Cache → DCSync → Admin |