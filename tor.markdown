---
layout: page
title: Tor
permalink: /tor/
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

<h2>Tor & Python:</h2>
<ul>
  {% for tor in site.tor %}
    {% if tor.category == "python" %}
      <li>
        <a href="{{ tor.url }}">{{ tor.title }}</a>: <b>{{ tor.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>Tor Configurations:</h2>
<ul>
  {% for tor in site.tor %}
    {% if tor.category == "scripts" %}
      <li>
        <a href="{{ tor.url }}">{{ tor.title }}</a>: <b>{{ tor.description }}</b>
      </li>
    {% endif %}
  {% endfor %}
</ul>

---

<h2>Tor Hidden Services:</h2>
<ul>
  {% for tor in site.tor %}
    {% if tor.category == "hidden_service" %}
      <li>
        <a href="{{ tor.url }}">{{ tor.title }}</a>: <b>{{ tor.description }}</b>
      </li>
    {% endif %}
  {% endfor %}

</ul>
