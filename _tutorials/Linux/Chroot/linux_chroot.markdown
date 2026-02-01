---
layout: page
title: Chroot & Sandbox Hardening
published: 2026-01-31
description: Implement system isolation techniques with chroot and sandbox environments to protect critical applications.
permalink: /tutorials/Linux/Chroot/scripts
category: linux
subcategory: Chroot
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

# Chroot & Sandbox Hardening on Arch Linux

This guide demonstrates how to isolate applications in a secure sandbox environment using **Bubblewrap (bwrap)**. The sandbox provides process, filesystem, and user namespace isolation, allowing you to safely test or run programs without affecting the host system.

---

## 1. Install required packages

```bash
sudo pacman -Syu bubblewrap firejail apparmor
```

---

# 2. Prepare the sandbox user and home directory

# Create a dedicated user for sandboxing (if not existing)
sudo useradd -m sandbox

# Create a secure home directory for the sandbox
sudo mkdir -p /home/sandbox
sudo chown sandbox:sandbox /home/sandbox
sudo chmod 700 /home/sandbox

``This ensures the sandboxed environment has a proper home directory and UID/GID mapping.``

---

# 3. Create the sandbox environment

```bash
bwrap \
  --bind /srv/chroot/app / \
  --ro-bind /etc/passwd /etc/passwd \
  --ro-bind /etc/group /etc/group \
  --bind /home/sandbox /home/sandbox \
  --dev /dev \
  --proc /proc \
  --unshare-all \
  --unshare-user \
  --uid 1000 --gid 1000 \
  --ro-bind /usr /usr \
  --ro-bind /lib /lib \
  --tmpfs /tmp \
  --tmpfs /run \
  --die-with-parent \
  --clearenv \
  --setenv HOME /home/sandbox \
  --setenv USER sandbox \
  --setenv LOGNAME sandbox \
  --setenv PATH /usr/bin \
  --setenv TERM xterm-256color \
  /bin/bash
```

---

# Explanation:

    --bind /srv/chroot/app /: Mounts your chroot application directory as root inside the sandbox.
    --ro-bind /etc/passwd /etc/passwd and --ro-bind /etc/group /etc/group: Allow UID/GID mapping so the username shows properly.
    --bind /home/sandbox /home/sandbox: Provides a writable home directory.
    --dev /dev and --proc /proc: Give minimal device/proc access.
    --unshare-all --unshare-user --uid 1000 --gid 1000: Isolate namespaces and run as unprivileged user.
    --ro-bind /usr /usr and --ro-bind /lib /lib: Provide necessary binaries and libraries read-only.
    --tmpfs /tmp --tmpfs /run: Use ephemeral writable tmp directories.
    --clearenv and --setenv ...: Reset environment variables for security and usability.
    /bin/bash: Start a bash shell inside the sandbox.

---

<style>
  footer {
    display: none;
  }
</style>