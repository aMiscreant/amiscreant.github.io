---
layout: page
title: 🕵️‍♂️ Tor Cloak SSH
date: 2025-5-29
description: Provides the same cloaking and Tor-routing as Tor Cloak but keeps SSH accessible, allowing remote management while anonymizing all other traffic through Tor.
permalink: /tor/scripts/cloak_ssh
category: Scripts
subcategory:
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

#### _Tor Cloak SSH is a Bash script designed to cloak a Linux system’s network identity and route outbound connections transparently through the Tor network. It achieves anonymity and resistance to tracking by spoofing hardware identifiers, randomizing system details, and setting up a Tor-based transparent proxy. Crucially, it maintains SSH connectivity, allowing the system to be administered remotely while all other traffic goes through Tor._

---

### 1. Spoof MAC Address

---

```bash
IFACE=$(ip route | grep default | awk '{print $5}')
if [[ -n "$IFACE" ]]; then
    ip link set "$IFACE" down
    macchanger -r "$IFACE"
    ip link set "$IFACE" up
    dhclient -r "$IFACE"
    dhclient "$IFACE"
fi
```

>`Finds the default network interface.`
> 
>`Changes its MAC address randomly with macchanger.`
> 
>`Restarts the interface to apply the change and renew DHCP.`
> 
>`Purpose: Prevents tracking via hardware MAC addresses.`

---

### 2. Randomize Hostname

---

```bash
NEW_HOST="anon-$(tr -dc a-z0-9 </dev/urandom | head -c6)"
hostnamectl set-hostname "$NEW_HOST"
```

>`Sets the hostname to a random string like anon-4f7d2a.`
> 
>`Purpose: Reduces fingerprinting by avoiding static hostnames.`

---

### 3. Obfuscate Kernel Info

---

```bash
for line in \
  "kernel.hostname = hidden" \
  "kernel.dmesg_restrict = 1" \
  "kernel.kptr_restrict = 2"; do
    grep -qxF "$line" /etc/sysctl.conf || echo "$line" >> /etc/sysctl.conf
done
sysctl -p
```

>`Hides the hostname from /proc/sys/kernel/hostname.`
> 
>`Restricts access to kernel logs and pointers to hinder exploitation or fingerprinting.`
> 
>`Purpose: Increases system stealth and reduces kernel-level info leakage.`

---

### 4. Disable Bash History

---

```bash
unset HISTFILE
ln -sf /dev/null ~/.bash_history
```

>`Stops storing shell command history.`
> 
>`Links the history file to /dev/null.`
> 
>`Purpose: Prevents command logs from revealing sensitive activity.`

---

### 5. Configure Tor for Transparent Proxy

---

```bash
cp /etc/resolv.conf /etc/resolv.conf.bak
echo "nameserver 127.0.0.1" > /etc/resolv.conf

cat > /etc/tor/torrc <<EOF
VirtualAddrNetworkIPv4 10.192.0.0/10
AutomapHostsOnResolve 1
TransPort 9040
DNSPort 5353
EOF
```

>`Redirects DNS lookups to Tor’s DNSPort.`
> 
>`Configures Tor’s transparent proxy ports.`
> 
>`Purpose: Ensures all DNS and TCP traffic is routed via Tor.`

---

### 6. Set Up iptables Rules

---

```bash
iptables -F
iptables -t nat -F

# Redirect DNS queries
iptables -t nat -A OUTPUT -p udp --dport 53 -j REDIRECT --to-ports 5353
iptables -t nat -A OUTPUT -p tcp --dport 53 -j REDIRECT --to-ports 5353

# Redirect TCP connections
iptables -t nat -A OUTPUT -p tcp --syn -j REDIRECT --to-ports 9040

# Allow loopback
iptables -A OUTPUT -o lo -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT

# Allow established connections
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow Tor process traffic
_UID=$(id -u debian-tor)
iptables -A OUTPUT -m owner --uid-owner "$_UID" -j ACCEPT

# Allow SSH traffic
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 22 -j ACCEPT

# Block everything else
iptables -A OUTPUT -j REJECT
iptables -A INPUT -j REJECT

# Save iptables rules
netfilter-persistent save
iptables-save > /etc/iptables/rules.v4
ip6tables-save > /etc/iptables/rules.v6
```

>`Redirects all outbound TCP connections and DNS requests to Tor.`
> 
>`Preserves SSH connectivity (port 22).`
> 
>`Allows Tor daemon to connect out directly.`
> 
>`Rejects all other traffic.`
> 
>`Purpose: Forces non-SSH traffic through Tor, ensuring anonymity while preserving administrative access.`

---

### 7. Restart Tor Service

---

```bash
systemctl enable tor
systemctl restart tor
```

>`Enables Tor to start automatically on boot.`
> 
>`Restarts the service to apply the new configuration.`
> 
>`Purpose: Ensures Tor transparent proxy persists across reboots.`
> 
>`Final Messages`

---

>`echo "[+] Transparent proxy via Tor is now active!"`
> 
>`echo "[+] Cloaking complete."`

---

>`Confirms successful setup.`
> 
>`What This Script Achieves`

---

##### ✅ Randomizes identifiers (MAC, hostname).
##### ✅ Hides sensitive kernel info.
##### ✅ Disables shell command traces.
##### ✅ Routes all outbound traffic via Tor except SSH.
##### ✅ Protects DNS queries from leaking.
##### ✅ Blocks all non-approved traffic.
##### ✅ Enables persistent Tor routing after reboot.

---

### Full Source:

---

```bash
#!/bin/bash

set -e

# 1. Spoof MAC Address
echo "[+] Spoofing MAC address..."
IFACE=$(ip route | grep default | awk '{print $5}')
if [[ -n "$IFACE" ]]; then
    ip link set "$IFACE" down
    macchanger -r "$IFACE"
    ip link set "$IFACE" up
    dhclient -r "$IFACE"
    dhclient "$IFACE"
fi

# 2. Randomizing Hostname
echo "[+] Randomizing hostname..."
NEW_HOST="anon-$(tr -dc a-z0-9 </dev/urandom | head -c6)"
hostnamectl set-hostname "$NEW_HOST"

# 3. Obfuscating Kernel Info
echo "[+] Obfuscating kernel info..."
for line in \
  "kernel.hostname = hidden" \
  "kernel.dmesg_restrict = 1" \
  "kernel.kptr_restrict = 2"; do
    grep -qxF "$line" /etc/sysctl.conf || echo "$line" >> /etc/sysctl.conf
done
sysctl -p

# 4. Disabling Bash History
echo "[+] Disabling bash history..."
unset HISTFILE
ln -sf /dev/null ~/.bash_history

# 5. Set up Tor Transparent Proxy
echo "[+] Configuring Tor for transparent proxy..."
cp /etc/resolv.conf /etc/resolv.conf.bak
echo "nameserver 127.0.0.1" > /etc/resolv.conf

cat > /etc/tor/torrc <<EOF
VirtualAddrNetworkIPv4 10.192.0.0/10
AutomapHostsOnResolve 1
TransPort 9040
DNSPort 5353
EOF

# 6. Setting up iptables Rules
echo "[+] Setting up iptables rules..."
iptables -F
iptables -t nat -F

# Redirect DNS
iptables -t nat -A OUTPUT -p udp --dport 53 -j REDIRECT --to-ports 5353
iptables -t nat -A OUTPUT -p tcp --dport 53 -j REDIRECT --to-ports 5353

# Redirect TCP traffic
iptables -t nat -A OUTPUT -p tcp --syn -j REDIRECT --to-ports 9040

# Allow loopback
iptables -A OUTPUT -o lo -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT

# Allow established/related
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow Tor process to reach the network
_UID=$(id -u debian-tor)
iptables -A OUTPUT -m owner --uid-owner "$_UID" -j ACCEPT

# Allow SSH (incoming and outgoing)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 22 -j ACCEPT

# Block everything else
iptables -A OUTPUT -j REJECT
iptables -A INPUT -j REJECT

# Save iptables rules
echo "[+] Saving iptables rules..."
netfilter-persistent save
iptables-save > /etc/iptables/rules.v4
ip6tables-save > /etc/iptables/rules.v6

# 7. Restart Tor Service
echo "[+] Enabling Tor at boot..."
systemctl enable tor
systemctl restart tor

echo "[+] Transparent proxy via Tor is now active!"
echo "[+] Cloaking complete."
```

---