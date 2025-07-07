---
layout: page
title: 🕵️‍♂️ Tor Cloak
date: 2025-5-29
description: Cloaks your Linux system by anonymizing identifiers and forcing all network traffic through a Tor transparent proxy, blocking all non-Tor connections for maximum privacy.
permalink: /tor/scripts/cloak
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

##### _Tor Cloak is a Linux-based privacy hardening tool that cloaks your machine by anonymizing key identifiers (MAC address, hostname), hiding system-level metadata, disabling shell history, and routing all outbound traffic through a Tor Transparent Proxy — while blocking all non-Tor traffic using strict iptables firewall rules._
##### _It installs itself to /opt/torcloak/, sets up a persistent systemd service, and ensures it reboots cleanly into a cloaked state every time._

---

### 1. Self-Installation to /opt/torcloak/

---

```bash
INSTALL_DIR="/opt/torcloak"
SERVICE_NAME="torcloak"
...
if [[ "$(realpath "$0")" != "$SCRIPT_PATH" ]]; then
    cp "$0" "$SCRIPT_PATH"
    chmod +x "$SCRIPT_PATH"
    exec "$SCRIPT_PATH" "$@"
    exit 0
fi
```

---

>`Ensures the script lives in /opt/torcloak/.`
> 
>`Copies itself if it's run from somewhere else.`
> 
>`Re-runs from the new location automatically.`

---

>`Why: Centralized management, systemd compatibility, persistence across reboots.`

---

### 2. MAC Address Spoofing

---

```bash
IFACE=$(ip route | grep default | awk '{print $5}')
...
macchanger -r "$IFACE"
```

---

>`Gets the default network interface.`
> 
>`Uses macchanger to randomize the MAC.`
> 
>`Restarts networking on that interface.`

---

>`Why: Prevents hardware tracking based on your physical address.`

---

### 3. Hostname Randomization

---

```bash
NEW_HOST="anon-$(tr -dc a-z0-9 </dev/urandom | head -c6)"
hostnamectl set-hostname "$NEW_HOST"
```

---

>`Generates a random hostname like anon-r2j7bq.`

---

>`Why: Prevents DNS logs or services from fingerprinting your machine by name.`

---

### 4. Kernel Info Obfuscation

---

```bash
for line in \
  "kernel.hostname = hidden" \
  "kernel.dmesg_restrict = 1" \
  "kernel.kptr_restrict = 2"; ...
```

---

>`Updates /etc/sysctl.conf to:`
> 
>`Hide hostname from kernel output.`
> 
>`Restrict access to dmesg and kernel pointer info.`
> 
>`Applies with sysctl -p.`

---

>`Why: Reduces leakage of system details that could identify or fingerprint the host.`

---

### 5. Bash History Disabling

---

```bash
unset HISTFILE
ln -sf /dev/null ~/.bash_history
```

>`Prevents storage of any command history.`
> 
>`Links .bash_history to /dev/null.`

---

>`Why: Avoid leaving traces of your activity in terminal logs.`

---

### 6. Tor Transparent Proxy Setup

---

```bash
cp /etc/resolv.conf /etc/resolv.conf.bak
echo "nameserver 127.0.0.1" > /etc/resolv.conf
...
cat > /etc/tor/torrc <<EOF
...
EOF
```

---

>`Redirects all DNS to local Tor DNS.`
> 
>`Configures Tor with:`

---

>`TransPort 9040: transparent TCP proxy.`
> 
>`DNSPort 5353: DNS resolution through Tor.`
> 
>`Virtual address mapping for non-IP hostnames.`

---

>`Why: Ensures even DNS traffic is anonymized through Tor — no leaks.`

---

### 7. iptables Firewall Rules

---

```bash
iptables -F
iptables -t nat -F
...
iptables -t nat -A OUTPUT -p udp --dport 53 -j REDIRECT --to-ports 5353
iptables -t nat -A OUTPUT -p tcp --syn -j REDIRECT --to-ports 9040
...
_UID=$(id -u debian-tor)
iptables -A OUTPUT -m owner --uid-owner "$_UID" -j ACCEPT
...
iptables -A OUTPUT -j REJECT
iptables -A INPUT -j REJECT
```

---

>`Redirects all DNS and TCP to Tor’s ports.`
> 
>`Allows Tor daemon (debian-tor) direct access to the internet.`
> 
>`Blocks everything else.`
> 
>`Allows only loopback and established traffic for functionality.`

---

>`Why: Absolute traffic control — no bypassing Tor unless explicitly permitted.`

---

### 💾 Saving iptables Rules

---

```bash
netfilter-persistent save
iptables-save > /etc/iptables/rules.v4
ip6tables-save > /etc/iptables/rules.v6
```

---

>`Saves rules to persist after reboot.`

---

>`Why: Your firewall config stays active even after restarts.`

---

### 8. Tor Service Handling

---

```bash
systemctl enable tor
systemctl restart tor
```

>`Ensures Tor starts at boot and applies new settings.`

---

### 9. Creating the systemd Service

---

```bash
cat > "$SERVICE_PATH" <<EOF
[Unit]
Description=Tor Cloak Service
...
EOF

systemctl daemon-reexec
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
```

>`Registers torcloak as a system service.`
> 
>`Boots automatically every time your machine starts.`


---

>`Why: Fully automatic cloaking and proxy setup on every boot — no user interaction needed.`
> 
>`🧪 Results`

>`When finished:`

>`All traffic (except loopback and Tor daemon) is blocked or routed via Tor.`
> 
>`No logs, no hostname, no MAC address ties you to the system.`
> 
>`Tor Cloak auto-runs at boot like a ghost mode.`


---

>`📎 Bonus Notes`

>`Requires macchanger, tor, iptables, and netfilter-persistent.`
>`You can install dependencies via:`

>`sudo apt install tor macchanger iptables netfilter-persistent -y`

>`For testing after install:`

>`curl --socks5-hostname 127.0.0.1:9050 https://check.torproject.org`

>`To verify that Tor is functioning and your IP is anonymized.`
 
---

### Full Source:

```bash
#!/bin/bash

set -e

INSTALL_DIR="/opt/torcloak"
SERVICE_NAME="torcloak"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}.service"

# Ensure install directory exists
mkdir -p "$INSTALL_DIR"
SCRIPT_PATH="$INSTALL_DIR/torcloak.sh"

# If not running from install location, copy self there
if [[ "$(realpath "$0")" != "$SCRIPT_PATH" ]]; then
    echo "[+] Installing Tor Cloak to $INSTALL_DIR..."
    cp "$0" "$SCRIPT_PATH"
    chmod +x "$SCRIPT_PATH"
    exec "$SCRIPT_PATH" "$@"
    exit 0
fi

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

# 8. Create systemd service
echo "[+] Creating systemd service..."
cat > "$SERVICE_PATH" <<EOF
[Unit]
Description=Tor Cloak Service
After=network.target

[Service]
Type=simple
ExecStart=$SCRIPT_PATH
Restart=on-failure
User=root
Group=root
Environment=PATH=/usr/bin:/usr/sbin:/bin:/sbin
WorkingDirectory=/root

[Install]
WantedBy=multi-user.target
EOF

chmod 644 "$SERVICE_PATH"
systemctl daemon-reexec
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

echo "[+] Transparent proxy via Tor is now active!"
echo "[+] Tor Cloak installed as system service: $SERVICE_NAME"

```

---