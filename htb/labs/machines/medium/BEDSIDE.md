# till we pwn
### Machine : bedside
### OS: linux
### Level: medium 

add the ip to hosts 
```bash
echo "10.10.10.10     bedside.htb" | sudo tee -a /etc/hosts 
```
- [ ] RECON
###### NMAP SCAN 
```bash
sudo nmap --min-rate 5000 -sCV -oA bedside.scan bedside.htb  
```
convert to html 

```bash 
xsltproc bedside.scan.xml > bedside.html 
```
![[Pasted image 20260719013113.png]]
grab the banner 
```bash
curl -I bedside.htb 
```
oputput:
```
HTTP/1.1 200 OK
Date: Sat, 18 Jul 2026 23:33:33 GMT
Server: Apache/2.4.68 (Debian)
Content-Type: text/html; charset=UTF-8
```
VHOST discovery 
```bash
gobuster vhost -u bedside.htb \
 -w /home/clumzzy/SecLists/Discovery/DNS/bitquark-subdomains-top100000.txt --append-domain
```
found :
> research.bedside.htb

add it to hosts too 

banner grab 
```bash 
curl -I http://research.bedside.htb 
```
output:
```
HTTP/1.1 200 OK
Date: Sat, 18 Jul 2026 23:38:00 GMT
Server: Apache/2.4.68 (Debian)
X-Powered-By: pdfminer.six
Content-Type: text/html; charset=UTF-8
```

visiting the domain, file upload attacks raise curiosity
- [ ] FOOTHOLD
- [ ] PRIV ESC


