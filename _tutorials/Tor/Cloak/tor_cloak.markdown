---
layout: page
title: Tor - Cloak
published: 2025-09-22
description: "Tor Cloaking Methods."
permalink: /tor/cloak
category: tor
subcategory: Cloak
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

<div class="post-meta">
  <p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
  <p>{{ page.description }}</p>
</div>

---

<h1>cloak.sh</h1>

```bash
#!/bin/bash
# aMiscreant

echo "[+] Spoofing MAC address..."
IFACE=$(ip route | grep default | awk '{print $5}')
if [[ -n "$IFACE" ]]; then
    ip link set $IFACE down
    macchanger -r $IFACE
    ip link set $IFACE up
fi

echo "[+] Randomizing hostname..."
NEW_HOST="anon-$(tr -dc a-z0-9 </dev/urandom | head -c6)"
hostnamectl set-hostname $NEW_HOST

echo "[+] Obfuscating kernel info..."
echo "kernel.hostname = hidden" >> /etc/sysctl.conf
echo "kernel.dmesg_restrict = 1" >> /etc/sysctl.conf
echo "kernel.kptr_restrict = 2" >> /etc/sysctl.conf
sysctl -p

echo "[+] Disabling bash history..."
unset HISTFILE
ln -sf /dev/null ~/.bash_history

echo "[+] Done. You're now a ghost on the wire."
```

---

<h1>cloak_v1.sh</h1>

```bash
#!/bin/bash
# aMiscreant

echo "[+] Spoofing MAC address..."
IFACE=$(ip route | grep default | awk '{print $5}')
if [[ -n "$IFACE" ]]; then
    ip link set $IFACE down
    macchanger -r $IFACE
    ip link set $IFACE up
    dhclient -r $IFACE
    dhclient $IFACE
fi

echo "[+] Randomizing hostname..."
NEW_HOST="anon-$(tr -dc a-z0-9 </dev/urandom | head -c6)"
hostnamectl set-hostname "$NEW_HOST"

echo "[+] Obfuscating kernel info..."
for line in \
  "kernel.hostname = hidden" \
  "kernel.dmesg_restrict = 1" \
  "kernel.kptr_restrict = 2"; do
    grep -qxF "$line" /etc/sysctl.conf || echo "$line" >> /etc/sysctl.conf
done
sysctl -p

echo "[+] Disabling bash history..."
unset HISTFILE
ln -sf /dev/null ~/.bash_history

echo "[+] Cloaking complete."
```

---

<h1>cloak.service</h1>

```bash
[Unit]
Description=MAC + Hostname Cloaking
After=network-pre.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/cloak.sh
RemainAfterExit=true

[Install]
WantedBy=multi-user.target
```

---

<h1></h1>

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloak.service
```

---

<style>
  footer {
    display: none;
  }
</style>