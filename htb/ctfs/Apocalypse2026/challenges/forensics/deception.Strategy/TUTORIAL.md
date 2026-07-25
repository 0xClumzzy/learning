# Deception.Strategy Forensics Challenge - Learning Tutorial

This tutorial covers every foundational skill needed to solve this HTB Apocalypse 2026
forensics challenge. Work through each module in order -- they build on each other.

---

## Module 0: Environment Setup

### Install these tools first

```bash
# Network analysis
sudo apt install wireshark tshark

# File analysis
sudo apt install file binwalk hexedit sqlite3

# Binary/data analysis tools
pip install construct pycryptodome

# Text searching
sudo apt install ripgrep  # provides 'rg' - faster grep for large files

# SQLite browser (GUI)
sudo apt install sqlitebrowser  # or use 'sqlite3' CLI

# hexdump / xxd (usually pre-installed)
which xxd hexdump
```

### Verify everything works

```bash
tshark --version
sqlite3 --version
strings --version
xxd --version
```

---

## Module 1: Archive Triage & Initial Recon

### Skill: Identifying what you're working with

```bash
# Step 1: Check what files you have
ls -lah

# Step 2: Identify file types (NEVER trust extensions)
file deception
file Logfile.PML
file network.pcap
file C.zip

# Step 3: Look inside archives without extracting
unzip -l deception.zip | head -20
unzip -l C.zip | head -20

# Step 4: Extract to a working directory
mkdir -p /tmp/challenge
cd /tmp/challenge
unzip -o /path/to/deception.zip
unzip -o C.zip
```

### Exercise 1.1
```
Q: What compression method does the 'deception' zip use?
Q: How many files are inside C.zip?
Q: What is the total uncompressed size?
```

### Key concept: File signatures don't lie
```bash
# A file named 'deception' with no extension might be anything
# Always check the magic bytes:
xxd deception | head -2    # Shows the first 32 bytes
# ZIP files start with: 50 4b 03 04
# PML files start with: 50 4d 4c 5f
# PCAP files start with: d4 c3 b2 a1
```

---

## Module 2: Network Forensics (PCAP Analysis)

### Skill: Reading packet captures with tshark

```bash
# Step 1: Basic info about the capture
tshark -r network.pcap -q -z io,phs    # Protocol hierarchy
tshark -r network.pcap -q -z conv,tcp   # TCP conversations
tshark -r network.pcap -q -z endpoints,ip  # IP endpoints

# Step 2: Extract all HTTP requests
tshark -r network.pcap -Y "http" \
  -T fields -e frame.time_epoch \
  -e ip.src -e ip.dst \
  -e http.host -e http.request.method \
  -e http.request.uri

# Step 3: Extract DNS queries
tshark -r network.pcap -Y "dns" \
  -T fields -e frame.time_epoch \
  -e dns.qry.name -e dns.qry.type

# Step 4: Look at TLS connections (SNI = Server Name Indication)
tshark -r network.pcap -Y "tls.handshake.extensions_server_name" \
  -T fields -e tls.handshake.extensions_server_name

# Step 5: Extract HTTP request/response bodies
tshark -r network.pcap -Y "http.request.method == POST" \
  -T fields -e http.file_data -e http.request.uri

# Step 6: Follow a TCP stream
tshark -r network.pcap -q -z follow,tcp,ascii,0
```

### Skill: Understanding network protocols

```
HTTP over port 80 (not HTTPS):
  - Plaintext traffic, can read everything
  - Telegram MTProto can run over HTTP port 80
  - Look for POST /api calls to Telegram IPs:
    149.154.167.41 (Telegram DC2)
    91.108.56.193  (Telegram DC4)

DNS queries reveal C2 domains:
  - discord-cdn.com (FAKE - real Discord uses cdn.discordapp.com)
  - ios.pclog.3u.com (3uTools log upload)
  - d.updater.3u.com (3uTools updater)
  - url.3u.com (3uTools URL shortener)

Suspicious HTTP POST patterns:
  - POST to IP:80/api = Telegram MTProto over HTTP
  - POST to discord-cdn.com/api/v9/experiments = Data exfiltration
    (mimicking Discord API to hide data in "experiment" updates)
```

### Exercise 2.1
```
Q: What is the first DNS query in the capture?
Q: What IP does discord-cdn.com resolve to?
Q: How many POST requests go to 149.154.167.41?
Q: What domain receives data at epoch 1782570492?
```

### Key concept: Epoch timestamps
```python
# Convert epoch to readable date
from datetime import datetime, timezone
epoch = 1782570438
dt = datetime.fromtimestamp(epoch, tz=timezone.utc)
print(dt)  # 2026-06-27 14:27:18+00:00

# Or with command line:
date -d @1782570438 -u
```

---

## Module 3: Process Monitor (PML) Analysis

### Skill: Understanding PML binary format

The PML file is a binary log from Microsoft Process Monitor. It records every
file system, registry, process, and network operation on Windows.

```bash
# Step 1: Examine the header
xxd Logfile.PML | head -20
# Magic: PML_ (50 4d 4c 5f)
# Version: 9 (09 00 00 00) = Windows 10 format

# Step 2: Extract ALL readable strings (your primary tool for PML)
strings Logfile.PML | head -100

# Step 3: Find specific strings with byte offsets
strings -t d Logfile.PML | grep "libitunesfix"
# -t d = decimal offset (where in the file the string appears)

# Step 4: Count occurrences
strings Logfile.PML | grep -c "libitunesfix.dll"
```

### Skill: Searching PML for evidence

```bash
# Search for specific processes
strings Logfile.PML | grep -i "\.exe" | sort | uniq -c | sort -rn | head -30

# Search for malicious DLLs
strings Logfile.PML | grep "libmfxsw64"
strings Logfile.PML | grep "libitunesfix"

# Search for registry modifications
strings Logfile.PML | grep "HKCU\\Software\\Classes"
strings Logfile.PML | grep "CLSID"

# Search for network connections
strings Logfile.PML | grep -E "149\.154\.167\.41|91\.108\.56\.193"

# Search for file operations
strings Logfile.PML | grep "C:\\\\Program.exe"

# Find function names near DLL loading
strings -n 4 Logfile.PML | grep -iE "^(Work|Main|Start|Run|Init|DllMain)$"
```

### Skill: Extracting timestamps from PML binary

```python
import struct
from datetime import datetime, timedelta, timezone

with open("Logfile.PML", "rb") as f:
    # Read a chunk of the file
    f.seek(offset)  # offset = byte position
    data = f.read(2000)

    # FILETIME values are 8-byte little-endian integers
    # They represent 100-nanosecond intervals since Jan 1, 1601
    for i in range(len(data) - 7):
        val = struct.unpack("<Q", data[i:i+8])[0]
        # Check if it looks like a valid FILETIME for 2026
        if 133000000000000000 < val < 135000000000000000:
            epoch = datetime(1601, 1, 1, tzinfo=timezone.utc)
            dt = epoch + timedelta(microseconds=val // 10)
            unix_ts = int(dt.timestamp())
            print(f"Offset {i:#x}: FILETIME={val}, "
                  f"datetime={dt}, unix={unix_ts}")
```

### Key concept: PML string table
```
The PML format stores strings in a table and references them by index.
That's why 'strings' extraction works for file paths but NOT for:
  - Operation names (stored as indices)
  - Function names (stored in binary record fields)
  - Registry binary values (REG_BINARY data)

For those, you need to parse the binary event records directly,
or use a proper PML parser tool.
```

### Exercise 3.1
```
Q: What is the PML version number?
Q: How many times does "libitunesfix.dll.dll" appear in the PML?
Q: What is the byte offset of the first "libmfxsw64.dll" reference?
Q: What process names appear most frequently in the PML?
```

---

## Module 4: Windows Forensics Artifacts

### Skill: Understanding the Windows file system layout

```
C:\Users\admin\
  AppData/
    Local/          -- Machine-specific data (browser cache, temp files)
    LocalLow/       -- Low integrity data (IE DOMStore)
    Roaming/        -- Synced across domain (app settings, profiles)

Key forensic locations:
  AppData\Local\Microsoft\Edge\User Data\     -- Browser profile
  AppData\Roaming\discord\                    -- Discord app data
  AppData\Roaming\Telegram Desktop\           -- Telegram data
  AppData\Local\Temp\                         -- Temporary files
  AppData\Local\ConnectedDevicesPlatform\     -- Windows Timeline
  NTUSER.DAT                                  -- User registry hive
```

### Skill: Reading PowerShell history

```bash
cat ConsoleHost_history.txt
# This shows every command the user typed in PowerShell
# In this challenge, it reveals the evidence collection script
```

### Skill: Windows Registry basics

```
Registry Hives:
  HKLM = HKEY_LOCAL_MACHINE (all users)
  HKCU = HKEY_CURRENT_USER (current user)

Key locations for malware:
  HKCU\Software\Classes\CLSID\     -- COM object registration
  HKLM\SOFTWARE\Classes\CLSID\     -- System-wide COM objects
  HKCU\Software\Classes\exefile\   -- .exe file association hijacking
  HKCU\Software\Classes\*\shell\   -- Context menu handlers
  HKCU\...\UserAssist\             -- Tracks program execution (ROT13 encoded)
  HKLM\...\InventoryApplicationFile\ -- Windows SRUM application inventory
```

### Skill: UserAssist decoding

```
UserAssist stores program execution paths with ROT13 encoding.
To decode:

  Cebpzba64.rkro  -> ROT13 -> D:\Procmon64.exe
  Gryrtenz.GryrtenzQrfxgbc -> ROT13 -> Telegram.TelegramDesktop

ROT13 shifts each letter by 13 positions:
  A->N, B->O, C->P, D->Q, E->R, F->S, G->T, H->U,
  I->V, J->W, K->X, L->Y, M->Z, N->A, O->B, P->C,
  Q->D, R->E, S->F, T->G, U->H, V->I, W->J, X->K,
  Y->L, Z->M
```

```python
import codecs
encoded = "Cebpzba64.rkro"
decoded = codecs.decode(encoded, 'rot_13')
print(decoded)  # D:\Procmon64.exe
```

### Skill: CLSID COM hijacking

```
When malware registers under HKCU\Software\Classes\CLSID\,
it hijacks COM object loading. Windows checks HKCU before HKLM,
so the malicious DLL loads instead of the legitimate one.

The InprocServer32 key tells Windows which DLL to load:
  HKCU\Software\Classes\CLSID\{GUID}\InprocServer32 = "malware.dll"

The TreatAs key redirects to another CLSID:
  HKCU\Software\Classes\CLSID\{GUID}\TreatAs = {Other-GUID}
```

### Exercise 4.1
```
Q: What PowerShell commands were run on the system?
Q: Decode all UserAssist entries found in the PML
Q: What CLSIDs were registered under HKCU\Software\Classes?
Q: What was modified in the exefile\shell registry key?
```

---

## Module 5: Browser & Extension Forensics

### Skill: SQLite database analysis

```bash
# Open any SQLite database
sqlite3 History.db

# Useful commands inside sqlite3:
.tables                          # List all tables
.schema                          # Show table structure
SELECT * FROM urls LIMIT 10;     # Query data
.headers on                      # Show column headers
.mode column                     # Pretty print

# From command line:
sqlite3 History.db "SELECT url, title, last_visit_time FROM urls;"
```

### Skill: LevelDB analysis (Chrome/Edge extensions)

LevelDB is a key-value store used by Chrome extensions (MetaMask, Keplr, Discord).

```bash
# LevelDB files have this structure:
#   CURRENT       -- Points to the latest table file
#   MANIFEST-*    -- Version info
#   LOG           -- Write-ahead log
#   *.ldb         -- Sorted string tables
#   *.log         -- Unsorted entries

# Extract strings from LevelDB files
strings 000004.log | head -50
strings 000031.ldb | head -50

# Look for JSON data (vaults, configs)
strings 000004.log | grep -i "vault\|keyring\|mnemonic\|seed"
strings 000031.ldb | grep -i "vault\|encrypt\|password"
```

### Skill: Chrome extension ID to name mapping

```
Extension IDs are derived from the extension's public key.
Known IDs for crypto wallets:
  nkbihfbeogaeaoehlefnkodbefgpgknn = MetaMask
  ocodgmmffbkkeecmadcijjhkmeohinei = Keplr

Extension data locations:
  Extensions/{ID}/{version}/         -- Extension files
  Local Extension Settings/{ID}/     -- Persistent settings (LevelDB)
  Extension State/{ID}/              -- Runtime state
  IndexedDB/chrome-extension_{ID}/   -- IndexedDB data
```

### Skill: Understanding crypto wallet storage

```
MetaMask vault structure (encrypted):
  {
    "data": "encrypted_aes_cbc_data",
    "iv": "base64_initialization_vector",
    "salt": "base64_pbkdf2_salt"
  }

Encryption: AES-256-CBC
Key derivation: PBKDF2 with 600,000 iterations
Password: The user's MetaMask password (unknown)

Keplr vault structure:
  - Stored in LevelDB as keyring data
  - Keyring name: identifies the wallet
  - Mnemonic type: BIP39 seed phrase
  - Encrypted with user password
```

### Exercise 5.1
```
Q: Query the Edge History database for all visited URLs
Q: What extensions are installed?
Q: Find the MetaMask encrypted vault in the LevelDB files
Q: What chain configurations are visible in Keplr data?
```

---

## Module 6: DLL Side-Loading & Malware Analysis

### Skill: Understanding DLL side-loading

```
DLL Side-Loading Attack Chain:

1. Legitimate application loads a DLL by name:
   3uTools.exe -> loads libitunesfix.dll (from same directory)

2. Attacker places malicious DLL with same name:
   C:\Program Files\3uTools9\libitunesfix.dll  (MALICIOUS)

3. Windows DLL search order:
   1. Application directory (C:\Program Files\3uTools9\)
   2. System32 directory
   3. System directory
   4. Windows directory
   5. Current directory
   6. PATH directories

4. Malicious DLL performs actions:
   - Copies itself to system directories as libitunesfix.dll.dll
   - Creates persistence: C:\Program.exe
   - Plants second-stage DLL in Discord: libmfxsw64.dll
```

### Skill: Identifying malicious DLL activity in PML

```
Look for these patterns in PML strings:

File operations:
  - CopyFile/CopyFileW: DLL copying to system directories
  - CreateFile: Creating persistence executables
  - LoadImage: DLL loading events

Registry operations:
  - Setting CLSID entries: COM hijacking
  - Modifying exefile\shell: File association hijacking
  - Setting InprocServer32: DLL registration

Process operations:
  - CreateProcess: Spawning new processes
  - CreateThread: Injecting code into other processes
```

### Skill: DLL export functions

```
Common DLL export function names:
  DllMain          -- Standard entry point (called on load/unload)
  DllGetClassObject -- COM class factory
  DllCanUnloadNow  -- COM unload check
  DllRegisterServer -- COM self-registration
  DllUnregisterServer -- COM unregistration

For malicious DLLs, the exported function is whatever the host
application expects. The question "what exported function was invoked"
asks: what function did 3uTools.exe call from libitunesfix.dll?
```

### Exercise 6.1
```
Q: List all directories where libitunesfix.dll.dll was copied
Q: What registry keys were modified by the malicious DLL?
Q: What file was created as a persistence mechanism?
Q: Where was libmfxsw64.dll planted?
```

---

## Module 7: MITRE ATT&CK Framework

### Skill: Mapping evidence to MITRE techniques

```
For this challenge, the relevant techniques are:

T1574.002 - Hijack Execution Flow: DLL Side-Loading
  Evidence: libitunesfix.dll loaded by 3uTools.exe

T1574.009 - Path Interception by Unquoted Path
  Evidence: C:\Program.exe (unquoted path exploitation)

T1547.001 - Boot or Logon Autostart: Registry Run Keys
  Evidence: Registry modifications for persistence

T1555 - Credentials from Password Stores
  Evidence: Stealing MetaMask/Keplr wallet data

T1005 - Data from Local System
  Evidence: Reading wallet files from filesystem

T1567.002 - Exfiltration Over Web Service: Exfiltration to Cloud Storage
  Evidence: POST to discord-cdn.com (fake Discord CDN)

T1102.002 - Web Service: Bidirectional C2
  Evidence: Telegram MTProto over HTTP for C2

T1071.001 - Application Layer Protocol: Web Protocols
  Evidence: HTTP-based C2 to Telegram

T1573 - Encrypted Channel
  Evidence: Telegram MTProto encryption
```

### Skill: ATT&CK technique identification

```
When analyzing malware, ask:

1. INITIAL ACCESS: How did it get in?
   -> DLL side-loading (T1574.002)

2. EXECUTION: How does it run?
   -> DLL loaded by legitimate application

3. PERSISTENCE: How does it survive reboots?
   -> C:\Program.exe, CLSID registration

4. PRIVILEGE ESCALATION: Does it need admin?
   -> HKCU\registration (no admin needed)

5. DEFENSE EVASION: How does it hide?
   -> Disguised as legitimate DLL, system directory copies

6. CREDENTIAL ACCESS: What secrets does it steal?
   -> Crypto wallet seeds (T1555)

7. EXFILTRATION: How does data leave?
   -> Fake Discord CDN (T1567.002)

8. C2: How does attacker communicate?
   -> Telegram MTProto (T1102.002)
```

---

## Module 8: Binary Analysis Basics

### Skill: PE (Portable Executable) file analysis

```bash
# Check if a file is a PE executable
file some_file.exe
# Output: PE32+ executable (console) x86-64, for MS Windows

# Extract strings from a binary
strings -n 6 some_file.exe | head -50

# Look for imported DLLs
strings some_file.exe | grep -i "\.dll"

# Look for function calls
strings some_file.exe | grep -iE "CreateFile|WriteFile|LoadLibrary|GetProcAddress"
```

### Skill: FILETIME conversion

```python
# Windows FILETIME: 100-nanosecond intervals since Jan 1, 1601
import struct
from datetime import datetime, timedelta, timezone

def filetime_to_datetime(filetime_val):
    epoch = datetime(1601, 1, 1, tzinfo=timezone.utc)
    return epoch + timedelta(microseconds=filetime_val // 10)

def datetime_to_filetime(dt):
    epoch = datetime(1601, 1, 1, tzinfo=timezone.utc)
    delta = dt - epoch
    return int(delta.total_seconds() * 10_000_000)

# Example
ft = 134270441015338653
dt = filetime_to_datetime(ft)
print(dt)  # 2026-06-27 14:28:21.533865+00:00

# Convert to Unix epoch
unix_ts = int(dt.timestamp())
print(unix_ts)  # 1782570501
```

### Skill: Hex analysis

```bash
# View hex dump
xxd file | head -20

# Look at specific offset
xxd -s 0x100 -l 64 file   # Skip 256 bytes, read 64 bytes

# Search for hex pattern
xxd file | grep "504d4c5f"  # Search for PML_ magic

# Extract binary data at offset
dd if=file bs=1 skip=419434211 count=100 2>/dev/null | xxd
```

---

## Module 9: Putting It All Together - Solving the Challenge

### Step-by-step approach for deception.Strategy

```
STEP 1: TRIAGE (5 min)
  - file deception -> ZIP archive
  - unzip and examine contents
  - Identify 3 key artifacts: PML, PCAP, C.zip

STEP 2: NETWORK ANALYSIS (15 min)
  - tshark -r network.pcap -q -z io,phs
  - Find HTTP POST requests -> Telegram C2
  - Find discord-cdn.com -> exfiltration
  - Identify C2 IP: 149.154.167.41

STEP 3: PML ANALYSIS (20 min)
  - strings Logfile.PML | grep "libitunesfix"
  - strings Logfile.PML | grep "libmfxsw64"
  - Identify process chain: 3uTools.exe -> libitunesfix.dll -> libmfxsw64.dll
  - Find registry modifications

STEP 4: FILESYSTEM ANALYSIS (15 min)
  - Examine Edge browser history for crypto wallet activity
  - Find MetaMask and Keplr extension data
  - Analyze Discord data for evidence of compromise
  - Check PowerShell history for attacker scripts

STEP 5: CORRELATE TIMELINE (10 min)
  - Network timestamps + PML timestamps
  - Discord restart logs
  - 3uTools activity

STEP 6: ANSWER QUESTIONS
  For each question, cross-reference evidence from multiple sources.
  Always verify with at least 2 artifacts.
```

---

## Module 10: Practice Exercises

### Exercise A: Basic Triage
```
1. What is the timezone of the compromised system?
2. What is the user account name?
3. What antivirus is installed?
4. What virtualization platform is the VM running on?
```

### Exercise B: Network Analysis
```
1. What is the first HTTP request in the capture?
2. What DNS queries were made to 3uTools domains?
3. How many bytes were sent to the fake discord-cdn.com?
4. What is the exact timestamp of the first Telegram C2 beacon?
```

### Exercise C: PML Analysis
```
1. What is the first event recorded in the PML?
2. How many unique .exe processes appear in the PML?
3. What registry key was modified to hijack .exe file association?
4. What is the full path of the persistence executable?
```

### Exercise D: Wallet Forensics
```
1. What is the MetaMask vault encryption algorithm?
2. What chain IDs are configured in Keplr?
3. What is the Keplr keyring name?
4. Can you find the wallet public address?
```

### Exercise E: Advanced
```
1. Reconstruct the full attack timeline with timestamps
2. Map every action to a MITRE ATT&CK technique
3. Identify the exact exfiltration method
4. Determine what data was stolen and where it was sent
```

---

## Appendix A: Quick Reference Commands

```bash
# === NETWORK ===
tshark -r file.pcap -Y "http" -T fields -e http.host -e http.request.uri
tshark -r file.pcap -Y "dns" -T fields -e dns.qry.name
tshark -r file.pcap -q -z conv,tcp
tshark -r file.pcap -q -z io,phs

# === STRINGS ===
strings file | head -100
strings -n 8 file | sort -u
strings -t d file | grep "pattern"
strings -e l file   # UTF-16LE strings (Windows)

# === HEX ===
xxd file | head -20
xxd -s OFFSET -l SIZE file

# === SQLITE ===
sqlite3 database.db ".tables"
sqlite3 database.db "SELECT * FROM table LIMIT 10;"

# === FILE ANALYSIS ===
file mystery_file
binwalk mystery_file
binwalk -e mystery_file  # Extract embedded files

# === TIMELINE ===
date -d @EPOCH -u           # Epoch to UTC
python3 -c "from datetime import datetime; print(datetime.utcfromtimestamp(EPOCH))"
```

## Appendix B: Key File Locations in Challenge

| File | Location | What it contains |
|------|----------|-----------------|
| Logfile.PML | Root | Process Monitor binary log (643MB) |
| network.pcap | Root | Network capture (9.4MB) |
| C.zip | Root | Filesystem dump (261MB) |
| PowerShell history | C/Users/admin/AppData/Roaming/Microsoft/Windows/PowerShell/PSReadLine/ | Evidence collection script |
| Discord logs | C/.../Roaming/discord/logs/ | Discord startup timeline |
| Edge History | C/.../Edge/User Data/Default/History | Browser history |
| MetaMask vault | C/.../Local Extension Settings/nkbihfbeogaeaoehlefnkodbefgpgknn/ | Encrypted wallet |
| Keplr data | C/.../Local Extension Settings/ocodgmmffbkkeecmadcijjhkmeohinei/ | Cosmos wallet |
| Telegram data | C/.../Roaming/Telegram Desktop/tdata/ | Messaging app |
| NTUSER.DAT logs | C/Users/admin/ | Registry transaction logs |

---

## Appendix C: Common Pitfalls

1. **Don't trust file extensions** - Always use `file` command
2. **PML is binary** - `strings` works for paths but not for structured data
3. **Epoch timestamps** - Verify timezone (UTC vs local)
4. **LevelDB is not SQLite** - Different tools needed
5. **Encrypted != unreadable** - Metadata is often plaintext
6. **Empty files are evidence** - Empty Desktop/Downloads = attacker cleaned up
7. **Correlate timestamps** - One artifact confirms another
8. **Check the challenge name** - "deception" means expect misdirection
