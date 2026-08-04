---
layout: page
title: ESP32 - Networking
published: 2026-09-27
description: "WebSocket - Spiffs"
permalink: /arduino/esp8266/websocket_toolkit
category: esp32
subcategory: websockets
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

<h1>ESP32 Remote WebSocket Client</h1>

<p>
This project implements a lightweight ESP32 WebSocket client for remote device management and diagnostics. It connects to a central server, responds to system commands, performs Wi-Fi network discovery, and stores discovered networks in SPIFFS for later retrieval. The project served as the foundation for later encrypted communication and expanded remote management features.
</p>

<h1>Features</h1>

<ul>
    <li>Persistent WebSocket connection with automatic reconnection.</li>
    <li>Remote device diagnostics and status reporting.</li>
    <li>Wi-Fi network scanning with signal strength reporting.</li>
    <li>SPIFFS storage for discovered Wi-Fi networks.</li>
    <li>Duplicate filtering when saving scan results.</li>
    <li>JSON-based storage using ArduinoJson.</li>
</ul>

<h1>Supported Commands</h1>

<ul>
    <li><code class="language-bash">PING</code> — Verifies communication with the device.</li>
    <li><code class="language-bash">UPTIME</code> — Returns the current system uptime.</li>
    <li><code class="language-bash">FREE_MEM</code> — Displays available heap memory.</li>
    <li><code class="language-bash">SCAN_WIFI</code> — Scans nearby wireless networks and stores newly discovered entries.</li>
    <li><code class="language-bash">LOAD_WIFI</code> — Returns all previously saved Wi-Fi scan results.</li>
</ul>

<h1>Reusable Components</h1>

<p>
The project includes several reusable modules, including a WebSocket client, automatic reconnect logic, Wi-Fi scanning routines, SPIFFS file storage, JSON serialization, duplicate filtering for persistent data, and a simple command dispatcher that can easily be adapted to other ESP32 projects.
</p>

<h1>Future Improvements</h1>

<p>
Future development could include encrypted communications, authenticated command handling, asynchronous networking, configuration stored outside the firmware, modular command registration, and support for additional remote management features such as file transfers and over-the-air firmware updates.
</p>

```bash
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <FS.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>  // Include Arduino JSON library for easier manipulation

const char* deviceHostName = "DirectSec_ESP32_ToolKit";  // 🔹 Set a static hostname here
const char* ssid = "TL;DR";  // 🔹 Replace with your Wi-Fi SSID
const char* password = "*******";       // 🔹 Replace with your Wi-Fi password
const char* serverAddress = "192.168.66.107";   // 🔹 Your PC's IP  
const int serverPort = 8000;
const char* deviceID = "ESP32_1";  

WebSocketsClient webSocket;

void saveWiFiData(String wifiData) {
    // 🔹 Load existing Wi-Fi data
    String existingData = loadWiFiData();
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, existingData);

    JsonArray networks = doc.as<JsonArray>();

    // 🔹 Parse the new Wi-Fi data to check for duplicates
    DynamicJsonDocument newDoc(1024);
    deserializeJson(newDoc, wifiData);
    JsonArray newNetworks = newDoc.as<JsonArray>();

    for (JsonObject network : newNetworks) {
        String ssid = network["SSID"].as<String>();
        String signal = network["Signal"].as<String>();

        // 🔹 Check if the SSID already exists in saved data
        bool exists = false;
        for (JsonObject savedNetwork : networks) {
            if (savedNetwork["SSID"].as<String>() == ssid) {
                exists = true;
                break;
            }
        }

        // 🔹 Only add if it doesn't already exist
        if (!exists) {
            networks.add(network);
        }
    }

    // 🔹 Save the updated list
    File file = SPIFFS.open("/wifi_data.json", "w");
    if (file) {
        serializeJson(doc, file);
        file.close();
        Serial.println("[+] Wi-Fi data saved!");
    }
}

String loadWiFiData() {
    File file = SPIFFS.open("/wifi_data.json", "r");
    if (!file) {
        return "[]";  // 🔹 Return empty array if no data found
    }
    String data = file.readString();
    file.close();
    return data;
}

void scanWiFi() {
    Serial.println("[*] Scanning Wi-Fi...");
    int networksFound = WiFi.scanNetworks();
    DynamicJsonDocument wifiDoc(1024);
    JsonArray wifiArray = wifiDoc.to<JsonArray>();

    for (int i = 0; i < networksFound; i++) {
        JsonObject network = wifiArray.createNestedObject();
        network["SSID"] = WiFi.SSID(i);
        network["Signal"] = String(WiFi.RSSI(i));

        // Format the output (For debugging, you can check the structure of wifiDoc)
        Serial.println("  " + String(i + 1) + ". " + WiFi.SSID(i) + " (Signal: " + String(WiFi.RSSI(i)) + " dBm)");
    }

    // Save the scanned Wi-Fi networks
    saveWiFiData(wifiDoc.as<String>());

    // Send the formatted result over WebSocket
    String wifiData = "Wi-Fi Networks Found:\n";
    for (int i = 0; i < wifiArray.size(); i++) {
        JsonObject network = wifiArray[i];
        wifiData += "  " + String(i + 1) + ". " + network["SSID"].as<String>() + " (Signal: " + network["Signal"].as<String>() + ")\n";
    }
    webSocket.sendTXT(wifiData);
}

void loadWiFiDataFormatted() {
    String savedData = loadWiFiData();
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, savedData);

    JsonArray networks = doc.as<JsonArray>();
    String formattedData = "Wi-Fi Networks Found:\n";

    for (int i = 0; i < networks.size(); i++) {
        JsonObject network = networks[i];
        String ssid = network["SSID"].as<String>();
        String signal = network["Signal"].as<String>();

        // Add the network to the formatted string with numbering and signal strength
        formattedData += "  " + String(i + 1) + ". " + ssid + " (Signal: " + signal + ")\n";
    }

    // Send the formatted result over WebSocket
    webSocket.sendTXT(formattedData);
}

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length) {
    switch (type) {
        case WStype_TEXT: {
            String command = String((char*)payload);
            Serial.println("Received: " + command);

            if (command == "PING") {
                webSocket.sendTXT("PONG");
            }
            else if (command == "UPTIME") {
                webSocket.sendTXT("Uptime: " + String(millis() / 1000) + " seconds");
            }
            else if (command == "FREE_MEM") {
                webSocket.sendTXT("Free Heap: " + String(ESP.getFreeHeap()) + " bytes");
            }
            else if (command == "SCAN_WIFI") {
                scanWiFi();
            }
            else if (command == "LOAD_WIFI") {
                loadWiFiDataFormatted();  // Call the formatted load function
            }
            else {
                webSocket.sendTXT("[ERROR] Unknown Command: " + command);
            }
            break;
        }

        case WStype_CONNECTED:
            Serial.println("[+] WebSocket Connected!");
            break;

        case WStype_DISCONNECTED:
            Serial.println("[-] WebSocket Disconnected. Reconnecting...");
            break;
    }
}

void connectWiFi() {
    Serial.print("[*] Connecting to WiFi...");
    WiFi.begin(ssid, password);
    
    int attempt = 0;
    while (WiFi.status() != WL_CONNECTED && attempt < 20) {
        delay(500);
        Serial.print(".");
        attempt++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n[+] WiFi Connected! IP: " + WiFi.localIP().toString());
    } else {
        Serial.println("\n[-] WiFi connection failed. Restarting...");
        ESP.restart();
    }
}

void connectWebSocket() {
    Serial.println("[*] Connecting to WebSocket...");
    webSocket.begin(serverAddress, serverPort, (String("/ws/") + deviceID).c_str());
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
}

void setup() {
    Serial.begin(115200);
    SPIFFS.begin(true);
    connectWiFi();
    connectWebSocket();
}

void loop() {
    webSocket.loop();
    delay(10);
}
```


---

<style>
  footer {
    display: none;
  }
</style>