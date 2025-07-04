---
layout: page
title: 💻 Transparent Proxy
date: 2025-5-29
description: This script configures Linux iptables rules to route all outbound TCP traffic transparently through Tor
permalink: /tutorials/OPI3Zero/Tor/transparent_proxy
category: opi3zero
subcategory: tor
copy_to_clipboard: true
---
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https:; script-src 'self'; style-src 'self' 'unsafe-inline';">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload">
<meta name="referrer" content="no-referrer">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta http-equiv="Access-Control-Allow-Origin" content="*">
<meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
<meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
<meta http-equiv="Cross-Origin-Resource-Policy" content="same-origin">
<meta http-equiv="Expect-CT" content="max-age=86400, enforce">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="stylesheet" href="{{ 'css/main.css' | relative_url }}">
<script src="{{ 'assets/js/copy-to-clipboard.js' | relative_url }}"></script>


---

<p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
<p>{{ page.description }}</p>

---

### 🔒 Tor Transparent Proxy Firewall Rules for Linux


---


#### 🔒 This script configures Linux iptables rules to route all outbound TCP traffic transparently through Tor, enhancing privacy and anonymity. It dynamically detects the Tor user ID, redirects DNS and TCP traffic to Tor's TransPort and DNSPort, and carefully preserves local network and system traffic. Designed for hardened setups, it blocks unauthorized traffic, mitigates leaks, and optionally logs dropped packets for auditing. Suitable for Debian, Ubuntu, Arch, Gentoo, and custom deployments, it's a powerful foundation for building a secure Tor gateway or stealthy privacy device.

---

>Modify _out_if="wlan0" to desired interface && Port 22 if needed for SSH

---

```bash
# ========================================== #
#    Made by aMiscreant for Miscreants       #
# ========================================== #
### Set variables
# The UID that Tor runs as (varies from system to system)
#_tor_uid="109" #As per assumption
_tor_uid=`id -u debian-tor` #Debian/Ubuntu
#_tor_uid=`id -u tor` #ArchLinux/Gentoo

# Tor's TransPort
_trans_port="9040"

# Tor's DNSPort
_dns_port="5353"

# Tor's VirtualAddrNetworkIPv4
_virt_addr="10.192.0.0/10"

# Your outgoing interface
_out_if="wlan0" # Change to desired interface

# LAN destinations that shouldn't be routed through Tor
_non_tor="127.0.0.0/8 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16"

# Other IANA reserved blocks (These are not processed by tor and dropped by default)
_resv_iana="0.0.0.0/8 100.64.0.0/10 169.254.0.0/16 192.0.0.0/24 192.0.2.0/24 192.88.99.0/24 198.18.0.0/15 198.51.100.0/24 203.0.113.0/24 224.0.0.0/4 240.0.0.0/4 255.255.255.255/32"

### Don't lock yourself out after the flush
#iptables -P INPUT ACCEPT
#iptables -P OUTPUT ACCEPT

echo "[+] Flushing existing iptables rules..."

### Flush iptables
iptables -F
iptables -t nat -F

echo "[+] Setting up NAT rules for Tor routing..."

### *nat OUTPUT (For local redirection)
# nat .onion addresses
iptables -t nat -A OUTPUT -d $_virt_addr -p tcp -m tcp --tcp-flags FIN,SYN,RST,ACK SYN -j REDIRECT --to-ports $_trans_port

# nat dns requests to Tor
iptables -t nat -A OUTPUT -d 127.0.0.1/32 -p udp -m udp --dport 53 -j REDIRECT --to-ports $_dns_port

# Don't nat the Tor process, the loopback, or the local network
iptables -t nat -A OUTPUT -m owner --uid-owner $_tor_uid -j RETURN
iptables -t nat -A OUTPUT -o lo -j RETURN

# Allow lan access for hosts in $_non_tor
for _lan in $_non_tor; do
  iptables -t nat -A OUTPUT -d $_lan -j RETURN
done

for _iana in $_resv_iana; do
  iptables -t nat -A OUTPUT -d $_iana -j RETURN
done

# Redirect all other pre-routing and output to Tor's TransPort
iptables -t nat -A OUTPUT -p tcp -m tcp --tcp-flags FIN,SYN,RST,ACK SYN -j REDIRECT --to-ports $_trans_port

### *filter INPUT
# Don't forget to grant yourself ssh access from remote machines before the DROP.
iptables -A INPUT -i $_out_if -p tcp --dport 22 -m state --state NEW -j ACCEPT

iptables -A INPUT -m state --state ESTABLISHED -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT

# Allow INPUT from lan hosts in $_non_tor
# Uncomment these 3 lines to enable.
#for _lan in $_non_tor; do
# iptables -A INPUT -s $_lan -j ACCEPT
#done

# Log & Drop everything else. Uncomment to enable logging
#iptables -A INPUT -j LOG --log-prefix "Dropped INPUT packet: " --log-level 7 --log-uid
iptables -A INPUT -j DROP

echo "[+] Setting up filter rules for traffic..."

### *filter FORWARD
iptables -A FORWARD -j DROP

### *filter OUTPUT
iptables -A OUTPUT -m state --state INVALID -j DROP
iptables -A OUTPUT -m state --state ESTABLISHED -j ACCEPT

# Allow Tor process output
iptables -A OUTPUT -o $_out_if -m owner --uid-owner $_tor_uid -p tcp -m tcp --tcp-flags FIN,SYN,RST,ACK SYN -m state --state NEW -j ACCEPT

# Allow loopback output
iptables -A OUTPUT -d 127.0.0.1/32 -o lo -j ACCEPT

# Tor transproxy magic
iptables -A OUTPUT -d 127.0.0.1/32 -p tcp -m tcp --dport $_trans_port --tcp-flags FIN,SYN,RST,ACK SYN -j ACCEPT

# Allow OUTPUT to lan hosts in $_non_tor
# Uncomment these 3 lines to enable.
#for _lan in $_non_tor; do
# iptables -A OUTPUT -d $_lan -j ACCEPT
#done

# Log & Drop everything else. Uncomment to enable logging
#iptables -A OUTPUT -j LOG --log-prefix "Dropped OUTPUT packet: " --log-level 7 --log-uid
iptables -A OUTPUT -j DROP

### Set default policies to DROP
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP

### Set default policies to DROP for IPv6
ip6tables -P INPUT DROP
ip6tables -P FORWARD DROP
ip6tables -P OUTPUT DROP
echo "[✓] iptables rules applied. Tor transparent proxy is active."


```
