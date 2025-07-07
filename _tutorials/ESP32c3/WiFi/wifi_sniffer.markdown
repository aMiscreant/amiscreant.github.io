---
layout: page
title: 🌐 ESP32c3 WiFi Sniffer
published: 2025-07-08
date: 2025-5-29
description: ESP32c3 WiFi Tutorials
permalink: /tutorials/ESP32c3/wifi/wifi_sniffer
category: esp32c3
subcategory: wifi
copy_to_clipboard: true
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

# Wi-Fi Sniffer on ESP32c3 - Code Documentation Overview:


[Full Source Code Available Here](https://github.com/aMiscreant/ESP32c3-WiFi-Scipts/blob/main/sniffer.c)

### This program demonstrates a Wi-Fi sniffer running on an ESP32, capable of detecting Wi-Fi networks (beacon frames) and data frames in promiscuous mode. The program cycles through Wi-Fi channels, processes packets, and extracts SSID and MAC address details, filtering out duplicates. The sniffer provides real-time Wi-Fi network activity and maintains a list of previously seen MAC addresses to avoid redundant reporting. Key Features:

#### Wi-Fi Packet Sniffing: Captures both management (beacon frames) and data frames. Channel Hopping: Cycles through Wi-Fi channels 1 to 13. Duplicate Filtering: Ensures that the same network or device is not reported multiple times. Real-Time Reporting: Prints SSID, MAC address, and RSSI (signal strength) for each detected network.

## Code Breakdown: 
# 1. Imports and Setup:
```c
    #include <string.h> 
    #include "freertos/FreeRTOS.h" 
    #include "freertos/task.h" 
    #include "esp_wifi.h"
    #include "esp_log.h" 
    #include "nvs_flash.h" 
    #include "esp_event.h"
```

>These headers include necessary libraries for FreeRTOS tasks, Wi-Fi functions, logging, and flash memory handling.

# 2.  Constants and Variables:
```c
#define MAX_MAC_ADDRESSES 100 static uint8_t
mac_addresses\[MAX_MAC_ADDRESSES\]\[6\]; static int mac_count = 0;
```

>MAX_MAC_ADDRESSES defines the maximum number of MAC addresses the sniffer will track.
> 
>mac_addresses stores the unique MAC addresses.
> 
>mac_count tracks how many unique MAC addresses have been detected.


# 3. MAC Address Filtering Functions: Checking if a MAC address has been seen:
```c
bool is_mac_seen(const uint8_t \*mac) { for (int i = 0; i \< mac_count;
i++) { if (memcmp(mac_addresses\[i\], mac, 6) == 0) { return true; //
MAC address found } } return false; }
```

>is_mac_seen checks if a given MAC address is already in the list of previously seen addresses.

## Adding a MAC address to the list:
```c
void add_mac_address(const uint8_t *mac) { if (mac_count \<
MAX_MAC_ADDRESSES) { memcpy(mac_addresses\[mac_count\], mac, 6);
mac_count++; } else { // Overwrite the oldest MAC address
memmove(mac_addresses, mac_addresses + 1, (MAX_MAC_ADDRESSES - 1) * 6);
memcpy(mac_addresses\[MAX_MAC_ADDRESSES - 1\], mac, 6); } }
```

> add_mac_address adds a new MAC address to the list, and if the list is full, it overwrites the oldest entry.

# 4. Wi-Fi Packet Handler:
```c
static void wifi_sniffer_packet_handler(void *buff,
wifi_promiscuous_pkt_type_t type) { const wifi_promiscuous_pkt_t *ppkt =
(wifi_promiscuous_pkt_t *)buff; const uint8_t *payload = ppkt-\>payload;

    if (type == WIFI_PKT_MGMT) {
        // Beacon frame or probe response
        if (payload[0] == 0x80 || payload[0] == 0x50) {
            uint8_t ssid_len = payload[37];
            if (ssid_len > 0 && ssid_len < 33) {
                char ssid[33] = {0};
                memcpy(ssid, &payload[38], ssid_len);
                uint8_t mac[6] = { payload[10], payload[11], payload[12], payload[13], payload[14], payload[15] };

                // Check if this MAC address has been seen before
                if (!is_mac_seen(mac)) {
                    printf("📡 SSID: %s | RSSI: %d | MAC: %02x:%02x:%02x:%02x:%02x:%02x\n",
                        ssid, ppkt->rx_ctrl.rssi,
                        payload[10], payload[11], payload[12],
                        payload[13], payload[14], payload[15]);

                    // Add the MAC address to the list to avoid duplicates
                    add_mac_address(mac);
                }
            }
        }
    } else if (type == WIFI_PKT_DATA) {
        // Optional: Print MAC + RSSI for data frames
        uint8_t mac[6] = { payload[10], payload[11], payload[12], payload[13], payload[14], payload[15] };
        if (!is_mac_seen(mac)) {
            printf("📦 DATA Frame | RSSI: %d | MAC: %02x:%02x:%02x:%02x:%02x:%02x\n",
                ppkt->rx_ctrl.rssi,
                payload[10], payload[11], payload[12],
                payload[13], payload[14], payload[15]);

            // Add the MAC address to the list to avoid duplicates
            add_mac_address(mac);
        }
    }

}
```



>wifi_sniffer_packet_handler processes incoming packets.
> 
>It looks for management packets (beacon frames or probe responses) and extracts the SSID and MAC.
> 
>It also handles data frames and prints out the RSSI and MAC address if it hasn't already been seen.

# 5. Channel Hopping Task:
```c
void channel_hop_task(void \*pvParameters) { uint8_t channel = 1; while
(true) { esp_wifi_set_channel(channel, WIFI_SECOND_CHAN_NONE); //
Suppressed the log output // ESP_LOGI(TAG, "Switched to channel %d",
channel); channel = (channel % 13) + 1; // Loop channels 1-13
vTaskDelay(pdMS_TO_TICKS(500)); } }
```

>The channel_hop_task cycles through Wi-Fi channels 1 to 13 with a 500ms delay, ensuring the sniffer picks up packets from all available channels. The log output showing each channel switch has been suppressed to reduce verbosity.

# 6. Main Setup and Initialization:

```c
void app_main(void) { ESP_ERROR_CHECK(nvs_flash_init());
ESP_ERROR_CHECK(esp_netif_init());
ESP_ERROR_CHECK(esp_event_loop_create_default());

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM));
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_NULL));
    ESP_ERROR_CHECK(esp_wifi_start());

    // Start sniffer
    ESP_ERROR_CHECK(esp_wifi_set_promiscuous(true));
    ESP_ERROR_CHECK(esp_wifi_set_promiscuous_rx_cb(&wifi_sniffer_packet_handler));

    // Start channel hopping task
    xTaskCreate(channel_hop_task, "channel_hop_task", 2048, NULL, 1, NULL);

    ESP_LOGI(TAG, "🚀 Sniffer started. Scanning Wi-Fi activity...");

}
```

>Initializes Wi-Fi and FreeRTOS, enabling promiscuous mode and setting up the packet handler.
>
>Starts the channel hopping task to ensure the sniffer scans all available Wi-Fi channels.


📡 SSID: TL;DR | RSSI: -47 | MAC: 94:43:c4:4a:35:99
📡 SSID: North Korea's Wi-Fi | RSSI: -91 | MAC: 60:83:e9:0b:c9:04


Conclusion:

This project demonstrates how to use the ESP32 in promiscuous mode to
detect Wi-Fi networks and track them. It includes features like SSID
extraction, MAC address filtering, channel hopping, and real-time
reporting, which are essential for building Wi-Fi scanners and network
monitors.

You can leverage this implementation for Wi-Fi monitoring, security
assessments, or as a foundation for more advanced Wi-Fi-related tools.
