---
layout: page
title: ESP32-C3 - Custom Partition
published: 2025-09-27
description: "Setting up a custom partition scheme for esp32c3 (SPIFFS)"
permalink: /arduino/wifi/esp32c3_partition
category: esp32c3
subcategory: Partition
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

<div class="post-meta">
  <p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
  <p>{{ page.description }}</p>
</div>

---

<h1>Custom Partition Scheme for ESP32c3</h1>

---

<h1>64KB SPIFFS</h1>

<p>navigate to:</p>

- ~/.arduino15/packages/esp32/hardware/esp32/2.0.9/tools/partitions

- _create file_: 

`spiffs64.csv`


    # Name,   Type, SubType, Offset,  Size, Flags
    nvs,      data, nvs,     0x9000,  0x5000,
    otadata,  data, ota,     0xe000,  0x2000,
    app0,     app,  factory, 0x10000, 0x180000,
    spiffs,   data, spiffs,  0x190000,0x10000,
    coredump, data, coredump,0x3F0000,0x10000,


<p>navigate to:</p>

- ~/.arduino15/packages/esp32/hardware/esp32/2.0.9

- edit: boards.txt

<p>Add the following contents (Roughly Line: 345)</p>

    esp32c3.menu.PartitionScheme.spiffs64=Minimal 64KB SPIFFS (1.5MB App / 64KB SPIFFS)
    esp32c3.menu.PartitionScheme.spiffs64.build.partitions=spiffs64
    esp32c3.menu.PartitionScheme.spiffs64.upload.maximum_size=1572864


----

<h1>128KB SPIFFS</h1>

<p>navigate to:</p>

- ~/.arduino15/packages/esp32/hardware/esp32/2.0.9/tools/partitions


- _create file_: 

`spiffs128.csv`


    # Name,   Type, SubType, Offset,  Size, Flags
    nvs,      data, nvs,     0x9000,  0x5000,
    otadata,  data, ota,     0xe000,  0x2000,
    app0,     app,  factory, 0x10000, 0x180000,
    spiffs,   data, spiffs,  0x190000,0x20000,
    coredump, data, coredump,0x3F0000,0x10000,


<p>navigate to:</p>

- ~/.arduino15/packages/esp32/hardware/esp32/2.0.9

- edit: boards.txt

<p>Add the following contents (Roughly Line: 345)</p>

    esp32c3.menu.PartitionScheme.spiffs128=Minimal 128KB SPIFFS (1.5MB App / 128KB SPIFFS)
    esp32c3.menu.PartitionScheme.spiffs128.build.partitions=spiffs128
    esp32c3.menu.PartitionScheme.spiffs128.upload.maximum_size=1572864


---

<p>Reload arduino and navigate to partition scheme's and your custom partitions will now be available.</p>

---

<style>
  footer {
    display: none;
  }
</style>