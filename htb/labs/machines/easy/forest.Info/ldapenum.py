#!/usr/bin/env python3
"""
ldapenum.py - Automate common anonymous/authenticated LDAP enumeration
against an Active Directory domain controller during a pentest/CTF engagement.

Wraps the classic ldapsearch -x sequence:
  1. Domain naming context / rootDSE info
  2. All user objects (with key attack-relevant attributes)
  3. SPN enumeration (Kerberoasting targets)
  4. Computer accounts (unconstrained/constrained delegation flags, RBCD)
  5. Arbitrary group membership lookup (e.g. "Service Accounts")
  6. (optional, --all) Generic catch-all dump of every object + every attribute

Usage:
  python3 ldapenum.py -H 10.129.95.210 -d htb.local
  python3 ldapenum.py -H 10.129.95.210 -d htb.local -u 'svc_user' -w 'Password123' --group "Service Accounts"
  python3 ldapenum.py -H 10.129.95.210 -d htb.local --ssl
  python3 ldapenum.py -H 10.129.95.210 -d htb.local --all

Requires: ldap3 (pip install ldap3 --break-system-packages)
          Falls back to shelling out to `ldapsearch` if ldap3 isn't available.
"""

import argparse
import os
import subprocess
import sys
from datetime import datetime

# ---- UAC flag bits worth flagging ----
UAC_FLAGS = {
    0x0002: "ACCOUNTDISABLE",
    0x0010: "LOCKOUT",
    0x0020: "PASSWD_NOTREQD",
    0x0040: "PASSWD_CANT_CHANGE",
    0x0200: "NORMAL_ACCOUNT",
    0x0800: "TRUSTED_FOR_DELEGATION",      # unconstrained delegation
    0x1000: "NOT_DELEGATED",
    0x80000: "TRUSTED_TO_AUTH_FOR_DELEGATION",  # constrained delegation
    0x100000: "DONT_REQ_PREAUTH",          # ASREPRoastable
}


def decode_uac(value):
    try:
        v = int(value)
    except (TypeError, ValueError):
        return []
    return [name for bit, name in UAC_FLAGS.items() if v & bit]


def base_dn_from_domain(domain):
    return ",".join(f"DC={p}" for p in domain.split("."))


def try_ldap3(args, base_dn, loot_dir):
    try:
        from ldap3 import Server, Connection, ALL, SUBTREE
    except ImportError:
        return False

    server = Server(args.host, use_ssl=args.ssl, get_info=ALL, port=args.port)
    if args.user:
        user_dn = args.user if "@" in args.user or "=" in args.user else f"{args.user}@{args.domain}"
        conn = Connection(server, user=user_dn, password=args.password, auto_bind=True)
    else:
        conn = Connection(server, auto_bind=True)  # anonymous

    print(f"[+] Bound to {args.host} ({'auth' if args.user else 'anonymous'})")

    # 1. rootDSE / base info
    print("\n[1] Domain naming context / rootDSE")
    info = server.info
    print(info)
    with open(os.path.join(loot_dir, "rootdse.txt"), "w") as f:
        f.write(str(info))

    # 2. All users
    print(f"\n[2] Enumerating user objects under {base_dn} ...")
    user_attrs = ["cn", "sAMAccountName", "userPrincipalName", "description",
                  "userAccountControl", "lastLogon", "pwdLastSet", "badPwdCount",
                  "servicePrincipalName", "msDS-AllowedToDelegateTo",
                  "msDS-AllowedToActOnBehalfOfOtherIdentity"]
    conn.search(base_dn, "(objectClass=user)", SUBTREE, attributes=user_attrs)
    users = conn.entries
    with open(os.path.join(loot_dir, "ldap-users.ldif"), "w") as f:
        for e in users:
            f.write(e.entry_to_ldif() + "\n")
    print(f"    -> {len(users)} user objects saved to loot/ldap-users.ldif")

    interesting_users = []
    constrained_deleg = []   # (name, [allowed SPN targets])
    rbcd_users = []          # (name,) — has an RBCD security descriptor set on it
    for e in users:
        uac = e["userAccountControl"].value if "userAccountControl" in e else None
        flags = decode_uac(uac)
        allowed_to_delegate = e["msDS-AllowedToDelegateTo"].values if "msDS-AllowedToDelegateTo" in e else []
        has_rbcd = bool(e["msDS-AllowedToActOnBehalfOfOtherIdentity"].value) if "msDS-AllowedToActOnBehalfOfOtherIdentity" in e else False

        if allowed_to_delegate:
            constrained_deleg.append((str(e.sAMAccountName), allowed_to_delegate))
        if has_rbcd:
            rbcd_users.append(str(e.sAMAccountName))

        if any(f in flags for f in ("DONT_REQ_PREAUTH", "TRUSTED_FOR_DELEGATION",
                                     "TRUSTED_TO_AUTH_FOR_DELEGATION")) or \
           (e["servicePrincipalName"].value if "servicePrincipalName" in e else None) or \
           allowed_to_delegate or has_rbcd:
            interesting_users.append((str(e.sAMAccountName), flags,
                                       e["servicePrincipalName"].value if "servicePrincipalName" in e else None))

    # 3. SPNs (Kerberoasting)
    print("\n[3] Enumerating SPNs (Kerberoasting targets) ...")
    conn.search(base_dn, "(servicePrincipalName=*)", SUBTREE,
                attributes=["cn", "sAMAccountName", "servicePrincipalName", "userAccountControl"])
    spns = conn.entries
    with open(os.path.join(loot_dir, "ldap-spns.ldif"), "w") as f:
        for e in spns:
            f.write(e.entry_to_ldif() + "\n")
    print(f"    -> {len(spns)} SPN-bearing accounts saved to loot/ldap-spns.ldif")

    # 4. Computer accounts
    print("\n[4] Enumerating computer accounts (delegation check) ...")
    conn.search(base_dn, "(objectClass=computer)", SUBTREE,
                attributes=["cn", "sAMAccountName", "userAccountControl", "servicePrincipalName",
                            "msDS-AllowedToDelegateTo", "msDS-AllowedToActOnBehalfOfOtherIdentity"])
    computers = conn.entries
    with open(os.path.join(loot_dir, "ldap-computers.ldif"), "w") as f:
        for e in computers:
            f.write(e.entry_to_ldif() + "\n")
    print(f"    -> {len(computers)} computer objects saved to loot/ldap-computers.ldif")

    deleg_computers = []
    for e in computers:
        uac = e["userAccountControl"].value if "userAccountControl" in e else None
        flags = decode_uac(uac)
        allowed_to_delegate = e["msDS-AllowedToDelegateTo"].values if "msDS-AllowedToDelegateTo" in e else []
        has_rbcd = bool(e["msDS-AllowedToActOnBehalfOfOtherIdentity"].value) if "msDS-AllowedToActOnBehalfOfOtherIdentity" in e else False

        if allowed_to_delegate:
            constrained_deleg.append((str(e.sAMAccountName), allowed_to_delegate))
        if has_rbcd:
            rbcd_users.append(str(e.sAMAccountName))

        if "TRUSTED_FOR_DELEGATION" in flags or "TRUSTED_TO_AUTH_FOR_DELEGATION" in flags \
           or allowed_to_delegate or has_rbcd:
            deleg_computers.append((str(e.sAMAccountName), flags))

    # 5b. Generic "everything" dump (optional)
    if args.all:
        print(f"\n[*] Dumping ALL objects under {base_dn} with ALL attributes (this can be large) ...")
        conn.search(base_dn, "(objectClass=*)", SUBTREE, attributes=["*", "+"])
        all_entries = conn.entries
        with open(os.path.join(loot_dir, "ldap-all.ldif"), "w") as f:
            for e in all_entries:
                f.write(e.entry_to_ldif() + "\n")
        print(f"    -> {len(all_entries)} objects (every attribute) saved to loot/ldap-all.ldif")

        # Quick breakdown by objectClass so you know what's in there
        from collections import Counter
        class_counts = Counter()
        for e in all_entries:
            if "objectClass" in e:
                # most specific (last) objectClass value is usually the meaningful one
                classes = e["objectClass"].values
                if classes:
                    class_counts[classes[-1]] += 1
        if class_counts:
            print("    Object type breakdown:")
            for cls, count in class_counts.most_common():
                print(f"      {cls}: {count}")

    # 5. Group membership (optional)
    group_members = None
    if args.group:
        print(f"\n[5] Looking up members of group: {args.group}")
        conn.search(base_dn, f"(cn={args.group})", SUBTREE, attributes=["member"])
        if conn.entries:
            group_members = conn.entries[0]["member"].values if "member" in conn.entries[0] else []
            with open(os.path.join(loot_dir, "ldap-group-members.txt"), "w") as f:
                f.write("\n".join(group_members))
            print(f"    -> {len(group_members)} members saved to loot/ldap-group-members.txt")
        else:
            print(f"    -> group '{args.group}' not found")

    # ---- Summary ----
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    if interesting_users:
        print("\n[!] Users with interesting UAC flags or SPNs:")
        for name, flags, spn in interesting_users:
            tag = ", ".join(flags) if flags else ""
            spn_tag = f" SPN={spn}" if spn else ""
            print(f"    - {name}: {tag}{spn_tag}")
    else:
        print("\n[-] No ASREPRoastable/delegation-flagged user accounts found.")

    if deleg_computers:
        print("\n[!] Computer accounts with delegation flags:")
        for name, flags in deleg_computers:
            print(f"    - {name}: {', '.join(flags)}")
    else:
        print("\n[-] No computer accounts with delegation flags found.")

    if spns:
        print(f"\n[!] {len(spns)} Kerberoastable SPN(s) — feed ldap-spns.ldif into GetUserSPNs.py / Impacket for ticket requests.")

    if constrained_deleg:
        print("\n[!] Constrained delegation (msDS-AllowedToDelegateTo) configured:")
        for name, targets in constrained_deleg:
            print(f"    - {name} can delegate to:")
            for t in targets:
                print(f"        {t}")
        print("    -> Abuse: obtain a ticket for this account (Kerberoast if it's roastable, or")
        print("       compromise it directly), then use it to impersonate any user to the listed")
        print("       SPNs (S4U2Self/S4U2Proxy, e.g. via Impacket's getST.py).")

    if rbcd_users:
        print("\n[!] Resource-Based Constrained Delegation (msDS-AllowedToActOnBehalfOfOtherIdentity) set on:")
        for name in rbcd_users:
            print(f"    - {name}")
        print("    -> Abuse: whoever is listed in that security descriptor can impersonate any user")
        print("       to this object. If you control (or can create) a computer account with write")
        print("       access here, you can add yourself and forge a ticket (rbcd.py / Impacket).")

    conn.unbind()
    return True


def fallback_shell(args, base_dn, loot_dir):
    """Fall back to shelling out to the real ldapsearch binary if ldap3 isn't installed."""
    print("[*] ldap3 not available — falling back to `ldapsearch` CLI binary.")
    proto = "ldaps" if args.ssl else "ldap"
    uri = f"{proto}://{args.host}"
    auth = []
    if args.user:
        user_dn = args.user if "@" in args.user or "=" in args.user else f"{args.user}@{args.domain}"
        auth = ["-D", user_dn, "-w", args.password]
    else:
        auth = ["-x"]  # anonymous simple bind

    def run(filters_desc, ldap_filter, attrs, outfile):
        print(f"\n[*] {filters_desc}")
        cmd = ["ldapsearch", "-x", "-H", uri, "-b", base_dn] + (auth if args.user else []) + \
              [ldap_filter] + attrs + ["-o", "ldif-wrap=no"]
        with open(os.path.join(loot_dir, outfile), "w") as f:
            result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)
        if result.returncode != 0:
            print(f"    [!] ldapsearch returned nonzero: {result.stderr.strip()[:300]}")
        else:
            print(f"    -> saved to loot/{outfile}")

    run("Domain naming context / rootDSE", "-s", ["base"], "rootdse.txt")
    run("All user objects", "(objectClass=user)",
        ["cn", "sAMAccountName", "userPrincipalName", "description", "userAccountControl",
         "lastLogon", "pwdLastSet", "badPwdCount", "servicePrincipalName"],
        "ldap-users.ldif")
    run("SPN enumeration (Kerberoasting)", "(servicePrincipalName=*)",
        ["cn", "sAMAccountName", "servicePrincipalName", "userAccountControl"],
        "ldap-spns.ldif")
    run("Computer accounts", "(objectClass=computer)",
        ["cn", "sAMAccountName", "userAccountControl", "servicePrincipalName"],
        "ldap-computers.ldif")
    if args.group:
        run(f"Group membership: {args.group}", f"(cn={args.group})", ["member"],
            "ldap-group-members.txt")
    if args.all:
        print(f"\n[*] Dumping ALL objects under {base_dn} with ALL attributes (this can be large) ...")
        cmd = ["ldapsearch", "-x", "-H", uri, "-b", base_dn] + (auth if args.user else []) + \
              ["(objectClass=*)", "*", "+", "-o", "ldif-wrap=no"]
        with open(os.path.join(loot_dir, "ldap-all.ldif"), "w") as f:
            result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)
        if result.returncode != 0:
            print(f"    [!] ldapsearch returned nonzero: {result.stderr.strip()[:300]}")
        else:
            print(f"    -> saved to loot/ldap-all.ldif")

    print("\n[*] Raw LDIFs saved. Run this script with `pip install ldap3 --break-system-packages`")
    print("    for automatic UAC flag decoding and a Kerberoasting/delegation/RBCD summary.")
    print("    (Without ldap3, check ldap-users.ldif / ldap-computers.ldif by hand for")
    print("     msDS-AllowedToDelegateTo and msDS-AllowedToActOnBehalfOfOtherIdentity.)")
    return True


def main():
    ap = argparse.ArgumentParser(description="Automate LDAP enumeration against an AD DC.")
    ap.add_argument("-H", "--host", required=True, help="DC IP or hostname")
    ap.add_argument("-d", "--domain", required=True, help="FQDN domain, e.g. htb.local")
    ap.add_argument("-u", "--user", help="Username for authenticated bind (omit for anonymous)")
    ap.add_argument("-w", "--password", help="Password for authenticated bind")
    ap.add_argument("-p", "--port", type=int, default=None, help="Override LDAP port")
    ap.add_argument("--ssl", action="store_true", help="Use LDAPS")
    ap.add_argument("--group", help="Group CN to enumerate membership of, e.g. 'Service Accounts'")
    ap.add_argument("--all", action="store_true",
                    help="Also dump every object under the base DN with every attribute (objectClass=*) into loot/ldap-all.ldif")
    ap.add_argument("-o", "--outdir", default="loot", help="Output directory (default: loot)")
    args = ap.parse_args()

    if args.user and not args.password:
        ap.error("-u requires -w")

    base_dn = base_dn_from_domain(args.domain)
    loot_dir = args.outdir
    os.makedirs(loot_dir, exist_ok=True)

    print(f"[*] Target: {args.host}  Domain: {args.domain}  Base DN: {base_dn}")
    print(f"[*] Started: {datetime.now().isoformat(timespec='seconds')}")

    if not try_ldap3(args, base_dn, loot_dir):
        fallback_shell(args, base_dn, loot_dir)


if __name__ == "__main__":
    main()
