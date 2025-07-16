---
layout: page
title: Signal Bot
published: 2025-07-08
date: 2024-10-19
description:  Automate sending and receiving secure messages via Signal.
permalink: /snippets/python/bots/signal
category: Bots
subcategory: Signal
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

#### This Python bot interfaces with Signal’s secure messaging platform to send, receive, and automate encrypted conversations. Ideal for privacy-focused notifications, alerts, or automated message workflows, it brings Signal’s strong encryption into programmable applications while maintaining end-to-end security.

---

Full Source:

```python
import re
import subprocess
from datetime import datetime
from colorama import Fore, Back, Style

SENDER_NUMBER = '+1**********' # Replace with signal number

class SignalCLI:
    def __init__(self, scrub_log=False):
        self.groups = []   # List of dicts {id, name}
        self.scrub_log = scrub_log

    def scrub_output(self, text):
        # Simple scrubbing logic for US numbers
        return re.sub(r"\+1\d{10}", "+1**********", text) # Contact Number blur

    def run_cmd(self, cmd):
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            output = result.stdout.strip()
            if self.scrub_log:
                output = self.scrub_output(output)
            return output
        except subprocess.CalledProcessError as e:
            if e.returncode == 1 and not e.output:
                return ""
            print(f"Command error: {e}")
            return ""

    def list_contacts(self):
        output = self.run_cmd(['signal-cli', '-u', SENDER_NUMBER, 'listContacts'])

        contacts = []
        # pattern = re.compile(r"Number:\s*(\S+).*?Name:\s*(.*?)\s", re.DOTALL)
        # Ensures capture of empty or multi-world names
        pattern = re.compile(
            r"Number:\s*(\S+).*?Name:\s*(.*?)\s*(?=Profile name:|$)",
            re.DOTALL
        )
        for m in pattern.finditer(output):
            number = m.group(1).strip()
            name = m.group(2).strip()
            contacts.append({
                "number": number,
                "name": name,
            })

        # print scrubbed
        for c in contacts:
            safe_number = self.scrub_output(c["number"])
            print(f"Number: {safe_number} Name: {c['name']}")

        return contacts

    def send_message_to_contact(self):
        contacts = self.list_contacts()
        if not contacts:
            print("No contacts found.")
            return

        print("Select contact to send message:")
        for i, c in enumerate(contacts, 1):
            safe_number = self.scrub_output(c["number"])
            print(f"  {i}. {c['name']} ({safe_number})")

        choice = input("Enter number: ").strip()
        if not choice.isdigit():
            print("Invalid choice.")
            return

        idx = int(choice) - 1
        if idx < 0 or idx >= len(contacts):
            print("Invalid contact number.")
            return

        recipient = contacts[idx]
        message = input(f"Enter message for {recipient['name']}: ").strip()
        if not message:
            print("Empty message. Cancelled.")
            return

        cmd_list = [
            'signal-cli', '-u', SENDER_NUMBER,
            'send', '-m', message,
            recipient['number']
        ]
        print("Sending message...")
        self.run_cmd(cmd_list)
        print("Message sent.")

    def list_groups(self):
        output = self.run_cmd(['signal-cli', '-u', SENDER_NUMBER, 'listGroups'])
        groups = []

        pattern = re.compile(r"Id:\s*(\S+)\s+Name:\s*(\S+)")
        for line in output.splitlines():
            match = pattern.search(line)
            if match:
                group_id, group_name = match.group(1), match.group(2)
                groups.append({"id": group_id, "name": group_name})

        self.groups = groups
        if not groups:
            print("No groups found.")
            return
        print("Groups:")
        for i, g in enumerate(groups, 1):
            print(f"  {i}. {g['name']}")

    def receive_raw_output(self):
        """
        Run signal-cli receive and capture raw text output.
        """
        cmd = ['signal-cli', '-u', SENDER_NUMBER, 'receive']
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        return result.stdout

    def parse_messages_for_group(self, raw_output, group_id):
        """
        Parse plaintext signal-cli output to extract messages belonging to the given group.
        Returns list of dicts with:
            - timestamp
            - body
        """

        messages = []

        # ----------------------------
        # 1. Match normal incoming messages
        # ----------------------------

        pattern_incoming = re.compile(
            r"Envelope from:.*?"
            r"Timestamp:\s*(\d+).*?"
            r"Body:\s*(.*?)\n"
            r"(?:.*?\n)*?"
            r"Group info:\n"
            r"\s+Id:\s*(\S+)",
            re.DOTALL
        )

        for m in pattern_incoming.finditer(raw_output):
            timestamp_str, body, found_group_id = m.groups()
            if found_group_id.strip() == group_id:
                messages.append({
                    "timestamp": int(timestamp_str),
                    "body": body.strip(),
                })

        # ----------------------------
        # 2. Match sync sent messages
        # ----------------------------

        pattern_sync = re.compile(
            r"^Received sync sent message.*?"
            r"^\s*Timestamp:\s*(\d+).*?"
            r"^\s*Body:\s*(.*?)\n"
            r"(?:.*?\n)*?"
            r"^\s*Group info:\n"
            r"^\s*Id:\s*(\S+)",
            re.DOTALL | re.MULTILINE
        )

        for m in pattern_sync.finditer(raw_output):
            timestamp_str, body, found_group_id = m.groups()
            if found_group_id.strip() == group_id:
                messages.append({
                    "timestamp": int(timestamp_str),
                    "body": body.strip(),
                })

        return messages

    def read_messages_from_group(self, group):
        """
        Display only new messages from the selected group.
        """
        raw = self.receive_raw_output()
        msgs = self.parse_messages_for_group(raw, group["id"])

        if not msgs:
            print(f"No new messages from group '{group['name']}'.")
            return

        # Print all new messages
        for msg in sorted(msgs, key=lambda x: x["timestamp"]):
            ts = datetime.fromtimestamp(msg["timestamp"] / 1000.0).strftime('%Y-%m-%d %H:%M:%S')
            print(f"[{ts}] {msg['body']}")

    def send_message_to_group(self, group):
        confirm = input(f"Send message to group '{group['name']}'? (y/N): ").strip().lower()
        if confirm != 'y':
            print("Cancelled.")
            return
        message = input("Enter message: ").strip()
        if not message:
            print("Empty message. Cancelled.")
            return

        cmd = ['signal-cli', '-u', SENDER_NUMBER, 'send', '-g', group['id'], '-m', message]
        print("Sending message...")
        self.run_cmd(cmd)
        print("Message sent.")

    def repl(self):
        print("")
        print("")
        print(Style.DIM + Fore.MAGENTA + " _________.__                      .__      " + Style.RESET_ALL)
        print(Style.DIM + Fore.MAGENTA + " /   _____/|__| ____   ____ _____  |  |     " + Style.RESET_ALL)
        print(Style.DIM + Fore.MAGENTA + " \_____  \ |  |/ ___\ /    \\\__  \ |  |     " + Style.RESET_ALL)
        print(Style.DIM + Fore.MAGENTA + " /        \|  / /_/  >   |  \/ __ \|  |__   " + Style.RESET_ALL)
        print(Style.DIM + Fore.MAGENTA + "/_______  /|__\___  /|___|  (____  /____/   " + Style.RESET_ALL)
        print(Style.DIM + Fore.MAGENTA + "       \/   /_____/      \/     \/          " + Style.RESET_ALL)
        print("")
        print("")
        print(Fore.RED + Style.BRIGHT + "Welcome to aMiscreant@signal shell. Type 'help' for commands." + Style.RESET_ALL)
        while True:
            try:
                cmd = input(Fore.RED + Style.DIM + "aMiscreant💀signal _> " + Style.RESET_ALL).strip()
            except (EOFError, KeyboardInterrupt):
                print("\nExiting.")
                break
            if not cmd:
                continue
            if cmd == 'help':
                print("")
                print("")
                print(Style.DIM + Fore.MAGENTA + " _________.__                      .__      " + Style.RESET_ALL)
                print(Style.DIM + Fore.MAGENTA + " /   _____/|__| ____   ____ _____  |  |     " + Style.RESET_ALL)
                print(Style.DIM + Fore.MAGENTA + " \_____  \ |  |/ ___\ /    \\\__  \ |  |     " + Style.RESET_ALL)
                print(Style.DIM + Fore.MAGENTA + " /        \|  / /_/  >   |  \/ __ \|  |__   " + Style.RESET_ALL)
                print(Style.DIM + Fore.MAGENTA + "/_______  /|__\___  /|___|  (____  /____/   " + Style.RESET_ALL)
                print(Style.DIM + Fore.MAGENTA + "       \/   /_____/      \/     \/          " + Style.RESET_ALL)
                print("")
                print(Fore.LIGHTGREEN_EX + "Commands:" + Style.RESET_ALL)
                print("")
                print(Fore.LIGHTYELLOW_EX + "  contacts      - List Contact List")
                print("  send          - Send Private message to Contact")
                print("  groups        - List Signal groups")
                print("  read_group    - Read NEW messages from a group (from others only)")
                print("  send_group    - Send message to a group")
                print("  exit          - Exit shell" + Style.RESET_ALL)
            elif cmd == 'contacts':
                self.list_contacts()
            elif cmd == 'send':
                self.send_message_to_contact()
            elif cmd == 'groups':
                self.list_groups()
            elif cmd == 'read_group':
                if not self.groups:
                    print("No groups loaded. Run 'groups' first.")
                    continue
                print("Select group to read messages from:")
                for i, g in enumerate(self.groups, 1):
                    print(f"  {i}. {g['name']}")
                choice = input("Enter number: ").strip()
                if not choice.isdigit():
                    print("Invalid choice.")
                    continue
                idx = int(choice) - 1
                if idx < 0 or idx >= len(self.groups):
                    print("Invalid group number.")
                    continue
                self.read_messages_from_group(self.groups[idx])
            elif cmd == 'send_group':
                if not self.groups:
                    print("No groups loaded. Run 'groups' first.")
                    continue
                print("Select group to send message:")
                for i, g in enumerate(self.groups, 1):
                    print(f"  {i}. {g['name']}")
                choice = input("Enter number: ").strip()
                if not choice.isdigit():
                    print("Invalid choice.")
                    continue
                idx = int(choice) - 1
                if idx < 0 or idx >= len(self.groups):
                    print("Invalid group number.")
                    continue
                self.send_message_to_group(self.groups[idx])
            elif cmd == 'exit':
                print("Bye.")
                break
            else:
                print(f"Unknown command: {cmd}")

if __name__ == '__main__':
    shell = SignalCLI(scrub_log=True)
    shell.repl()
```

---