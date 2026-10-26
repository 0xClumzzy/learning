LAYOVER(linux)-(medium)
*As is common in real life pentests, you will start the Layover box with credentials for the following account contractor / Contractor2026!*


Port scan 
```shellsession
22/tcp   open  ssh           syn-ack OpenSSH 9.6p1 Ubuntu 3ubuntu13.19 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBN9Ju3bTZsFozwXY1B2KIlEY4BA+RcNM57w4C5EjOw1QegUUyCJoO4TVOKfzy/9kd3WrPEj/FYKT2agja9/PM44=
|   256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH9qI0OvMyp03dAGXR0UPdxw7hjSwMR773Yb9Sne+7vD
3389/tcp open  ms-wbt-server syn-ack Microsoft Terminal Service
Service Info: OSs: Linux, Windows; CPE: cpe:/o:linux:linux_kernel, cpe:/o:microsoft:windows
```

After a lil exploration, i realized the 2 wlan interfaces hint wifi connection 
After connecting to the internal wifi, the browser opened with the wen instance
- Wireless configuration can also be investigated with `nmcli device status` and `nmcli device wifi list`.

This calls for wifi sniffing
# PASSIVE WIFI SNIFFING 
-[] 1. Turn on monitor mode on the 3 interface, this was figured out along the way
```bash
    sudo ip link set wlan3 down 
    sudo iw dev wlan3 set type monitor
    sudo ip link set wlan3 up
```
The target WiFi network (HTB International WiFi) uses no encryption at all (key_mgmt=NONE). On an open network, every802.11 data frame — and everything carried inside it, including HTTP traffic — is readable by anyone within radio range.

This is where monitor mode matters. Monitor mode is not the same as promiscuous mode: promiscuous mode only sees traffic on networks your adapter has already associated with, while monitor mode captures every 802.11 frame on a channel regardless of destination. The jumpbox here simulates this over the kernel’s mac80211_hwsim module, with one interface (wlan2) doing normal connectivity and a second (wlan3) dedicated to sniffing

now, since these are my notes, we gonna do some learning 
-[] 802.11 aka Wi.Fi
    - Basically wifi standards
    - They define a *through-the-air* interface
    - This can be between a *wireless client* and a *base station access point* or
    - between two wireless clients
    
    The 802.11 Stack Is Just Layers of Envelopes
    ```
        [ 802.11 Frame ]
            └── [ IP Packet ]
                    └── [ TCP Segment ]
                            └── [ HTTP Request ]  ← your actual data
    ```
    Every envelope has a header(addressing info) and a payload(the next envelope)
 
    The 802.11 frame is the outermost envelope — it contains the MAC addresses, the signal info, and the actual data.If the network is open (no encryption), that entire stack is readable by anyone nearby


-[] Wireless Is a Broadcast Medium
    Wifi broadcasts to every device within its range
    - The NIC is responsible for ignoring frames not addressed to it 

-[] Association vs. Reception Are Different Things
    - Reception- Your radio physically captured the RF signal
    - Association- You’ve done the 802.11 handshake and joined the network
    
    You don’t need to be associated to receive. Monitor mode exploits this. You’re not on the network. You’re just standing close enough to hear the shouting.
    **Promiscuous mode ≠ monitor mode:**
    - Promiscuous = you’re associated, but you listen to all traffic on that network (Layer 2 up)
    - Monitor = you’re not associated at all, you capture raw 802.11 frames (Layer 1/2, everything)
