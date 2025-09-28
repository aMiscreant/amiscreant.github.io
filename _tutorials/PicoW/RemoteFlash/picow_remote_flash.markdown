---
layout: page
title: PicoW Remote Firmware Upgrade (OTA)
published: 2025-07-08
date: 2025-5-29
description: "This project demonstrates how to remotely upgrade the firmware of a Raspberry Pi Pico W."
permalink: /tutorials/PicoW/remote_flash
category: picow
subcategory: remoteflash
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

# Pico W Remote UF2 Flashing (OTA) – By aMiscreant

#### This project demonstrates how to remotely upgrade the firmware of a Raspberry Pi Pico W by downloading a `.uf2` file from a server and flashing it directly into flash memory. Unlike standard MicroPython OTA examples, this approach writes the raw `UF2 payload` to flash, effectively performing a true firmware upgrade over Wi-Fi.

**WARNING:** 
    
    This method is dangerous. Writing directly to flash can permanently brick your Pico W if done incorrectly. Only use on test devices and understand the risks.

---

### Overview
#### Server:

    The server hosts the UF2 firmware files via Flask:

```python
@app.route("/firmware/<path:filename>", methods=["GET"])
@require_key
def firmware_files(filename):
    """
    Serve UF2 files from the firmware directory.
    Example: /firmware/nuke.uf2
    """
    return send_from_directory(UPLOAD_DIR, filename, as_attachment=True)
```

    Files are served over HTTP with an API key.
    Any Pico W on the network can fetch the UF2 if it has the correct key.

---

## Pico W

    The Pico W script handles:
    Connecting to Wi-Fi.
    Fetching the UF2 file from the server.
    Extracting payload blocks from the UF2.
    Overwriting flash memory.
    Rebooting into the new firmware.

---

**Important Flash Parameters:**

```python
FLASH_BASE = 0x10000000  # RP2040 flash base
FLASH_SIZE = 2 * 1024 * 1024  # 2MB example
UF2_PAYLOAD_OFFSET = 0x200  # skip UF2 header to raw flash data
```

---

**Firmware Upgrade Function:**
```python
def fetch_nuke_brick_mode():
    url = f"http://{SERVER_IP}:{SERVER_PORT}/firmware/nuke.uf2"
    local_path = "/nuke.uf2"

    # Download UF2
    response = urequests.get(url, headers={"X-API-KEY": API_KEY}, stream=True)
    # ... handle download

    # Read UF2 and extract payload
    uf2_data = open(local_path, "rb").read()
    payloads = [uf2_data[i + UF2_PAYLOAD_OFFSET:i + 512] for i in range(0, len(uf2_data), 512)]

    # Direct flash write (dangerous!)
    for idx, payload in enumerate(payloads):
        addr = FLASH_BASE + idx * len(payload)
        for i in range(len(payload)):
            machine.mem32[addr + i] = payload[i]

    # Reboot into new firmware
    machine.reset()
```

---

**Key points:**

    Each UF2 block is 512 bytes; the first 32 bytes are header.
    We skip the header (UF2_PAYLOAD_OFFSET) and write the raw data.
    Uses machine.mem32 to write directly to flash — high risk of bricking.

---

**Requirements:**

    Wi-Fi connection to reach the server.
    API key to access the UF2 files.
    Tested only on Raspberry Pi Pico W running MicroPython.


| Method                              | Description                           | Risk     |
| ----------------------------------- | ------------------------------------- | -------- |
| Standard MicroPython OTA            | Fetch `.py` files or use Git/SSH      | Low      |
| Custom Bootloader (Jakub Zimnol)    | Switch firmware using a bootloader    | Medium   |
| **UF2 Direct Flash (this project)** | Fetch `.uf2`, write raw flash, reboot | **High** |

__Most existing guides update code, not firmware. This approach replaces the firmware itself.__

---

# **Warnings:**

###    [!]️ Direct flash writes are `irreversible` if done incorrectly.
###    [!]️ Always test on disposable Pico W devices first.
###    [!]️ This method assumes `2MB` flash layout; adjust for other models.

---

# **Working Example:**

#### [PicoW](https://github.com/aMiscreant/Subrosa-Pico)
#### [Server](https://github.com/aMiscreant/Subrosa-Ducky)

---


<style>
  footer {
    display: none;
  }
</style>