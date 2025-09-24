---
layout: page
title: Tor - Mail Server
published: 2025-09-23
description: "Configuring Tor Mail Server (Debian bookworm)"
permalink: /tor/mail-server
category: tor
subcategory: MailServer
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

<h1>Tor Mail Server</h1>

- Below outlines the steps to take to configure your own mail server.


<p>Install Dependencies</p>

<p>you will also need to install dovecot & postfix.</p>

```bash
sudo apt-get install apt-transport-tor gnupg -y
# https://support.torproject.org/apt/tor-deb-repo/
wget -qO- https://deb.torproject.org/torproject.org/A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89.asc | gpg --dearmor | tee /usr/share/keyrings/deb.torproject.org-keyring.gpg >/dev/null
sudo apt-get install tor -y
```


---

<h1>Edit Torrc File:</h1>

```bash
# Transport Port
TransPort 9040

# Auto Resolve
AutomapHostsOnResolve 1

# Daemon
RunAsDaemon 1

# Hardware Acceleration Crypto
HardwareAccel 1

# DNS Safety
ClientDNSRejectInternalAddresses 1
ClientRejectInternalAddresses 1
DNSPort 127.0.0.1:53

# Circuit Hacks
NewCircuitPeriod 40
MaxCircuitDirtiness 600
MaxClientCircuitsPending 48
UseEntryGuards 1
EnforceDistinctSubnets 1

# Cookie
CookieAuthentication 1
CookieAuthFile /var/run/tor/control.authcookie

# SSH
HiddenServiceDir /var/lib/tor/ssh/
HiddenServiceVersion 3
HiddenServicePort 22 127.0.0.1:22

# Mail Server
HiddenServiceDir /var/lib/tor/mailserver/
HiddenServiceVersion 3
#HiddenServicePort 25 127.0.0.1:25
#HiddenServicePort 143 127.0.0.1:143
#HiddenServicePort 587 127.0.0.1:587
#HiddenServicePort 993 127.0.0.1:993

# Postfix
HiddenServicePort 25 127.0.0.1:25     
# SMTP (server-to-server)
HiddenServicePort 587 127.0.0.1:587   
# Submission (SMTP+AUTH+STARTTLS)

# Dovecot
HiddenServicePort 143 127.0.0.1:143   
# IMAP
HiddenServicePort 993 127.0.0.1:993   
# IMAPS
HiddenServicePort 110 127.0.0.1:110   
# POP3
HiddenServicePort 995 127.0.0.1:995   
# POP3S
```

---

<h1>Modify sources.list.d</h1>


<p>debian.list</p>

```text
deb     tor+http://2s4yqjx5ul6okpp3f2gaunr2syex5jgbfpfvhxxbbjwnrsvbk5v3qbid.onion/debian            bookworm         main
deb-src tor+http://2s4yqjx5ul6okpp3f2gaunr2syex5jgbfpfvhxxbbjwnrsvbk5v3qbid.onion/debian            bookworm         main

deb     tor+http://2s4yqjx5ul6okpp3f2gaunr2syex5jgbfpfvhxxbbjwnrsvbk5v3qbid.onion/debian            bookworm-updates main
deb-src tor+http://2s4yqjx5ul6okpp3f2gaunr2syex5jgbfpfvhxxbbjwnrsvbk5v3qbid.onion/debian            bookworm-updates main

deb     tor+http://5ajw6aqf3ep7sijnscdzw77t7xq4xjpsy335yb2wiwgouo7yfxtjlmid.onion/debian-security     bookworm-security main
deb-src tor+http://5ajw6aqf3ep7sijnscdzw77t7xq4xjpsy335yb2wiwgouo7yfxtjlmid.onion/debian-security     bookworm-security main

# Optional backports (may not be populated)
# deb     tor+http://2s4yqjx5ul6okpp3f2gaunr2syex5jgbfpfvhxxbbjwnrsvbk5v3qbid.onion/debian          bookworm-backports main
# deb-src tor+http://2s4yqjx5ul6okpp3f2gaunr2syex5jgbfpfvhxxbbjwnrsvbk5v3qbid.onion/debian          bookworm-backports main
```

<p>tor.list</p>

```text
deb [signed-by=/usr/share/keyrings/deb.torproject.org-keyring.gpg] tor+http://apow7mjfryruh65chtdydfmqfpj5btws7nbocgtaovhvezgccyjazpqd.onion/torproject.org bookworm main

# For the unstable version.
deb [signed-by=/usr/share/keyrings/deb.torproject.org-keyring.gpg] tor+http://apow7mjfryruh65chtdydfmqfpj5btws7nbocgtaovhvezgccyjazpqd.onion/torproject.org tor-nightly-main-bookworm main

```

---

<h1>Proxy</h1>

<p>route network traffic through tor</p>


```bash
#!/bin/bash
# aMiscreant

# Flush & drop all
iptables -F
iptables -P INPUT DROP
iptables -P OUTPUT DROP

# Allow already-established sessions
iptables -A INPUT  -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow localhost
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Tor daemon access
iptables -A OUTPUT -m owner --uid-owner debian-tor -j ACCEPT

# Tor DNS and SOCKS only for debian-tor
iptables -A OUTPUT -p tcp --dport 9040 -m owner --uid-owner debian-tor -j ACCEPT
iptables -A OUTPUT -p tcp --dport 9050 -m owner --uid-owner debian-tor -j ACCEPT
iptables -A OUTPUT -p udp --dport 53   -m owner --uid-owner debian-tor -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53   -m owner --uid-owner debian-tor -j ACCEPT

# ALLOW local-only onion forward ports
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 22  -j ACCEPT  # SSH
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 25  -j ACCEPT  # SMTP
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 587 -j ACCEPT  # SMTP Auth
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 143 -j ACCEPT  # IMAP
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 993 -j ACCEPT  # IMAPS
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 110 -j ACCEPT  # POP3
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 995 -j ACCEPT  # POP3S
```

---

<h1>Postfix & Dovecot configuration files</h1>

- YOU must edit and replace {ONION_MAIL} with your onion address, or use the script below

<h1>Postfix</h1>

<p>main.cnf</p>


```bash
# See /usr/share/postfix/main.cf.dist for a commented, more complete version


# Debian specific:  Specifying a file name will cause the first
# line of that file to be used as the name.  The Debian default
# is /etc/mailname.
#myorigin = /etc/mailname

# Mail Dir
home_mailbox = Maildir/

#smtpd_banner = $myhostname ESMTP $mail_name (Debian/GNU)
smtpd_banner = $myhostname ESMTP
biff = no

# appending .domain is the MUA's job.
append_dot_mydomain = no

# Uncomment the next line to generate "delayed mail" warnings
#delay_warning_time = 4h

readme_directory = no

# See http://www.postfix.org/COMPATIBILITY_README.html -- default to 3.6 on
# fresh installs.
compatibility_level = 3.6

# TLS parameters
smtpd_tls_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file=/etc/ssl/private/ssl-cert-snakeoil.key
smtpd_tls_security_level=may

smtp_tls_CApath=/etc/ssl/certs
smtp_tls_security_level=may
smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache

# TLS Security
smtpd_tls_auth_only = yes
smtp_tls_security_level = encrypt
smtp_tls_note_starttls_offer = yes
smtpd_tls_protocols = !SSLv2, !SSLv3
smtpd_tls_ciphers = high
smtpd_tls_mandatory_ciphers = high

# Dovecot
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes
smtpd_sasl_security_options = noanonymous

#smtpd_relay_restrictions = permit_mynetworks permit_sasl_authenticated defer_unauth_destination
smtpd_helo_restrictions = permit_mynetworks, reject_invalid_helo_hostname
smtpd_helo_required = yes

myhostname = {ONION_MAIL}
alias_maps = hash:/etc/aliases
alias_database = hash:/etc/aliases
myorigin = /etc/mailname
#myorigin = $myhostname
mydestination = {ONION_MAIL}, localhost
relayhost = 
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
mailbox_size_limit = 0
recipient_delimiter = +
inet_interfaces = 127.0.0.1
inet_protocols = all
disable_vrfy_command = yes

```

<h1>Dovecot</h1>

<p>dovecot.conf</p>

```bash
## Dovecot configuration file

# If you're in a hurry, see http://wiki2.dovecot.org/QuickConfiguration

# "doveconf -n" command gives a clean output of the changed settings. Use it
# instead of copy&pasting files when posting to the Dovecot mailing list.

# '#' character and everything after it is treated as comments. Extra spaces
# and tabs are ignored. If you want to use either of these explicitly, put the
# value inside quotes, eg.: key = "# char and trailing whitespace  "

# Most (but not all) settings can be overridden by different protocols and/or
# source/destination IPs by placing the settings inside sections, for example:
# protocol imap { }, local 127.0.0.1 { }, remote 10.0.0.0/8 { }

# Default values are shown for each setting, it's not required to uncomment
# those. These are exceptions to this though: No sections (e.g. namespace {})
# or plugin settings are added by default, they're listed only as examples.
# Paths are also just examples with the real defaults being based on configure
# options. The paths listed here are for configure --prefix=/usr
# --sysconfdir=/etc --localstatedir=/var

# Enable installed protocols
!include_try /usr/share/dovecot/protocols.d/*.protocol

# A comma separated list of IPs or hosts where to listen in for connections. 
# "*" listens in all IPv4 interfaces, "::" listens in all IPv6 interfaces.
# If you want to specify non-default ports or anything more complex,
# edit conf.d/master.conf.
#listen = *, ::
listen = 127.0.0.1

# Base directory where to store runtime data.
#base_dir = /var/run/dovecot/

# Name of this instance. In multi-instance setup doveadm and other commands
# can use -i <instance_name> to select which instance is used (an alternative
# to -c <config_path>). The instance name is also added to Dovecot processes
# in ps output.
#instance_name = dovecot

# Greeting message for clients.
#login_greeting = Dovecot ready.

# Space separated list of trusted network ranges. Connections from these
# IPs are allowed to override their IP addresses and ports (for logging and
# for authentication checks). disable_plaintext_auth is also ignored for
# these networks. Typically you'd specify your IMAP proxy servers here.
#login_trusted_networks =

# Space separated list of login access check sockets (e.g. tcpwrap)
#login_access_sockets = 

# With proxy_maybe=yes if proxy destination matches any of these IPs, don't do
# proxying. This isn't necessary normally, but may be useful if the destination
# IP is e.g. a load balancer's IP.
#auth_proxy_self =

# Show more verbose process titles (in ps). Currently shows user name and
# IP address. Useful for seeing who are actually using the IMAP processes
# (eg. shared mailboxes or if same uid is used for multiple accounts).
#verbose_proctitle = no

# Should all processes be killed when Dovecot master process shuts down.
# Setting this to "no" means that Dovecot can be upgraded without
# forcing existing client connections to close (although that could also be
# a problem if the upgrade is e.g. because of a security fix).
#shutdown_clients = yes

# If non-zero, run mail commands via this many connections to doveadm server,
# instead of running them directly in the same process.
#doveadm_worker_count = 0
# UNIX socket or host:port used for connecting to doveadm server
#doveadm_socket_path = doveadm-server

# Space separated list of environment variables that are preserved on Dovecot
# startup and passed down to all of its child processes. You can also give
# key=value pairs to always set specific settings.
#import_environment = TZ

##
## Dictionary server settings
##

# Dictionary can be used to store key=value lists. This is used by several
# plugins. The dictionary can be accessed either directly or though a
# dictionary server. The following dict block maps dictionary names to URIs
# when the server is used. These can then be referenced using URIs in format
# "proxy::<name>".

dict {
  #quota = mysql:/etc/dovecot/dovecot-dict-sql.conf.ext
}

# Most of the actual configuration gets included below. The filenames are
# first sorted by their ASCII value and parsed in that order. The 00-prefixes
# in filenames are intended to make it easier to understand the ordering.
!include conf.d/*.conf

# A config file can also tried to be included without giving an error if
# it's not found:
!include_try local.conf

```

---

<h1>Bonus Script:</h1>

<p>This script can act as a backup or installer, using the configurations<br>
from above, below you can find tormail_stack.sh.
</p>

```bash
#!/bin/bash

set -e

# CONFIG
CONFIG_DIR="$(dirname "$0")/configs"
BACKUP_DIR="/root/tormail_backup_$(date +%F_%H-%M-%S)"
ONION_FILE="/var/lib/tor/mail_hidden/hostname"
PATCH_PLACEHOLDER="{ONION_MAIL}"
HOSTNAME_FILE="/root/tormail_hostnames.txt"

install() {
    echo "[+] Installing TorMail stack..."

    echo "[+] Adding Tor Project onion repository key and source..."
    
    echo "[+] Installing Tor..."
    apt update && apt install -y tor apt-transport-tor
    
    # Add Tor Project GPG key to keyring
    wget -qO- https://deb.torproject.org/torproject.org/A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89.asc | \
      gpg --dearmor | tee /usr/share/keyrings/deb.torproject.org-keyring.gpg >/dev/null

    # Add Tor Project onion repo to sources list
    cat << EOF > /etc/apt/sources.list.d/tor.list
deb [signed-by=/usr/share/keyrings/deb.torproject.org-keyring.gpg] tor+http://apow7mjfryruh65chtdydfmqfpj5btws7nbocgtaovhvezgccyjazpqd.onion/torproject.org bookworm main
deb [signed-by=/usr/share/keyrings/deb.torproject.org-keyring.gpg] tor+http://apow7mjfryruh65chtdydfmqfpj5btws7nbocgtaovhvezgccyjazpqd.onion/torproject.org tor-nightly-main-bookworm main
EOF

    # Add Debian onion repo to sources list
    cat << EOF > /etc/apt/sources.list.d/debian.list
deb     tor+http://2s4yqjx5ul6okpp3f2gaunr2syex5jgbfpfvhxxbbjwnrsvbk5v3qbid.onion/debian            bookworm         main
deb-src tor+http://2s4yqjx5ul6okpp3f2gaunr2syex5jgbfpfvhxxbbjwnrsvbk5v3qbid.onion/debian            bookworm         main

deb     tor+http://2s4yqjx5ul6okpp3f2gaunr2syex5jgbfpfvhxxbbjwnrsvbk5v3qbid.onion/debian            bookworm-updates main
deb-src tor+http://2s4yqjx5ul6okpp3f2gaunr2syex5jgbfpfvhxxbbjwnrsvbk5v3qbid.onion/debian            bookworm-updates main

deb     tor+http://5ajw6aqf3ep7sijnscdzw77t7xq4xjpsy335yb2wiwgouo7yfxtjlmid.onion/debian-security     bookworm-security main
deb-src tor+http://5ajw6aqf3ep7sijnscdzw77t7xq4xjpsy335yb2wiwgouo7yfxtjlmid.onion/debian-security     bookworm-security main

# Optional backports (may not be populated)
# deb     tor+http://2s4yqjx5ul6okpp3f2gaunr2syex5jgbfpfvhxxbbjwnrsvbk5v3qbid.onion/debian          bookworm-backports main
# deb-src tor+http://2s4yqjx5ul6okpp3f2gaunr2syex5jgbfpfvhxxbbjwnrsvbk5v3qbid.onion/debian          bookworm-backports main    
EOF
    echo "[+] Installing dependencies..."
    apt update && apt install -y tor deb.torproject.org-keyring

    echo "[+] TorMail stack dependencies installed."
   
    echo "[+] Backing up existing configs to $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    cp -r /etc/tor "$BACKUP_DIR/tor"
    
    echo "[+] Replacing tor configs..."
    cp "$CONFIG_DIR/torrc" /etc/tor/torrc
    
    echo "[+] Restarting tor be sure to follow the instructions from README.md for configuration for Postfix during install"
    systemctl restart tor
    
    sleep 4
    
    if [[ ! -f "$ONION_FILE" ]]; then
        echo "[!] Onion hostname file not found. Tor HiddenService may not be ready."
        exit 1
    fi

    ONION_HOST=$(cat "$ONION_FILE")
    echo "[+] Onion Mail hostname [COPY]: $ONION_HOST"

    
    sleep 8
    
    echo "[+] Installing dependencies..."
    apt update && apt install -y dovecot-core dovecot-imapd dovecot-pop3d postfix mailutils
    
    echo "[+] Backing up existing configs to $BACKUP_DIR"
    cp -r /etc/dovecot "$BACKUP_DIR/dovecot"
    cp -r /etc/postfix "$BACKUP_DIR/postfix"

    echo "[+] Replacing configs..."
    cp -r "$CONFIG_DIR/dovecot/"* /etc/dovecot/
    cp -r "$CONFIG_DIR/dovecot/conf.d/"* /etc/dovecot/conf.d/
    cp -r "$CONFIG_DIR/postfix/"* /etc/postfix/

    echo "[*] Updating Resolv.conf {backup} /etc/resolv.conf.bak"

    cp -v /etc/resolv.conf /etc/resolv.conf.bak

    # Filter out 'search' and 'nameserver' lines, then append 'nameserver 127.0.0.1'
    grep -vE '^(search|nameserver)' /etc/resolv.conf.bak > /etc/resolv.conf

    echo "nameserver 127.0.0.1" >> /etc/resolv.conf
    
    echo "[+] Restarting Tor..."
    systemctl restart tor
    #systemctl restart dovecot
    #systemctl restart postfix
    

    sleep 3

    if [[ ! -f "$ONION_FILE" ]]; then
        echo "[!] Onion hostname file not found. Tor HiddenService may not be ready."
        exit 1
    fi

    ONION_HOST=$(cat "$ONION_FILE")
    echo "[+] Onion Mail hostname: $ONION_HOST"

    echo "[+] Replacing onion placeholders in config files..."
    grep -rl "$PATCH_PLACEHOLDER" /etc/dovecot /etc/postfix | while read -r file; do
        sed -i "s/$PATCH_PLACEHOLDER/$ONION_HOST/g" "$file"
    done

    echo "Mail Onion Hostname: $ONION_HOST" > "$HOSTNAME_FILE"
    echo "SSH Onion Hostname: $(cat /var/lib/tor/ssh_hidden/hostname 2>/dev/null || echo 'Not Set')" >> "$HOSTNAME_FILE"

    echo "[✓] TorMail installed. Hostnames saved to $HOSTNAME_FILE"
    
    echo "[Restarting and enabling Dovecot/Postfix/Tor at boot-time]"
    systemctl restart dovecot
    systemctl restart postfix
    systemctl restart tor
    
    # Enable at boot
    systemctl enable tor
    systemctl enable postfix
    systemctl enable dovecot
    
    echo "[Services Available and running...]"
}

backup() {
    echo "[+] Backing up current configs to $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    cp -r /etc/tor "$BACKUP_DIR/tor"
    cp -r /etc/dovecot "$BACKUP_DIR/dovecot"
    cp -r /etc/postfix "$BACKUP_DIR/postfix"
    echo "[✓] Backup complete: $BACKUP_DIR"
}

iptables() {
    echo "[*] Creating /opt/iptables.sh Route all traffic through tor"
    cat << EOF > /opt/iptables.sh
#!/bin/bash

# Flush & drop all
iptables -F
iptables -P INPUT DROP
iptables -P OUTPUT DROP

# Allow already-established sessions
iptables -A INPUT  -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow localhost
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Tor daemon access
iptables -A OUTPUT -m owner --uid-owner debian-tor -j ACCEPT

# Tor DNS and SOCKS only for debian-tor
iptables -A OUTPUT -p tcp --dport 9040 -m owner --uid-owner debian-tor -j ACCEPT
iptables -A OUTPUT -p tcp --dport 9050 -m owner --uid-owner debian-tor -j ACCEPT
iptables -A OUTPUT -p udp --dport 53   -m owner --uid-owner debian-tor -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53   -m owner --uid-owner debian-tor -j ACCEPT

# ALLOW local-only onion forward ports
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 22  -j ACCEPT  # SSH
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 25  -j ACCEPT  # SMTP
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 587 -j ACCEPT  # SMTP Auth
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 143 -j ACCEPT  # IMAP
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 993 -j ACCEPT  # IMAPS
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 110 -j ACCEPT  # POP3
iptables -A INPUT -p tcp -s 127.0.0.1 --dport 995 -j ACCEPT  # POP3S
EOF
    chmod +x /opt/iptables.sh
    echo "[*] Applying non-persistent iptables"
    /opt/iptables.sh    
}

apply_new_hostname() {
    echo "[*] Applying new hostname to configuration files..."

    # Get hostname from Tor Hidden Service directory
    ONION_MAIL=$(cat /var/lib/tor/mail_hidden/hostname 2>/dev/null)

    if [[ -z "$ONION_MAIL" ]]; then
        echo "[!] ERROR: Hostname file not found or empty at /var/lib/tor/mail_hidden/hostname"
        return 1
    fi

    echo "[*] Hostname detected: $ONION_MAIL"
    echo "[*] Replacing {ONION_MAIL_REPLACE} in config files..."

    # Replace placeholder in postfix configs
    echo "[*] Updating Postfix configuration files..."
    grep -Rl '{ONION_MAIL_REPLACE}' /etc/postfix | while read -r file; do
        echo "  [+] $file"
        sed -i "s/{ONION_MAIL_REPLACE}/$ONION_MAIL/g" "$file"
    done

    # Replace placeholder in dovecot configs
    echo "[*] Updating Dovecot configuration files..."
    grep -Rl '{ONION_MAIL_REPLACE}' /etc/dovecot | while read -r file; do
        echo "  [+] $file"
        sed -i "s/{ONION_MAIL_REPLACE}/$ONION_MAIL/g" "$file"
    done

    echo "[✓] Hostname applied to Postfix and Dovecot configs."
    
    echo "[Restarting and enabling Dovecot/Postfix/Tor at boot-time]"
    systemctl restart dovecot
    systemctl restart postfix
    systemctl restart tor
    
    systemctl enable tor
    systemctl enable postfix
    systemctl enable dovecot
}

help () {
    echo "[*] TorMail Stack"
    echo "[*]"
    echo "[*] Installs Postfix/Dovecot/Tor"
    echo "[*]"
    echo "[*] How to use:"
    echo "[*]"
    echo "[*] ./tormail_stack.sh install   | INFO | {installs all dependencies & configuration files}"
    echo "[*] ./tormail_stack.sh backup    | INFO | {backup Postfix/Dovecot/Tor configuration files}"
    echo "[*] ./tormail_stack.sh iptables  | INFO | {route all traffic through tor}"
    echo "[*]"
    echo "[*] DEBUG "
    echo "[*] ./tormail_stack.sh appy_new_hostname {replace ALL config files from configs to appropriate directory & run this}"
    echo "[*]"
}
usage() {
    echo "Usage: $0 {install|backup|iptables|apply_new_hostname}"
    exit 1
}

case "$1" in
    install) install ;;
    backup) backup ;;
    iptables) iptables ;;
    appy_new_hostname) appy_new_hostname ;;
    *) usage ;;
esac

```

<h1>Usage:</h1>

- ./tormail_stack.sh install
- ./tormail_stack.sh backup
- ./tormail_stack.sh iptables


---

<style>
  footer {
    display: none;
  }
</style>