---
layout: page
title: Tor - Only VPS
published: 2025-09-22
description: "Tor-Only SSH VPS Deployment (Privex IPv6-Only VPS)."
permalink: /tor/privex
category: tor
subcategory: Privex
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

<h1>Tor Only VPS (IPv6)</h1>>

- Fix DNS Resolution

```bash
sudo bash -c 'echo -e "nameserver 2606:4700:4700::1111\nnameserver 1.1.1.1" > /etc/resolv.conf'
```

---

- Install and Configure Tor

---

<h1>Creating a Swap File</h1>

- May help if tor can't bootstrap

```bash
sudo fallocate -l 500M /swapfile  
sudo chmod 600 /swapfile             
sudo mkswap /swapfile 
sudo swapon /swapfile  
```

- nano /etc/fstab

```bash
/swapfile none swap sw 0 0
```

---

```bash
sudo apt update && sudo apt install tor torsocks -y
```

- Edit /etc/tor/torrc:

```bash
# Enable IPv6-only operation
ClientUseIPv4 0
ClientPreferIPv6ORPort 1

# Logging
#Log notice stdout

# Hidden SSH service
HiddenServiceDir /var/lib/tor/hidden_ssh/
HiddenServicePort 6666 127.0.0.1:22
```

- Apply and restart:

```bash
sudo systemctl restart tor
sudo journalctl -u tor -f
```

---

- Grab your .onion:

```bash
sudo cat /var/lib/tor/hidden_ssh/hostname
```

---

- OpenSSH Configuration (Optional Harden)

  - Edit /etc/ssh/sshd_config:

```bash
Port 22
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes
```

- Then:

```bash
sudo systemctl restart ssh
```

- Connect Over Tor

  - From your local machine:

```bash
torsocks ssh -p 6666 root@your.onion

# Or
TORSOCKS_LOG_LEVEL=5 torsocks ssh -vvv -p 6666 root@your.onion
```

- Example .ssh/config 

```bash
Host tor-vps
    HostName 3nt3c3z2hy45q6fourzzr5q2k7clwiththfswpd5qowlm2vcds5valid.onion # REPLACE WITH YOUR ONION ADDRESS
    Port 6666
    User debian # CHANGE ME
    ProxyCommand torsocks -P 9050 nc %h %p
    LogLevel DEBUG3
    IdentityFile ~/.ssh/id_rsa
```

---

<h1>Enable HTTPS</h1>

```bash
sudo apt update
sudo apt install lighttpd openssl

# Enable the mod_openssl module:
sudo lighty-enable-mod ssl
service lighttpd force-reload
```

- NOTE: `YOUR_ONION_ADDRESS`

```bash
# Install Caddy (has easy TLS support)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Create self-signed cert for your .onion (replace YOUR_ONION_ADDRESS)
mkdir -p /etc/caddy/certs
cd /etc/caddy/certs
openssl req -x509 -newkey rsa:4096 -sha256 -days 365 \
  -nodes -keyout your_onion.key -out your_onion.crt \
  -subj "/CN=YOUR_ONION_ADDRESS.onion" \
  -addext "subjectAltName=DNS:YOUR_ONION_ADDRESS.onion"

# Create Caddyfile
cat <<EOF | sudo tee /etc/caddy/Caddyfile
YOUR_ONION_ADDRESS.onion:443 {
  tls /etc/caddy/certs/your_onion.crt /etc/caddy/certs/your_onion.key
  reverse_proxy 127.0.0.1:80
}
EOF

# Restart Caddy
sudo systemctl restart caddy

sudo mkdir -p /etc/caddy/certs
cd /etc/caddy/certs
sudo openssl req -x509 -newkey rsa:4096 -sha256 -days 365 \
  -nodes -keyout fq3uv32e3rvkpy3dbplpfkgs4hlryptriz3id5bpld2usku3dwv6koad.onion.key -out fq3uv32e3rvkpy3dbplpfkgs4hlryptriz3id5bpld2usku3dwv6koad.onion.crt \
  -subj "/CN=fq3uv32e3rvkpy3dbplpfkgs4hlryptriz3id5bpld2usku3dwv6koad.onion" \
  -addext "subjectAltName=DNS:fq3uv32e3rvkpy3dbplpfkgs4hlryptriz3id5bpld2usku3dwv6koad.onion/"
  
  fq3uv32e3rvkpy3dbplpfkgs4hlryptriz3id5bpld2usku3dwv6koad.onionn:443 {
  tls /etc/caddy/certs/your_onion.crt /etc/caddy/certs/fq3uv32e3rvkpy3dbplpfkgs4hlryptriz3id5bpld2usku3dwv6koad.onion.key
  reverse_proxy 127.0.0.1:80
}


sudo chown root:caddy /etc/caddy/certs/*onion.*
sudo chmod 640 /etc/caddy/certs/*onion.*
```

- Finally edit torrc configuration

```textmate
HiddenServicePort 443 127.0.0.1:443
```

- Restart Services

```bash
systemctl tor restart
service lighttpd force-reload
```

---

<style>
  footer {
    display: none;
  }
</style>