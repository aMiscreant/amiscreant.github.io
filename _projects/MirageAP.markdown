---
layout: page
title: MirageAP
published: 2025-09-22
description: "Fake Access Point using: esp8266 (Evil Twin)"
permalink: /projects/MirageAP
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

![MirageAP](https://image2url.com/images/1759045091178-a91f1c1e-2283-4da5-b112-0746448bc554.jpeg)

---

<h1>MirageAP</h1>

<p>Evil Twin pentesting tool that deauths target network</p>
<p>Emulating a [Router Firmware Update] with cli command, and a builtin menu.</p>


                      MirageAP

    Type 'scan' to scan WiFi networks.
    Type `load` to load found WiFi networks.
    Type 'select <SSID>' to select network for deauth and start fake AP.
    Type 'clear' to clear stored scan results.

    - [scan]    - Wi-Fi scan          
    - [load]    - Show Found Networks 
    - [select]  - Select Network      
    - [clear]   - Clear Found Networks
    - [m]       - Show menu again     

---

---

<style>
  footer {
    display: none;
  }
</style>