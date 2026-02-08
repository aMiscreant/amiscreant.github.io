---
layout: page
title: Code Farm (Python3)
published: 2026-02-08
description: "Code Farm (Ollama - Python3)"
permalink: /tutorials/CodeFarm/setup_python3
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

```python
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

def run_tasks(taskfile, count):
    with open(taskfile, "r") as f:
        tasks = [line.strip() for line in f if line.strip()]

    for task in tasks:
        print(f"\n=== Generating code for: {task} ===")
        generate_code(task=task, count=count)

if __name__ == "__main__":
    run_tasks("python_tasks.txt", count=5)
```

---
