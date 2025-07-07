---
layout: page
title: 💻 Secure Web User Management
published: 2025-07-08
date: 2025-5-29
description: Manage web users and deploy secure web operations with these web-specific security tools and services.
permalink: /tutorials/Linux/SecureWebManagement/scripts
category: linux
subcategory: SecureWebManagement
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

#### Basic WebOps User Creation with Minimal Permissions

>`Creates a system user "webops" with no login shell for managing web operations. Secures the /var/www directory with strict ownership and permissions. Grants minimal sudo privileges for common file operations and safe service reloads. Simple and quick setup for small deployments, though it’s less secure than fully compartmentalized approaches.`

---

```bash
#!/bin/bash
# ========================================== #
#    Made by aMiscreant for Miscreants       #
# ========================================== #
# rbash version.
# NOT SUGGESTED

USERNAME="webops"
GROUPNAME="wwwops"
HOMEDIR="/var/www"
SHELL="/usr/sbin/nologin"

# Create group
sudo groupadd --system "$GROUPNAME"

# Create user with locked shell
sudo useradd -r -d "$HOMEDIR" -s "$SHELL" -g "$GROUPNAME" "$USERNAME"

# Secure /var/www directory
sudo chown -R "$USERNAME:$GROUPNAME" "$HOMEDIR"
sudo chmod -R 750 "$HOMEDIR"

# Lock password (optional)
sudo passwd -l "$USERNAME"

# Setup sudoers entry (without chown and chmod)
SUDOERS_FILE="/etc/sudoers.d/$USERNAME"
sudo bash -c "cat > $SUDOERS_FILE" <<EOF
$USERNAME ALL=(ALL) NOPASSWD: /bin/cp, /bin/mv, /bin/rm, /bin/mkdir, \
/usr/bin/nano, /usr/bin/vim, /usr/bin/systemctl reload apache2, \
/usr/bin/systemctl reload nginx
EOF

sudo chmod 440 "$SUDOERS_FILE"

echo "✅ User '$USERNAME' created and secured for web ops."


```
---

#### Hardened WebOps User Provisioning with Safe Service Reloads

>`Sets up a system user "webops" with a locked shell and dedicated group. Enforces strict ownership and permissions on /var/www, preventing unauthorized access. Introduces a separate directory for secure admin scripts, including a controlled reload script for nginx and Apache. Limits sudo access exclusively to this script, greatly reducing potential risk. Recommended for production environments requiring higher security.`

---

```bash
#!/bin/bash
# ========================================== #
#    Made by aMiscreant for Miscreants       #
# ========================================== #

USERNAME="webops"
GROUPNAME="wwwops"
HOMEDIR="/var/www"
SHELL="/usr/sbin/nologin"  # NO shell access

# Create system group
sudo groupadd --system "$GROUPNAME"

# Create system user with no login shell
sudo useradd -r -d "$HOMEDIR" -s "$SHELL" -g "$GROUPNAME" "$USERNAME"

# Set strict ownership and permissions on /var/www
sudo mkdir -p "$HOMEDIR"
sudo chown -R "$USERNAME:$GROUPNAME" "$HOMEDIR"
sudo chmod -R 750 "$HOMEDIR"

# Lock the user password so it can't be used interactively
sudo passwd -l "$USERNAME"

# Create safe sudo scripts directory
SCRIPTDIR="/usr/local/sbin/webops"
sudo mkdir -p "$SCRIPTDIR"
sudo chown root:root "$SCRIPTDIR"
sudo chmod 750 "$SCRIPTDIR"

# Create safe reload script
sudo tee "$SCRIPTDIR/reload_web.sh" > /dev/null <<'EOF'
#!/bin/bash
# Safely reload nginx or apache2

case "$1" in
    nginx)
        /usr/bin/systemctl reload nginx
        ;;
    apache2)
        /usr/bin/systemctl reload apache2
        ;;
    *)
        echo "Usage: $0 [nginx|apache2]"
        exit 1
        ;;
esac
EOF

sudo chmod 750 "$SCRIPTDIR/reload_web.sh"
sudo chown root:root "$SCRIPTDIR/reload_web.sh"

# Setup minimal sudoers file for webops
SUDOERS_FILE="/etc/sudoers.d/$USERNAME"
sudo tee "$SUDOERS_FILE" > /dev/null <<EOF
$USERNAME ALL=(ALL) NOPASSWD: $SCRIPTDIR/reload_web.sh
EOF

sudo chmod 440 "$SUDOERS_FILE"

echo "✅ Hardened user '$USERNAME' created for safe /var/www operations."


```
---

#### Automated Web Deployment and Permissions Reset

>`Performs automated updates for a web application by pulling changes from Git into /var/www. After updates, it resets ownership and permissions to ensure files remain locked down under the webops user and group. Maintains an update log to track deployment times. Simple and efficient tool for maintaining secure and traceable deployments.`

---

```bash
#!/bin/bash
# ========================================== #
#    Made by aMiscreant for Miscreants       #
# ========================================== #
# Path to your web root (this should be inside /var/www)
WEB_ROOT="/var/www"

# Example: Pull updates from Git
cd "$WEB_ROOT" || exit 1
git pull origin main

# Example: Change permissions for new files (if applicable)
chown -R webops:wwwops "$WEB_ROOT"
chmod -R 750 "$WEB_ROOT"

# Log update time
echo "Site update completed on $(date)" >> "$WEB_ROOT/update.log"

```
---

#### Systemd Service for Secure Automated Web Updates

>`Defines a systemd one-shot service that runs the safe_site_update.sh script as the non-privileged "webops" user. Implements strong sandboxing measures such as private /tmp, device isolation, read-only filesystem restrictions, and limited writable paths. Ensures web deployments are executed securely and predictably without manual intervention.`

---

```bash
[Unit]
Description=Safe Site Update for WebOps User
After=network.target

[Service]
Type=oneshot
User=webops
Group=wwwops
WorkingDirectory=/var/www
ExecStart=/usr/local/sbin/webops/safe_site_update.sh
Environment="PATH=/usr/bin:/bin"  # Minimal PATH
Environment="HOME=/var/www"       # Web root as the home directory

# Restrict access to system directories
NoNewPrivileges=true
PrivateTmp=true
PrivateDevices=true
ProtectSystem=full
ProtectHome=yes
ReadOnlyPaths=/ /etc /usr /bin /lib /libexec
ReadWritePaths=/var/www
RestrictAddressFamilies=AF_INET AF_INET6

[Install]
WantedBy=multi-user.target

```

---

#### Safe Automated Website Update Script

>`Automates pulling the latest code changes into /var/www from a Git repository. Resets ownership and file permissions after updates to maintain security boundaries enforced for the webops user. Logs each update’s timestamp for auditing. Designed to be run by the safe_site_update.service for reliable, minimal-risk deployments.`

---

```bash
#!/bin/bash
# ========================================== #
#    Made by aMiscreant for Miscreants       #
# ========================================== #

# Path to your web root (this should be inside /var/www)
WEB_ROOT="/var/www"

# Example: Pull updates from Git
cd "$WEB_ROOT" || exit 1
git pull origin main

# Example: Change permissions for new files (if applicable)
chown -R webops:wwwops "$WEB_ROOT"
chmod -R 750 "$WEB_ROOT"

# Log update time
echo "Site update completed on $(date)" >> "$WEB_ROOT/update.log"

```
---

## 🔐 Best Security Practices for webops and Similar Users

#### When managing web deployments, a specialized system user like webops is a powerful way to separate responsibilities and reduce risk. Below are battle-tested security practices for deploying, managing, and protecting your website infrastructure.

---

#### 1. User & Group Design

#### ✅ Use a System User

>`Create webops as a system account (no login shell, no password):`

```bash
sudo useradd -r -d /var/www -s /usr/sbin/nologin webops
```

#### ✅ Dedicated Group

>`Group ownership isolates permissions:`

```bash
sudo groupadd --system wwwops
```

#### ✅ Avoid Full Sudo

>`Never give webops unrestricted sudo.`
> 
>`Allow only specific binaries via a dedicated sudoers file:`
> 
>`/etc/sudoers.d/webops`

#### ✅ Consider ACLs for Granular Access

>`Use POSIX ACLs if webops needs precise permissions:`
> 
>`setfacl -m u:webops:rx /var/www/myapp`

---

#### 2. Filesystem Permissions

#### ✅ Lock Down Directories

>`Restrict access:`
> 
```bash
chmod -R 750 /var/www
chown -R webops:wwwops /var/www
```

#### ✅ Sticky Bit for Shared Uploads

>`Prevent users from deleting each other’s files in shared directories:`

```bash
chmod +t /var/www/myapp/uploads
```

#### ✅ Secure Mount Options

>`Consider:`

>`nosuid,nodev,noexec`
> 
>`Example /etc/fstab entry:`

>`UUID=... /var/www ext4 defaults,nosuid,nodev,noexec 0 2`

---

#### 3. Restrict Shell & Execution

#### ✅ Disable Login Shell

>`Use:`
>`/usr/sbin/nologin`

>`or`
> 
>`/bin/false`

#### ✅ Sandbox with Systemd

>`Use advanced protections like:`
> 
>`ProtectSystem=full`
> 
>`NoNewPrivileges=true`
> 
>`PrivateTmp=yes`

#### ✅ Limit PATH

>`Restrict what executables are visible via:`
>`Systemd’s Environment="PATH=...".`
>`Shell wrappers.`

#### ✅ Use AppArmor or SELinux

>`Profile webops with AppArmor or SELinux to control file access, process capabilities, and network usage.`

---

#### 4. Web Server Isolation

#### ✅ Separation of Duties

>`The web server (e.g. www-data) should serve content.`
>`webops deploys content but should not run the web server.`

#### ✅ Disable Directory Listings

#### _Apache:_
>`Options -Indexes`


---

#### _Nginx:_

>`autoindex off;`

#### ✅ Limit PHP/CGI Execution

>`Allow execution only in specific, trusted locations.`

#### ✅ Consider Chroot

>`For high-security setups, serve websites from a chroot jail like /var/www-chroot.`

#### ✅ Disable Unused Modules

>`Example:`
> 
>`Disable mod_php in Apache if unused.`
> 
>`Build Nginx with only required modules.`

---

#### 5. Audit & Monitoring

#### ✅ Review Sudoers Regularly

>`Check /etc/sudoers.d/webops for risky commands like:`
> 
>`chmod`
> 
>`chown`
> 
>`shells like bash or sh`


#### ✅ Use File Integrity Monitoring

##### _Tools:_

>`AIDE`
> 
>`Tripwire`
> 
>`fswatch`


#### ✅ Enable Logging

>`Use auditd to track:`

>`File changes`
> 
>`Sudo activity`
> 
>`Unexpected processes`


#### ✅ Log All Access Attempts

>`Even if webops has no shell, log:`
> 
>`Systemd job executions`
> 
>`Any indirect command usage`

---

####  6. Secure Deployment Processes

#### ✅ No World-Writable Files

>`Find and remove:`
> 
>`find /var/www -perm -o=w`

---

#### ✅ Avoid Sensitive Files in Deployments

>`Exclude:`
> 
>`.env`
> 
>`.git/`
> 
>`backups`
> 
>`Use .gitignore.`


#### ✅ Automate Deployments

>`Avoid direct manual pulls by webops.`
> 
>`Prefer CI/CD pipelines that deploy securely.`



#### ✅ Use Staging

>`Never deploy directly to production.`
> 
>`Test in a locked-down staging environment first.`



#### 7. Advanced Sandboxing (Optional)

#### ✅ Firejail

>`Wrap commands like git in lightweight sandboxes:`
> 
>`firejail git pull origin main`

---

#### ✅ Bubblewrap (bwrap)

>`Container-like sandbox for deploy scripts.`

---

#### ✅ Run Updates in Ephemeral Containers

>`Use:`

>`systemd-nspawn`
> 
>`Docker with --rm`

---

#### 8. Secrets & Cryptography

#### ✅ No Hardcoded Secrets

>`Store secrets in:`

>`environment files readable only by root`
> 
>`or CI/CD secrets managers`

---

#### ✅ Encrypt Sensitive Data

>`Use GPG or age:`

>`/var/www/secure/`
> 
>`Decrypt only during deploys.`


---

#### ✅ Minimize SSH Keys

>`If webops uses SSH:`

>`Use forced commands via authorized_keys.`
> 
>`Never allow unrestricted shell access.`
        
 
---

| Category         | Setting/Practice                     |
| ---------------- | ------------------------------------ |
| User shell       | /usr/sbin/nologin                    |
| Permissions      | 750 + strict group ownership         |
| Systemd          | Use sandboxing for all deployments   |
| Filesystem       | nosuid, nodev, noexec for /var/www   |
| Sudo             | Whitelist only — never allow shells  |
| Auditing         | auditd, auth logs, systemd logs      |
| Monitoring       | Watch for new files, script changes  |
| Deployments      | Use CI/CD or systemd-run deployments |
| AppArmor/SELinux | Strong profiles for webops           |

---


#### ✅ Summary

>`By enforcing these practices, you ensure that:`

>`webops cannot accidentally damage the system.`
>`The web server and deploy processes stay isolated.`
>`Secrets remain secure.`
>`Attacks are contained and visible.`

---