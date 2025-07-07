---
layout: page
title: ⚠️ Log Cleanup
published: 2025-07-08
date: 2025-7-29
description: Ensure your system logs and activities are not tampered with by implementing logger dropper scripts that help you track and remove traces of suspicious actions.
permalink: /tutorials/Linux/CleanLogs/scripts
category: linux
subcategory: CleanLogs
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

#### Subrosa Wipe is a security-focused Bash script and systemd integration designed to automatically erase sensitive traces from a Linux system. It securely clears system logs, temporary files, user histories, and caches to reduce forensic footprints. Configurable for execution at boot, shutdown, and user login, Subrosa Wipe helps maintain system privacy and operational security in sensitive environments.

---

```bash
#!/bin/bash
# subrosa_wipe - Securely delete logs & temp data

set -e

# Clear logs
find /var/log -type f -exec truncate -s 0 {} \; 2>/dev/null
find /var/log -type f -name '*.gz' -delete
find /var/log -type f -name '*.old' -delete
> /var/log/wtmp
> /var/log/btmp
> /var/log/lastlog
[ -d /var/log/audit ] && rm -rf /var/log/audit/*

# Clear journalctl logs (if systemd present)
if command -v journalctl >/dev/null 2>&1; then
    journalctl --rotate
    journalctl --vacuum-time=1s
fi

# Optionally delete journal files completely (risky!)
# rm -rf /var/log/journal/*

# Clear temp
rm -rf /tmp/*
rm -rf /var/tmp/*

# Clear user bash history and caches
for user in $(ls /home); do
    rm -rf "/home/$user/.bash_history"
    rm -rf "/home/$user/.cache/"*
    rm -rf "/home/$user/.local/share/"*
done

# Clear root history
[ -f /root/.bash_history ] && truncate -s 0 /root/.bash_history

# Drop caches (optional)
sync; echo 3 > /proc/sys/vm/drop_caches

```

---

#### _Enable On Boot / Profile Switch & Shutdown_

#### On boot:
##### Create a systemd service /etc/systemd/system/subrosa-wipeboot.service:

```bash
[Unit]
Description=Subrosa Boot-Time Wipe
Before=multi-user.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/subrosa_wipe

[Install]
WantedBy=multi-user.target
```

---

#### Enable it:

```bash
systemctl enable subrosa-wipeboot
```

---

#### On shutdown:

```bash
cp /etc/systemd/system/subrosa-wipeboot.service \
/etc/systemd/system/subrosa-wipeshutdown.service
sed -i 's/Boot-Time Wipe/Shutdown-Time Wipe/' \
/etc/systemd/system/subrosa-wipeshutdown.service
sed -i 's/Before=multi-user.target/Before=shutdown.target/' \
/etc/systemd/system/subrosa-wipeshutdown.service
```

#### Then:

```bash
systemctl enable subrosa-wipeshutdown
```

---

#### On user switch or login:

>`Edit /etc/profile or create /etc/profile.d/subrosa_login.sh:`

```bash
#!/bin/bash
/usr/local/bin/subrosa_wipe
```

#### Make it executable:

```bash
chmod +x /etc/profile.d/subrosa_login.sh
```

---