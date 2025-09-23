---
layout: page
title: ESP8266 - Wi-Fi Scanner (Web Server)
published: 2025-07-02
description: "Wi-Fi Scanner (Web Server) using Flask."
permalink: /arduino/wifi/esp32wroom_webserver
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

<div class="post-meta">
  <p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
  <p>{{ page.description }}</p>
</div>

---

```g
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <FS.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>  // Include Arduino JSON library for easier manipulation

const char* deviceHostName = "DirectSec_ESP32_ToolKit";  // Set a static hostname here
const char* ssid = "";  // Replace with your Wi-Fi SSID
const char* password = "";       // Replace with your Wi-Fi password
const char* serverAddress = "";   // Your PC's IP  
const int serverPort = 8000;
const char* deviceID = "ESP32_1";  

WebSocketsClient webSocket;

void saveWiFiData(String wifiData) {
    // Load existing Wi-Fi data
    String existingData = loadWiFiData();
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, existingData);

    JsonArray networks = doc.as<JsonArray>();

    // Parse the new Wi-Fi data to check for duplicates
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

        // Only add if it doesn't already exist
        if (!exists) {
            networks.add(network);
        }
    }

    // Save the updated list
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
        return "[]";  // Return empty array if no data found
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