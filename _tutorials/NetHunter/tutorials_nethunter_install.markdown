---
layout: page
title: Install LineageOS / NetHunter
published: 2025-07-08
date: 2025-5-28
description: Install LineageOS + Root + F-Droid + BusyBox + NetHunter
permalink: /tutorials/NetHunter/install
category: NetHunter
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

#### ✅ Full Tutorial – Install LineageOS + Root + F-Droid + BusyBox + NetHunter (A–Z)

### _(Example device: Google Pixel 2 XL – adjust files for your own device!)_

---

#### 🔹 0. Set up your PC (Linux)

#### Install tools:

```bash
sudo apt update
sudo apt install android-sdk-platform-tools fastboot adb unzip curl wget
```

#### Check versions:

```bash
adb version
fastboot --version
```

#### These work on:

>`Ubuntu / Debian`
> 
>`Arch (use pacman -S android-tools)`
> 
>`Fedora (dnf install android-tools)`

---

#### 🔹 1. Download what you’ll need

>`LineageOS -`
>[LineageOS](https://lineageos.org/download/)
>`→ Pick your device (Pixel 2 XL = taimen)`\
>`TWRP -`
>[TWRP](https://twrp.me/Devices/)
>`→ Download your .img file`\
>`Magisk (for root)`
>[Magisk](https://github.com/topjohnwu/Magisk/releases)
>`→ Download your .apk file`\
>`NikGApps (optional)`
>[NikGApps](https://nikgapps.com/downloads)
>`→ Download your .apk file`\
>`NetHunter`
>[NetHunter](https://www.kali.org/get-kali/#kali-mobile)
>`→ Rootless APK or full images`\
>`F-Droid APK`
>[F-Droid](https://f-droid.org)
>`F-Droid APK (BusyBox)`

---

#### 🔹 2. Enable Developer Options & OEM Unlock

#### _On your phone:_

- `Go to Settings → About phone → Build number`
- `Tap 7 times → “You’re now a developer!”`
- `Go to Settings → System → Developer Options`
        - `Enable OEM Unlocking`\
        - `Enable USB Debugging`

---

#### 🔹 3. Connect device and verify ADB

>`Plug in USB cable.`
> 
>`Check ADB connection:`

```bash
adb devices
```

>`If it says “unauthorized,” check the screen and approve the dialog.

---

#### 🔹 4. Reboot to fastboot

```bash
adb reboot bootloader
```

>`OR hold:`
    `Power + Vol Down → bootloader screen`

---

#### 🔹 5. Unlock the bootloader

>`⚠️ This wipes your entire phone. Back up first!`

#### - Run:

```bash
fastboot flashing unlock
```

#### On older devices:

```bash
fastboot oem unlock
```

>`Confirm on-screen prompt.`

---

#### 🔹 6. Flash TWRP Recovery

>`Assuming twrp.img is in your current folder:`

```bash
fastboot flash recovery twrp.img
```

>`OR for A/B devices:`

```bash
fastboot boot twrp.img
```

>`→ This boots TWRP without flashing, handy for Pixel.`

---

#### 🔹 7. Wipe data for a clean install

- `In TWRP:`
    - `Wipe → Advanced Wipe → select:`
        - `Dalvik / ART Cache`
        - `System`
        - `Data`
        - `Cache`
   - `Swipe to wipe →`

---

#### 🔹 8. Install LineageOS

#### **Option A – ADB sideload:**

>`In TWRP:`\
>`Advanced → ADB Sideload`\
>`On PC:`

```bash
adb sideload lineage-xx.zip

```

---

#### **Option B – Copy to storage:**

>`Enable MTP in TWRP → copy file`\
>`Tap Install → select ZIP → swipe to flash`

---

#### 🔹 9. Install GApps (Optional)

>`Same as Lineage:`

>`Flash NikGApps ZIP`\
>`OR MindTheGapps, BitGApps, etc.`

---

#### 🔹 10. Install Magisk (Root)

>`Two ways:`\
>`Method 1 – Patch boot.img`

>`Install LineageOS first`\
>`Boot into system`\
>`Install Magisk APK`\
>`Tap → Install → Select and patch a file → pick your boot.img`\
>`Magisk generates magisk_patched.img`

>`Back to fastboot:`

```bash
fastboot flash boot magisk_patched.img
fastboot reboot
```

## `Done!`

----

>`Method 2 – Flash ZIP in TWRP`

>`Copy Magisk ZIP to phone`\
>`TWRP → Install → flash Magisk ZIP`\
>`Reboot`

>`(A/B devices prefer patched boot.img method.)`

---

#### 🔹 11. Install F-Droid

>`Sideload F-Droid.apk`\
>`Browse and install open-source apps`

---

#### 🔹 12. Install BusyBox

>`Search “BusyBox” in F-Droid`\
>`Install and grant root`\
>`Run install to create symlinks`

---

#### 🔹 13. Install NetHunter

##### _NetHunter Rootless:_

>`Download NetHunter Rootless APK`\
>`Install from F-Droid or sideload`\
>`Launch → download Kali minimal or full chroot`\
>`Done!`

##### _NetHunter Full:_

>`Download NetHunter ZIPs for your device`\
>`Flash via TWRP`\
>`Install NetHunter App & Terminal APKs`\
>`Launch NetHunter → finish setup`

---

#### 🔹 14. Hardware for Hacking

#### _✅ Wi-Fi dongles that work out-of-box:_

>`Alfa AWUS036NHA → Atheros AR9271`\
>`Alfa AWUS036NH → Ralink RT3070`\
>`TP-Link TL-WN722N v1 → Atheros AR9271`

---

#### _✅ Bluetooth dongles:_

>`CSR8510 A10`\
>`CSR 4.0 nano dongles`

>`These support Bluetooth scanning, attacks, HID, etc.`\
>`Troubleshooting`

>`No device detected → check USB cable, drivers`\
>`Bootloop → wipe caches, reflash ROM`\
>`No Wi-Fi monitor → need compatible dongle`\
>`Chroot fails → try different mirrors or manual import`

---


Quick Links:

LineageOS Downloads
[LineageOS](https://lineageos.org/download/)\
TWRP Downloads
[TWRP](https://twrp.me/Devices/)\
Magisk Releases
[Magisk](https://github.com/topjohnwu/Magisk/releases)\
F-Droid
[F-Droid](https://f-droid.org/)\
NetHunter Official Page
[NetHunter](https://www.kali.org/get-kali/#kali-mobile)\
Security Tip:
use F-Droid to download Tor Browser for Android by enabling the Guardian Project's Repository
[Guardian Project's](https://guardianproject.info/fdroid/)\
F-Droid Repo's ADD:
[F-Droid](https://guardianproject.info/fdroid/repo)

---