---
layout: page
title: Tor - Privatebin
published: 2026-02-03
description: "Configuring Tor Hidden Service Hosting Privatebin."
permalink: /tor/privatebin
category: tor
subcategory: Privatebin
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

# PrivateBin over Tor

### This setup deploys a hardened, self-hosted PrivateBin instance as a Tor hidden service. It allows anonymous, end-to-end encrypted paste sharing without logs, trackers, or client identifiers. The configuration emphasizes strict access controls, minimal attack surface, and privacy-preserving defaults, making it suitable for sensitive text exchange entirely within the Tor network.


Note:

"You will need to append the access token to submit uploads."

---

## 99-privatebin.conf


```bash
# No alias needed if document-root is already /var/www/privatebin

# Deny access to /index.php unless correct access token is present
# No alias needed if document-root is already /var/www/privatebin

# Block access to /index.php unless correct access token is present
#$HTTP["url"] =~ "^/index\.php" {
#    $HTTP["querystring"] !~ "access_token=BBfUxKaNYwOCBMV40LP" {
#        url.access-deny = ( "" )
#    }
#}
# Deny direct /index.php access unless token is present or referer is valid
$HTTP["url"] =~ "^/index\.php" {
    # Allow Tor access without token
    $HTTP["remoteip"] !~ "127\.0\.0\.1|::1" {
        $HTTP["host"] !~ "YOUR_ONION\.onion" {
            $HTTP["querystring"] !~ "access_token=BBfUxKaNYwOCBMV40LP" {
                url.access-deny = ( "" )
            }
        }
    }
}

```

## 99-security.conf

---

```bash
# ========================
# PrivateBin Hardened Security Rules
# ========================

# Disable directory listing globally
#dir-listing.activate = "disable"

# Deny access to suspicious extensions (config files, backups, temp edits)
$HTTP["url"] =~ "\.(git|svn|hg|env|bak|swp|inc|log|yaml|yml|ini)$" {
  url.access-deny = ( "" )
}

# Allow only GET and POST (no TRACE, PUT, etc.)
$HTTP["request-method"] !~ "^(GET|POST)$" {
  url.access-deny = ( "" )
}

# Block requests with no User-Agent (often bots or scanners)
$HTTP["useragent"] == "" {
  url.access-deny = ( "" )
}

# Anti-hotlinking: only allow images to be loaded from our onion
$HTTP["referer"] !~ "^($|https://YOUR_ONION\.onion)" {
  url.access-deny = ( ".jpg", ".jpeg", ".png", ".webp", ".gif" )
}

# Block known bots (example: Googlebot, Bingbot, Baiduspider)
$HTTP["useragent"] =~ "(Google|Bing|Slurp|DuckDuckBot|Baiduspider|Yandex)" {
  url.access-deny = ( "" )
}

# Security headers via mod_setenv
$HTTP["scheme"] == "https" {
  setenv.add-response-header = (
    "Referrer-Policy" => "same-origin",
    "Strict-Transport-Security" => "max-age=31536000",
    "X-Frame-Options" => "DENY",
    "X-Content-Type-Options" => "nosniff",
    "X-XSS-Protection" => "1; mode=block",
    "Permissions-Policy" => "accelerometer=(), camera=(), geolocation=(), microphone=()",
    "Server" => "PrivateBin"
  )
}

# Virtual-host validation 
$HTTP["host"] !~ "^YOUR_ONION\.onion$" {
  url.access-deny = ( "" )
}

```

## 404-privatebin.html

---

```bash
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>404</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background: black;
      overflow: hidden;
      font-family: monospace;
    }
    canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
    }
    .center-404 {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 20vw;
      font-weight: bold;
      color: transparent;
      z-index: 2;
      -webkit-text-stroke: 2px #9b59b6;
      text-shadow: 0 0 20px #9b59b6;
      pointer-events: none;
      user-select: none;
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 3;
      width: 100%;
      text-align: center;
      margin-top: 5vh;
      color: #9b59b6;
      font-size: 1.5em;
      text-shadow: 0 0 10px #9b59b6;
    }
  </style>
</head>
<body>
  <canvas id="matrix"></canvas>
  <div class="center-404">404</div>

  <script>
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()+=<>?';
    const chars = characters.split('');
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#9b59b6';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    setInterval(draw, 33);

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  </script>
</body>
</html>

```

## Caddy file below:

---

```bash
# The Caddyfile is an easy way to configure your Caddy web server.
#
# Unless the file starts with a global options block, the first
# uncommented line is always the address of your site.
#
# To use your own domain name (with automatic HTTPS), first make
# sure your domain's A/AAAA DNS records are properly pointed to
# this machine's public IP, then replace ":80" below with your
# domain name.
# reverse_proxy localhost:8080
# Or serve a PHP site through php-fpm:
# php_fastcgi localhost:9000

{
    auto_https disable_redirects
    servers {
        protocols h1 h2
    }
}

YOUR_ONION.onion:443 {
	tls /etc/caddy/certs/YOUR_ONION.onion.crt /etc/caddy/certs/YOUR_ONION.onion.key
	reverse_proxy 127.0.0.1:80
}
# Refer to the Caddy docs for more information:
# https://caddyserver.com/docs/caddyfile

```

## lighttpd.conf

---

```bash
server.modules = (
	"mod_indexfile",
	"mod_access",
	"mod_alias",
	"mod_redirect",
)

server.document-root        = "/var/www/privatebin"
server.upload-dirs          = ( "/var/cache/lighttpd/uploads" )
server.errorlog             = "/var/log/lighttpd/error.log"
server.pid-file             = "/run/lighttpd.pid"
server.username             = "www-data"
server.groupname            = "www-data"
server.port                 = 80

# features
#https://redmine.lighttpd.net/projects/lighttpd/wiki/Server_feature-flagsDetails
server.feature-flags       += ("server.h2proto" => "enable")
server.feature-flags       += ("server.h2c"     => "enable")
server.feature-flags       += ("server.graceful-shutdown-timeout" => 5)
#server.feature-flags       += ("server.graceful-restart-bg" => "enable")

server.error-handler-404 = "/404.html"
# server.error-handler-400 = "/404.html"
# strict parsing and normalization of URL for consistency and security
# https://redmine.lighttpd.net/projects/lighttpd/wiki/Server_http-parseoptsDetails
# (might need to explicitly set "url-path-2f-decode" = "disable"
#  if a specific application is encoding URLs inside url-path)
server.http-parseopts = (
  "header-strict"           => "enable",# default
  "host-strict"             => "enable",# default
  "host-normalize"          => "enable",# default
  "url-normalize-unreserved"=> "enable",# recommended highly
  "url-normalize-required"  => "enable",# recommended
  "url-ctrls-reject"        => "enable",# recommended
  "url-path-2f-decode"      => "enable",# recommended highly (unless breaks app)
 #"url-path-2f-reject"      => "enable",
  "url-path-dotseg-remove"  => "enable",# recommended highly (unless breaks app)
 #"url-path-dotseg-reject"  => "enable",
 #"url-query-20-plus"       => "enable",# consistency in query string
)

#index-file.names            = ( "index.php", "index.html" )
#index-file.names = ( "index.html", "index.php" )
index-file.names = ( "index.html" )

url.access-deny             = ( "~", ".inc" )
static-file.exclude-extensions = ( ".php", ".pl", ".fcgi" )

# default listening port for IPv6 falls back to the IPv4 port
include_shell "/usr/share/lighttpd/use-ipv6.pl " + server.port
include_shell "/usr/share/lighttpd/create-mime.conf.pl"
include "/etc/lighttpd/conf-enabled/*.conf"

#server.compat-module-load   = "disable"
server.modules += (
	"mod_dirlisting",
	"mod_staticfile",
        "mod_setenv",
	"mod_magnet",
)

```

## privatebin-index.html

---

```bash
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Service Offline</title>
<style>
  html, body {
    margin: 0; padding: 0;
    height: 100%;
    background: black;
    overflow: hidden;
    color: #9b59b6; /* purple */
    font-family: monospace;
  }
  #matrix {
    position: fixed;
    top: 0; left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
  }
  .message-container {
    position: relative;
    z-index: 1;
    color: #9b59b6;
    text-align: center;
    top: 40%;
    font-size: 2em;
    font-weight: bold;
    text-shadow: 0 0 8px #9b59b6;
  }
</style>
</head>
<body>
<canvas id="matrix"></canvas>

<div class="message-container">
  <h2>Temporarily Unavailable</h2>
  <p>This service is currently down for maintenance.</p>
</div>

<script>
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()-+=<>?';
  const charsArray = characters.split('');

  const fontSize = 18;
  const columns = Math.floor(canvas.width / fontSize);

  const drops = [];
  for (let x = 0; x < columns; x++) drops[x] = Math.random() * canvas.height;

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#9b59b6'; // purple text
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = charsArray[Math.floor(Math.random() * charsArray.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 33);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
</script>
</body>
</html>

```

## Tor configuration file "/etc/tor/torrc file for privatebin"

---

```bash
## by removing the "#" symbol.
##
## See 'man tor', or https://www.torproject.org/docs/tor-manual.html,
## for more options you can use in this file.
##
## Tor will look for this file in various places based on your platform:
## https://www.torproject.org/docs/faq#torrc
HiddenServiceDir /var/lib/tor/ssh
HiddenServicePort 6666 127.0.0.1:6666
Log notice stdout
Log info file /var/log/tor/info_new.log
#ClientUseIPv4 0
ClientPreferIPv6ORPort 1

log debug file /var/log/tor/debug.log

## PrivateBin Hidden Service
HiddenServiceDir /var/lib/tor/privatebin_onion/
HiddenServicePort 443 127.0.0.1:443

DirReqStatistics 0

```

---

## install_privatebin.sh

```bash
#!/bin/bash

set -e

echo "[*] Installing dependencies..."
apt update
apt install -y lighttpd php php-cgi unzip curl tor

echo "[*] Enabling CGI for PHP..."
lighty-enable-mod fastcgi-php
systemctl restart lighttpd

echo "[*] Downloading PrivateBin..."
mkdir -p /var/www/privatebin
cd /var/www/privatebin
curl -L https://github.com/PrivateBin/PrivateBin/archive/refs/tags/2.0.0.zip -o privatebin.zip
unzip -o privatebin.zip
mv PrivateBin-*/* .
rm -rf PrivateBin-master privatebin.zip

echo "[*] Setting permissions..."
chown -R www-data:www-data /var/www/privatebin
chmod -R 755 /var/www/privatebin

echo "[*] Configuring PrivateBin..."
cp cfg/conf.sample.php cfg/conf.php

sed -i "s/'cipher' => 'aes'/'cipher' => 'chacha20'/" cfg/conf.php
sed -i "s/'discussion' => true/'discussion' => false/" cfg/conf.php
sed -i "s/'fileupload' => true/'fileupload' => false/" cfg/conf.php
sed -i "s/'burnafterreading' => false/'burnafterreading' => true/" cfg/conf.php

echo "[*] Configuring lighttpd..."
cat > /etc/lighttpd/conf-available/99-privatebin.conf <<EOF
server.modules += ("mod_alias", "mod_cgi")

alias.url += (
    "/privatebin/" => "/var/www/privatebin/"
)

\$HTTP["url"] =~ "^/privatebin/" {
    cgi.assign = ( ".php" => "/usr/bin/php-cgi" )
}
EOF

ln -s /etc/lighttpd/conf-available/99-privatebin.conf /etc/lighttpd/conf-enabled/
systemctl reload lighttpd

echo "[*] Configuring Tor Hidden Service..."
mkdir -p /var/lib/tor/privatebin_onion/
chown -R debian-tor:debian-tor /var/lib/tor/privatebin_onion/
chmod 700 /var/lib/tor/privatebin_onion/

cat >> /etc/tor/torrc <<EOF

## PrivateBin Hidden Service
HiddenServiceDir /var/lib/tor/privatebin_onion/
HiddenServicePort 80 127.0.0.1:80
EOF

echo "[*] Restarting Tor..."
systemctl restart tor

sleep 3
echo "[+] PrivateBin .onion address:"
cat /var/lib/tor/privatebin_onion/hostname
```

---

<style>
  footer {
    display: none;
  }
</style>