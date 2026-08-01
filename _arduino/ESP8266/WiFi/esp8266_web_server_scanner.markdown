---
layout: page
title: ESP8266 - Wi-Fi Scanner (Web Server)
published: 2025-07-02
description: "Wi-Fi Scanner (Web Server) using Flask."
permalink: /arduino/wifi/esp8266_websocket
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

<p>ESP8266 - Wi-Fi Scanner (Web Server)  using Flask & uvicorn.</p>

<p>Configure:</p>

    const char* ssid = "";  // Replace with your Wi-Fi SSID
    const char* password = "";       // Replace with your Wi-Fi password

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

<h1>Server Code:</h1>

```python
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow all origins (adjust for security in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active WebSocket connections
esp_connections = {}  # {device_id: websocket}
browser_connections = set()  # Stores browser websockets

from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
async def get_terminal():
    with open("templates/index.html", "r") as file:
        return file.read()

@app.websocket("/ws/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    """Handle WebSocket connections from ESP32 and browsers."""
    await websocket.accept()
    print(f"[+] {device_id} connected.")

    # Store connections
    if device_id.startswith("ESP32"):
        esp_connections[device_id] = websocket
    else:
        browser_connections.add(websocket)

    try:
        while True:
            message = await websocket.receive_text()
            print(f"[{device_id}]: {message}")

            # Send ESP32 messages to all browsers
            if device_id.startswith("ESP32"):
                for browser in browser_connections:
                    try:
                        await browser.send_text(f"{device_id}: {message}")
                    except SyntaxError:
                        browser_connections.discard(browser)

            # Send browser messages to all ESP32 devices
            elif device_id.startswith("Browser"):
                for esp_id, esp in esp_connections.items():
                    try:
                        await esp.send_text(message)  # Fix: Now sends to ESP32
                    except SyntaxError:
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

<p>templates/index.html</p>

- Change YOUR_LOCAL_IP with  you local ip address 
- "let serverUrl = "ws://YOUR_LOCAL_IP:8000/ws/Browser_1";


```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ESP32 CNC Terminal - DirectSec</title>
    <style>
        body { background-color: black; color: lime; font-family: monospace; padding: 20px; }
        #terminal { width: 80%; height: 300px; border: 1px solid lime; padding: 10px; overflow-y: auto; white-space: pre-wrap; background-color: black; }
        #command { width: 80%; background: black; color: lime; border: 1px solid lime; font-family: monospace; padding: 5px; }
        button { background: black; color: lime; border: 1px solid lime; padding: 5px; margin-top: 10px; cursor: pointer; }
        .esp-msg { color: cyan; }
        .error-msg { color: red; }
    </style>
</head>
<body>
    <h2>ESP32 CNC Terminal</h2>
    <div id="terminal"></div>
    <input type="text" id="command" placeholder="Enter command..." autofocus>
    <button onclick="sendCommand('SCAN_WIFI')">Scan Wi-Fi</button>
    <button onclick="sendCommand('LOAD_WIFI')">Load Saved Wi-Fi</button>
    <button onclick="sendCommand('DEAUTH')">DeAuth Attack</button>
    <input type="file" id="binUploader" />
    <button onclick="uploadBin()">Upload Payload</button>


<script>
    let terminal = document.getElementById("terminal");
    let commandInput = document.getElementById("command");
    let socket = null;
    let serverUrl = "ws://YOUR_LOCAL_IP:8000/ws/Browser_1";

    function connectWebSocket() {
        socket = new WebSocket(serverUrl);

        socket.onopen = function() {
            appendToTerminal("[+] Connected to WebSocket server\n", "esp-msg");
        };

        socket.onmessage = function(event) {
            let message = event.data.trim();

            // Clean up unwanted metadata (e.g., "[ESP32_1]:")
            message = cleanMessage(message);

            // Directly append the message (no need for JSON formatting)
            appendToTerminal(message, "esp-msg");
        };

        socket.onerror = function() {
            appendToTerminal("[-] WebSocket Error\n", "error-msg");
        };

        socket.onclose = function() {
            appendToTerminal("[-] WebSocket Disconnected. Reconnecting...\n", "error-msg");
            setTimeout(connectWebSocket, 3000);
        };
    }

    function sendCommand(command) {
        if (socket.readyState === WebSocket.OPEN) {
            appendToTerminal("You: " + command, "");
            socket.send(command);
        } else {
            appendToTerminal("[!] WebSocket not connected", "error-msg");
        }
    }

    commandInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            let command = commandInput.value.trim();
            if (command !== "") {
                sendCommand(command);
                commandInput.value = "";
            }
        }
    });

    function appendToTerminal(message, className) {
        let lines = message.split("\n");
        lines.forEach(line => {
            let div = document.createElement("div");
            div.textContent = line;
            if (className) div.classList.add(className);
        terminal.appendChild(div);
        });
        terminal.scrollTop = terminal.scrollHeight;
    }
    function uploadBin() {
    let file = document.getElementById('binUploader').files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(event) {
        let arrayBuffer = event.target.result;
        let base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        // Wrap it in a JSON message for ESP32 to process
        socket.send(JSON.stringify({
            type: "flash_payload",
            filename: file.name,
            data: base64
        }));
    };
    reader.readAsArrayBuffer(file);
    }

    // Optional: Keep this if you want to clean any remaining metadata
    //function cleanMessage(message) {
    //   return message.replace(/\[ESP32_\d\]:\s*/g, '');  // Clean any ESP32 metadata if needed
    //}
    function cleanMessage(message) {
        return message.replace(/^\[ESP32.*?\]:\s*/g, '');
    }
    connectWebSocket();
</script>


</body>
</html>
```


---

<style>
  footer {
    display: none;
  }
</style>