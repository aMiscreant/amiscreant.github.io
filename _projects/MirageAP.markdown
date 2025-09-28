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

# MirageAP

**MirageAP** is an Evil Twin Wi-Fi pentesting tool designed for the ESP8266 platform. It performs targeted deauthentication attacks on a selected Wi-Fi network and simultaneously creates a fake access point (AP) that mimics the target's SSID. The fake AP serves a convincing router firmware update captive portal to capture credentials or perform social engineering.

---

## Features

- **Targeted Deauthentication**  
  Continuously deauthenticates clients from the selected target network to force them to disconnect.

- **Fake Access Point (Evil Twin)**  
  Creates an open Wi-Fi access point with the same SSID as the target network to lure clients.

- **Captive Portal Web Interface**  
  Serves a realistic router firmware update page to capture user credentials.

- **Serial Command Line Interface (CLI)**  
  Built-in menu accessible via serial monitor for scanning networks, selecting targets, and managing stored data.

- **Persistent Scan Results**  
  Stores Wi-Fi scan results in LittleFS filesystem for later retrieval and selection.

- **DNS Spoofing for Captive Portal**  
  Redirects all DNS queries to the ESP8266 to ensure captive portal activation on connected clients.

---

## Usage

1. **Connect the ESP8266 and open the serial monitor at 115200 baud.**

2. **Use the following commands:**

   - `scan`  
     Scan for nearby Wi-Fi networks and store the results.

   - `load`  
     Load and display previously stored scan results.

   - `select <SSID>`  
     Select a target network by SSID to start the deauthentication attack and launch the fake AP.

   - `clear`  
     Clear stored scan results from memory and filesystem.

   - `m`  
     Display the menu and available commands.

3. **Connect your client device to the fake AP with the target SSID.**

4. **The captive portal will appear automatically, prompting for credentials.**

---

## Requirements

- ESP8266 development board (e.g., NodeMCU, Wemos D1 Mini)
- Arduino IDE with ESP8266 core installed
- LittleFS filesystem support enabled
- Basic knowledge of serial communication and Wi-Fi pentesting concepts

---

## Project Structure

- `MirageAP.ino`  
  Main sketch handling Wi-Fi scanning, deauthentication, fake AP setup, and serial CLI.

- `MirageAP_WebServer.cpp/h`  
  Web server implementation serving the captive portal pages.

- `MirageAP_DNS.cpp/h`  
  DNS server implementation for captive portal DNS spoofing.

- `MirageAP_Utils.cpp/h`  
  Utility functions such as URL decoding and byte array formatting.

- `MirageAP_OLED.cpp/h` *(optional)*  
  OLED display support for status and menu (if implemented).

- `data/`  
  LittleFS filesystem data including stored scan results and logs.

---

## Disclaimer

This tool is intended for authorized security testing and educational purposes only. Unauthorized use against networks or devices without permission is illegal and unethical. Use responsibly.

---

## License

[MIT License]

---

## Acknowledgments

Inspired by common Evil Twin and captive portal techniques used in Wi-Fi security assessments.

---

## Contact

For questions or contributions, please open an issue or pull request on the project repository.

---

                     MirageAP

                  by: aMiscreant

    Type 'scan' to scan WiFi networks.
    Type `load` to load found WiFi networks.
    Type 'select <SSID>' to select network for deauth and start fake AP.
    Type 'clear' to clear stored scan results.

    [scan]    - Wi-Fi scan          
    [load]    - Show Found Networks 
    [select]  - Select Network      
    [clear]   - Clear Found Networks
    [m]       - Show menu again     

---

<style>
  footer {
    display: none;
  }
</style>