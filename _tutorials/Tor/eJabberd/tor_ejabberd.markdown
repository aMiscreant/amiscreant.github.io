---
layout: page
title: Tor - XMPP Server (eJabberd)
published: 2025-09-09
description: "Tor hosted XMPP Server using eJabberd"
permalink: /tor/xmpp_server
category: tor
subcategory: eJabberd
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

<h1>XMPP Hidden Service</h1>

<p>The script below provides a basic roll-out setup.</p>
<p>Please refer to ejabberd docs for adding users.</p>


- sudo apt-get install tor ejabberd -y

---

```bash
#!/bin/bash
# aMiscreant

set -e

TORRC="/etc/tor/torrc"
SSL_DIR="/etc/ejabberd/ssl"
EJABBERD_YML="/etc/ejabberd/ejabberd.yml"

# 1. Ensure SSL directory exists
sudo mkdir -p "$SSL_DIR"
sudo chown $(whoami) "$SSL_DIR"

# 2. Append Tor Hidden Service for XMPP if not already present
if ! grep -q "HiddenServiceDir /var/lib/tor/xmppserver/" "$TORRC"; then
    echo -e "\n# Jabber/XMPP" | sudo tee -a "$TORRC"
    echo "HiddenServiceDir /var/lib/tor/xmppserver/" | sudo tee -a "$TORRC"
    echo "HiddenServiceVersion 3" | sudo tee -a "$TORRC"
    echo "HiddenServicePort 5222 127.0.0.1:5222" | sudo tee -a "$TORRC"
fi

# 3. Restart Tor to generate hostname
sudo systemctl restart tor

# 4. Wait a bit for Tor to create the hostname
sleep 2

ONION_HOSTNAME=$(sudo cat /var/lib/tor/xmppserver/hostname)
echo "Generated .onion hostname: $ONION_HOSTNAME"

# 5. Generate self-signed cert
sudo openssl req -x509 -nodes -days 3650 -newkey rsa:4096 \
  -keyout "$SSL_DIR/$ONION_HOSTNAME.key" \
  -out "$SSL_DIR/$ONION_HOSTNAME.crt" \
  -subj "/CN=$ONION_HOSTNAME"

sudo chown ejabberd:ejabberd "$SSL_DIR/$ONION_HOSTNAME".*
sudo chmod 644 "$SSL_DIR/$ONION_HOSTNAME.crt"
sudo chmod 600 "$SSL_DIR/$ONION_HOSTNAME.key"

# 6. Update ejabberd.yml (hosts and certfiles)
sudo sed -i "/^hosts:/c\hosts:\n  - \"$ONION_HOSTNAME\"" "$EJABBERD_YML"
sudo sed -i "/^certfiles:/c\certfiles:\n  - \"$SSL_DIR/$ONION_HOSTNAME.crt\"\n  - \"$SSL_DIR/$ONION_HOSTNAME.key\"" "$EJABBERD_YML"

# 7. Restart ejabberd
sudo systemctl restart ejabberd

echo "Ejabberd configured for Tor XMPP at $ONION_HOSTNAME"

```

---

<style>
  footer {
    display: none;
  }
</style>