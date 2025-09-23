---
layout: page
title: LineageOS Bad OTA
published: 2025-09-23
date: 2025-5-28
description: "Fix corrupt (OTA) over-the-air update with LineageOS."
permalink: /tutorials/NetHunter/bad_ota
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

<h1>Fix BAD OTA Update</h1>


<p>I ran into some problems doing the OTA update last night<br> 
ended in a complete mess with my Google Pixel 2 XL.</p>


- These were the only steps that seemed to worked after the failed system OTA currupt fiasco... to get WiFi and GSM back online / working this is what i had to do...

<h1>Pixel 2 XL (Taimen) — Full Reflash & LineageOS Install (Both Slots)</h1>


<p>WARNING: This process will erase all user data and system partitions.
Phase 1: Reflash Stock to Slot A and B</p>

---

- Boot into Fastboot/Bootloader Mode

          Power off the device.
          Hold Power + Volume Down until the bootloader screen appears.

---

- Flash Full Stock Images to Slot A

```bash
fastboot set_active a

fastboot flash boot boot.img
fastboot flash system system.img
fastboot flash vendor vendor.img
fastboot flash modem modem.img
fastboot flash abl abl.img
fastboot flash xbl xbl.img
fastboot flash tz tz.img
fastboot flash devcfg devcfg.img
fastboot flash rpm rpm.img
fastboot flash cmnlib cmnlib.img
fastboot flash cmnlib64 cmnlib64.img
fastboot flash keymaster keymaster.img
fastboot flash hyp hyp.img
fastboot flash dtbo dtbo.img
```

---

- Flash Full Stock Images to Slot B

```bash
fastboot set_active b

fastboot flash boot boot.img
fastboot flash system system.img
fastboot flash vendor vendor.img
fastboot flash modem modem.img
fastboot flash abl abl.img
fastboot flash xbl xbl.img
fastboot flash tz tz.img
fastboot flash devcfg devcfg.img
fastboot flash rpm rpm.img
fastboot flash cmnlib cmnlib.img
fastboot flash cmnlib64 cmnlib64.img
fastboot flash keymaster keymaster.img
fastboot flash hyp hyp.img
fastboot flash dtbo dtbo.img
```

<h1>Phase 2: Fix Corrupted Data</h1>

    From the bootloader, use the volume keys to navigate to Recovery Mode.
    Select it using the Power button.

    In recovery, choose:

        Wipe data/factory reset
        Then Format data and confirm.

---

<h1>Phase 3: Install LineageOS (Slot A Recommended)</h1>

- Flash Critical LineageOS Partitions

```bash
fastboot flash boot boot.img
fastboot flash vbmeta vbmeta.img
fastboot flash dtbo dtbo.img
```

---

- Enter LineageOS Recovery

    From the bootloader screen, use volume keys to select Recovery Mode, then press Power to confirm.

---

- Sideload LineageOS via ADB

On your PC, run:

adb sideload lineage-22.2-20250717-nightly-taimen-signed.zip

    If prompted with "To install additional packages, reboot to recovery first?":
        Select No
        If needed, manually Format data again in recovery.


---

<style>
  footer {
    display: none;
  }
</style>