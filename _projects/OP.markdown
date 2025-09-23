---
layout: page
title: OP Package Manager
published: 2025-09-22
description: "Custom Environment designed for OnePlus 3/3T"
permalink: /projects/OP
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

<div class="post-meta">
  <p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
  <p>{{ page.description }}</p>
</div>

---

# OP Package Manager

![OP-Menu](https://anopik.org/84743075df6bc5aba65675729d8832e11758599498.png)
![OP-Commands](https://anopik.org/39fcee01c2bc714b65b46c0dec19e54b1758599499.png)

---

**OP Package Manager** is a custom package management script designed for **OnePlus 3/3T** devices. It allows you to install, upgrade, preview, and list packages from a GitHub repository, specifically tailored for the OP environment. It also provides easy management of additional configurations, such as `bashrc` modifications for custom package behavior.

This tool works directly from the terminal, ensuring seamless installation of necessary packages, along with special handling for configuration files (e.g., `op-bashrc`), which are appended to `/system/etc/bash/bashrc` to make packages behave as expected.

## Features

- **Install Packages**: Installs a specified version of a package from the repository.
- **Preview Packages**: Allows you to preview package contents before installation.
- **Upgrade Packages**: Upgrades installed packages to a specified version.
- **List Remote Packages**: Lists all available packages and their versions from the GitHub repository.
- **Manage Config Files**: Appends `op-bashrc` contents to `/system/etc/bash/bashrc` if available, ensuring correct behavior for certain packages.

## Installation

### Prerequisites

1. **Root access**: This tool requires root privileges to modify the `/system` partition and certain directories.
2. **OnePlus 3/3T**: This package manager is designed for use with OnePlus 3/3T devices, but can be adapted for other devices with a similar setup.
3. **`curl` and `unzip`**: Ensure that `curl` and `unzip` are installed on your device, as they are required for fetching and extracting packages.
4. **A working shell environment**: The script is intended to be run in a Bash shell or compatible environment.

---

### Setup

1. **Acquire adb shell on OnePlus 3/3T.**
2. **Elevate privileges to root access `su`.**
3. **Download release op.zip, `adb push op.zip /sdcard/Download/`.**
4. **Install op.zip Command: `magisk --install-module op.zip`**
5. **Reboot device.**

---

<style>
  footer {
    display: none;
  }
</style>