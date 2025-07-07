---
layout: page
title: 📂 ESP32-C3 - Bluetooth
published: 2025-07-08
date: 2025-5-29
timezone: America/Toronto
description: 
permalink: /arduino/bluetooth/esp32c3
category: esp32c3
subcategory: Bluetooth
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

### Description

#### This project demonstrates how to build a basic serial CLI (Command Line Interface) menu on the ESP32-C3 using the Arduino IDE. Instead of endlessly looping code, this approach waits for user input over serial to trigger specific actions—in this case, scanning for nearby Wi-Fi networks.

---

Full Source Code:

```bash
#include "WiFi.h"

// Flag to indicate whether we should scan Wi-Fi
bool wifiScan = false;

void showMenu() {
  Serial.println(F(" _________________________"));
  Serial.println(F("|     ESP32-C3 Super     |"));
  Serial.println(F("|      Mini Board        |"));
  Serial.println(F("|------------------------|"));
  Serial.println(F("| [ ] EN           IO10  |"));  
  Serial.println(F("| [ ] 3V3          IO6   |"));
  Serial.println(F("| [ ] IO0          IO7   |"));
  Serial.println(F("| [ ] GND          IO5   |"));
  Serial.println(F("| [ ] IO1          IO4   |"));
  Serial.println(F("| [ ] IO2          IO3   |"));
  Serial.println(F("| [ ] IO8          GND   |"));
  Serial.println(F("| [ ] IO9          5V    |"));
  Serial.println(F("|------------------------|"));
  Serial.println(F("|__USB-C________RST BTN__|"));
  Serial.println(F("")); 
  Serial.println(F("  [s]  Wi-Fi scan      "));
  Serial.println(F("  [m]  Show menu again "));
}

void handleMenuInput(char input) {
  switch (input) {
    case 's':
      wifiScan = true;
      break;
    case 'm':
      showMenu();
      break;
    default:
      Serial.println(F("? Unknown command. Type 'm' to show menu options."));
      break;
  }
}

void scanWifi() {
  Serial.println("\nStarting Wi-Fi Scan...");

  int n = WiFi.scanNetworks();
  Serial.println("Scan complete.");

  if (n == 0) {
    Serial.println("No networks found.");
  } else {
    Serial.printf("%d networks found:\n", n);
    Serial.println("Nr | SSID                             | RSSI | CH | Encryption");

    for (int i = 0; i < n; ++i) {
      Serial.printf("%2d | %-32.32s | %4d | %2d | ",
                    i + 1,
                    WiFi.SSID(i).c_str(),
                    WiFi.RSSI(i),
                    WiFi.channel(i));

      switch (WiFi.encryptionType(i)) {
        case WIFI_AUTH_OPEN:           Serial.print("Open"); break;
        case WIFI_AUTH_WEP:            Serial.print("WEP"); break;
        case WIFI_AUTH_WPA_PSK:        Serial.print("WPA"); break;
        case WIFI_AUTH_WPA2_PSK:       Serial.print("WPA2"); break;
        case WIFI_AUTH_WPA_WPA2_PSK:   Serial.print("WPA+WPA2"); break;
        case WIFI_AUTH_WPA2_ENTERPRISE:Serial.print("WPA2-EAP"); break;
        case WIFI_AUTH_WPA3_PSK:       Serial.print("WPA3"); break;
        case WIFI_AUTH_WPA2_WPA3_PSK:  Serial.print("WPA2+WPA3"); break;
        case WIFI_AUTH_WAPI_PSK:       Serial.print("WAPI"); break;
        default:                       Serial.print("Unknown"); break;
      }

      Serial.println();
      delay(10);
    }
  }

  WiFi.scanDelete(); // free memory from scan result

  wifiScan = false; // reset flag
}

void setup() {
  Serial.begin(115200);

  // Set Wi-Fi to station mode and disconnect from any previous connection
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);

  Serial.println("WiFi Scanner Ready.");
  showMenu();
}

void loop() {
  if (Serial.available()) {
    char input = Serial.read();

    // Ignore newlines/carriage returns
    if (input != '\n' && input != '\r') {
      handleMenuInput(input);
    }

    // Clear the rest of the buffer
    while (Serial.available()) {
      Serial.read();
    }
  }

  if (wifiScan) {
    scanWifi();
  }
}

```

---

### Example Output:

```bash
Starting Wi-Fi Scan...
Scan complete.
12 networks found:
Nr | SSID                             | RSSI | CH | Encryption
 1 | TL;DR                            |  -37 | 11 | WPA2+WPA3
 2 | North Korea's Wi-Fi              |  -45 | 11 | WPA2

```

### The code provides:

>`✅ A serial menu printed at startup`
> 
>`✅ User commands:`
>
>`[s] → Start Wi-Fi scan`
>
>`[m] → Show menu again`

---

>`✅ A nicely formatted Wi-Fi scan result with:`
>
>`SSID`
>
>`RSSI (signal strength)`
>
>`Channel`
>
>`Encryption type`

### This is a great template for adding more CLI commands for future ESP32-C3 projects.

---

```bash
 _________________________
|     ESP32-C3 Super     |
|      Mini Board        |
|------------------------|
| [ ] EN           IO10  |
| [ ] 3V3          IO6   |
| [ ] IO0          IO7   |
| [ ] GND          IO5   |
| [ ] IO1          IO4   |
| [ ] IO2          IO3   |
| [ ] IO8          GND   |
| [ ] IO9          5V    |
|------------------------|
|__USB-C________RST BTN__|

  [s]  Wi-Fi scan
  [m]  Show menu again
```

>`Press s → Performs a Wi-Fi scan.`
> 
>`Press m → Displays the menu again.`

---

>`Benefits of CLI Over Endless Loops`
> 
>`Instead of having the sketch run a single task in loop() forever, a CLI lets you:`
> 
>`Interactively choose features to test or run`
> 
>`Avoid cluttering serial output with constant scanning or logging`
> 
>`Build modular code, where each feature is wrapped into its own function`
> 
>`Ideas to Extend This Sketch`
> 
>`Add Bluetooth scanning`
> 
>`Control GPIO pins via commands`
> 
>`Display system information (chip ID, heap size, etc.)`
> 
>`Change the board’s name via serial command`
> 
>`Save settings to NVS or EEPROM`