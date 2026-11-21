# tiny — LDAP triage report

_2 objects · htb.local · generated 2026-11-18 20:07_

## Pyramid

| Tier | Objects | Meaning |
|------|---------|---------|
| 0 · CROWN JEWELS | 0 | direct path to domain takeover |
| 1 · HIGH VALUE | 1 | privilege-escalation primitives |
| 2 · MEDIUM | 0 | useful targets and context |
| 3 · LOW | 1 | background noise |

## Priority queue

| Score | Tier | Object | Type | Why |
|-------|------|--------|------|-----|
| 70 | T1 | `FOREST$` | computer | Domain Controller |
| 15 | T3 | `EXCH01$` | computer | no escalation signals |

## Sources

- `stdin`

---

Scoring is heuristic and based solely on attributes present in the dump. ACL edges (`nTSecurityDescriptor`) are not analysed.
