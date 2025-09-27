---
layout: page
title: BLEyeOnU
published: 2025-09-26
description: "Broadcast like a beacon, sniff like a spook."
permalink: /projects/BLEyeOnU/BLEyeOnU
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

![BLEYEONU](https://image2url.com/images/1758931565821-f8051556-59c5-4d72-add7-89c4f06063be.png)

<h1>BLEyeOnU</h1>

    "Broadcast like a beacon, sniff like a spook."

- Mission Objective

Create a passive BLE reconnaissance tool that:
    Scans for BLE4/5 advertisements
    Parses and interprets ADV payloads
    Identifies device types (iBeacon, Eddystone, etc.)
    Logs and decodes Manufacturer, Service UUIDs, and names
    Estimates proximity using RSSI + TxPower
    And then uses the onboard LED to determine distance.

- Development Implementation (Testable Now)
- iBeacon & Eddystone Tracker

---

<h1>Source Code:</h1>

```bash
#ifndef SOC_BLE_50_SUPPORTED
#warning "This SoC does not support BLE5. Try using ESP32-C3, or ESP32-S3"
#else
// aMiscreant

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <map>

#define LED_PIN 8

// LED timing
unsigned long ledLastToggle = 0;
unsigned long ledInterval = 500;  // default blink interval
bool ledState = false;

// BLE scanning
uint32_t scanTime = 100;  // In 10ms units (1000 = 10s)
BLEScan *pBLEScan;

// Known devices
std::map<String, String> foundDevices;
int macCount = 0;
String targetMac = "";
float targetDistance = 0;
bool bluetoothScan = false;

// Estimate distance from RSSI and TX power
float estimateDistance(int rssi, int txPower, float pathLossExponent = 2.0) {
  return pow(10.0, ((float)txPower - (float)rssi) / (10.0 * pathLossExponent));
}

// Parse BLE advertisement payload
void parseAdvData(uint8_t *data, uint8_t len, int rssi, String macStr) {
  int i = 0;
  String devName = "";

  while (i < len) {
    uint8_t field_len = data[i];
    if (field_len == 0) break;
    uint8_t type = data[i + 1];

    switch (type) {
      case 0x09: { // Complete Local Name
        char nameBuf[32] = {0};
        memcpy(nameBuf, &data[i + 2], min(field_len - 1, 31));
        devName = String(nameBuf);
        Serial.print(" Complete Name: ");
        Serial.println(devName);
        break;
      }
      default:
        break;
    }

    i += field_len + 1;
  }

  // Store this device in map
  if (foundDevices.count(macStr) == 0) {
    foundDevices[macStr] = devName;
    macCount++;
    Serial.printf("  [+] New device stored: %s [%s]\n", macStr.c_str(), devName.c_str());
  } else {
    // update name if it was empty previously
    if (foundDevices[macStr].isEmpty() && !devName.isEmpty()) {
      foundDevices[macStr] = devName;
    }
  }
}

// BLE5 Extended Scan Callback
class MyBLEExtAdvertisingCallbacks : public BLEExtAdvertisingCallbacks {
  void onResult(esp_ble_gap_ext_adv_report_t report) {
    char addr_str[18];
    sprintf(addr_str,
            "%02X:%02X:%02X:%02X:%02X:%02X",
            report.addr[0], report.addr[1], report.addr[2],
            report.addr[3], report.addr[4], report.addr[5]);

    Serial.println("\n----------------------------------");
    Serial.printf("Device address: %s\n", addr_str);
    Serial.printf("RSSI: %d dBm\n", report.rssi);

    if (report.event_type & ESP_BLE_GAP_SET_EXT_ADV_PROP_LEGACY) {
      Serial.println("LEGACY ADV (BLE4.x)");
    } else {
      Serial.printf("XTENDED ADV (BLE5.x) | Data Length: %d | Data Status: %d\n",
                    report.adv_data_len,
                    report.data_status);
    }

    // Display ADV payload
    if (report.adv_data_len > 0) {
      Serial.println("ADV PAYLOAD (raw):");
      for (int i = 0; i < report.adv_data_len; i++) {
        if (report.adv_data[i] < 0x10) Serial.print('0');
        Serial.print(report.adv_data[i], HEX);
        Serial.print(" ");
      }
      Serial.println();

      parseAdvData(report.adv_data, report.adv_data_len, report.rssi, String(addr_str));
    }

    float dist = estimateDistance(report.rssi, -59, 2.0);
    Serial.printf("Estimated distance (generic): %.2f meters\n", dist);

    // Check if this is the target device
    if (targetMac.length() > 0 && targetMac == String(addr_str)) {
      targetDistance = dist;

      float cappedDist = constrain(dist, 0.5, 10.0);
      ledInterval = map(cappedDist * 100, 50, 1000, 100, 2000);
      Serial.printf("[TRACKING] %.2f m → LED interval %lu ms\n", dist, ledInterval);
    }

    Serial.println("----------------------------------");
  }
};

void listMac() {
  Serial.println(F("\n[+] Known Bluetooth Devices:"));
  if (foundDevices.empty()) {
    Serial.println(F("None found."));
    return;
  }

  for (auto& device : foundDevices) {
    Serial.print("MAC: ");
    Serial.print(device.first.c_str());
    Serial.print(" | Name: ");
    Serial.println(device.second.c_str());
  }
  Serial.print("[Total]: ");
  Serial.println(macCount);
}

void showMenu() {
  Serial.println(F(""));
  Serial.println(F("   ESP32-C3 Super Mini - [BLEyeOnU]"));
  Serial.println(F(""));
  Serial.println(F("  [b] Toggle Bluetooth scan"));
  Serial.println(F("  [s] Store found devices (live mode)"));
  Serial.println(F("  [l] List known devices"));
  Serial.println(F("  [t] Track a specific device"));
  Serial.println(F("  [m] Show menu again"));
  Serial.println(F(""));
}

void handleMenuInput(char input) {
  switch (input) {
    case 'b':
      bluetoothScan = !bluetoothScan;
      Serial.print(F("Bluetooth Scan "));
      Serial.println(bluetoothScan ? F("Enabled") : F("Disabled"));
      if (bluetoothScan) {
        pBLEScan->startExtScan(scanTime, 3);
      } else {
        pBLEScan->stop();
      }
      break;
    case 's':
      Serial.println(F("[+] Storing found devices... (done automatically while scanning)"));
      break;
    case 'l':
      listMac();
      break;
    case 't':
      Serial.println(F("[?] Enter MAC to track (uppercase, e.g. 66:61:4B:98:9E:84):"));
      while (!Serial.available()) delay(10);
      targetMac = Serial.readStringUntil('\n');
      targetMac.trim();
      if (foundDevices.count(targetMac)) {
        Serial.printf("[✓] Tracking device: %s (%s)\n",
                      targetMac.c_str(),
                      foundDevices[targetMac].c_str());
      } else {
        Serial.println("[!] MAC not found. Try scanning first.");
        targetMac = "";
      }
      break;
    case 'm': 
      showMenu(); 
      break;
    default:
      Serial.println(F("? Unknown command. Type 'm' to show menu options."));
      break;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.println("Starting BLE Extended Scan...");
  showMenu();

  BLEDevice::init("");
  pBLEScan = BLEDevice::getScan();
  pBLEScan->setExtendedScanCallback(new MyBLEExtAdvertisingCallbacks());
  pBLEScan->setExtScanParams();
  delay(5000);
}

void loop() {
  // handle user input
  if (Serial.available()) {
    char input = Serial.read();
    handleMenuInput(input);
  }

  if (targetMac.length() > 0) {
    if (millis() - ledLastToggle >= ledInterval) {
      ledLastToggle = millis();
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    }
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}

#endif  // SOC_BLE_50_SUPPORTED
```

---

<style>
  footer {
    display: none;
  }
</style>