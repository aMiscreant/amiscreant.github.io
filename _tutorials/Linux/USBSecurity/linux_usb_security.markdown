---
layout: page
title: USB Security & Defense
published: 2025-07-08
description: Prevent unauthorized USB devices from compromising your system with defense mechanisms and whitelisting scripts.
permalink: /tutorials/Linux/USBSecurity/scripts
category: linux
subcategory: USBSecurity
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

# 🛡️ USBDefense

---

#### A hardened USB defense system for Linux designed to monitor, control, and respond to USB device events in real time using udev rules and shell scripts.

#### This tool protects against unauthorized USB devices, logs all insertions, and can trigger emergency actions like network lockdown or secure wiping if a trusted security key is removed.

---

#### 📂 Directory Structure:

```bash
usbdefense/
├── allowlist.txt               # List of allowed USB device serials
├── rules/
│   └── 10-usb-guard.rules     # udev rules for USB defense
└── scripts/
    ├── usb-allow.sh
    ├── usb-deny.sh
    ├── usb-log.sh
    ├── usb-network-lock.sh
    └── usb-paranoid-wipe.sh

```

---

#### 🧩 Components

- ✅ allowlist.txt

- A simple text file containing allowed USB device serials, one per line:

```bash
123456789ABCDEF0
87654321FEDCBA09
```

---

### 📜 rules/10-usb-guard.rules

>This udev rules file controls USB behavior:
> 
> ✅ Allow listed USB devices
> 
> ❌ Deny all unlisted USB storage 
> 
> 📝 Log all inserted devices
> 
> ☠ - Wipe the system if a specific security key is removed

```bash
# Allow specific USB devices by serial
ACTION=="add", SUBSYSTEM=="usb", \
RUN+="/opt/usbdefense/scripts/usb-allow.sh"

# Deny all unlisted USB storage devices
ACTION=="add", SUBSYSTEMS=="usb", \
ENV{ID_USB_DRIVER}=="usb-storage", RUN+="/opt/usbdefense/scripts/usb-deny.sh"

# Log all USB device insertions
ACTION=="add", SUBSYSTEM=="usb", RUN+="/opt/usbdefense/scripts/usb-log.sh"

# Panic if a security key is removed
ACTION=="remove", SUBSYSTEMS=="usb", \
ENV{ID_SERIAL_SHORT}=="YOURYUBIKEYSERIAL", \
RUN+="/opt/usbdefense/scripts/usb-paranoid-wipe.sh"

```

---

### 🧠 Script Functions
#### 🔓 usb-allow.sh

>Allows and logs USB devices listed in allowlist.txt.

```bash
SERIAL=$(udevadm info -q property -n "$DEVNAME" | grep ID_SERIAL_SHORT= | cut -d= -f2)
if grep -q "$SERIAL" /opt/usbdefense/allowlist.txt; then
  logger "[usbdefense] Allowed USB: $SERIAL"
else
  logger "[usbdefense] UNKNOWN USB: $SERIAL"
fi

```

---

#### 🚫 usb-deny.sh

>Blocks unauthorized USB storage by unmounting and ejecting the device.

```bash
DEV=$(basename "$DEVNAME")
logger "[usbdefense] Unauthorized USB device: $DEV - unmounting"
umount -l "/dev/$DEV" 2>/dev/null
eject "/dev/$DEV" 2>/dev/null

---

📄 usb-log.sh

Logs detailed USB event information to /var/log/usb_events.log.

```bash
logfile="/var/log/usb_events.log"
{
    echo "[usbdefense] New USB Inserted:"
    udevadm info -q all -n "$DEVNAME"
    echo "-------------------------------------"
} >> "$logfile"

```

---

#### 📡 usb-network-lock.sh

>Cuts off all network interfaces in response to a USB-based trigger.

```bash
logger "[usbdefense] Network lockdown triggered due to USB event"
ip link set eth0 down
ip link set wlan0 down

```

---

#### 💣 usb-paranoid-wipe.sh

>Emergency wipe if a trusted USB security key is removed.

```bash
logger "[usbdefense] Security key removed - wiping system"
sync
sleep 2
shred -n 3 -v /dev/mmcblk0

```
#### ⚠️ Use with extreme caution — this script irreversibly wipes the primary storage!

---

### 📦 Installation

>Clone or copy the usbdefense folder to /opt/usbdefense
>
>Update udev rules:

```bash
sudo cp /opt/usbdefense/rules/10-usb-guard.rules /etc/udev/rules.d/
sudo udevadm control --reload-rules && sudo udevadm trigger

```

>Add trusted USB serials to allowlist.txt

---

### 🔐 Suggested Use Cases

>USB intrusion prevention on air-gapped systems
>Triggering panic responses during physical tampering
>Logging USB access for forensics and auditing
>Blocking all external USB storage except approved devices

---

<style>
  footer {
    display: none;
  }
</style>