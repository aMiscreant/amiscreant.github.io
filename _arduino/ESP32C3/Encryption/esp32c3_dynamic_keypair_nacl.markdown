---
layout: page
title: 📂 ESP32-C3 - Encryption - Dynamic Key Pair TweetNaCl
published: 2025-07-02
date: 2025-5-29
timezone: America/Toronto
description: Dynamic Key Pair Generation Using TweetNaCl
permalink: /arduino/encryption/esp32c3/dynamic_key_pair
category: esp32c3
subcategory: Encryption
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

### 🚀 ESP32 NaCl Encryption Demo — Arduino C++ with TweetNaCl

#### Overview

---

_This example demonstrates secure public-key encryption and decryption on the ESP32 using the TweetNaCl library._

**It generates**:

_A dynamic key pair for the sender_
_A dynamic key pair for the receiver_
_A random nonce_
_Encryption of a message_
_Decryption and recovery of the original plaintext_

---

### This makes it a great foundation for secure ESP32-to-ESP32 communication over Wi-Fi, BLE, LoRa, or other channels. 

**Features**

---

>
✅ Uses NaCl’s crypto_box (Curve25519 + XSalsa20 + Poly1305)
>
✅ Compatible with other NaCl-compatible systems (e.g. libsodium, PyNaCl)
>
✅ Safe handling of cryptographic zero-padding
>
✅ Dynamic key generation for testing
>
✅ Prints all keys, nonce, and ciphertext for analysis or future hard-coding
>
✅ Clean heap management with malloc/free to avoid memory leaks

---

**Full Source Code**:

```bash
#include <Arduino.h>
#include <esp_system.h>  // esp_fill_random()

extern "C" {
  #include "tweetnacl.h"
}

// Constants
#define NACL_PUBLICKEY_SIZE     32
#define NACL_SECRETKEY_SIZE     32
#define NACL_NONCE_SIZE         24
#define NACL_BOX_ZEROBYTES      32
#define NACL_BOX_BOXZEROBYTES   16

// Declare prototype
extern "C" int nacl_randombytes(uint8_t *buffer, size_t size);

// RNG
extern "C" int nacl_randombytes(uint8_t *buf, size_t len) {
  esp_fill_random(buf, len);
  return 0;
}

// Nonce
uint8_t nonce_[NACL_NONCE_SIZE];

// Hex printer
void print_hex(const uint8_t *data, size_t len) {
  for (size_t i = 0; i < len; ++i) {
    if (data[i] < 0x10) Serial.print('0');
    Serial.print(data[i], HEX);
    Serial.print(' ');
  }
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n🚀 TweetNaCl Demo – Working Dynamic Keypairs");
  delay(1000);
  // Generate sender keypair
  uint8_t sender_pk[NACL_PUBLICKEY_SIZE];
  uint8_t sender_sk[NACL_SECRETKEY_SIZE];
  crypto_box_keypair(sender_pk, sender_sk);

  // Generate receiver keypair
  uint8_t receiver_pk[NACL_PUBLICKEY_SIZE];
  uint8_t receiver_sk[NACL_SECRETKEY_SIZE];
  crypto_box_keypair(receiver_pk, receiver_sk);

  // Generate fresh nonce
  nacl_randombytes(nonce_, NACL_NONCE_SIZE);
  
  Serial.println("✅ Sender Public Key:"); print_hex(sender_pk, NACL_PUBLICKEY_SIZE);
  Serial.println("✅ Receiver Public Key:"); print_hex(receiver_pk, NACL_PUBLICKEY_SIZE);
  Serial.println("✅ Nonce:"); print_hex(nonce_, NACL_NONCE_SIZE);

  Serial.println("✅ Sender Secret Key:");
  print_hex(sender_sk, NACL_SECRETKEY_SIZE);
  Serial.println("✅ Receiver Secret Key:");
  print_hex(receiver_sk, NACL_SECRETKEY_SIZE);
  delay(1000);
  // Message
  const char *plaintext = "Secret: ESP32 to ESP32!";
  size_t msg_len = strlen(plaintext);
  size_t padded_len = msg_len + NACL_BOX_ZEROBYTES;

  // Pad message
  uint8_t *padded_msg = (uint8_t *)malloc(padded_len);
  memset(padded_msg, 0, NACL_BOX_ZEROBYTES);
  memcpy(padded_msg + NACL_BOX_ZEROBYTES, plaintext, msg_len);

  // Encrypt
  uint8_t *ciphertext = (uint8_t *)malloc(padded_len);
  if (crypto_box(ciphertext, padded_msg, padded_len, nonce_, receiver_pk, sender_sk) != 0) {
    Serial.println("❌ Encryption failed!");
    return;
  }

  Serial.println("✅ Ciphertext:");
  print_hex(ciphertext + NACL_BOX_BOXZEROBYTES, padded_len - NACL_BOX_BOXZEROBYTES);

  // Prepare padded ciphertext for decryption
  uint8_t *padded_cipher = (uint8_t *)malloc(padded_len);
  memset(padded_cipher, 0, NACL_BOX_BOXZEROBYTES);
  memcpy(padded_cipher + NACL_BOX_BOXZEROBYTES,
         ciphertext + NACL_BOX_BOXZEROBYTES,
         padded_len - NACL_BOX_BOXZEROBYTES);

  // Decrypt
  uint8_t *decrypted = (uint8_t *)malloc(padded_len);
  if (crypto_box_open(decrypted, padded_cipher, padded_len, nonce_, sender_pk, receiver_sk) != 0) {
    Serial.println("❌ Decryption failed!");
    return;
  }

  Serial.print("✅ Decrypted message: ");
  for (size_t i = 0; i < msg_len; i++) {
    Serial.print((char)decrypted[NACL_BOX_ZEROBYTES + i]);
  }
  Serial.println();

  free(padded_msg);
  free(ciphertext);
  free(padded_cipher);
  free(decrypted);
}

void loop() {
  delay(5000);
}
```

---

Output:

```bash
🚀 TweetNaCl Demo – Working Dynamic Keypairs

✅ Sender Public Key:
28 B7 0C 0C B4 93 34 8D 74 03 98 FE 05 8D DA BA A3 EE 20 ED 44 59 00 DB 46 BF B1 08 34 65 F5 10 
✅ Receiver Public Key:
D2 2A 97 AE 41 BE A4 7A 65 22 DF C8 77 6E B0 F8 62 BC 96 7C FD 0C CA 01 98 9D D6 30 BB 69 AA 07 
✅ Nonce:
4D 82 AE F7 3E E1 72 16 4F BC 7F EF 67 A2 EE B3 7C 0B 60 F5 2E 34 D4 88 
✅ Sender Secret Key:
F9 CD 95 E1 44 94 49 9C D2 A0 B0 53 81 3C 91 A9 9D 02 83 3E 10 B7 DE 0E 3C D0 93 39 C2 8C D9 76 
✅ Receiver Secret Key:
42 4C 5A 34 6F 14 78 79 08 04 FC B2 BC E2 BE BB C0 60 F6 F1 FE 35 3D E1 FF EE 03 5D 37 60 3B F9 
✅ Ciphertext:
1C 12 9F C0 28 46 A0 F3 72 8D DB A3 73 94 3C 4F A4 9C 68 9D 84 A4 D6 47 2D 54 1D AD 60 2E 83 06 C8 08 51 AE 1D 5F 67 
✅ Decrypted message: Secret: ESP32 to ESP32!

🚀 TweetNaCl Demo – Working Dynamic Keypairs

✅ Sender Public Key:
98 68 AD 20 6E 8B 13 07 51 B9 DA 54 C1 0D D8 43 E3 09 85 46 57 DE A6 D9 EE 40 21 A2 20 37 86 79 
✅ Receiver Public Key:
BA 4D B4 23 03 C0 72 72 40 51 43 D5 1B AF 72 96 5A 22 DC 8D 2F 34 53 8E 1C 72 29 22 D1 CB 55 2E 
✅ Nonce:
F3 65 EA B3 DC 3C 5B E4 E0 7F A2 F5 7B 06 01 B8 24 55 D2 17 58 3E FC ED 
✅ Sender Secret Key:
99 CA 3D B2 F5 64 BE E3 A8 36 D5 BD F7 A6 E1 39 87 BA 65 61 B8 62 36 D0 8B D7 4B A2 81 7E 8C 37 
✅ Receiver Secret Key:
11 C0 D6 62 AC CD A2 1A 1B F2 E0 E4 09 8B C6 D2 0D 68 32 08 61 F0 F3 E0 F4 C5 6E DC E4 BC C4 03 
✅ Ciphertext:
4A 76 05 7F AB 7C FE 81 14 71 6D 09 36 9F FD 0D A1 60 B4 2A E2 12 56 CF D4 F6 0B 04 89 FD F9 AA CF 5B 60 46 C5 44 D7 
✅ Decrypted message: Secret: ESP32 to ESP32!

```

---