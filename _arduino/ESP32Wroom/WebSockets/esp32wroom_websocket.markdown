---
layout: page
title: ESP32-Wroom-32D - WebSocket Server
published: 2026-09-27
description: "WebSocket - CNC - Scanner"
permalink: /arduino/esp8266/encrypt_decrypt
category: esp32wroom
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


<h1>Encrypted ESP32 WebSocket Client</h1>

- IJustWantYou

<p>
This project implements a secure ESP32 client that communicates with a central server using encrypted WebSocket messages. Commands and responses are protected with AES-256 CTR encryption, while JSON and Base64 are used to package encrypted payloads. The client also maintains a local SPIFFS filesystem for storing discovered Wi-Fi networks and other project data.
</p>

<h1>Features</h1>

<ul>
    <li>AES-256 CTR encrypted WebSocket communication.</li>
    <li>Automatic Wi-Fi and WebSocket reconnection.</li>
    <li>JSON-based command protocol.</li>
    <li>SPIFFS storage for persistent device data.</li>
    <li>Remote system diagnostics including uptime and free memory.</li>
    <li>Wi-Fi network discovery with duplicate filtering.</li>
    <li>File transfer support for data stored in SPIFFS.</li>
</ul>

<h1>Supported Commands</h1>

<ul>
    <li><code class="language-bash">PING</code> — Tests connectivity with the server.</li>
    <li><code class="language-bash">UPTIME</code> — Returns the device uptime.</li>
    <li><code class="language-bash">FREE_MEM</code> — Reports available heap memory.</li>
    <li><code class="language-bash">SCAN_WIFI</code> — Scans for nearby wireless networks and stores new results.</li>
    <li><code class="language-bash">LOAD_WIFI</code> — Returns saved Wi-Fi scan results.</li>
    <li><code class="language-bash">SAVE_WIFI</code> — Saves discovered networks to SPIFFS.</li>
    <li><code class="language-bash">CLEAR_WIFI</code> — Deletes saved Wi-Fi data.</li>
    <li><code class="language-bash">GET_CAP_FILE</code> — Transfers a capture file stored in SPIFFS.</li>
</ul>

<h1>Reusable Components</h1>

<p>
Several modules can be reused independently in other ESP32 projects, including the encrypted WebSocket client, AES-256 encryption routines, Base64 encoding helpers, JSON command parser, SPIFFS file management utilities, Wi-Fi scanning and storage system, and automatic reconnect logic.
</p>

<h1>Future Improvements</h1>

<p>
Future revisions could replace the pre-shared encryption key with a secure key exchange, support chunked file transfers for larger files, improve message authentication, migrate to asynchronous networking, and separate the command dispatcher into a modular plugin system for easier expansion.
</p>

---

```bash
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <Crypto.h>
#include <AES.h>
#include <CTR.h>
#include <ArduinoJson.h>
#include <Base64.h>  // note capital B
#include <vector>
#include <utility>
#include "SPIFFS.h"
#include "FS.h"

#define FORMAT_SPIFFS_IF_FAILED true

// ... your WiFi and AES key setup ...
const char* ssid = "TL;DR";
const char* password = "*********";
const char* serverAddress = "192.168.67.107";
const int serverPort = 8000;
const char* deviceID = "ESP32_1";

WebSocketsClient webSocket;

// AES-256 key (must match FastAPI server)
const byte aesKey[32] = {
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
  0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
  0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
  0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F
};

// Generate 16-byte nonce
void generateNonce(byte* nonce, size_t len = 16) {
  for (size_t i = 0; i < len; ++i) {
    nonce[i] = random(0, 256);
  }
}

String base64Encode(const byte* input, size_t length) {
  int encodedLen = Base64.encodedLength(length);
  char encoded[encodedLen + 1];

  // Create a temporary char array for input (copy bytes)
  char inputCopy[length];
  memcpy(inputCopy, input, length);

  Base64.encode(encoded, inputCopy, length);
  encoded[encodedLen] = '\0';
  return String(encoded);
}


void base64Decode(byte* output, const char* input) {
  int inputLen = strlen(input);
  char inputCopy[inputLen + 1];
  memcpy(inputCopy, input, inputLen + 1);  // include null terminator
  Base64.decode((char*)output, inputCopy, inputLen);
}

// Encrypt plaintext using AES-256 CTR and return JSON string
String encryptMessage(const String& plaintext) {
  byte nonce[16];
  generateNonce(nonce);

  CTR<AES256> ctr;
  ctr.clear();
  ctr.setKey(aesKey, sizeof(aesKey));
  ctr.setIV(nonce, sizeof(nonce));

  size_t len = plaintext.length();
  byte plainBytes[len];
  memcpy(plainBytes, plaintext.c_str(), len);

  byte cipherBytes[len];
  ctr.encrypt(cipherBytes, plainBytes, len);

  // Use helper function for encoding
  String nonce_b64 = base64Encode(nonce, sizeof(nonce));
  String cipher_b64 = base64Encode(cipherBytes, len);

  DynamicJsonDocument doc(512);
  doc["nonce"] = nonce_b64;
  doc["ciphertext"] = cipher_b64;

  String json;
  serializeJson(doc, json);
  return json;
}

void saveWiFiData(String wifiData) {
    DynamicJsonDocument doc(1024);
    DeserializationError err = deserializeJson(doc, wifiData);
    if (err) {
        Serial.println("[ERROR] Failed to parse Wi-Fi JSON");
        return;
    }

    JsonArray newNetworks = doc.as<JsonArray>();
    String existingData = loadWiFiData();
    DynamicJsonDocument existingDoc(1024);
    err = deserializeJson(existingDoc, existingData);
    if (err) {
        Serial.println("[ERROR] Failed to parse existing data");
        existingDoc.createNestedArray();  // Create a fresh array if load fails
    }

    JsonArray existingNetworks = existingDoc.as<JsonArray>();

    for (JsonObject network : newNetworks) {
        String ssid = network["SSID"].as<String>();
        bool exists = false;
        for (JsonObject savedNetwork : existingNetworks) {
            if (savedNetwork["SSID"].as<String>() == ssid) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            existingNetworks.add(network);
        }
    }

    // Save at root
    File file = SPIFFS.open("/wifi_found.json", FILE_WRITE);
    if (!file) {
        Serial.println("[ERROR] Could not open file for writing");
        return;
    }
    serializeJson(existingDoc, file);  // Serialize existing data
    file.close();
    Serial.println("[+] Wi-Fi data saved!");
}

void saveCurrentWiFiData() {
    String existingData = loadWiFiData();
    
    if (existingData == "[]") {
        Serial.println("[i] No Wi-Fi data to save.");
        String response = encryptMessage("No Wi-Fi data to save.");
        webSocket.sendTXT(response);
        return;
    }

    saveWiFiData(existingData);
    String response = encryptMessage("Wi-Fi data saved.");
    webSocket.sendTXT(response);
}

String loadWiFiData() {
    File file = SPIFFS.open("/wifi_found.json", FILE_READ);
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
    String jsonStr;
    serializeJson(wifiDoc, jsonStr);
    saveWiFiData(jsonStr);
    delay(3000);
    
    // Prepare the Wi-Fi data message as a string (plaintext)
    String wifiData = "Wi-Fi Networks Found:\n";
    for (int i = 0; i < wifiArray.size(); i++) {
        JsonObject network = wifiArray[i];
        wifiData += "  " + String(i + 1) + ". " + network["SSID"].as<String>() + " (Signal: " + network["Signal"].as<String>() + ")\n";
    }

    // Encrypt the Wi-Fi data before sending it
    String encryptedWiFiData = encryptMessage(wifiData);

    // Send the encrypted Wi-Fi networks over WebSocket
    webSocket.sendTXT(encryptedWiFiData);
}

void loadWiFiDataFormatted() {
    // Load the saved Wi-Fi data (unencrypted)
    String savedData = loadWiFiData();

    // Parse the saved data into a JSON document
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

    // Encrypt the formatted Wi-Fi data before sending
    String encryptedWiFiData = encryptMessage(formattedData);

    // Send the encrypted Wi-Fi networks over WebSocket
    webSocket.sendTXT(encryptedWiFiData);
}

void clearWifiData() {
    String response;

    if (SPIFFS.exists("/wifi_found.json")) {
        SPIFFS.remove("/wifi_found.json");
        response = encryptMessage("Wi-Fi data cleared.");
        Serial.println("[+] Wi-Fi data file deleted.");
    } else {
        response = encryptMessage("No Wi-Fi data found to delete.");
        Serial.println("[i] Wi-Fi data file did not exist.");
    }

    webSocket.sendTXT(response);
}

void sendCapFile() {
    File file = SPIFFS.open("/handshake.cap", "r");
    if (!file) {
        String response = encryptMessage("No .cap file found.");
        Serial.println("No Cap file detected");
        webSocket.sendTXT(response);
        return;
    }

    size_t size = file.size();
    std::vector<uint8_t> buffer(size);
    file.read(buffer.data(), size);
    file.close();

    // Base64 encoding
    size_t encodedLen = Base64.encodedLength(size);
    char* base64Output = new char[encodedLen + 1]; // +1 for null terminator
    Base64.encode(base64Output, (char*)buffer.data(), size);
    base64Output[encodedLen] = '\0'; // Ensure it's null-terminated

    DynamicJsonDocument doc(2048);
    doc["type"] = "cap_file";
    doc["filename"] = "handshake.cap";
    doc["data"] = base64Output;

    String payload;
    serializeJson(doc, payload);
    delete[] base64Output;

    String encryptedCap = encryptMessage(payload);
    webSocket.sendTXT(encryptedCap);

}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case WStype_TEXT: {
            String command = String((char*)payload);
            Serial.println("Received: " + command);

            // If the message is encrypted
            if (command.startsWith("{")) {
                // Assuming the message is encrypted with JSON structure { "nonce": ..., "ciphertext": ... }
                StaticJsonDocument<512> doc;
                DeserializationError error = deserializeJson(doc, command);

                if (!error) {
                    String nonce_b64 = doc["nonce"];
                    String ciphertext_b64 = doc["ciphertext"];

                    byte nonce[16];
                    byte ciphertext[256];

                    // Decode Base64 data
                    base64Decode(nonce, nonce_b64.c_str());
                    base64Decode(ciphertext, ciphertext_b64.c_str());

                    // Decrypt the message using AES-256 CTR
                    CTR<AES256> ctr;
                    ctr.clear();
                    ctr.setKey(aesKey, sizeof(aesKey));
                    ctr.setIV(nonce, sizeof(nonce));

                    byte decrypted[256];
                    size_t cipherLen = strlen((char*)ciphertext);  // Use ciphertext length
                    ctr.decrypt(decrypted, ciphertext, cipherLen);  // Decrypt ciphertext

                    // Convert decrypted bytes to String, handling null-termination
                    String decryptedMessage = "";
                    for (size_t i = 0; i < cipherLen; i++) {
                        if (decrypted[i] == '\0') break;  // Stop at the first null byte
                        decryptedMessage += (char)decrypted[i];
                    }

                    Serial.println("Decrypted message: " + decryptedMessage);

                    // Handle the decrypted message commands
                    if (decryptedMessage == "PING") {
                        String pongMessage = encryptMessage("PONG");
                        webSocket.sendTXT(pongMessage);
                        Serial.println("[ESP32] Sent PONG");
                    } else if (decryptedMessage == "UPTIME") {
                        String uptime = "Uptime: " + String(millis() / 1000) + " seconds";
                        String encryptedUptime = encryptMessage(uptime);
                        webSocket.sendTXT(encryptedUptime);
                    } else if (decryptedMessage == "FREE_MEM") {
                        String freeMem = "Free Heap: " + String(ESP.getFreeHeap()) + " bytes";
                        String encryptedFreeMem = encryptMessage(freeMem);
                        Serial.println(encryptedFreeMem);
                        webSocket.sendTXT(encryptedFreeMem);
                    } else if (decryptedMessage == "SCAN_WIFI") {
                        scanWiFi();  // Call the Wi-Fi scan function
                    } else if (decryptedMessage == "LOAD_WIFI") {
                        loadWiFiDataFormatted();  // Call the formatted load function
                    } else if (decryptedMessage == "SAVE_WIFI") {
                        saveCurrentWiFiData();  // Save WiFi data
                    } else if (decryptedMessage == "GET_CAP_FILE") {
                        sendCapFile();
                    } else if (decryptedMessage == "CLEAR_WIFI") {
                        clearWifiData();  // Clear spiffs
                        String clearWifi = encryptMessage("Spiffs WiFi wiped");
                        Serial.println(clearWifi);
                        webSocket.sendTXT(clearWifi);
                    } else {
                        String errorMsg = "[ERROR] Unknown Command: " + decryptedMessage;
                        String encryptedErrorMsg = encryptMessage(errorMsg);
                        webSocket.sendTXT(encryptedErrorMsg);
                    }
                } else {
                    Serial.println("[ERROR] Failed to deserialize JSON message");
                }
            } else {
                // Handle the case where message is not encrypted (plain text)
                if (command == "PING") {
                    webSocket.sendTXT("PONG");
                } else if (command == "UPTIME") {
                    webSocket.sendTXT("Uptime: " + String(millis() / 1000) + " seconds");
                } else if (command == "FREE_MEM") {
                    webSocket.sendTXT("Free Heap: " + String(ESP.getFreeHeap()) + " bytes");
                } else if (command == "SCAN_WIFI") {
                    scanWiFi();
                } else if (command == "LOAD_WIFI") {
                    loadWiFiDataFormatted();  // Call the formatted load function
                } else {
                    webSocket.sendTXT("[ERROR] Unknown Command: " + command);
                }
            }
            break;
        }

        case WStype_CONNECTED: {
            Serial.println("[+] WebSocket connected.");
            String payload = encryptMessage("PING");
            webSocket.sendTXT(payload);
            Serial.println(payload);
            break;
        }

        case WStype_DISCONNECTED:
            Serial.println("[-] WebSocket disconnected.");
            break;
    }
}

void connectWiFi() {
  Serial.print("[*] Connecting to WiFi...");
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println(WiFi.localIP());
}

void connectWebSocket() {
  String wsPath = String("/ws/") + deviceID;
  webSocket.begin(serverAddress, serverPort, wsPath.c_str());
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void listDir(fs::FS &fs, const char * dirname, uint8_t levels) {
  Serial.printf("Listing directory: %s\n", dirname);
  File root = fs.open(dirname);
  if (!root || !root.isDirectory()) {
    Serial.println("− failed to open directory");
    return;
  }

  File file = root.openNextFile();
  while (file) {
    if (file.isDirectory()) {
      Serial.print("DIR : ");
      Serial.println(file.name());
      if (levels) {
        listDir(fs, file.name(), levels - 1);
      }
    } else {
      Serial.print("FILE: ");
      Serial.print(file.name());
      Serial.print("  SIZE: ");
      Serial.println(file.size());
    }
    file = root.openNextFile();
  }
}

void writeFile(fs::FS &fs, const char *path, const char *message) {
  Serial.printf("Writing file: %s\n", path);
  File file = fs.open(path, FILE_WRITE);
  if (!file) {
    Serial.println("Failed to open file for writing");
    return;
  }
  if (file.print(message)) {
    Serial.println("File written successfully!");
  } else {
    Serial.println("Write failed");
  }
  file.close();
}

void listFile(fs::FS &fs, const char* path) {
  File file = fs.open(path);
  if (!file) {
    Serial.println("File not found!");
  } else {
    Serial.println("File found!");
  }
}

void setup() {
  Serial.begin(9600);
  delay(1000);  // Optional: give serial monitor time
  connectWiFi();
  connectWebSocket();
  if (!SPIFFS.begin(FORMAT_SPIFFS_IF_FAILED)) {
    Serial.println("SPIFFS Mount Failed");
    return;
  }
  Serial.println("Listing root directory's:");
  listDir(SPIFFS, "/", 0);
  // writeFile(SPIFFS, "/wifi_found.json", "Test message");
  listFile(SPIFFS, "/wifi_found.json");
  delay(500);
  listDir(SPIFFS, "/", 0);
  delay(500);
}

void loop() {
  webSocket.loop();
}
```

---

<style>
  footer {
    display: none;
  }
</style>