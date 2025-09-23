---
layout: page
title: Code Farm
published: 2025-09-22
description: "How To Setup a Code Farm (Ollama)"
permalink: /tutorials/CodeFarm/setup
category: codefarm
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

<div class="post-meta">
  <p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
  <p>{{ page.description }}</p>
</div>


---

<h1>Code Farm</h1>

- Simple setup to get a Code Farm rolling.

<p>Install Script below provides an ESP template</p>

```bash
#!/usr/bin/env bash
# chmod +x ollama.sh && ./ollama.sh

set -e

echo "[*] Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

echo "[*] Installing Python virtual environment..."
sudo apt update
sudo apt install -y python3 python3-venv python3-pip

# Create project folder
mkdir -p ~/esp-codefarm
cd ~/esp-codefarm

# Setup venv
python3 -m venv venv
source venv/bin/activate

echo "[*] Installing requirements..."
pip install --upgrade pip

# Create script
cat > codefarm.py << 'EOF'
import os
import subprocess
from datetime import datetime

MODEL = "llama3"
OUTPUT_DIR = "generated_code"
ESP_TARGETS = ["Arduino", "ESP-IDF"]
CHIPS = ["ESP32", "ESP8266", "ESP32-C3"]

PROMPT_TEMPLATE = """
Generate {count} different working code examples for {chip} using {framework}.
Task: {task}.
Each example should be complete and compilable.
"""

def generate_code(task="WiFi scanning", count=3):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for chip in CHIPS:
        for framework in ESP_TARGETS:
            prompt = PROMPT_TEMPLATE.format(
                count=count, chip=chip, framework=framework, task=task
            )
            print(f"[+] Requesting {chip} / {framework} code...")
            result = subprocess.run(
                ["ollama", "run", MODEL],
                input=prompt.encode(),
                capture_output=True,
            )
            output = result.stdout.decode().strip()
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{OUTPUT_DIR}/{chip}_{framework}_{timestamp}.txt"
            with open(filename, "w") as f:
                f.write(output)
            print(f"[✓] Saved: {filename}")

def run_tasks(taskfile="tasks.txt", count=3):
    with open(taskfile, "r") as f:
        tasks = [line.strip() for line in f if line.strip()]

    for task in tasks:
        print(f"\n=== Generating code for: {task} ===")
        generate_code(task=task, count=count)

if __name__ == "__main__":
    run_tasks("tasks.txt", count=5)
EOF

echo "[*] Creating Topics"
cat > tasks.txt << 'EOF'
Wi-Fi Phisher with builtin credential login to spiffs and serial monitor, looks like a normal login page, Full Working Example
Wi-Fi spoofer with DNS Redirect to localhost url, Full Working Example
EOF

echo "[*] Setup complete!"
echo "Run it like this:"
echo "  cd ~/esp-codefarm && source venv/bin/activate && python3 codefarm.py"
cd ~/esp-codefarm && source venv/bin/activate && python3 codefarm.py

```

<h1>ESP</h1>

<p>Script below provides an ESP Template (Targeting Both Arduino & ESP idf)<br></p>

```bash
import os
import subprocess
from datetime import datetime

# --- Configuration ---
MODEL = "llama3"  # Replace with the Ollama model you want
# MODEL = "deepseek-coder"
OUTPUT_DIR = "generated_code"
ESP_TARGETS = ["Arduino", "ESP-IDF"]
CHIPS = ["ESP32", "ESP8266", "ESP32-C3"]

PROMPT_TEMPLATE = """
Generate {count} different working code examples for {chip} using {framework}.
Task: {task}.
Each example should be complete and compilable.
"""

def generate_code(task, count=5):
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for chip in CHIPS:
        for framework in ESP_TARGETS:
            prompt = PROMPT_TEMPLATE.format(
                count=count, chip=chip, framework=framework, task=task
            )
            print(f"[+] Requesting {chip} / {framework} code...")

            # Run Ollama CLI (could also use subprocess.run + pipe JSON)
            result = subprocess.run(
                ["ollama", "run", MODEL],
                input=prompt.encode(),
                capture_output=True,
            )
            output = result.stdout.decode().strip()

            # Save output
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{OUTPUT_DIR}/{chip}_{framework}_{timestamp}.txt"
            with open(filename, "w") as f:
                f.write(output)
            print(f"[✓] Saved: {filename}")

def run_tasks(taskfile="tasks.txt", count=3):
    with open(taskfile, "r") as f:
        tasks = [line.strip() for line in f if line.strip()]

    for task in tasks:
        print(f"\n=== Generating code for: {task} ===")
        generate_code(task=task, count=count)

if __name__ == "__main__":
    run_tasks("tasks.txt", count=5)
```

<h1>Python3</h1>

<p>Script below provides a Python3 Template</p>

```bash
import os
import subprocess
from datetime import datetime

# --- Configuration ---
MODEL = "llama3"
# MODEL = "deepseek-coder"
OUTPUT_DIR = "generated_code"
TARGETS = ["Python3"]

PROMPT_TEMPLATE = """
Generate {count} different working code examples in {framework}.
Task: {task}.
Each example should be complete and runnable with Python 3.
"""

def generate_code(task, count=3):
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for framework in TARGETS:
        prompt = PROMPT_TEMPLATE.format(
            count=count, framework=framework, task=task
        )
        print(f"[+] Requesting {framework} code...")

        result = subprocess.run(
            ["ollama", "run", MODEL],
            input=prompt.encode(),
            capture_output=True,
        )
        output = result.stdout.decode().strip()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{OUTPUT_DIR}/{framework}_{timestamp}.txt"
        with open(filename, "w") as f:
            f.write(output)
        print(f"[✓] Saved: {filename}")

def run_tasks(taskfile="tasks.txt", count=3):
    with open(taskfile, "r") as f:
        tasks = [line.strip() for line in f if line.strip()]

    for task in tasks:
        print(f"\n=== Generating code for: {task} ===")
        generate_code(task=task, count=count)

if __name__ == "__main__":
    run_tasks("python_tasks.txt", count=5)
```

---

<h1>Raspberry Pi</h1>

<p>Script below provides a Raspberry Pi Pico / W Template</p>

```bash
import os
import subprocess
from datetime import datetime

# --- Configuration ---
MODEL = "llama3"
# MODEL = "deepseek-coder"
OUTPUT_DIR = "generated_code"
FRAMEWORK = "MicroPython"
BOARDS = ["Raspberry Pi Pico W", "Raspberry Pi Pico"]

PROMPT_TEMPLATE = """
Generate {count} different working code examples for {board} using {framework}.
Task: {task}.
Each example should be complete and ready to run.
"""

def generate_code(task, count=3):
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for board in BOARDS:
        prompt = PROMPT_TEMPLATE.format(
            count=count, board=board, framework=FRAMEWORK, task=task
        )
        print(f"[+] Requesting {board} / {FRAMEWORK} code...")

        result = subprocess.run(
            ["ollama", "run", MODEL],
            input=prompt.encode(),
            capture_output=True,
        )
        output = result.stdout.decode().strip()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_board = board.replace(" ", "_").replace("/", "_")
        filename = f"{OUTPUT_DIR}/{safe_board}_{FRAMEWORK}_{timestamp}.txt"
        with open(filename, "w") as f:
            f.write(output)
        print(f"[✓] Saved: {filename}")

def run_tasks(taskfile="tasks.txt", count=3):
    with open(taskfile, "r") as f:
        tasks = [line.strip() for line in f if line.strip()]

    for task in tasks:
        print(f"\n=== Generating code for: {task} ===")
        generate_code(task=task, count=count)

if __name__ == "__main__":
    run_tasks("rpi_tasks.txt", count=5)
```

---

<h1>Cross Compile</h1>

<p>Script below provides a Cross-Compile Template for Android NDK (r21e)</p>

```bash
import os
import subprocess
from datetime import datetime

# --- Configuration ---
MODEL = "llama3"
# MODEL = "deepseek-coder"
OUTPUT_DIR = "generated_code"

BOARD = {
    "name": "OnePlus 3/3T",
    "toolchain": "/root/android-ndk-r21e",
    "host": "aarch64-linux-android",
    "api": 29,
}

PROMPT_TEMPLATE = """
Generate {count} working bash cross-compilation scripts for {board}.
Requirements:
- Target: {host} (API {api})
- Set NDK toolchain paths, CC, CXX, AR, RANLIB, STRIP, LD
- Set CFLAGS and LDFLAGS
- Include example ./configure, make, and make install steps
- Include comments explaining each step
- Scripts must be fully executable and runnable on a Linux build machine
- PREFIX: /root/static_prefix
"""

def generate_code(task, count=3):
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    prompt = PROMPT_TEMPLATE.format(
        count=count,
        board=BOARD["name"],
        host=BOARD["host"],
        api=BOARD["api"]
    )
    print(f"[+] Generating {BOARD['name']} cross-compile scripts...")

    result = subprocess.run(
        ["ollama", "run", MODEL],
        input=prompt.encode(),
        capture_output=True,
    )
    output = result.stdout.decode().strip()

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_board = BOARD["name"].replace(" ", "_").replace("/", "_")
    filename = f"{OUTPUT_DIR}/{safe_board}_cross_compile_{timestamp}.sh"
    with open(filename, "w") as f:
        f.write(output)
    os.chmod(filename, 0o755)
    print(f"[✓] Saved: {filename}")

def run_tasks(taskfile="tasks.txt", count=3):
    with open(taskfile, "r") as f:
        tasks = [line.strip() for line in f if line.strip()]

    for task in tasks:
        print(f"\n=== Generating code for: {task} ===")
        generate_code(task=task, count=count)

if __name__ == "__main__":
    run_tasks("cross_tasks.txt", count=5)
```

---

<style>
  footer {
    display: none;
  }
</style>