# level 0
basic file navigation 
flag: W3lc0m3T0Gh0st

# level 
ghost0
basic file navigation 
flag:D4shIsN0tAFl4g
# level 1
ghost1
same thing
flag: H1dd3nInSh4dow

# level 2
ghost2
basic file perm check 
flag: P3rm1ss10ns_M4tt3r 

# ghost 4
```
cat record_* | grep -v "STATUS"
```
thats the solution from the writeup. The way i solved it, i looked into the contents of the only odd file and eventually found the flag
flag: Gr3p_F1nds_Truth
# ghost5
hidden listener
no ss/netstat
1. find localports 
```
nmap -p- --open localhost | grep -oP '^\d+' > ports
```
2. connect to all them 
```
for port in $(cat ports); do echo ""| nc -w1 localhost $port && echo "$port RESPONDED"; done 
```
flag: P0rts_N3v3r_L13

# ghost6
 so the flag was hidden inside the env file(API)
flag: 3nv_L34ks_3v3ryth1ng
# ghost 7 
decode the item 
flag: D3c0d3_0r_D13 
