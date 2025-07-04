---
layout: page
title: 🔐 User Hardening Scripts
date: 2025-5-29
description: Secure your system by implementing strict user management policies, including sudoer privileges and account lockdowns. These scripts make user hardening efficient and automated.
permalink: /tutorials/Linux/HardeningScripts/scripts
category: linux
subcategory: HardeningScripts
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

#### SSH Hardening Script

>`A bash script to automate hardening of SSH server and client configurations. Disables root login, enforces key-based authentication, restricts forwarding, and sets strict connection parameters for enhanced security.`

```bash
#!/bin/bash
echo "[+] Hardening SSH configuration..."

# Backup
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
cp /etc/ssh/ssh_config /etc/ssh/ssh_config.bak

# Harden sshd_config (incoming)
cat > /etc/ssh/sshd_config << 'EOF'
# Core hardening
Port 22
AddressFamily inet4
ListenAddress 127.0.0.1
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes
AllowAgentForwarding no
AllowTcpForwarding no
X11Forwarding no
PrintMotd no
ClientAliveInterval 300
ClientAliveCountMax 0
LoginGraceTime 30
MaxAuthTries 3
MaxSessions 1
MaxStartups 2:30:10

# Authentication via public key only
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys

# Logging and auditing
LogLevel VERBOSE
SyslogFacility AUTH

# Disable SFTP if not needed
Subsystem sftp /bin/false

# Optional: Allow specific user
# AllowUsers admin@127.0.0.1
EOF
echo "[+] sshd_config hardened"

# Harden ssh_config (outgoing)
cat > /etc/ssh/ssh_config << 'EOF'
Host *
    ForwardAgent no
    ForwardX11 no
    PasswordAuthentication no
    ChallengeResponseAuthentication no
    GSSAPIAuthentication no
    ServerAliveInterval 30
    ServerAliveCountMax 3
    StrictHostKeyChecking ask
    UserKnownHostsFile ~/.ssh/known_hosts
    LogLevel QUIET
EOF
echo "[+] ssh_config hardened"

echo "[+] SSH hardening complete."

```

---

#### User Account Policy Hardening

>`Automates hardening of user account defaults by securing /etc/adduser.conf, /etc/login.defs, and default skeleton files. Enforces secure umask, directory permissions, strong password policies, and login configurations to improve baseline system security.`

```bash
#!/bin/bash

set -e

# Backup originals
cp /etc/adduser.conf /etc/adduser.conf.bak
cp /etc/login.defs /etc/login.defs.bak

echo "[*] Hardening /etc/adduser.conf..."

# Ensure UMASK and DIR_MODE are secure
sed -i 's/^UMASK.*/UMASK 077/' /etc/adduser.conf
sed -i 's/^DIR_MODE.*/DIR_MODE=0700/' /etc/adduser.conf

# If not present, add it
grep -q '^UMASK' /etc/adduser.conf || echo "UMASK 077" >> /etc/adduser.conf
grep -q '^DIR_MODE' /etc/adduser.conf || echo "DIR_MODE=0700" >> /etc/adduser.conf

echo "[*] Hardening /etc/login.defs..."

# Apply secure login.defs settings
sed -i 's/^PASS_MIN_LEN.*/PASS_MIN_LEN 10/' /etc/login.defs
sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS 90/' /etc/login.defs
sed -i 's/^PASS_MIN_DAYS.*/PASS_MIN_DAYS 1/' /etc/login.defs
sed -i 's/^PASS_WARN_AGE.*/PASS_WARN_AGE 7/' /etc/login.defs
sed -i 's/^ENCRYPT_METHOD.*/ENCRYPT_METHOD SHA512/' /etc/login.defs
sed -i 's/^UID_MIN.*/UID_MIN 1000/' /etc/login.defs
sed -i 's/^UID_MAX.*/UID_MAX 60000/' /etc/login.defs
sed -i 's/^CREATE_HOME.*/CREATE_HOME yes/' /etc/login.defs
sed -i 's/^CHFN_RESTRICT.*/CHFN_RESTRICT rwh/' /etc/login.defs

# Add missing lines if needed
grep -q '^PASS_MIN_LEN' /etc/login.defs || echo "PASS_MIN_LEN 10" >> /etc/login.defs
grep -q '^PASS_MAX_DAYS' /etc/login.defs || echo "PASS_MAX_DAYS 90" >> /etc/login.defs
grep -q '^PASS_MIN_DAYS' /etc/login.defs || echo "PASS_MIN_DAYS 1" >> /etc/login.defs
grep -q '^PASS_WARN_AGE' /etc/login.defs || echo "PASS_WARN_AGE 7" >> /etc/login.defs
grep -q '^ENCRYPT_METHOD' /etc/login.defs || echo "ENCRYPT_METHOD SHA512" >> /etc/login.defs
grep -q '^LOGIN_RETRIES' /etc/login.defs || echo "LOGIN_RETRIES 3" >> /etc/login.defs
grep -q '^LOGIN_TIMEOUT' /etc/login.defs || echo "LOGIN_TIMEOUT 60" >> /etc/login.defs
grep -q '^UID_MIN' /etc/login.defs || echo "UID_MIN 1000" >> /etc/login.defs
grep -q '^UID_MAX' /etc/login.defs || echo "UID_MAX 60000" >> /etc/login.defs
grep -q '^CREATE_HOME' /etc/login.defs || echo "CREATE_HOME yes" >> /etc/login.defs
grep -q '^CHFN_RESTRICT' /etc/login.defs || echo "CHFN_RESTRICT rwh" >> /etc/login.defs

echo "[*] Hardening /etc/skel..."

chmod -R go-rwx /etc/skel
find /etc/skel -type f -exec chmod 600 {} \;
find /etc/skel -type d -exec chmod 700 {} \;

echo "[*] Done. System user account policies hardened securely."

```
---

#### /etc/security Hardening Script

>`Secures system-wide limits and access controls under /etc/security. Sets strict user resource limits, configures PAM access controls, restricts remote logins to local admins, and enforces strong password quality requirements.`

```bash
#!/bin/bash
echo "[+] Hardening /etc/security..."

# Backup original files
cp /etc/security/limits.conf /etc/security/limits.conf.bak
cp /etc/security/access.conf /etc/security/access.conf.bak
cp /etc/security/pwquality.conf /etc/security/pwquality.conf.bak 2>/dev/null

# Harden limits.conf
cat > /etc/security/limits.conf << 'EOF'
*       hard    core    0
*       hard    rss     50000
*       hard    nproc   150
*       hard    nofile  1024
*       soft    nofile  512
EOF
echo "[+] limits.conf hardened"

# Restrict login access to local admin
cat > /etc/security/access.conf << 'EOF'
-:ALL:ALL
+:admin:LOCAL
EOF
echo "[+] access.conf hardened (admin local only)"

# Enable PAM access control
for f in /etc/pam.d/login /etc/pam.d/sshd; do
    grep -q "pam_access.so" $f || echo "account required pam_access.so" >> $f
done
echo "[+] PAM access control enabled"

# Set password quality policy
cat > /etc/security/pwquality.conf << 'EOF'
minlen = 12
dcredit = -1
ucredit = -1
lcredit = -1
ocredit = -1
retry = 3
EOF
echo "[+] pwquality.conf hardened"

echo "[+] /etc/security hardening complete."

```
---

#### PAM Configuration Hardening

>`Automates hardening of PAM (Pluggable Authentication Modules) configurations to enforce password complexity, account lockouts, password expiry, session timeouts, and secure SSH authentication practices. Improves system resilience against unauthorized access and brute-force attacks.`

```bash
#!/bin/bash

set -e

echo "[*] Hardening PAM Configuration..."

# Backup PAM configs
cp /etc/pam.d/common-auth /etc/pam.d/common-auth.bak
cp /etc/pam.d/common-password /etc/pam.d/common-password.bak
cp /etc/pam.d/common-session /etc/pam.d/common-session.bak
cp /etc/pam.d/common-account /etc/pam.d/common-account.bak

# 1. Enforce password complexity (Minimum 8 chars, with digits, lowercase, uppercase, special characters)
echo "[*] Enforcing password complexity..."
echo "password requisite pam_pwquality.so retry=3 minlen=10 minclass=4" >> /etc/pam.d/common-password

# 2. Account lockout after 3 failed attempts (5-minute lockout)
echo "[*] Enforcing account lockout after 3 failed attempts..."
echo "auth required pam_tally2.so onerr=fail deny=3 unlock_time=300" >> /etc/pam.d/common-auth

# 3. Enforce password expiry (90 days max)
echo "[*] Enforcing password expiry..."
echo "password requisite pam_unix.so sha512" >> /etc/pam.d/common-password

# 4. Ensure password history (prevents reusing old passwords)
echo "[*] Enforcing password history..."
echo "password sufficient pam_unix.so remember=5" >> /etc/pam.d/common-password

# 5. Restrict root login via SSH (Important for security)
echo "[*] Restricting root login via SSH..."
echo "auth required pam_securetty.so" >> /etc/pam.d/sshd

# 6. Enforce account expiration after 365 days of inactivity
echo "[*] Enforcing account expiration..."
echo "account required pam_unix.so expire=365" >> /etc/pam.d/common-account

# 7. Configure session timeout after 10 minutes of inactivity
echo "[*] Enforcing session timeout..."
echo "session required pam_limits.so" >> /etc/pam.d/common-session

# 8. Ensure root is not allowed to login directly via SSH (disable root login entirely)
echo "[*] Disabling root SSH login..."
sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config

# Restart SSH service to apply changes
systemctl restart sshd

echo "[*] PAM Configuration Hardened!"

# Optionally, you may want to manually verify PAM settings as per your use case.
echo "[*] You can verify changes in the respective PAM files:"
echo "  - /etc/pam.d/common-auth"
echo "  - /etc/pam.d/common-password"
echo "  - /etc/pam.d/common-account"
echo "  - /etc/pam.d/sshd"

```
---

#### System-Wide /etc Hardening

>`Applies a wide range of system hardening measures under /etc. Configures secure defaults for critical files like host.conf, nsswitch.conf, sysctl.conf, deluser.conf, logrotate.conf, and rkhunter.conf. Enforces kernel protections, disables IPv6, tightens logging permissions, and disables unnecessary services or features for enhanced security posture.`

```bash
#!/bin/bash

echo "[+] Hardening /etc configuration..."

# 1. host.conf
cat > /etc/host.conf <<EOF
order hosts,bind
multi on
nospoof on
EOF
echo "[+] /etc/host.conf hardened"

# 2. nsswitch.conf
sed -i 's/^hosts:.*/hosts:          files dns/' /etc/nsswitch.conf
echo "[+] /etc/nsswitch.conf set to prefer files over DNS"

# 3. sysctl.conf
cat >> /etc/sysctl.conf <<'EOF'
# === HARDENING START ===

# Restrict access to kernel pointers and dmesg
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
kernel.sysrq = 0

# Disable core dumps
fs.suid_dumpable = 0

# Harden symlinks and hardlinks
fs.protected_symlinks = 1
fs.protected_hardlinks = 1

# Disable IPv6 if not needed
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1

# Enable IP spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Disable ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.all.send_redirects = 0

# Ignore broadcast pings
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Enable SYN cookies (prevent SYN flood attacks)
net.ipv4.tcp_syncookies = 1

# Disable IP forwarding
net.ipv4.ip_forward = 0

# Disable source routed packets
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
# === HARDENING END ===
EOF

sysctl -p
echo "[+] sysctl hardened and applied"

# 4. deluser.conf
sed -i 's/^#\?REMOVE_HOME.*/REMOVE_HOME = yes/' /etc/deluser.conf
sed -i 's/^#\?REMOVE_ALL_FILES.*/REMOVE_ALL_FILES = yes/' /etc/deluser.conf
echo "[+] /etc/deluser.conf set to remove home and files on user deletion"

# 5. logrotate.conf
sed -i 's/^create .*/create 0600 root root/' /etc/logrotate.conf
grep -q compress /etc/logrotate.conf || echo "compress" >> /etc/logrotate.conf
echo "[+] /etc/logrotate.conf permissions tightened and compression enabled"

# 6. rkhunter.conf
sed -i 's/^#\?ALLOW_SSH_ROOT_USER=.*/ALLOW_SSH_ROOT_USER=no/' /etc/rkhunter.conf
sed -i 's/^#\?MAIL-ON-WARNING=.*/MAIL-ON-WARNING=root/' /etc/rkhunter.conf
sed -i 's/^#\?ENABLE_TESTS=.*/ENABLE_TESTS=ALL/' /etc/rkhunter.conf
echo "[+] /etc/rkhunter.conf security checks expanded"

# 7. sudo.conf
# Optional: Check for plugin entries and warn
if grep -qE '^Plugin\s' /etc/sudo.conf; then
  echo "[!] Warning: /etc/sudo.conf contains Plugin entries. Review them for risk."
fi

# 8. nftables.conf backup
if [ -f /etc/nftables.conf ]; then
  cp /etc/nftables.conf /etc/nftables.conf.bak
  echo "[+] Backed up /etc/nftables.conf"
fi

# 9. Disable sudo_logsrvd if unused
if systemctl is-enabled sudo_logsrvd &>/dev/null; then
  systemctl disable --now sudo_logsrvd
  echo "[+] sudo_logsrvd disabled"
fi

echo "[+] Hardening complete."

```
---

#### System Services and systemd Hardening

>`Disables unnecessary or potentially risky services to reduce system attack surface. Implements safe defaults for systemd, including disabling Ctrl+Alt+Del reboots, and enforces secure logging with volatile, compressed, rate-limited journal storage.`

```bash
#!/bin/bash
echo "[+] Hardening services and systemd settings..."

# Disable potentially unsafe or unneeded services
systemctl disable --now \
    avahi-daemon.socket avahi-daemon.service \
    bluetooth.service \
    cups.service \
    ModemManager.service \
    rpcbind.service \
    ufw.service \
    systemd-timesyncd.service

# Disable Ctrl+Alt+Del reboot combo
ln -sf /dev/null /etc/systemd/system/ctrl-alt-del.target

# Harden journald logs (no persistent logs, rate-limited)
mkdir -p /etc/systemd/journald.conf.d
cat <<EOF > /etc/systemd/journald.conf.d/harden.conf
[Journal]
Storage=volatile
Compress=yes
RateLimitInterval=30s
RateLimitBurst=100
ForwardToSyslog=no
EOF

systemctl daemon-reexec
systemctl restart systemd-journald

echo "[✓] Services hardened and unnecessary ones disabled."

```
---

#### Linux OS Hardening Master Script

>`Central script that orchestrates execution of all individual hardening scripts for securing a Linux system. Sequentially runs multiple specialized scripts covering SSH security, kernel parameters, PAM policies, user account restrictions, /etc configurations, service lockdowns, and general system hardening. Provides a streamlined, repeatable way to apply security best practices across the operating system.`

```bash
#!/bin/bash
echo "[*] Running OS hardening suite..."

for script in \
    ./harden_etc.sh \
    ./harden_security.sh \
    ./harden_ssh.sh \
    ./harden_kernel.sh \
    ./harden_pam.sh \
    ./harden_users.sh \
    ./harden_services.sh; do

    if [ -x "$script" ]; then
        echo "[+] Executing $script"
        "$script"
    else
        echo "[!] Skipping $script (not executable or missing)"
    fi
done

echo "[✓] All hardening scripts completed."

```

---