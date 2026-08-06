---
layout: page
title: High n' Wired
published: 2025-07-08
description: "ESP32c3 Super Mini Penetration Testing Tool."
permalink: /projects/HighNWired
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

<h1>High & Wired</h1>

<p>Features a custom partition, tons of pentesting features.</p>
<p>SPIFFS system explorer; create/browse & upload files.</p>
<p>MITM Attacks, FakeAP, Deauth & Capture.</p>

---

![LOGIN](https://image2url.com/images/1758931748203-829d0f6c-3bee-47bf-a1cb-0c78138f60c5.png)

![MENU](https://image2url.com/images/1758931763214-3487c393-f410-45ab-ab71-25f26d60b547.png)

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
const char* password = "PASSWORD";
const char* serverAddress = "192.168.66.107";
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
                        webSocket.sendTXT(encryptedFreeMem);
                    } else if (decryptedMessage == "SCAN_WIFI") {
                        scanWiFi();  // Call the Wi-Fi scan function
                    } else if (decryptedMessage == "LOAD_WIFI") {
                        loadWiFiDataFormatted();  // Call the formatted load function
                    } else if (decryptedMessage == "SAVE_WIFI") {
                        // saveWiFiData(wifiData);  // Call the save Wi-Fi function
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
  Serial.begin(115200);
  delay(1000);  // Optional: give serial monitor time
  connectWiFi();
  connectWebSocket();
  if (!SPIFFS.begin(FORMAT_SPIFFS_IF_FAILED)) {
    Serial.println("SPIFFS Mount Failed");
    return;
  }
  Serial.println("Listing root directory's:");
  listDir(SPIFFS, "/", 0);
  writeFile(SPIFFS, "/wifi_found.json", "Test message");
  listFile(SPIFFS, "/wifi_found.json");
  delay(500);
  listDir(SPIFFS, "/", 0);
  delay(500);
}

void loop() {
  webSocket.loop();
}
```


```bash
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ESP32 CNC Terminal - DirectSec</title>
  <style>
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

  body {
    background: radial-gradient(ellipse at center, #000000 0%, #050505 100%);
    color: #00ff99;
    font-family: 'Share Tech Mono', monospace;
    margin: 0;
    padding: 20px;
  }

  h2 {
    margin-bottom: 10px;
    color: #00ffe6;
    text-shadow: 0 0 5px #00ffe6, 0 0 10px #00ffe6;
    letter-spacing: 1px;
  }

  #terminal {
    width: 98.5%;
    height: 250px;
    border: 2px solid #00ff99;
    background: rgba(0, 0, 0, 0.85);
    overflow-y: auto;
    padding: 10px;
    white-space: pre-wrap;
    margin-bottom: 10px;
    font-size: 14px;
    box-shadow: inset 0 0 10px #00ff99;
    border-radius: 5px;
    scrollbar-width: thin;
    scrollbar-color: #00ff99 #000000;
  }

  #terminal::-webkit-scrollbar {
    width: 8px;
  }
  #terminal::-webkit-scrollbar-track {
    background: #000;
  }
  #terminal::-webkit-scrollbar-thumb {
    background-color: #00ff99;
    border-radius: 4px;
  }

  #command {
    width: calc(100% - 20px);
    background: #000000;
    color: #00ff99;
    border: 1px solid #00ff99;
    padding: 8px;
    margin-bottom: 10px;
    font-size: 14px;
    border-radius: 4px;
    outline: none;
    box-shadow: 0 0 5px #00ff99;
    transition: all 0.3s;
  }

  #command:focus {
    background: #001a13;
    box-shadow: 0 0 10px #00ff99;
  }

  .button-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
  }

  button {
    background: linear-gradient(145deg, #001f17, #003d2e);
    color: #00ff99;
    border: 2px solid #00ff99;
    padding: 10px;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px;
    text-shadow: 0 0 5px #00ff99;
    transition: all 0.3s ease-in-out;
    box-shadow:
      0 0 5px #00ff99,
      0 0 10px #00ff99 inset;
  }

  button:hover {
    background: linear-gradient(145deg, #00ff99, #00ffe6);
    color: #000;
    box-shadow:
      0 0 10px #00ffe6,
      0 0 20px #00ff99 inset;
    transform: scale(1.05);
  }

  .file-upload {
    margin-top: 10px;
  }

  .esp-msg {
    color: #00ffe6;
    text-shadow: 0 0 3px #00ffe6;
  }

  .error-msg {
    color: #ff0033;
    text-shadow: 0 0 5px #ff0033;
  }
</style>
</head>
<body>
  <h2>ESP32 CNC Terminal <span style="font-size: 0.7em;">codename: High & Wired</span></h2>
  <h2>by: aMiscreant <span style="font-size: 0.7em;">for Miscreants</span></h2>
  <div id="terminal"></div>
  <input type="text" id="command" placeholder="Enter command..." autofocus>

  <div class="button-grid">
    <button onclick="sendCommand('WIFI_SCAN')">Scan Wi-Fi</button>
    <button onclick="sendCommand('WIFI_LOAD')">Load Saved Wi-Fi</button>
    <button onclick="sendCommand('WIFI_SELECT_NETWORK')">Select Wi-Fi Network</button>
    <button onclick="sendCommand('WIFI_DEAUTH')">DeAuth Attack</button>
    <button onclick="sendCommand('WIFI_PHISHER')">Wi-Fi Phisher</button>
    <button onclick="sendCommand('WIFI_DEAUTH')">DeAuth Attack</button>
    <button onclick="sendCommand('WIFI_CLEAR')">Clear Saved Wi-Fi Devices</button>
    <button onclick="sendCommand('WIFI_DOWNLOAD_CAP')">Download .cap Files</button>
    <!-- Grid 2 -->
    <button onclick="sendCommand('WIFI_PIVOT')">Connect To New Network</button>
    <button onclick="sendCommand('WIFI_NETWORK_SCAN')">Local Network Scan</button>
    <button onclick="sendCommand('WIFI_SELECT_LOCALHOST')">Select Localhost Network</button>
    <button onclick="sendCommand('WIFI_ARP')">ARP Attack</button>
    <button onclick="sendCommand('WIFI_MITM')">Wi-Fi MITM Attack</button>
    <button onclick="sendCommand('WIFI_DNS_REDIRECT')">Wi-Fi DNS Redirect Attack</button>
    <!-- Grid 3 -->
    <button onclick="sendCommand('BLUETOOTH_SCAN')">Bluetooth Scan</button>
    <button onclick="sendCommand('BLUETOOTH_LOAD')">Bluetooth Load Saved</button>
    <button onclick="sendCommand('BLUETOOTH_SELECT')">Select Bluetooth Device</button>
    <button onclick="sendCommand('BLUETOOTH_SPOOF')">Bluetooth Spoof</button>
    <button onclick="sendCommand('BLUETOOTH_HID')">Bluetooth HID Attack</button>
    <button onclick="sendCommand('BLUETOOTH_CLEAR')">Clear Saved Bluetooth Devices</button>
  </div>

  <div class="file-upload">
    <input type="file" id="binUploader" />
    <button onclick="uploadBin()">Upload Payload</button>
  </div>

  <!-- CryptoJS for AES-CTR encryption -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
  <script>
    const terminal = document.getElementById("terminal");
    const commandInput = document.getElementById("command");
    let socket = null;

    const serverUrl = "ws://192.168.66.107:8000/ws/Browser_1";

    const aesKeyHex = "000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F";
    const aesKey = CryptoJS.enc.Hex.parse(aesKeyHex);

    function connectWebSocket() {
      socket = new WebSocket(serverUrl);

      socket.onopen = function () {
        appendToTerminal("[+] Connected to WebSocket server\n", "esp-msg");
      };

      socket.onmessage = function (event) {
        let message = event.data.trim();
        message = cleanMessage(message);
        appendToTerminal(message, "esp-msg");
      };

      socket.onerror = function () {
        appendToTerminal("[-] WebSocket Error\n", "error-msg");
      };

      socket.onclose = function () {
        appendToTerminal("[-] WebSocket Disconnected. Reconnecting...\n", "error-msg");
        setTimeout(connectWebSocket, 3000);
      };
    }

    function aesEncryptCTR(plaintext) {
      const nonceBytes = new Uint8Array(16);
      crypto.getRandomValues(nonceBytes);
      const nonceHex = Array.from(nonceBytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
      const nonceWordArray = CryptoJS.enc.Hex.parse(nonceHex);

      const encrypted = CryptoJS.AES.encrypt(plaintext, aesKey, {
        iv: nonceWordArray,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.NoPadding
      });

      return {
        nonce: btoa(String.fromCharCode(...nonceBytes)),
        ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
      };
    }

    function sendCommand(command) {
      if (socket.readyState === WebSocket.OPEN) {
        const encrypted = aesEncryptCTR(command);

        socket.send(
          JSON.stringify({
            nonce: encrypted.nonce,
            ciphertext: encrypted.ciphertext
          })
        );

        appendToTerminal("You: " + command, "");
      } else {
        appendToTerminal("[!] WebSocket not connected", "error-msg");
      }
    }

    commandInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        const command = commandInput.value.trim();
        if (command !== "") {
          sendCommand(command);
          commandInput.value = "";
        }
      }
    });

    function appendToTerminal(message, className) {
      const lines = message.split("\n");
      lines.forEach((line) => {
        const div = document.createElement("div");
        div.textContent = line;
        if (className) div.classList.add(className);
        terminal.appendChild(div);
      });
      terminal.scrollTop = terminal.scrollHeight;
    }

    function uploadBin() {
      const file = document.getElementById("binUploader").files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (event) {
        const arrayBuffer = event.target.result;
        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(arrayBuffer))
        );

        socket.send(
          JSON.stringify({
            type: "flash_payload",
            filename: file.name,
            data: base64,
          })
        );

        appendToTerminal(`[+] Uploaded file: ${file.name}`, "esp-msg");
      };
      reader.readAsArrayBuffer(file);
    }

    function cleanMessage(message) {
      return message.replace(/^\[ESP32.*?\]:\s*/g, "");
    }

    connectWebSocket();
  </script>
</body>
</html>

```

```bash
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import base64
from Crypto.Cipher import AES

app = FastAPI()

# Allow all origins (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection storage
esp_connections = {}  # {device_id: websocket}
browser_connections = set()

# Shared secret key (same as on ESP32)
SHARED_KEY = bytes([
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
    0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
    0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F
])

def decrypt_aes_ctr(ciphertext, nonce):
    initial_counter = int.from_bytes(nonce, byteorder='big')
    cipher = AES.new(SHARED_KEY, AES.MODE_CTR, nonce=b'', initial_value=initial_counter)
    plaintext = cipher.decrypt(ciphertext)
    return plaintext

from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
async def get_terminal():
    with open("encrypted_index.html", "r") as file:
        return file.read()

@app.websocket("/ws/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    await websocket.accept()
    print(f"[+] {device_id} connected.")

    if device_id.startswith("ESP32"):
        esp_connections[device_id] = websocket
    else:
        browser_connections.add(websocket)

    try:
        while True:
            raw_msg = await websocket.receive_text()

            if device_id.startswith("ESP32"):
                try:
                    import json
                    parsed = json.loads(raw_msg)
                    nonce = base64.b64decode(parsed["nonce"])
                    ciphertext = base64.b64decode(parsed["ciphertext"])
                    plaintext = decrypt_aes_ctr(ciphertext, nonce).decode()


                    print(f"[{device_id}]: {plaintext}")

                    if plaintext == "PONG":
                        print(f"[Server] Received PONG from {device_id}")
                        # Optionally, you could respond back with another message.

                    # Forward plaintext to browsers
                    for browser in browser_connections:
                        try:
                            await browser.send_text(f"{device_id}: {plaintext}")
                        except ConnectionError:
                            browser_connections.discard(browser)

                except (KeyError, ValueError) as e:
                    print(f"[!] Failed to decrypt message from {device_id}: {e}")

            elif device_id.startswith("Browser"):
                # Forward message to all ESP32 clients (plaintext expected)
                for esp_id, esp in esp_connections.items():
                    try:
                        await esp.send_text(raw_msg)
                        # except WebSocket.client:
                    except:
                        esp_connections.pop(esp_id, None)

    except WebSocketDisconnect:
        print(f"[-] {device_id} disconnected.")
        if device_id.startswith("ESP32"):
            esp_connections.pop(device_id, None)
        else:
            browser_connections.discard(websocket)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, ws_ping_interval=60, ws_ping_timeout=180)

```

---

<style>
  footer {
    display: none;
  }
</style>