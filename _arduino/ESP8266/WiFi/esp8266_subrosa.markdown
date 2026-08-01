---
layout: page
title: ESP8266 - Subrosa
published: 2026-09-27
description: "Web Console - HTTP"
permalink: /arduino/esp8266/subrosa
category: esp8266
subcategory: wifi
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

<h1>Subrosa3 Web Console</h1>

<p>
Subrosa3 is an ESP8266-based development platform that combines a password-protected web console, OLED status display, and nRF24L01 support into a portable hardware toolkit. The project allows commands to be executed from a web browser, providing a convenient interface for testing peripherals and displaying live system information without requiring the Arduino Serial Monitor.
</p>

<h1>Features</h1>

<ul>
    <li>Browser-based command console with HTTP Basic Authentication.</li>
    <li>128×64 SSD1306 OLED status display.</li>
    <li>nRF24L01 diagnostic support.</li>
    <li>Built-in LED testing and debugging.</li>
    <li>Serial logging for development and troubleshooting.</li>
    <li>Modular command system for easily adding new functionality.</li>
</ul>

<h1>Available Commands</h1>

<ul>
    <li><code class="language-bash">sd</code> — Generates a test log message.</li>
    <li><code class="language-bash">led</code> — Toggles the ESP8266's built-in LED.</li>
    <li><code class="language-bash">nrf</code> — Displays nRF24L01 radio diagnostic information.</li>
</ul>

<h1>Reusable Components</h1>

<p>
Several parts of this project can be reused independently in other ESP8266 projects, including the embedded web console, command dispatcher, OLED status interface, HTTP authentication, and nRF24L01 initialization code. The modular design makes it straightforward to extend with additional hardware modules or custom commands.
</p>

<h1>Future Improvements</h1>

<p>
Future revisions could replace the command parser with a lookup table, move Wi-Fi credentials into persistent storage, support asynchronous web requests, integrate LittleFS for configuration files, and add real-time WebSocket logging for a more responsive browser interface.
</p>

```bash
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

#include <SPI.h>
#include <RF24.h>
#include <nRF24L01.h>

#include "esp_wifi.h"

// OLED setup
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_SDA 14 // D6
#define OLED_SCL 12 // D5
#define SCREEN_ADDRESS 0x3C

#define CE_PIN  5  // D2
#define CSN_PIN 4  // D1

ESP8266WebServer server(80);

Adafruit_SSD1306* display;

RF24 radio(CE_PIN, CSN_PIN);

const char* www_username = "subrosa";
const char* www_password = "subrosa_secure";

bool bluetoothJammingActive = false;

// Serve static HTML
const char htmlPage[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <title>Subrosa3</title>
  <style>
    body {
      font-family: "Courier New", monospace;
      background: #0a0a0a;
      color: #00ff88;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    h2 {
      margin: 0;
      padding: 15px;
      background: #111;
      border-bottom: 1px solid #0f0;
      text-align: center;
      font-size: 20px;
      letter-spacing: 1px;
    }

    #log {
      flex: 1;
      padding: 15px;
      background: #000;
      overflow-y: auto;
      white-space: pre-wrap;
      font-size: 14px;
      line-height: 1.4;
      border-top: 1px solid #0f0;
    }

    #cmdbar {
      display: flex;
      background: #111;
      padding: 10px;
      border-top: 1px solid #0f0;
    }

    input#cmd {
      flex: 1;
      padding: 8px 10px;
      font-size: 14px;
      background: #111;
      color: #0f0;
      border: 1px solid #0f0;
      outline: none;
      margin-right: 10px;
    }

    button {
      background: #111;
      color: #0f0;
      border: 1px solid #0f0;
      padding: 8px 15px;
      cursor: pointer;
      transition: background 0.2s;
    }

    button:hover {
      background: #0f0;
      color: #111;
    }

    ::selection {
      background: #00ff88;
      color: #000;
    }
  </style>
  <script>
    function sendCommand() {
      let cmdInput = document.getElementById("cmd");
      let cmd = cmdInput.value.trim();
      if (!cmd) return;

      fetch("/run?cmd=" + encodeURIComponent(cmd))
        .then(r => r.text())
        .then(t => {
          const log = document.getElementById("log");
          log.innerText += "\n> " + cmd + "\n" + t;
          log.scrollTop = log.scrollHeight;
        });

      cmdInput.value = "";
      cmdInput.focus();
    }

    window.onload = () => {
      document.getElementById("cmd").addEventListener("keydown", function(e) {
        if (e.key === "Enter") sendCommand();
      });
    };
  </script>
</head>
<body>
  <h2>Subrosa3 Terminal</h2>
  <pre id="log">Connected to Subrosa3 ESP8266...</pre>
  <div id="cmdbar">
    <input id="cmd" type="text" placeholder="Type a command like sd, led, or nrf...">
    <button onclick="sendCommand()">Send</button>
  </div>
</body>
</html>
)rawliteral";

void handleRoot() {
  if (!server.authenticate(www_username, www_password)) {
    return server.requestAuthentication(); // prompts browser login
  }
  server.send_P(200, "text/html", htmlPage);
}

void jamBluetooth() {
    Serial.println("Bluetooth jamming: Starting frequency hopping...");
    for (int i = 0; i < 79; ++i) {
        esp_bt_gap_set_scan_mode(ESP_BT_NON_CONNECTABLE, ESP_BT_NON_DISCOVERABLE);
        Serial.print("Bluetooth jamming: Switched to channel ");
        Serial.println(i);
        delay(random(5, 50));
    }
    Serial.println("Bluetooth jamming: Completed one round of frequency hopping.");
}

void toggleBluetoothJamming(bool activate) {
    if (activate) {
        bluetoothJammingActive = true;
        esp_bt_controller_enable(ESP_BT_MODE_CLASSIC_BT);
        Serial.println("Bluetooth jamming: Activated.");
    } else {
        bluetoothJammingActive = false;
        esp_bt_controller_disable();
        Serial.println("Bluetooth jamming: Deactivated.");
    }
}

void handleCommand() {
  if (!server.authenticate(www_username, www_password)) {
    return server.requestAuthentication();
  }

  Serial.println("[Web] Received request");
  if (server.args() > 0) {
    String cmd = server.arg("cmd");
    String response = "Executed: " + cmd;

    if (cmd == "sd") {
      Serial.println("SD_LOG: Test log from Web Console");
      response += "\n[SD] Logged.";
    } else if (cmd == "led") {
      digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
      response += "\n[LED] Toggled.";
    } else if (cmd == "nrf") {
      radio.printDetails();
      Serial.println("[NRF] OK!");
      response += "\n[NRF] OK!";
    } else if (cmd == "bluetooth jam") {
      Serial.println("[BLUETOOTH JAMMING] OK!");
    } else {
      response += "\n[!] Unknown command.";
    }

    // === OLED update ===
    display->clearDisplay();
    display->setCursor(0, 0);
    display->setTextSize(1);
    display->println("CMD: " + cmd);
    if (cmd == "sd") {
      display->println("[SD] Logged.");
    } else if (cmd == "led") {
      display->println("[LED] Toggled.");
    } else if (cmd == "nrf") {
      display->println("[NRF] Status: OK!");
    } else {
      display->println("[!] Unknown.");
    }
    display->display();
    // ===================

    server.send(200, "text/plain", response);
  } else {
    server.send(400, "text/plain", "Missing 'cmd' argument");
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.hostname("SubrosaESP");
  WiFi.begin("TL;DR", "Miscreant1991");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
  Serial.println("Hostname set to: SubrosaESP");
  
  pinMode(LED_BUILTIN, OUTPUT);
  if (!radio.begin()) {
    Serial.println("NRF24L01 not detected!");
  } else {
    Serial.println("NRF24L01 OK!");
  }
  // OLED boot screen
  Wire.begin(OLED_SDA, OLED_SCL);
  display = new Adafruit_SSD1306(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
  if (!display->begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("OLED init failed");
    while (true);
  } else {
    display->clearDisplay();
    display->setTextSize(1);
    display->setTextColor(SSD1306_WHITE);
    display->setCursor(0, 0);
    display->println("Subrosa3 Console");
    display->println("================");
    display->print("SSID: ");
    display->println(WiFi.SSID());
    display->print("IP: ");
    display->println(WiFi.localIP());
    display->display();
    delay(2000);  // Let it sit for a sec before command loop
  }

  server.on("/", handleRoot);
  server.on("/run", handleCommand);
  server.begin();

  Serial.println("Web Console Ready.");
}

void loop() {
  server.handleClient();
}
```

---

<style>
  footer {
    display: none;
  }
</style>