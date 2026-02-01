---
layout: page
title: SPI TFT Display (ILI9341 / ILI9488) Guide
published: 2025-07-08
date: 2025-5-29
description: "Practical documentation for bringing up large 4-inch SPI TFT displays using ILI9341/ILI9488 controllers, including kernel modules, framebuffer mapping, and validation on SBCs."
permalink: /tutorials/OPI3Zero/TFT/TFTSPI_tutorial
category: opi3zero
subcategory: TFTSPI
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

## Orange Pi ILI9341 / ILI9488 Framebuffer Display Setup

**Short description:**  
Automated setup scripts for testing and enabling SPI TFT displays (ILI9341 / ILI9488) on Orange Pi using the Linux framebuffer (`fbtft`) and optional X11 fbdev support.

---

### What this does

- Installs required framebuffer tools (`fbi`, `kbd`)
- Loads the `fbtft` kernel module with custom GPIO/SPI parameters
- Tests framebuffer output on `/dev/fb0`
- Maps the Linux console to the TFT display
- Persists module loading and parameters across reboots
- Configures X11 to use the framebuffer device (`fbdev`)

---

### Notes

- Scripts were written for **validation and testing**
- GPIO pin numbers and rotation may need adjustment per board
- Designed for **SPI TFT panels (ILI9341 / ILI9488)**
- X11 configuration is optional but included for completeness

---

### Result

After reboot, the TFT panel should:
- Act as a Linux console framebuffer
- Display images via `fbi`
- Be usable by X11 through the `fbdev` driver

---

```bash
#!/bin/bash
# Orange Pi fb_ili9341 display setup script

set -e

# Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

echo -e "${GREEN}==> Installing required packages...${NC}"
sudo apt-get update -y
sudo apt-get install -y fbi kbd

echo -e "${GREEN}==> Loading fb_ili9488 kernel module...${NC}"
sudo modprobe fbtft custom name=ili9341 busnum=1 cs=1 \
  gpios=reset:73,dc:70,led:69 rotate=90 speed=65000000 bgr=1 txbuflen=65536

echo -e "${GREEN}==> Kernel logs (last 10 lines)...${NC}"
dmesg | tail

echo -e "${GREEN}==> Testing framebuffer...${NC}"
sudo fbi -vt 1 -noverbose -d /dev/fb0 || echo -e "${YELLOW} fbi test failed, continuing...${NC}"
sudo con2fbmap 1 1
sudo con2fbmap 1 0

echo -e "${GREEN}==> Configure console font...${NC}"
echo -e "Recommended: ${YELLOW}UTF-8 (en_US), Optimal charset, Terminus, 6x12 font${NC}"
read -p "Run dpkg-reconfigure console-setup now? (y/n): " fontset
if [[ "$fontset" =~ ^[Yy]$ ]]; then
    sudo dpkg-reconfigure console-setup
else
    echo -e "${YELLOW}Skipped console font configuration.${NC}"
fi

echo -e "${GREEN}==> Setting panel-ilitek-ili9341 to auto-load at boot...${NC}"

# Ensure module loads
echo "fbtft" | sudo tee /etc/modules-load.d/fbtft.conf > /dev/null

# Add module options
sudo tee /etc/modprobe.d/fbtft.conf > /dev/null <<EOF
options fbtft custom name=fb_ili9341 busnum=1 cs=1 \
gpios=reset:73,dc:70,led:69 rotate=90 speed=65000000 bgr=1 txbuflen=65536
EOF

echo -e "${GREEN}==> Ensuring fbcon is mapped correctly in boot args...${NC}"
if ! grep -q "fbcon=map:1" /boot/orangepiEnv.txt; then
    echo "extraargs=fbcon=map:1" | sudo tee -a /boot/orangepiEnv.txt > /dev/null
    echo -e "${GREEN}Added fbcon=map:1 to /boot/orangepiEnv.txt${NC}"
else
    echo -e "${YELLOW}fbcon=map:1 already present in /boot/orangepiEnv.txt${NC}"
fi

echo -e "${GREEN}==> Creating X11 fbdev config...${NC}"
sudo mkdir -p /usr/share/X11/xorg.conf.d
sudo tee /usr/share/X11/xorg.conf.d/99-fbdev.conf > /dev/null <<EOF
Section "Device"
    Identifier "myfb"
    Driver "fbdev"
    Option "fbdev" "/dev/fb1"
EndSection
EOF

echo -e "${GREEN} Setup complete! Reboot to test your display.${NC}"
```

```bash
#!/bin/bash
# Orange Pi fb_ili9488 display setup script

set -e

# Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

echo -e "${GREEN}==> Creating X11 fbdev config...${NC}"
sudo mkdir -p /usr/share/X11/xorg.conf.d
sudo tee /usr/share/X11/xorg.conf.d/99-fbdev.conf > /dev/null <<EOF
Section "Device"
    Identifier "myfb"
    Driver "fbdev"
    Option "fbdev" "/dev/fb1"
EndSection
EOF
```

---