# Machine: Orion 
### Level: Eazy
### OS: linux

add the machine to hosts 
```bash
echo "20.20.20.20     orion.htb" | sudo tee -a /etc/hosts  
```
set up workspace
```bash
mkdir orion/orion.Info/orion.Nmap
```
##### RECON

- [x] Nmap scan 
```bash
sudo nmap --min-rate 5000 -sCV -p- orion.htb -oA ./orion.Info/orion.nmap/
```
results:

| port   | service/version                                               |
| ------ | ------------------------------------------------------------- |
| 22/tcp | OpenSSH 8.9p1 Ubuntu 3ubuntu0.15 (Ubuntu Linux; protocol 2.0) |
| 80/tcp | nginx 1.18.0 (Ubuntu)                                         |

- [x] Directory discovery 
```bash 
gobuster dir -u http://orion.htb/api/ -w /home/clumzzy/SecLists/Discovery/Web-Content/api/api-endpoints.txt -s "200,201,204,301,302,307,401,403" -t 30
```
```
admin                (Status: 302) [Size: 0] [--> http://orion.htb/admin/login]
assets               (Status: 301) [Size: 178] [--> http://orion.htb/assets/]

```

- *Login page*- Powered by Craft CMS 5.6.16 
	- http://orion.htb/admin/login
