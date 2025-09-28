---
layout: page
title: Tutorials
permalink: /tutorials/
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

<h2>Code Farm:</h2>
<ul>
  {% for tutorial in site.tutorials %}
    {% if tutorial.category == "codefarm" %}
      <li>
        <a href="{{ tutorial.url }}">{{ tutorial.title }}</a>: <b>{{ tutorial.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>Cross Compile for Android:</h2>
<ul>
  {% for tutorial in site.tutorials %}
    {% if tutorial.category == "crosscompile" %}
      <li>
        <a href="{{ tutorial.url }}">{{ tutorial.title }}</a>: <b>{{ tutorial.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>Linux system hardening:</h2>
<ul>
  {% for tutorial in site.tutorials %}
    {% if tutorial.category == "linux" %}
      <li>
        <a href="{{ tutorial.url }}">{{ tutorial.title }}</a>: <b>{{ tutorial.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>NetHunter:</h2>
<ul>
  {% for tutorial in site.tutorials %}
    {% if tutorial.category == "NetHunter" %}
      <li>
        <a href="{{ tutorial.url }}">{{ tutorial.title }}</a>: <b>{{ tutorial.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>OpenWrt:</h2>
<ul>
  {% for tutorial in site.tutorials %}
    {% if tutorial.category == "openwrt" %}
      <li>
        <a href="{{ tutorial.url }}">{{ tutorial.title }}</a>: <b>{{ tutorial.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>OrangePi Zero 3:</h2>
<ul>
  {% for tutorial in site.tutorials %}
    {% if tutorial.category == "opi3zero" %}
      <li>
        <a href="{{ tutorial.url }}">{{ tutorial.title }}</a>: <b>{{ tutorial.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---
<h2>Proxmark3 Iceman:</h2>
<ul>
  {% for tutorial in site.tutorials %}
    {% if tutorial.category == "proxmark" %}
      <li>
        <a href="{{ tutorial.url }}">{{ tutorial.title }}</a>: <b>{{ tutorial.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>Python3:</h2>
<ul>
  {% for tutorial in site.tutorials %}
    {% if tutorial.category == "python" %}
      <li>
        <a href="{{ tutorial.url }}">{{ tutorial.title }}</a>: <b>{{ tutorial.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>Termux:</h2>
<ul>
  {% for tutorial in site.tutorials %}
    {% if tutorial.category == "termux" %}
      <li>
        <a href="{{ tutorial.url }}">{{ tutorial.title }}</a>: <b>{{ tutorial.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>Tor:</h2>
<ul>
  {% for tutorial in site.tutorials %}
    {% if tutorial.category == "tor" %}
      <li>
        <a href="{{ tutorial.url }}">{{ tutorial.title }}</a>: <b>{{ tutorial.description }}</b>
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