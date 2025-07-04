---
layout: page
title: 💻 Setting Up USB Extroot on OpenWrt
date: 2025-5-28
description: OpenWrt’s root filesystem onto a USB stick using Extroot
permalink: /tutorials/OpenWrt/external_usb
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
<script src="{{ 'assets/js/copy-to-clipboard.js' | relative_url }}"></script>


---

<p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
<p>{{ page.description }}</p>

---

#### 🛠️ Steps to Configure USB Extroot

##### 1. Install Required Packages

>`First, ensure your OpenWrt system has the required packages:`

```bash
opkg update
opkg install block-mount kmod-usb-storage kmod-fs-ext4 e2fsprogs kmod-scsi-core mount-utils
```

>`Note:`
>`If you plan to use FAT or NTFS instead of ext4, install:`

```bash
opkg install kmod-fs-vfat kmod-fs-ntfs
```

>`However, ext4 is strongly recommended for Linux-based systems like OpenWrt.`

---

#### 2. Prepare Your USB Drive

>`Format your USB stick as ext4:`

# Replace /dev/sda with your actual device

```bash
mkfs.ext4 /dev/sda
```

>`Label it (optional but helpful):`
> 
>`e2label /dev/sda extroot`
> 
>`Mount it to verify:`

```bash
mkdir -p /mnt/usb
mount /dev/sda /mnt/usb
```

>`Check contents:`

```bash
ls /mnt/usb
```

>`If all looks good, unmount it:`

```bash
umount /mnt/usb
```

---

#### 3. Copy the Root Filesystem

>`Detect your block devices and update fstab:`

```bash
block detect > /etc/config/fstab
```

>`Mount your USB stick temporarily:`

```bash
mkdir -p /mnt/extroot
mount /dev/sda /mnt/extroot
```

>`Copy your overlay filesystem to the USB stick:`

```bash
tar -C /overlay -cvf - . | tar -C /mnt/extroot -xvf -
```

>`Unmount it:`

```bash
umount /mnt/extroot
```

---

#### 4. Configure /etc/config/fstab

>`Edit the fstab file:`

```bash
vi /etc/config/fstab
```

>`Locate the section corresponding to your USB device. Update it so it looks similar to this:`

```bash
config mount
    option target '/overlay'
    option uuid '6a8bf7ef-a69f-4c35-a27d-18aa17f30381'
    option fstype 'ext4'
    option enabled '1'
    option enabled_fsck '1'
```

##### ✅ How to find your UUID:

>`block info`
> 
>`Look for a line like:`
> 
>`/dev/sda1: UUID="6a8bf7ef-a69f-4c35-a27d-18aa17f30381" ...`
> 
>`Replace the UUID in your fstab config with your actual UUID.`

---

#### 5. Enable Extroot Support

>`Run the following commands to enable and start the mount services:`

```bash
block detect > /etc/config/fstab
/etc/init.d/fstab enable
/etc/init.d/fstab start
```

---

#### 6. Reboot and Verify

>`Reboot your router:`
> 
>`reboot`
> 
>`After reboot, check that your USB stick is mounted as the new root filesystem:`
> 
>`df -h`

- **Look for /overlay showing the size of your USB stick rather than the small internal flash.
Optional: LuCI Web Interface**

>`Go to System → Mount Points in LuCI.`
> 
>`Find your extroot mount.`
> 
>`Check Enable and Save & Apply.`
> 
>`Reboot again.`

- **Verify using LuCI → Status → Overview or df -h to confirm the overlay is mounted from USB.**

---

##### ✅ Why Extroot?

>`Avoid running out of space on small routers.`
> 
>`Store large logs or data without risk of filling flash.`
> 
>`Install bigger packages (e.g. VPNs, network tools).`

>`This makes your OpenWrt install far more powerful!`
