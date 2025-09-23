---
layout: page
title: Bad Kitty
published: 2025-09-22
description: "BadKitty, an Automated Wi-Fi Pentesting Tool."
permalink: /projects/BadKitty
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

---

<div class="post-meta">
  <p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
  <p>{{ page.description }}</p>
</div>

---

![Bad Kitty](https://anopik.org/eb0013c494170cb248e9f015c44045c71758649717.png)

<h1>Bad Kitty</h1>

- Automated Wi-Fi Research Rig — Powered by ESP32 w/ TFT & micro-SD

   - "Designed to be: turn on and auto-pwn" — packed for researchers; use responsibly.

---

<h1>TL;DR</h1>

- Bad Kitty is a compact ESP32-based research device that automates wireless scanning and session capture for offline analysis. It’s built as a field-friendly, portable box that logs session captures to a micro-SD for later review in standard tools.


<p>What it does (high level)
Runs on an ESP32-WROOM module with a small SPI TFT UI.
Automatically scans local RF/802.11 environments and records session captures to the SD card for offline analysis.
Local UI shows status and saved sessions.
Portable and battery ready — designed for quick field use in controlled/test environments.</p>

 - [!] This project is for research and authorized testing only. Do not use this device on networks you do not own or do not have express permission to test.

<h1>Hardware (overview)</h1>

- <p>Core: ESP32-WROOM-32D (or compatible ESP32 module)<br>
- Display: SPI TFT (small, ~1.8"–2.8")<br>
- Storage: micro-SD card module (HSPI) for .cap session files and logs<br>
- Other: basic wiring, optional enclosure and battery pack<br>

---

<h1>Flashing & hardware notes</h1>

<p>Use your normal ESP32 toolchain/flash workflow (platformio, esptool, etc.). See docs/ for detailed build scripts if you want to compile locally.<br>
SD module quirk: Some micro-SD modules behave differently between vendors. In our build we observed a signal conflict on some modules;<br> 
the fix we used on the prototype was a small hardware adjustment to the SD module we had on hand.<br> 
Behavior varies by vendor — treat this as a module-specific hardware note rather than a required step. If you try a different SD adapter it may work without modification.<br>
Suggested repo entry: a short troubleshooting section that documents which SD modules worked for us and which behaved oddly.<br>
If you contribute hardware notes, please describe the module/vendor and symptoms rather than instructions that could be misapplied.<br></p>

---

<h1>Output</h1>

<p>Capture files written to the SD card in standard .cap format for offline analysis.<br>
Local log files and session metadata saved alongside captures.<br></p>

---

<h1>Responsible use & legal</h1>

<p>Bad Kitty is a research tool. By using or contributing to this project you agree to:<br>
Use the device only on networks you own or where you have explicit, written permission to test.<br>
Follow applicable laws and responsible disclosure practices.<br>
Not use the project to interfere with others' networks or services.<br>
Include a clear “Responsible Use” block in your project page and require contributors<br> 
to acknowledge the policy (see CONTRIBUTING.md).<br></p>

---

<h1>Credits</h1>

<p>libnet80211.a — used in this build for packet functionality.<br> 
Credits to the original author for their work.<br>
Thanks to community testers and hardware contributors.<br></p>

---

<h1>Contributing</h1>

<p>Contributions, bug reports, and hardware notes are welcome. When reporting an issue, include:<br>
Your test environment (hardware revisions, SD module vendor, ESP32 module variant).<br>
Confirmation you tested only on authorized targets.<br>
Please follow the repo’s CONTRIBUTING.md and CODE_OF_CONDUCT.md.<br></p>


---

<h1>License</h1>

```bash
MIT License

Copyright (c) 2025 aMiscreant

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

```

---

<h1>Links</h1>

- Repo: https://github.com/aMiscreant/BadKitty
- libnet80211 credits / upstream: https://github.com/Hex2424/esp32_deauth_patch