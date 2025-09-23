---
layout: page
title: Kali Build Scripts
published: 2025-09-22
description: "Build Scripts, Kali Linux"
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

<h2>Step 1:</h2>
```bash
chmod +x *.sh
```

<h2>Step 2:</h2>
```bash
./kali_install.sh
```

<h2>Step 3:</h2>
```bash
./kali_defaults.sh
```
---

<h2>Source Code:</h2>

### kali_install.sh

```bash
### kali_install.sh
#!/bin/bash
# aMiscreant
# ToDo
# export DEBIAN_FRONTEND=noninteractive
# set apt-get install/upgrade variable
# sudo DEBIAN_FRONTEND=noninteractive apt-get -y \
#    -o Dpkg::Options::="--force-confnew" \
#    -o Dpkg::Options::="--force-confdef" install <packages>

set -e

sudo apt-get update && sudo apt-get upgrade -y

echo "[*] Switching from Debian to Kali Rolling..."

# Step 1: Add Kali keyring
echo "[*] Adding Kali archive keyring..."
sudo wget -q https://archive.kali.org/archive-keyring.gpg -O /usr/share/keyrings/kali-archive-keyring.gpg

# Step 2: Clean Debian repos
echo "[*] Removing Debian repository entries..."
sudo sed -i '/debian/d' /etc/apt/sources.list || true
if [ -d /etc/apt/sources.list.d ]; then
    sudo rm -f /etc/apt/sources.list.d/debian.list 2>/dev/null || true
    sudo rm -f /etc/apt/sources.list.d/debian.sources 2>/dev/null || true
    # Also purge any lines mentioning "debian"
    for f in /etc/apt/sources.list.d/*; do
        sudo sed -i '/debian/d' "$f" 2>/dev/null || true
    done
fi

# Step 3: Add Kali repo
echo "[*] Adding Kali repository..."
echo "deb [signed-by=/usr/share/keyrings/kali-archive-keyring.gpg] http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware" | \
    sudo tee /etc/apt/sources.list

# Step 4: Clean
echo "[*] Cleaning apt-get sources..."
# Clean out old lists
sudo apt clean          # removes downloaded .deb files
sudo rm -rf /var/lib/apt/lists/*   # removes old repo indexes

# Step 5: Update + upgrade
echo "[*] Updating package lists..."
sudo apt-get update

echo "[*] Performing Upgrade (this will take a while)..."
sudo apt-get upgrade -y

# Step 6: Clean-up
echo "[*] Cleaning up..."
sudo apt-get autoremove -y

echo "[+] Conversion complete! You are now on Kali Rolling (reboot recommended)."
echo "[*] Please run ./kali_defaults.sh after rebooting"
sleep 10
sudo reboot
```

### kali_defaults.sh

```bash
#!/bin/bash
# aMiscreant

set -e

NEW_HOSTNAME="kali"

desktop_fix () {
    sudo apt update && sudo apt install -y libgtk-4-bin \
    gstreamer1.0-gl xdg-desktop-portal-gtk gstreamer1.0-libav \
    gstreamer1.0-plugins-bad python3-asn1crypto \
    docbook-xml fonts-dejavu libgtk-4-media-gstreamer \
    libegl1-mesa-dev gstreamer1.0-alsa xorg dbus-x11 x11-xserver-utils \
    kali-defaults kali-root-login desktop-base xfce4 xfce4-places-plugin xfce4-goodies
}

# Stage 1:
echo "[*] Installing Kali Defaults"
sudo apt-get install kali-defaults 

# Stage 2:
echo "[*] Changing hostname..."

sudo hostnamectl set-hostname "$NEW_HOSTNAME"
echo "[+] Hostname changed to $NEW_HOSTNAME"

sudo hostnamectl set-hostname kali
sudo sed -i "s/\borange[^[:space:]]*/kali/g" /etc/hosts

# Stage 3:
echo "[*] Installing kali AllWinner"
sudo apt-get install -y kali-sbc-allwinner || echo "[!] Failed to install kali-sbc-allwinner EXPECTED, continuing..."
# Stage 3b:
echo "[*] Fixing missing packages.."
sudo apt-get update && sudo apt-get update --fix-missing && sudo apt-get upgrade -y

# Stage 4:
echo "[*] Installing Kali Themes / Desktop Env"
sudo apt-get update && sudo apt-get upgrade -y \
    kali-themes \
    kali-menu \
    kali-screensaver \
    kali-desktop-xfce

# Stage 5:
echo "[*] Fixing missing packages.."
sudo apt-get update && sudo apt-get update --fix-missing && sudo apt-get upgrade -y

# Stage 6:
echo "[*] Fully Upgrading"
sudo apt-get full-upgrade -y

echo "[*] Installing Kali Tweaks && Tools {bluetooth/wifi/password/crypto}"
sudo apt-get install kali-tweaks -y
sudo apt-get install -y kali-tools-802-11 kali-tools-bluetooth kali-tools-crypto-stego kali-tools-top10 kali-tools-wireless kali-tools-passwords
echo "[*] Fixing missing packages.."
sudo apt-get update && sudo apt-get update --fix-missing && sudo apt-get upgrade -y
# Stage 6b:
desktop_fix

# Stage 7:
echo "[*] Cleaning up..."
sudo apt-get autoremove -y

# Stage 8:
echo "[*] Rebooting OrangePi"
sudo reboot
```

---

<style>
  footer {
    display: none;
  }
</style>