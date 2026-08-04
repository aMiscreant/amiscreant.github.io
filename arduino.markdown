---
layout: page
title: Arduino
permalink: /arduino/
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

<h2>ESP32:</h2>
<ul>
  {% for arduino in site.arduino %}
    {% if arduino.category == "esp32" %}
      <li>
        <a href="{{ arduino.url }}">{{ arduino.title }}</a>: <b>{{ arduino.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>ESP32c3:</h2>
<ul>
  {% for arduino in site.arduino %}
    {% if arduino.category == "esp32c3" %}
      <li>
        <a href="{{ arduino.url }}">{{ arduino.title }}</a>: <b>{{ arduino.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>ESP32-Wroom-32D:</h2>
<ul>
  {% for arduino in site.arduino %}
    {% if arduino.category == "esp32wroom" %}
      <li>
        <a href="{{ arduino.url }}">{{ arduino.title }}</a>: <b>{{ arduino.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>ESP8266:</h2>
<ul>
  {% for arduino in site.arduino %}
    {% if arduino.category == "esp8266" %}
      <li>
        <a href="{{ arduino.url }}">{{ arduino.title }}</a>: <b>{{ arduino.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<style>
  footer {
    display: none;
  }
</style>