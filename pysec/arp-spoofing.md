---
title: ARP Spoofing / Cache Poisoning
tags: layer2, network, attack
---

# ARP Spoofing / Cache Poisoning

Layer 2 MITM: forge ARP replies to associate the attacker's MAC
with a victim IP, diverting traffic. Ballmann implements a poisoner, an
ARP-watcher (defense), MAC-flooder, and VLAN-hopping/DTP abuse variants.

Built with [[scapy]]; pairs with [[port-scanning]] for recon.
From [[book-understanding-network-hacks]].

## Related
- [[scapy]]
- [[port-scanning]]
- [[book-understanding-network-hacks]]
