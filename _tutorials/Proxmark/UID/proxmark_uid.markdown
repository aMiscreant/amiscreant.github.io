---
layout: page
title: ❄ Dump and Clone MIFARE Classic and Magic Gen2️
date: 2025-5-29
description: Card (UID)
permalink: /tutorials/Proxmark3/uid/change_uid
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

# 🚀 Tutorial #1 — Dumping Data from CARD A

Let’s first read the data from CARD A (UID).

<p>This card is a <strong>Magic Gen 1a</strong> type with Gen 4 GDM/USCUID features, which may have different UID write protections.</p>

---

### Step 1 — Connect Proxmark

Plug in your Proxmark navigate to the directory [/home/miscreant/iceman-proxmark3] and run:

```bash
root💀NullOrigin:~#./pm3 -p /dev/ttyACM0
```

---

### Step 2 — Check Card Info

+ Hold/Place CARD A near the antenna and run:


<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> hf mf info
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- ISO14443-a Information ---------------------
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+]  UID: E3 62 41 1F 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] ATQA: 00 04
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+]  SAK: 08 [2]
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- Keys Information
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] loaded 2 user keys
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] loaded 61 hardcoded keys
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Sector 0 key A... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Sector 0 key B... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Sector 1 key A... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Block 0.... E362411FDF0804006263646566676869 | bcdefghi
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- Fingerprint
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Fudan based card
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- Magic Tag Information
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Magic capabilities... Gen 2 / CUID
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- PRNG Information
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Prng....... weak
  </code></pre>
</div>

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> hf mf autopwn
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [!] ⚠️  no known key was supplied, key recovery might fail
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] loaded 5 user keys
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] loaded 61 hardcoded keys
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] Running strategy 1
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] target sector   0 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] target sector   0 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] target sector   1 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] target sector   1 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [...]
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] target sector  15 key type A -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] target sector  15 key type B -- found valid key [ FFFFFFFFFFFF ]
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] found keys:
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] -----+-----+--------------+---+--------------+----
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+]  Sec | Blk | key A        |res| key B        |res
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] -----+-----+--------------+---+--------------+----
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+]  000 | 003 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+]  001 | 007 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] [...]
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+]  015 | 063 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] -----+-----+--------------+---+--------------+----
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] ( D:Dictionary / S:darkSide / U:User / R:Reused / N:Nested / H:Hardnested / C:statiCnested / A:keyA  )
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Generating binary key file
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Found keys have been dumped to `/home/miscreant/hf-mf-E362411F-key.bin`
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --[ FFFFFFFFFFFF ]-- has been inserted for unknown keys where res is 0
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] transferring keys to simulator memory ( ok )
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] dumping card content to emulator memory (Cmd Error: 04 can occur)
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] downloading card content from emulator memory
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Saved 1024 bytes to binary file `/home/miscreant/hf-mf-E362411F-dump.bin`
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Saved to json file /home/miscreant/hf-mf-E362411F-dump.json
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] autopwn execution time: 2 seconds
<span class="blinking-cursor"></span>
  </code></pre>
</div>

---

## Proxmark3 Tutorial: hf mf autopwn

When you run:

```
[usb] pm3 --> hf mf autopwn
```

here’s what happens, and why you see that output:

⚠️ **No known key warning**

```
[!] ⚠️  no known key was supplied, key recovery might fail
```

This means you didn’t explicitly provide a list of known keys. That’s not fatal—Proxmark3 still has built-in default keys—but your chances of success are lower for non-default cards.

---

### Keys loaded

```
[+] loaded 5 user keys
[+] loaded 61 hardcoded keys
```

Proxmark3 loads:

- **user keys** → any keys you’ve saved from prior sessions or custom lists.
- **hardcoded keys** → default keys known to be used in many systems (like `FFFFFFFFFFFF`).

---

### Strategy running

```
[=] Running strategy 1
```

Proxmark3 has different attack strategies (nested, hardnested, etc.). Strategy 1 tries known keys first for fast attacks.

---

### Sector key discovery

You’ll see repeated lines like:

```
[+] target sector   0 key type A -- found valid key [ FFFFFFFFFFFF ] (used for nested / hardnested attack)
[+] target sector   0 key type B -- found valid key [ FFFFFFFFFFFF ]
```

- **Sector** → the MIFARE Classic card is divided into sectors.
- **Key A / Key B** → each sector uses two keys for read/write permissions.
- **found valid key** → the key was successfully discovered.
- `FFFFFFFFFFFF` → a very common factory default key.

In your output, all sectors (0–15) use the default key on both A and B sides.

---

### Key summary table

Proxmark3 prints a table like this:

```
[+] -----+-----+--------------+---+--------------+----
[+]  Sec | Blk | key A        |res| key B        |res
[+] -----+-----+--------------+---+--------------+----
[+]  000 | 003 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D
[+]  001 | 007 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D
...
[+]  015 | 063 | FFFFFFFFFFFF | D | FFFFFFFFFFFF | D
[+] -----+-----+--------------+---+--------------+----
[=] ( D:Dictionary / S:darkSide / U:User / R:Reused / N:Nested / H:Hardnested / C:statiCnested / A:keyA  )
```

- **Sec** → the sector number.
- **Blk** → the block address of that sector’s trailer block.
- **key A / key B** → the recovered keys.
- **res** → how the key was recovered:
  - D = Dictionary attack (known keys).
  - Other codes (e.g. N, H) indicate attack types used.

In your dump, all keys were found via a dictionary attack (D) because the card uses the default key.

---

### Saving recovered keys

```
[+] Generating binary key file
[+] Found keys have been dumped to /home/miscreant/hf-mf-E362411F-key.bin
```

Proxmark3 saves all discovered keys into a binary file you can reuse for reading or cloning the card.

---

### Transfer to simulator

```
[=] transferring keys to simulator memory ( ok )
[=] dumping card content to emulator memory (Cmd Error: 04 can occur)
```

Proxmark3 loads the keys into its internal memory so it can emulate or dump the card.

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> hf mf dump
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] Using... hf-mf-E362411F-key.bin
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Loaded binary key file `/home/miscreant/hf-mf-E362411F-key.bin`
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] Reading sector access bits...
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] .................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Finished reading sector access bits
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] Dumping all blocks from card...
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> 🕑 Sector... 15 block... 3 ( ok )
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Succeeded in dumping all blocks
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] time: 9 seconds
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] -----+-----+-------------------------------------------------+-----------------
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]  sec | blk | data                                            | ascii
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] -----+-----+-------------------------------------------------+-----------------
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]    0 |   0 | E3 62 41 1F DF 08 04 00 62 63 64 65 66 67 68 69 | .bA.....bcdefghi
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |   1 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |   2 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |   3 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [...]
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]   15 |  63 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] -----+-----+-------------------------------------------------+-----------------
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Saved 1024 bytes to binary file `/home/miscreant/hf-mf-E362411F-dump-001.bin`
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Saved to json file /home/miscreant/hf-mf-E362411F-dump-001.json
<span class="blinking-cursor"></span>
  </code></pre>
</div>

### Dumping the card

```
[=] downloading card content from emulator memory
[+] Saved 1024 bytes to binary file /home/miscreant/hf-mf-E362411F-dump.bin
[+] Saved to json file /home/miscreant/hf-mf-E362411F-dump.json
```

Your card’s entire data was dumped:

- **binary file** → exact raw data for cloning.
- **JSON file** → more readable for analysis.

---

### Execution time

```
[=] autopwn execution time: 2 seconds
```

Indicates how fast the entire attack completed.

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> hf mf csetuid -u E48D1605
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] old block 0... E362411FDF0804006263646566676869
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] new block 0... E48D16057A0804006263646566676869
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Old UID... E3 62 41 1F 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] New UID... E4 8D 16 05  ( verified )
<span class="blinking-cursor"></span>
  </code></pre>
</div>

✅ hf mf csetuid

## Proxmark3 Tutorial: hf mf csetuid - Changing the Card UID

When you run:

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> hf mf csetuid -u E48D1605
  </code></pre>
</div>


Here’s what happens:

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] old block 0... E362411FDF0804006263646566676869
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span>[+] new block 0... E48D16057A0804006263646566676869
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Old UID... E3 62 41 1F
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] New UID... E4 8D 16 05 ( verified )
<span class="blinking-cursor"></span>
  </code></pre>
</div>

- The hf mf csetuid command **changes the UID (Unique Identifier)** stored on the card to a new value.
- -u E48D1605 specifies the new UID you want to set.
- **Old block 0** shows the original raw data of block 0, which includes the old UID.
- **New block 0** shows the new raw data with the updated UID.
- The **UID** is the unique 4-byte identifier of the card, often used for access control.
- The tool verifies that the new UID was successfully written.

**Important:** This command works only on UID-changeable cards such as "Magic" MIFARE cards. Standard MIFARE Classic cards have fixed UIDs that cannot be changed.

---

**Use case:** Changing a card's UID can be useful for cloning or testing access control systems.


<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> hf mf dump --ns
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] Using... hf-mf-E48D1605-key.bin
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Loaded binary key file `/home/miscreant/hf-mf-E48D1605-key.bin`
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] Reading sector access bits...
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] .................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Finished reading sector access bits
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] Dumping all blocks from card...
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> 🕒 Sector... 15 block... 3 ( ok )
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Succeeded in dumping all blocks
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] time: 9 seconds
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] -----+-----+-------------------------------------------------+-----------------
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]  sec | blk | data                                            | ascii
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] -----+-----+-------------------------------------------------+-----------------
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]    0 |   0 | E4 8D 16 05 7A 08 04 00 62 63 64 65 66 67 68 69 | ....z...bcdefghi
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |   1 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |   2 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |   3 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]    1 |   4 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |   5 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |   6 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |   7 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]    2 |   8 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |   9 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |  10 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |  11 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]    3 |  12 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |  13 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=]      |  14 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
<span class="blinking-cursor"></span>
  </code></pre>
</div>

✅ hf mf dump --ns

## Proxmark3 Tutorial: hf mf dump --ns - Dumping Card Data Without Sector Trailer Keys

When you run:

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> hf mf dump --ns
  </code></pre>
</div>

Here’s what’s happening step-by-step:

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] Using... hf-mf-E48D1605-key.bin
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Loaded binary key file /home/miscreant/hf-mf-E48D1605-key.bin
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] Reading sector access bits...
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] .................
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Finished reading sector access bits
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] Dumping all blocks from card...
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> 🕒 Sector... 15 block... 3 ( ok )
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Succeeded in dumping all blocks
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] time: 9 seconds
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span>
  </code></pre>
</div>

- The command loads the previously saved **key file** for authentication.
- It reads the **sector access bits**, which define permissions and security for each sector.
- Then, it dumps **all blocks** of the card sector-by-sector, including data blocks and sector trailers.
- The --ns option tells Proxmark3 to **not require sector trailer keys for dumping**, useful for certain Magic or UID-changed cards.

---

### Sample output of data blocks:

-  sec | blk | data | ascii
- [=] 0 | 0 | E4 8D 16 05 7A 08 04 00 62 63 64 65 66 67 68 69 | ....z...bcdefghi
- [=] 0 | 1 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
- [=] 0 | 2 | 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 | ................
- [=] 0 | 3 | FF FF FF FF FF FF FF 07 80 69 FF FF FF FF FF FF | .........i......


- **Sector 0, block 0** contains the new UID and manufacturer data.
- Other blocks usually contain application data or default empty values.
- **Sector trailers** (blocks like 3, 7, 11, etc.) store keys and access bits.

---

**Use case:** Dumping the entire card data is essential for backup, cloning, or analyzing the card's contents.

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> hf mf info
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- ISO14443-a Information ---------------------
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+]  UID: E4 8D 16 05 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] ATQA: 00 04
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+]  SAK: 08 [2]
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- Keys Information
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] loaded 2 user keys
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] loaded 61 hardcoded keys
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Sector 0 key A... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Sector 0 key B... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Sector 1 key A... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Block 0.... E48D16057A0804006263646566676869 | bcdefghi
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- Fingerprint
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Fudan based card
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- Magic Tag Information
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Magic capabilities... Gen 1a
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Magic capabilities... Gen 4 GDM / USCUID ( ZUID Gen1 Magic Wakeup )
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- PRNG Information
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Prng....... weak
  </code></pre>
</div>

✅ hf mf info

## Proxmark3 Tutorial: hf mf info - Display Card Information and Status

When you run:

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> hf mf info
  </code></pre>
</div>

Here’s what the output means:

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- ISO14443-a Information ---------------------
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] UID: E4 8D 16 05
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] ATQA: 00 04
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] SAK: 08 [2]
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- Keys Information
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] loaded 2 user keys
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] loaded 61 hardcoded keys
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Sector 0 key A... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Sector 0 key B... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Sector 1 key A... FFFFFFFFFFFF
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Block 0.... E48D16057A0804006263646566676869 | bcdefghi
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- Fingerprint
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Fudan based card
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- Magic Tag Information
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Magic capabilities... Gen 1a
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Magic capabilities... Gen 4 GDM / USCUID ( ZUID Gen1 Magic Wakeup )
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [=] --- PRNG Information
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> [+] Prng....... weak
  </code></pre>
</div>

- **ISO14443-a Information:** Basic card identifiers
  - **UID:** The card’s unique ID.
  - **ATQA:** Answer to Request, a standard identifier for card type.
  - **SAK:** Select Acknowledge, indicates card capabilities and type.
- **Keys Information:** Number of user and hardcoded keys loaded for attacks.
- **Keys for Sector 0 and 1:** Shows keys used to access sectors.
- **Block 0 content:** Shows data from the first block including the UID and manufacturer data.
- **Fingerprint:** Identifies the card vendor/type (e.g., Fudan).
- **Magic Tag Information:** Indicates if the card supports special "Magic" features such as UID changing or wakeup.
- **PRNG:** Pseudo-random number generator quality (weak means less secure).

---

**Use case:** Use hf mf info to gather a comprehensive snapshot of the card’s type, capabilities, and security info before attempting attacks or cloning.

---

# _______________________________________________________________________________________________________________________________________________________________

# ⚠️ Legal Disclaimer

Changing or cloning RFID cards may be illegal if used for unauthorized access. Only experiment on your own cards or with permission.
