---
layout: page
title: ESP8266 - Encrypt && Decrypt
published: 2025-09-27
description: "Encrypt + Decrypt a message using (TweetNaCl)."
permalink: /arduino/esp8266/encrypt_decrypt
category: esp8266
subcategory: tweetnacl
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

<p>Encrypt / Decrypt</p>



```bash
// aMiscreant
#include "tweetnacl_wrapper.h"
#include <Arduino.h>

void printHex(const char *label, const uint8_t *buf, size_t len) {
  Serial.print(label);
  for (size_t i = 0; i < len; i++) {
    Serial.printf("%02X", buf[i]);
  }
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  delay(200);

  uint8_t pk1[NACL_PUBLICKEY_SIZE], sk1[NACL_SECRETKEY_SIZE];
  uint8_t pk2[NACL_PUBLICKEY_SIZE], sk2[NACL_SECRETKEY_SIZE];
  nacl_keypair(pk1, sk1);
  nacl_keypair(pk2, sk2);

  printHex("PK1: ", pk1, NACL_PUBLICKEY_SIZE);
  printHex("SK1: ", sk1, NACL_SECRETKEY_SIZE);
  printHex("PK2: ", pk2, NACL_PUBLICKEY_SIZE);
  printHex("SK2: ", sk2, NACL_SECRETKEY_SIZE);

  const char *msg = "Hello from ESP8266!";
  size_t msg_len = strlen(msg);

  uint8_t nonce[NACL_NONCE_SIZE];
  nacl_randombytes(nonce, NACL_NONCE_SIZE);
  printHex("Nonce: ", nonce, NACL_NONCE_SIZE);

  // ciphertext buffer (msg_len + overhead)
  uint8_t ciphertext[msg_len + NACL_BOX_OVERHEAD];
  delay(1000);
  uint8_t decrypted[msg_len];  // decrypted will match msg_len exactly
  delay(1000);
  if (nacl_box(ciphertext, (const uint8_t*)msg, msg_len, nonce, pk2, sk1) == 0) {
    Serial.println("Message encrypted!");
    printHex("Ciphertext: ", ciphertext, msg_len + NACL_BOX_OVERHEAD);

    // FIX: ciphertext length must be msg_len + NACL_BOX_OVERHEAD
    delay(1000);
    if (nacl_box_open(decrypted, ciphertext, msg_len + NACL_BOX_OVERHEAD, nonce, pk1, sk2) == 0) {
      delay(1000);
      Serial.println("Decryption succeeded!");
      Serial.print("Decrypted: ");
      Serial.write(decrypted, msg_len);
      Serial.println();
    } else {
      Serial.println("Decryption failed!");
    }
  } else {
    Serial.println("Encryption failed!");
  }
}

void loop() {}

```

- OUTPUT

      SK1: 9E5437C62B499E671BE9D3568AF6A1F9E82F02B496892B0DAB6DAB3084F12BC3
      PK2: A66F5BBE701E2605E9C72FD7311E5301605B2ABAB665ED599B29286DBBA89C1B
      SK2: 9B87C589808A00F94E20D9A90F44C3ED01B64955EF08A08F8F01FEB75932E2CF
      Nonce: FEB6B4EBF5706D163DB3BF0E021C5CA40EF12C63EDB14F09
      Message encrypted!
      Ciphertext: F830BB71F8C8A029F8BBC4B0570669875AA7BBDF338B785690CEB7CF8D667869027E9C
      Decryption succeeded!
      Decrypted: Hello from ESP8266!

---

<h1>Here you can find my wrapper's</h1>

- tweetnacl_wrapper.c

```bash
// aMiscreant
#include "tweetnacl_wrapper.h"
#include "tweetnacl.h"
#include <string.h>
#include <stdlib.h>
#include <stdio.h>

#include <user_interface.h>  // For os_random()

int nacl_randombytes(uint8_t *buffer, size_t size) {
    if (!buffer) return -1;
    for (size_t i = 0; i < size; ++i) {
        buffer[i] = (uint8_t)os_random();
    }
    return 0;
}

int nacl_keypair(uint8_t *public_key, uint8_t *secret_key) {
    if (nacl_randombytes(secret_key, NACL_SECRETKEY_SIZE) != 0) {
        return -1;
    }

    if (crypto_scalarmult_base(public_key, secret_key) != 0) {
        return -1;
    }

    return 0;
}

int nacl_box(uint8_t *ciphertext, const uint8_t *message, uint64_t message_len,
             const uint8_t *nonce, const uint8_t *public_key, const uint8_t *secret_key) {
    uint8_t *padded_msg = (uint8_t *)malloc(message_len + 32);
    if (!padded_msg) return -1;

    memset(padded_msg, 0, 32);
    memcpy(padded_msg + 32, message, message_len);

    uint8_t *padded_ctext = (uint8_t *)malloc(message_len + 32);
    if (!padded_ctext) { free(padded_msg); return -1; }

    int result = crypto_box(padded_ctext, padded_msg, message_len + 32,
                            nonce, public_key, secret_key);

    if (result == 0) {
        // Strip the leading 16 zeros (NaCl convention)
        memcpy(ciphertext, padded_ctext + 16, message_len + 16);
    }

    free(padded_msg);
    free(padded_ctext);
    return result;
}

int nacl_box_open(uint8_t *message, const uint8_t *ciphertext, uint64_t cipher_len,
                  const uint8_t *nonce, const uint8_t *public_key, const uint8_t *secret_key) {
    uint8_t *padded_ctext = (uint8_t *)malloc(cipher_len + 16);
    if (!padded_ctext) return -1;

    memset(padded_ctext, 0, 16);
    memcpy(padded_ctext + 16, ciphertext, cipher_len);

    uint8_t *padded_msg = (uint8_t *)malloc(cipher_len + 16);
    if (!padded_msg) { free(padded_ctext); return -1; }

    int result = crypto_box_open(padded_msg, padded_ctext, cipher_len + 16,
                                 nonce, public_key, secret_key);

    if (result == 0) {
        memcpy(message, padded_msg + 32, cipher_len - 16);
    }

    free(padded_ctext);
    free(padded_msg);
    return result;
}

```

- tweetnacl_wrapper.h

```bash
// tweetnacl_wrapper.h
// aMiscreant
#ifndef TWEETNACL_WRAPPER_H
#define TWEETNACL_WRAPPER_H

#include <stdint.h>
#include <stddef.h>

// Key and nonce sizes for NaCl box
#define NACL_PUBLICKEY_SIZE 32
#define NACL_SECRETKEY_SIZE 32
#define NACL_NONCE_SIZE     24
#define NACL_BOX_OVERHEAD   16

#ifdef __cplusplus
extern "C" {
#endif

// Generates a keypair (public, secret)
int nacl_keypair(uint8_t *public_key, uint8_t *secret_key);

// Encrypts a message using public/secret key and nonce
int nacl_box(uint8_t *ciphertext, const uint8_t *message, uint64_t message_len,
             const uint8_t *nonce, const uint8_t *public_key, const uint8_t *secret_key);

// Decrypts a message using public/secret key and nonce
int nacl_box_open(uint8_t *message, const uint8_t *ciphertext, uint64_t cipher_len,
                  const uint8_t *nonce, const uint8_t *public_key, const uint8_t *secret_key);

// Fills a buffer with secure random bytes
int nacl_randombytes(uint8_t *buffer, size_t size);

#ifdef __cplusplus
}
#endif

#endif // TWEETNACL_WRAPPER_H
```

---

<style>
  footer {
    display: none;
  }
</style>