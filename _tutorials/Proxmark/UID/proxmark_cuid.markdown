---
layout: page
title: ❄ Dump and Clone MIFARE Classic and Magic Gen2️
date: 2025-5-29
description: Card (CUID)
permalink: /tutorials/Proxmark3/uid/change_cuid
category: proxmark
subcategory: uid
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

## Overview
This detailed tutorial walks you through using the Proxmark with IceMan firmware to read data from MIFARE Classic cards and clone it onto Magic Gen2 CUID cards. You’ll learn how to identify card types using IceMan-specific commands and outputs, dump card data, write new UIDs on compatible magic cards, troubleshoot common IceMan errors, and restore original dumps. Ideal for RFID researchers and enthusiasts working with IceMan’s advanced features.


## Proxmark IceMan Firmware Tutorial
Dump and Clone MIFARE Classic and Magic Gen2 Cards

---

# 🚀 Tutorial #2 — Writing to Magic CUID Card (CARD B)

Now let’s clone that data onto a Magic Gen2 CUID card (CARD B).

This card supports writing block 0 (the UID block).

<p>This card is a <strong>Magic Gen 2 / CUID</strong> type, supporting direct UID changes on block 0.</p>

---

### Step 1 — Connect Proxmark

Plug in your Proxmark navigate to the directory [/home/miscreant/iceman-proxmark3] and run:

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> ./pm3 -p /dev/ttyACM0
  </code></pre>
</div>

---

### Step 2 — Check Card Info

+ Hold/Place CARD B near the antenna and run:


<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>hf mf info
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] --- ISO14443-a Information ---------------------
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  UID: 79 12 3E 1E 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] ATQA: 00 04
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  SAK: 08 [2]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] --- Keys Information
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] loaded 2 user keys
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] loaded 61 hardcoded keys
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Sector 0 key A... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Sector 0 key B... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Sector 1 key A... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Block 0.... 79123E1E4B0804006263646566676869 | bcdefghi
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] --- Fingerprint
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Fudan based card
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] --- Magic Tag Information
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Magic capabilities... Gen 2 / CUID
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] --- PRNG Information
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Prng....... weak
<span class="blinking-cursor"></span>
  </code></pre>
</div>

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>hf mf wipe
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] Loaded keys matching MIFARE Classic 1K
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] Skipping sector 0 / block 0

<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]  blk | 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] -----+------------------------------------------------------------
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    1 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    2 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    3 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    4 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    5 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    6 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    7 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    8 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    9 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   10 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   11 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   12 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   13 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   14 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   15 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   16 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   17 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   18 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   19 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   20 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   21 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   22 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   23 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   24 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   25 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   26 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   27 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   28 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   29 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   30 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   31 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   32 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   33 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   34 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   35 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   36 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   37 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   38 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   39 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   40 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   41 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   42 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   43 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   44 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   45 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   46 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   47 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   48 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   49 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   50 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   51 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   52 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   53 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   54 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   55 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   56 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   57 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   58 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   59 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   60 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   61 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   62 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 - key B ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]   63 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF - key B ( ok )
  </code></pre>
</div>

**`hf mf wipe`** command erases data blocks on a MIFARE Classic card by writing zeros or default values to each block except **sector 0 block 0**, which contains the UID and manufacturer data and is **protected from wiping**.

- The tool reports each block wiped with data and confirms success with **`(ok)`**.
- Skipping **sector 0 block 0** avoids corrupting the card UID.
- This process resets all data blocks to empty/default states, effectively **"cleaning" the card**.
- Useful for preparing cards for new data or resetting cloned cards.

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>hf mf autopwn
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[!] ⚠️  no known key was supplied, key recovery might fail
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] loaded 5 user keys
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] loaded 61 hardcoded keys
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] Running strategy 1
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   0 key type A -- found valid key [ FFFFFFFFFFFF ] (used for nested / hardnested attack)
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   0 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   1 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   1 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   2 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   2 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   3 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   3 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   4 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   4 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   5 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   5 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   6 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   6 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   7 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   7 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   8 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   8 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   9 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector   9 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector  10 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector  10 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector  11 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector  11 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector  12 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector  12 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector  13 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector  13 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector  14 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector  14 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector  15 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] target sector  15 key type B -- found valid key [ FFFFFFFFFFFF ]

<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] found keys:

<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] -----+-----+--------------+---+--------------+----
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  Sec | Blk | key A        |res| key B        |res
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] -----+-----+--------------+---+--------------+----
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  000 | 003 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  001 | 007 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  002 | 011 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  003 | 015 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  004 | 019 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  005 | 023 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  006 | 027 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  007 | 031 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  008 | 035 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  009 | 039 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  010 | 043 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  011 | 047 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  012 | 051 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  013 | 055 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  014 | 059 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  015 | 063 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
  </code></pre>
</div>

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>hf mf dump
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] Using... hf-mf-79123E1E-key.bin
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Loaded binary key file `/home/miscreant/hf-mf-79123E1E-key.bin`
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] Reading sector access bits...
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] .................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Finished reading sector access bits
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] Dumping all blocks from card...
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span> 🕓 Sector... 15 block... 3 ( ok )
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Succeeded in dumping all blocks
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] time: 9 seconds
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] -----+-----+-------------------------------------------------+-----------------
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]  sec | blk | data                                            | ascii
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] -----+-----+-------------------------------------------------+-----------------
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    0 |   0 | 79 12 3E 1E 4B 08 04 00 62 63 64 65 66 67 68 69 | y.>.K...bcdefghi
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |   1 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |   2 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |   3 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    1 |   4 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |   5 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |   6 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |   7 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    2 |   8 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |   9 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  10 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  11 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    3 |  12 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  13 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  14 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  15 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    4 |  16 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  17 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  18 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  19 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    5 |  20 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  21 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  22 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  23 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    6 |  24 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  25 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  26 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  27 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]    7 |  28 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  29 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  30 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=]      |  31 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
  </code></pre>
</div>

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>hf mf wrbl --blk 0 -d E362411FDF0804006263646566676869
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] Targeting Sector 0 / Block 0 - Manufacturer block
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] Read the helptext for details before writing to this block
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] You must use param `--force` to write to this block
  </code></pre>
</div>


### Command

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> hf mf wrbl --blk 0 -d E362411FDF0804006263646566676869
  </code></pre>
</div>

## Detailed Breakdown: What is going on here?

### Command

This command tells the Proxmark3 tool to **write a block** (`wrbl` = write block) to a MIFARE Classic card, specifically targeting **block 0** (`--blk 0`) with the given data (`-d E362411FDF0804006263646566676869`).

---

### What is Block 0?

Block 0 in MIFARE Classic cards is **special** because it contains the **manufacturer data**, which includes the card's **UID (Unique Identifier)** and other factory-programmed information.  
This block is generally **read-only** or protected to prevent tampering because the UID is supposed to be unique and unchangeable by design.

---

### Output Explanation

- `[=] Targeting Sector 0 / Block 0 - Manufacturer block`  
  The Proxmark3 recognizes block 0 belongs to sector 0 and is the manufacturer block containing the UID and other critical data.

- `[=] Read the helptext for details before writing to this block`  
  This is a cautionary message reminding you that writing to this block is sensitive and potentially risky. Improper writes can damage the card or render it unusable.

- `[=] You must use param '--force' to write to this block`  
  To prevent accidental writes, the tool requires an explicit confirmation flag `--force` to allow you to write to this protected block.  
  This safety measure ensures the user is aware of the risks and intends to override default protections.

---

### Why is this important?

#### Manufacturer Block Protection

The UID stored in block 0 is essential for the card's identity and security functions. Changing it can cause the card to malfunction or be rejected by systems expecting that UID.

#### Legality and Ethics

Modifying manufacturer blocks may be illegal or unethical depending on jurisdiction and use case because it can be used to clone or spoof cards.

#### Tool Safety

Proxmark3 protects the user from unintentional writes to this critical block by requiring the `--force` flag. This encourages the user to carefully review the risks before proceeding.

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>hf mf wrbl --blk 0 -d E362411FDF0804006263646566676869 --force
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] Writing block no 0, key type:A - FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] data: E3 62 41 1F DF 08 04 00 62 63 64 65 66 67 68 69 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Write ( ok )
  </code></pre>
</div>

## Forcing the Write

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> hf mf wrbl --blk 0 -d E362411FDF0804006263646566676869 --force
  </code></pre>
</div>

- The --force parameter overrides safety checks, allowing writing to protected blocks (like the manufacturer block).
  - Output messages explained:

        [=] Writing block no 0, key type:A - FFFFFFFFFFFF
        The card was accessed using the default key FFFFFFFFFFFF for authentication.

        [=] data: E3 62 41 1F DF 08 04 00 62 63 64 65 66 67 68 69
        The exact 16 bytes of data being written to block 0.
        [+] Write ( ok )
  
        The write operation completed successfully.

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>hf mf info
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] --- ISO14443-a Information ---------------------
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  UID: E3 62 41 1F 
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] ATQA: 00 04
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+]  SAK: 08 [2]
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] --- Keys Information
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] loaded 2 user keys
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] loaded 61 hardcoded keys
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Sector 0 key A... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Sector 0 key B... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Sector 1 key A... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Block 0.... E362411FDF0804006263646566676869 | bcdefghi
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] --- Fingerprint
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Fudan based card
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] --- Magic Tag Information
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Magic capabilities... Gen 2 / CUID
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[=] --- PRNG Information
<span class="prompt"><span class="prompt-user">usb</span>💀<span class="prompt-host">pm3</span>--> </span>[+] Prng....... weak
  </code></pre>
</div>

---

# _______________________________________________________________________________________________________________________________________________________________

# ⚠️ Legal Disclaimer

Changing or cloning RFID cards may be illegal if used for unauthorized access. Only experiment on your own cards or with permission.
