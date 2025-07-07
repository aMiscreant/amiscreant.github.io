---
layout: page
title: 🔐 Hardening OpenWrt
published: 2025-07-08
date: 2025-5-28
description: OpenWrt Hardening Tips
permalink: /tutorials/OpenWrt/hardening
category: openwrt
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

<p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
<p>{{ page.description }}</p>

---

## Overview
Learn how to harden OpenWrt for maximum privacy and security. This step-by-step guide walks you through securing access, encrypting DNS, firewall tweaks, and advanced privacy configurations for a safer network.

## OpenWrt
OpenWrt System Configuration and Firewall Hardening Commands Explained

___

## Configure uHTTPd to Listen on a Specific IP

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set uhttpd.main.listen_http='192.168.66.6:80'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set uhttpd.main.listen_https='192.168.66.6:443'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit uhttpd
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/uhttpd restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Limits the uHTTPd web server to listen only on a specific local IP address (192.168.66.6) for HTTP and HTTPS traffic.

# Effect 
Restricts LuCI/web interface access to the specific IP/interface, increasing security.

# _______________________________________________________________________________________________________________________________________________________________
## Remove HTTP Listen Directive
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci -q delete uhttpd.main.listen_http
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit uhttpd
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/uhttpd restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Deletes the HTTP listen configuration to possibly disable unencrypted HTTP access.

# Effect 
HTTP access might be disabled, forcing HTTPS only.

# _______________________________________________________________________________________________________________________________________________________________
## Add Firewall Rule to Block LuCI Access from WAN

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci add firewall rule
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].name='Block-LuCI-From-WAN'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].src='wan'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].dest_port='80 443'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].proto='tcp'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].target='REJECT'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit firewall
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/firewall restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Blocks WAN (external) access to ports 80 and 443, which are typically used by LuCI (web UI).

# Effect 
Prevents remote access to the router’s web interface for security.

# _______________________________________________________________________________________________________________________________________________________________
## Disable IPv6 on Interfaces

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set network.lan.ipv6='0'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set network.wan.ipv6='0'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set network.wan6.disabled='1'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit network
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/network restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Disables IPv6 support on LAN and WAN interfaces.

# Effect 
Prevents IPv6 traffic to avoid possible IPv6 attack vectors or misconfigurations.

# _______________________________________________________________________________________________________________________________________________________________
## Disable IPv6 Features in DHCP and DNS
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set dhcp.@dnsmasq[0].filter_aaaa='1'   # Blocks AAAA DNS requests
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set dhcp.lan.dhcpv6='disabled'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set dhcp.lan.ra='disabled'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set dhcp.lan.ndp='disabled'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit dhcp
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/dnsmasq restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Stops devices from receiving IPv6 addresses via DHCPv6, router advertisements, and disables Neighbor Discovery Protocol.

# Effect 
Further ensures IPv6 is fully disabled on the local network.

# _______________________________________________________________________________________________________________________________________________________________
## Disable IPv6 in Firewall Defaults
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@defaults[0].disable_ipv6='1'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit firewall
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/firewall restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Disables IPv6 support in the firewall’s default configuration

# Effect 
Prevents firewall from handling IPv6 packets.

# _______________________________________________________________________________________________________________________________________________________________
## Add Firewall Rule to Drop All IPv6 Traffic
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci add firewall rule
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].name='Drop-IPv6'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].family='ipv6'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].target='DROP'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].proto='all'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].src='*'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit firewall
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/firewall restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Drops all IPv6 packets regardless of source.

# Effect 
Fully blocks IPv6 traffic on the device for security or simplicity

# _______________________________________________________________________________________________________________________________________________________________
## Disable IPv6 Modules 
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> # Create a sysctl config file:
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> echo "net.ipv6.conf.all.disable_ipv6 = 1" > /etc/sysctl.d/disable-ipv6.conf
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> echo "net.ipv6.conf.default.disable_ipv6 = 1" >> /etc/sysctl.d/disable-ipv6.conf
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> echo "net.ipv6.conf.lo.disable_ipv6 = 1" >> /etc/sysctl.d/disable-ipv6.conf
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> # Apply the changes immediately:
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> sysctl -p /etc/sysctl.d/disable-ipv6.conf
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> netstat -lpn | grep :::       # Look for any IPv6 listeners<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
This disables IPv6 support at the kernel level for all interfaces, including lo (loopback), ensuring that no IPv6 functionality is exposed — even if some services or configs attempt to re-enable it.

# Effect 
To prevent IPv6 modules from loading (if your system supports it)

# _______________________________________________________________________________________________________________________________________________________________
## TTY Login on Console

<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set system.@system[0].ttylogin="1" 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit system
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> service system restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Ensures that a login prompt appears on the device’s serial or physical console (TTY). This setting is enabled by default on OpenWrt, and the system’s inittab already points to /usr/libexec/login.sh, which enforces password-based login if a password is set for the root account.

# Effect 
With a root password set, console access requires authentication. If the root account has no password, the login prompt will allow immediate access — so ensure a password is set

# _______________________________________________________________________________________________________________________________________________________________
## Firewall Rules for SSH Access on Port 666
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci add firewall rule
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].name='Allow-SSH-LAN'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].src='lan'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].dest_port='666'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].proto='tcp'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].target='ACCEPT'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci add firewall rule
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].name='Deny-SSH-WAN'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].src='wan'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].dest_port='666'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].proto='tcp'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].target='REJECT'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit firewall
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/firewall restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Allows SSH connections only on LAN interface at port 666, while rejecting any SSH attempts on WAN

# Effect 
Restricts SSH access to internal network and non-standard port for better security.

# _______________________________________________________________________________________________________________________________________________________________
## Enable SYN Flood Protection
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@defaults[0].syn_flood='1'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit firewall
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/firewall restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Enables protection against SYN flood Denial-of-Service attacks.

# Effect 
Helps mitigate some types of DoS attacks.

# _______________________________________________________________________________________________________________________________________________________________
## Allow LuCI Access from Specific LAN IP Addresses Only
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci add firewall rule
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].name='Allow-LuCI-From-MyIP'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].src='lan'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].src_ip='192.168.6.66'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].dest_port='443'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].proto='tcp'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].target='ACCEPT'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci add firewall rule
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].name='Allow-LuCI-From-MyIP'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].src='lan'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].src_ip='192.168.66.107'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].dest_port='443'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].proto='tcp'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].target='ACCEPT'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci add firewall rule
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].name='Drop-LuCI-From-Other-LAN'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].src='lan'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].dest_port='443'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].proto='tcp'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].target='REJECT'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit firewall
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/firewall restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Only allows HTTPS LuCI access from specified LAN IP addresses, rejects all others.

# Effect 
Strict control of who can access the router’s web UI locally

# _______________________________________________________________________________________________________________________________________________________________
## Disable and Remove UPnP
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/miniupnpd stop
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/miniupnpd disable
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> opkg remove miniupnpd luci-app-upnp<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Stops, disables, and removes Universal Plug and Play service and its LuCI interface.

# Effect 
Eliminates UPnP vulnerabilities that could open ports automatically.

# _______________________________________________________________________________________________________________________________________________________________
## Tune uHTTPd Max Requests and Connections
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set uhttpd.main.max_requests='10'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set uhttpd.main.max_connections='20'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit uhttpd
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/uhttpd restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Limits the maximum HTTP requests per connection and maximum simultaneous connections.

# Effect 
Helps mitigate DoS by limiting server resource usage.

# _______________________________________________________________________________________________________________________________________________________________
## Drop Invalid Packets Firewall Rule [WARNING] 
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci add firewall rule
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].name='Drop Invalid Packets'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].src='*'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].proto='all'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].extra='-m conntrack --ctstate INVALID'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].target='DROP'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit firewall
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/firewall restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Drops all invalid network packets detected by connection tracking.

# Effect 
Prevents malformed or suspicious packets from passing through.

# NOTE: You may lock yourself out even with white listing practices

# _______________________________________________________________________________________________________________________________________________________________
## Drop Invalid Packets from WAN Only
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci add firewall rule
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].name='Drop Invalid from WAN Only'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].src='wan'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].proto='all'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].extra='-m conntrack --ctstate INVALID'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set firewall.@rule[-1].target='DROP'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit firewall
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/firewall restart<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
This rule targets only invalid connection states on the WAN interface, dropping suspicious packets without affecting internal (LAN) services like LuCI.

# Effect 
Prevents malformed or spoofed packets from entering via WAN without impacting local services, unlike global rules which may cause issues on LAN.

# _______________________________________________________________________________________________________________________________________________________________
## Encrypted DNS via DNSCrypt-Proxy (Recommended)
<div class="terminal-block">
  <pre><code>
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> opkg update
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> opkg install dnscrypt-proxy2
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set dhcp.@dnsmasq[0].noresolv='1'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci set dhcp.@dnsmasq[0].server='127.0.0.1#5053'
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> uci commit dhcp
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/dnsmasq restart
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/dnscrypt-proxy restart
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> /etc/init.d/dnscrypt-proxy enable
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> # Verification
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> dig +short openwrt.org @127.0.0.1 -p 5053<span class="blinking-cursor"></span>
</code></pre>
</div>

___

# Description
Installs and configures DNSCrypt-Proxy v2, allowing DNS queries to be sent over encrypted channels. Offers provider customization, IP filtering, and anonymization.

# Effect 
Prevents DNS leaks and improves privacy by replacing system DNS resolution with secure queries to trusted upstream servers over encrypted channels.

# _______________________________________________________________________________________________________________________________________________________________
## Encrypted DNS via DoH (HTTPS DNS Proxy)
<div class="terminal-block">
  <pre><code> 
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> opkg update
<span class="prompt"><span class="prompt-user">root</span>💀<span class="prompt-host">NullOrigin</span>:~#</span> opkg install https-dns-proxy luci-app-https-dns-proxy</span>
</code></pre>
</div>

___

# Description
Installs https-dns-proxy and its LuCI frontend, enabling DNS-over-HTTPS (DoH) with Cloudflare or Quad9 as resolvers.

# Effect 
Automatically encrypts DNS queries using HTTPS, protecting against DNS spoofing and surveillance without requiring manual config of upstream resolvers.

<style>
  footer {
    display: none;
  }
</style>