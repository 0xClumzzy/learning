---
title: INTELLIGENCE
description: A windows machine with active directory  with document bruteforcing for username discovery
date: 2026-10-20T01:46:41.000Z
category: htb
tags:
  - windows
  - nmap
  - ad
difficulty: medium
os: windows 
---

## Enumeration

### Port scan
 Nmap scan:

```bash
nmap --min-rate 5000 -sCV -oX nmap/intel 10.10.10.x
```

| Port     | State | Service              | Version / Notes                            |
| -------- | ----- | -------------------- | ------------------------------------------ |
| 53/tcp   | open  | DNS                  | Simple DNS Plus                            |
| 80/tcp   | open  | HTTP                 | Microsoft IIS 10.0 — Title: `Intelligence` |
| 88/tcp   | open  | Kerberos             | Server time: `2026-10-20 07:27:27Z`        |
| 135/tcp  | open  | MSRPC                | Microsoft Windows RPC                      |
| 139/tcp  | open  | NetBIOS-SSN          | Microsoft Windows                          |
| 389/tcp  | open  | LDAP                 | AD LDAP — Domain: `intelligence.htb`       |
| 445/tcp  | open  | SMB                  | microsoft-ds                               |
| 464/tcp  | open  | kpasswd5             | Kerberos password change                   |
| 593/tcp  | open  | RPC over HTTP        | Microsoft Windows RPC/HTTP 1.0             |
| 636/tcp  | open  | LDAPS                | (SSL)                                      |
| 3268/tcp | open  | Global Catalog LDAP  | AD LDAP                                    |
| 3269/tcp | open  | Global Catalog LDAPS | (SSL)                                      |
| 5985/tcp | open  | WinRM                | Microsoft HTTPAPI 2.0 — `Not Found`        |
### Web enumeration 
The web server has 2 pdfs that reflect at time stamp on it, editing the timestamp to a relative one confirms a hit making an assumption of potential users, all hits have a different creator in their metadata that can be viewed with exiftool. 
- A python script to download every iteration of the date from `2019-01-01` → `2019-12-15` saves the pdfs
- Another script searches for buzzwords like password, and we get a hit 
1. Script for  downloads, it saves the users in a wordlist(`cere)
```python
#!/usr/bin/env python3
"""
Date-based document brute forcer
Range: 2020-01-01 to 2020-12-15
Pattern: http://10.10.10.10/documents/YYYY-MM-DD-upload.pdf
"""

import os
import requests
from datetime import date, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover
    from PyPDF2 import PdfReader

BASE_URL = "http://10.129.95.154/documents/{}-upload.pdf"
START    = date(2020, 1, 1)
END      = date(2020, 12, 15)
OUTPUT   = os.getcwd()
WORKERS  = 10
CREATORS_FILE = os.path.join(OUTPUT, "creators.txt")


def daterange(start: date, end: date):
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


def fetch_one(d: date):
    date_str = d.strftime("%Y-%m-%d")
    url = BASE_URL.format(date_str)
    try:
        r = requests.get(url, timeout=5)
        return d, date_str, url, r.status_code, r.content, None
    except requests.exceptions.ConnectionError:
        return d, date_str, url, None, None, "CONN ERR"
    except requests.exceptions.Timeout:
        return d, date_str, url, None, None, "TIMEOUT"
    except Exception as e:  # pylint: disable=broad-except
        return d, date_str, url, None, None, f"ERR: {e}"


def extract_creator(path: str) -> str:
    try:
        reader = PdfReader(path)
        meta = reader.metadata
        if meta is not None and getattr(meta, "creator", None):
            return str(meta.creator)
        # Fallback for dict-like metadata
        if isinstance(meta, dict):
            for key in ("/Creator", "Creator"):
                if key in meta and meta[key]:
                    return str(meta[key])
        return ""
    except Exception:  # pylint: disable=broad-except
        return ""


def main():
    dates = list(daterange(START, END))
    found = []

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futures = {ex.submit(fetch_one, d): d for d in dates}
        for fut in as_completed(futures):
            d, date_str, url, status, content, err = fut.result()
            if err:
                print(f"[x] {err:8s} {url}")
                continue

            if status == 200:
                print(f"[+] FOUND   {url}")
                found.append((d, url))

                filename = os.path.join(OUTPUT, f"{date_str}-upload.pdf")
                with open(filename, "wb") as f:
                    f.write(content)
                print(f"    └─ Saved to {filename}")

                creator = extract_creator(filename)
                print(f"    └─ Creator: {creator if creator else '(none)'}")

            elif status == 403:
                print(f"[!] FORBID  {url}  (exists but locked — note it)")
                found.append((d, f"403: {url}"))

            else:
                print(f"[-] {status}     {url}")

    # Sort hits by date for a stable report
    found.sort(key=lambda x: x[0])

    # Extract creator metadata from every PDF in OUTPUT and save to creators.txt
    pdf_files = sorted(
        f for f in os.listdir(OUTPUT)
        if f.lower().endswith(".pdf") and os.path.isfile(os.path.join(OUTPUT, f))
    )
    with open(CREATORS_FILE, "w", encoding="utf-8") as f:
        for name in pdf_files:
            creator = extract_creator(os.path.join(OUTPUT, name))
            f.write(f"{creator}\n")

    print("\n" + "=" * 50)
    print(f"Scan complete. {len(found)} hit(s):")
    for _, hit in found:
        print(f"  {hit}")
    print(f"Creator metadata from {len(pdf_files)} PDF(s) saved to {CREATORS_FILE}")


if __name__ == "__main__":
    main()
```
2. script for password 

### SMB enumeration

## Foothold

How you got initial access.

### Exploitation

Step-by-step exploitation.

```bash
# Commands here
```

Got a shell as `username`.

## User Flag

```bash
cat /home/username/user.txt
```

## Privilege Escalation

How you escalated to root/admin.

```bash
# Commands here
```

## Root Flag

```bash
cat /root/root.txt
```

## Lessons Learned

1. Key takeaway one
2. Key takeaway two
3. Key takeaway three
