---
layout: page
title: 💻 Kali Wi-Fi Configuration
published: 2025-07-08
date: 2025-5-29
description: Replace NetworkManager with manual Wi-Fi config using wpa_supplicant and /etc/network/interfaces for minimal or headless Linux systems.
permalink: /tutorials/OPI3Zero/Kali/manual_wifi
category: opi3zero
subcategory: Kali
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

#### This guide walks through replacing NetworkManager with a manual Wi-Fi configuration on Linux systems, such as Orange Pi or minimal Debian/Ubuntu installations. It covers removing NetworkManager, setting up WPA Supplicant for wireless credentials, configuring `/etc/network/interfaces` for dynamic IP assignment, and optionally enabling a systemd service to bring up Wi-Fi automatically at boot. Ideal for lightweight systems, headless setups, or advanced users who prefer precise control over networking.

---

#### 🔥 Remove NetworkManager

>`First, uninstall NetworkManager and disable its service so it doesn’t conflict with your manual networking:`

```bash
sudo apt purge network-manager network-manager-gnome
sudo systemctl disable NetworkManager
```

---

#### 🔧 Create WPA Supplicant Config

>`This file holds your Wi-Fi SSID and password securely. Edit /etc/wpa_supplicant/wpa_supplicant.conf:`

```bash
ctrl_interface=DIR=/run/wpa_supplicant GROUP=netdev
update_config=1
country=US

network={
    ssid="YourWiFiSSID"
    psk="YourWiFiPassword"
}

```

---

#### ✅ Replace:

>`YourWiFiSSID → your actual Wi-Fi name (case-sensitive).`
> 
>`YourWiFiPassword → your Wi-Fi password.`
> 

>`Tip: update_config=1 allows wpa_cli or wpa_gui to modify this file.`
> 
>`If you prefer to lock it down, set it to 0 as in your final example.`


---

#### 🔹 Configure /etc/network/interfaces

>`Edit the network interfaces file:`
>
>`sudo nano /etc/network/interfaces`
>
>`Use this minimal configuration:`

```bash
auto lo
iface lo inet loopback

allow-hotplug wlan0
iface wlan0 inet dhcp
    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf

auto eth0
iface eth0 inet dhcp

```

>`allow-hotplug wlan0 lets the Wi-Fi come up automatically if plugged in or detected.`
>
>`iface wlan0 inet dhcp requests a dynamic IP address from your router.`
>
>`wpa-conf points to your WPA Supplicant file.`


---

#### Example:

```bash
source-directory /etc/network/interfaces.d

auto lo
iface lo inet loopback

allow-hotplug wlan0
iface wlan0 inet dhcp
    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf

auto eth0
iface eth0 inet dhcp

```


---

#### 🚀 Optional: Enable Auto-Start Service

>`For extra reliability (e.g. on headless devices), create a systemd service to bring up Wi-Fi on boot:`

```bash
/etc/systemd/system/wifi-autostart.service

[Unit]
Description=Bring up wlan0 with DHCP at boot
After=network.target

[Service]
Type=oneshot
ExecStart=/sbin/ip link set wlan0 up
ExecStartPost=/sbin/dhclient wlan0

[Install]
WantedBy=multi-user.target

```


---

#### Enable it:

```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable wifi-autostart

```


---

#### ✅ Example WPA Supplicant Config (Your Real Example)

```bash
ctrl_interface=DIR=/run/wpa_supplicant GROUP=netdev
update_config=0
country=US

network={
    ssid="TL;DR"
    psk="Password"
    key_mgmt=WPA-PSK
}

```

>`update_config=0 prevents changes from tools like wpa_cli.`
>
>`key_mgmt=WPA-PSK specifies WPA Personal security.`

---

#### 📄 kali_wifi.sh:

```bash
#!/bin/bash
# ========================================== #
#    Made by aMiscreant for Miscreants       #
# ========================================== #

echo "=== Manual Wi-Fi Configuration Script ==="

# Prompt for interface
read -rp "Enter your Wi-Fi interface name (e.g. wlan0): " IFACE
IFACE=${IFACE:-wlan0}

# Prompt for SSID
read -rp "Enter your Wi-Fi SSID: " SSID

# Prompt for Wi-Fi password
read -rsp "Enter your Wi-Fi password: " WIFI_PASS
echo

echo "[+] Removing NetworkManager..."
apt purge -y network-manager network-manager-gnome
systemctl disable NetworkManager

echo "[+] Writing wpa_supplicant.conf..."
cat <<EOF > /etc/wpa_supplicant/wpa_supplicant.conf
ctrl_interface=DIR=/run/wpa_supplicant GROUP=netdev
update_config=0
country=US

network={
    ssid="$SSID"
    psk="$WIFI_PASS"
    key_mgmt=WPA-PSK
}
EOF

chmod 600 /etc/wpa_supplicant/wpa_supplicant.conf

echo "[+] Writing /etc/network/interfaces..."
cat <<EOF > /etc/network/interfaces
auto lo
iface lo inet loopback

allow-hotplug $IFACE
iface $IFACE inet dhcp
    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf

auto eth0
iface eth0 inet dhcp
EOF

echo "[+] Creating optional wifi-autostart systemd service..."
cat <<EOF > /etc/systemd/system/wifi-autostart.service
[Unit]
Description=Bring up $IFACE with DHCP at boot
After=network.target

[Service]
Type=oneshot
ExecStart=/sbin/ip link set $IFACE up
ExecStartPost=/sbin/dhclient $IFACE

[Install]
WantedBy=multi-user.target
EOF

chmod 644 /etc/systemd/system/wifi-autostart.service

echo "[+] Reloading systemd..."
systemctl daemon-reexec
systemctl daemon-reload
systemctl enable wifi-autostart

echo "[✓] Configuration complete."
echo "You can now reboot or manually bring up your interface with:"
echo "  ip link set $IFACE up && dhclient $IFACE"

```

---