---
layout: page
title: ParrotOS Build Scripts
published: 2025-09-22
description: "Build Scripts, ParrotOS"
permalink: /tutorials/OPI3Zero/ParrotOS
category: opi3zero
subcategory: ParrotOS
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

<h2>Step 1:</h2>
```bash
chmod +x *.sh
```

<h2>Step 2:</h2>
```bash
./parrotos_install.sh
```

<h2>Step 3:</h2>
```bash
./parrotos_defaults.sh
```
---

<h2>Source Code:</h2>

>
<h1 class="hH1" data-text="ParrotOS Install">parrotos_install.sh</h1>

```bash
#!/bin/bash
# aMiscreant
# ToDo
# export DEBIAN_FRONTEND=noninteractive
# set apt-get install/upgrade variable
# sudo DEBIAN_FRONTEND=noninteractive apt-get -y \
#    -o Dpkg::Options::="--force-confnew" \
#    -o Dpkg::Options::="--force-confdef" install <packages>

set -e

PARROT_LINK="https://deb.parrot.sh/parrot/pool/main/p/parrot-archive-keyring/parrot-archive-keyring_2024.12_all.deb"
PARROT_DEB="parrot-archive-keyring_2024.12_all.deb"

# Step 1: Install keyring
if [ ! -f "$PARROT_DEB" ]; then
  echo "[*] Downloading Parrot Keyring..."
  wget "$PARROT_LINK"
fi

if ! dpkg -s parrot-archive-keyring >/dev/null 2>&1; then
  echo "[*] Installing Parrot Keyring..."
  sudo dpkg -i "$PARROT_DEB"
  sleep 1
else
  echo "[=] Parrot Keyring already installed"
fi

# Clean up
[ -f "$PARROT_DEB" ] && rm -f "$PARROT_DEB"

# Step 2: Clean Debian repos
echo "[*] Removing Debian repository entries..."
sudo sed -i '/debian/d' /etc/apt/sources.list || true
if [ -d /etc/apt/sources.list.d ]; then
    sudo rm -f /etc/apt/sources.list.d/debian.list 2>/dev/null || true
    sudo rm -f /etc/apt/sources.list.d/debian.sources 2>/dev/null || true
    # Also purge any lines mentioning "debian"
    for f in /etc/apt/sources.list.d/*; do
        sudo sed -i '/debian/d' "$f" 2>/dev/null || true
    done
fi

# Step 3: Add Parrot OS repo
sudo tee /etc/apt/sources.list.d/parrot.list > /dev/null <<EOF
deb https://deb.parrot.sh/parrot lory main contrib non-free non-free-firmware
deb https://deb.parrot.sh/parrot lory-security main contrib non-free non-free-firmware
deb https://deb.parrot.sh/parrot lory-backports main contrib non-free non-free-firmware
#deb-src https://deb.parrot.sh/parrot lory main contrib non-free non-free-firmware
#deb-src https://deb.parrot.sh/parrot lory-security main contrib non-free non-free-firmware
#deb-src https://deb.parrot.sh/parrot lory-backports main contrib non-free non-free-firmware
EOF


# Step 4: Clean
echo "[*] Cleaning apt-get sources..."
# Clean out old lists
sudo apt clean          # removes downloaded .deb files
sudo rm -rf /var/lib/apt/lists/*   # removes old repo indexes

# Step 5: Update + upgrade
echo "[*] Updating package lists..."
sudo apt-get update

echo "[*] Performing Upgrade (this will take a while)..."
sudo apt-get upgrade -y

# Step 6: Clean-up
echo "[*] Cleaning up..."
sudo apt-get autoremove -y

echo "[+] Conversion complete! You are now on ParrotOS lory (reboot recommended)."
echo "[*] Please run ./parrotos_defaults.sh after rebooting"
sleep 2
sudo reboot
```

### parrotos_defaults.sh
```bash
#!/bin/bash
# aMiscreant

set -e

NEW_HOSTNAME="parrot"

# Stage 1:
echo "[*] Installing ParrotOS..."
sudo apt-get install -y parrot-interface parrot-core parrot-zsh-profiles parrot-updater bash-completion parrot-tools-full parrot-themes parrot-interface-home parrot-firefox-profiles

# Stage 2:
echo "[*] Changing hostname..."

sudo hostnamectl set-hostname "$NEW_HOSTNAME"
echo "[+] Hostname changed to $NEW_HOSTNAME"

sudo hostnamectl set-hostname parrot
sudo sed -i "s/\borange[^[:space:]]*/parrot/g" /etc/hosts

bash && clear

# Stage 3:
echo "[*] Fixing missing packages.."
sudo apt-get update && sudo apt-get update --fix-missing && sudo apt-get upgrade -y

# Step 4:
# ToDo
# not sure why parrot-tools-full/parrot-tools* doesn't install any tools?... docs.parrotsec.org ...
# ERROR 'parrot-privacy' has no installation ... 'parrot-meta-sdr' 'xplico' 'rocket' 'sslyze' \
# 'convoc2' 'powershell' 'shellter' 'cmospwd' 'pack' 'rainbowcrack' 'king-phisher' 'eyewitness' \
# 'edb-debugger' 'firmware-mod-kit' 'gosh' 'wpscan' 'bluelog' 'blueranger' bluesnarfer'
#
echo "[*] Installing ParrotOS Tools"
sudo apt-get install zsh-autocomplete zsh-syntax-highlighting zsh-autosuggestions \
  parrot-tools-infogathering parrot-tools-vuln parrot-tools-web parrot-tools-pwn \
  parrot-tools-maintain parrot-tools-postexploit parrot-tools-password \
  parrot-tools-wireless parrot-tools-sniff parrot-tools-forensics parrot-tools-automotive \
  parrot-tools-reversing parrot-tools-reporting parrot-meta-crypto parrot-tools-full anonsurf \
  qttranslations5-l10n libqt5svg5 qt5-gtk-platformtheme qtwayland5 gpa sirikali gocryptfs cryfs encryptpad can-utils \
  gscanbus scantool ow-tools ow-shell afflib-tools dumpzilla extundelete rifiuti ewf-tools cabextract autopsy binwalk sleuthkit \
  dc3dd dcfldd ddrescue dex2jar foremost galleta gtkhash guymager hashdeep magicrescue missidentify pasco pdf-parser pdfid pev \
  recoverjpeg reglookup regripper rifiuti2 safecopy scalpel scrounge-ntfs vinetto inetsim forensic-artifacts gpp-decrypt yara \
  arp-scan 0trace amap arping braa thc-ipv6 dmitry dnsenum dnsmap enum4linux etherape gobuster hping3 ike-scan intrace irpas \
  lbd maltego masscan nbtscan netdiscover nmap onesixtyone p0f recon-ng smbclient smbmap smtp-user-enum snmpcheck ssldump sslh \
  sslscan swaks theharvester unicornscan ismtp python3-shodan emailharvester instaloader inspy sherlock nmapsi4 backdoor-factory dbd \
  dns2tcp evil-winrm hyperion iodine laudanum ncat-w32 nishang powercat powershell-empire starkiller proxychains proxytunnel ptunnel \
  pwnat sbd sliver socat stunnel4 udptunnel webacoo webshells weevely windows-binaries brutespray cewl changeme chntpw crackle crunch \
  fcrackzip hashcat hashid hydra john johnny medusa ophcrack-cli ophcrack pdfcrack pipal pixiewps rcracki-mt rsmangler samdump2 sipcrack \
  sucrack thc-pptp-bruter truecrack twofi wordlists device-pharmer statsprocessor mimikatz powersploit wce xspy lynis \
  linux-exploit-suggester armitage beef-xss commix jsql-injection mdbtools metasploit-framework oscanner pompem set shellnoob sidguesser \
  sqldict sqlitebrowser sqlmap sqlninja sqlsus websploit unicorn-magic kerberoast netexec ghidra javasnoop rizin rizin-cutter smali \
  bettercap chaosreader darkstat dnschef dsniff sniffjoke tcpflow driftnet ettercap-graphical fiked hamster-sidejack hexinject \
  isr-evilgrade mitmproxy netsniff-ng rebind responder sslsniff sslsplit tcpreplay wifi-honey wireshark yersinia afl doona dhcpig \
  enumiax iaxflood inviteflood ohrwurm protos-sip rtpbreak rtpflood rtpinsertsound rtpmixsound sipp slowhttptest spike sipvicious \
  thc-ssl-dos unix-privesc-check voiphopper siparmyknife sctpscan cisco-ocs cisco-torch copy-router-config burpsuite caido davtest \
  dirb dirbuster ffuf nikto padbuster skipfish whatweb xsser zaproxy wafw00f parsero aircrack-ng airgeddon asleap \
  btscanner bluez-hcidump bully cowpatty eapmd5pass fern-wifi-cracker hackrf inspectrum mdk3 mfcuk mfoc mfterm libfreefare-bin \
  libnfc-bin reaver redfang rfcat rtlsdr-scanner ubertooth wifite gnunet-gtk gnunet onionshare connect-proxy bleachbit \
  snowflake-client obfs4proxy firewalld socat apparmor-utils nyx torsocks

# Stage 5:
echo "[*] Fixing missing packages.."
sudo apt-get update && sudo apt-get update --fix-missing && sudo apt-get upgrade -y

# Stage 6:
echo "[*] Cleaning up..."
sudo apt-get autoremove -y

# Stage 7:
echo "[*] Rebooting, Applying updates..."
sleep 3
reboot
```

---

<style>
  footer {
    display: none;
  }
</style>