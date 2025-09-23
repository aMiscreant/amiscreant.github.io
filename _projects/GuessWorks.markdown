---
layout: page
title: GuessWorks
published: 2025-09-22
description: "Realistic Wordlist/Password Generation Tool."
permalink: /projects/GuessWorks
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

<img width="340" height="340" alt="GuessWorks" src="https://github.com/user-attachments/assets/e1106fb7-f860-4d1b-8abc-0752e2e1fdf8" />

<h1>GuessWorks</h1>>

+ `python3 guess_works.py`

### realistic password/wordlist generation

| Argument          | Description                                                  |
|-------------------|--------------------------------------------------------------|
| `-e, --essid`     | Target ESSID (e.g., BELL123456)                              |
| `-a, --area`      | Area code for phone number guesses (e.g., 416)               |
| `-s, --street`    | Street name (e.g., Main, KingWest)                           |
| `-o, --output`    | File to save the generated passwords                         |
| `--seasons`       | Include seasonal guesses                                     |
| `--months`        | Include month/year combinations                              |
| `--holidays`      | Include holiday-based guesses                                |
| `--names`         | Include popular names + years                                |
| `--events`        | Include global event-related patterns                        |
| `--sports`        | Include sports teams + years                                 |
| `--no-year`       | Exclude year suffix from guesses                             |
| `--add-numbers`   | Append numbers 1-N to each generated string (default 1–1000) |
| `--clean-length`  | Remove lines under 8 characters long                         |
| `--clean-numbers` | Remove lines containing only numbers                         |
| `--capitalize`    | Capitalize the first character of each line (skips numbers)  |
| `--filler`        | Adds junk numeric strings to the start and end of file       |
| `--filler-count`  | Total filler lines (default: 7000, 5000 start + 2000 end)    |

---

```bash
# 1. Generate guesses for a specific ESSID
python3 guess_works.py -e BELL123456 --seasons --holidays --output bell_guesses.txt

# 2. Generate guesses based on a Canadian area code
python3 guess_works.py -a 416 --add-numbers 50 --output phone_guesses.txt

# 3. Generate guesses using street names and popular names
python3 guess_works.py -s KingWest --names --no-year --output street_name_guesses.txt

# 4. Generate guesses for sports teams and global events
python3 guess_works.py --sports --events --capitalize --output event_sports_guesses.txt

# 5. Generate a full mixed list with cleaning applied
python3 guess_works.py -e VIRGIN123 --seasons --months --holidays --names --events --sports \
  --clean-length --clean-numbers --output full_wordlist.txt
```


---

# Pipe Wordlists Directly into Aircrack-ng

+ `gw_aircrack.py` generates enhanced password variants on-the-fly and can be piped straight into `aircrack-ng` without creating a large intermediate file.


| Flag          | Description                                     |
| ------------- | ----------------------------------------------- |
| `-i, --input` | Input wordlist file (required)                  |
| `--leet`      | Apply leetspeak substitutions                   |
| `--suffix`    | Append common suffixes (numbers, symbols, etc.) |
| `--prefix`    | Add common prefixes (`!`, `VIP`, etc.)          |
| `--toggle`    | Randomly toggle character case                  |
| `--max`       | Optional maximum number of variants to generate |

---
```bash
# 1. Generate with leetspeak + suffixes, pipe to aircrack-ng:
python3 gw_aircrack.py -i base_words.txt --leet --suffix | aircrack-ng -w- -b <BSSID> capture.cap
# 2. Apply all enhancements and limit to 50,000 variants:
python3 gw_aircrack.py -i base_words.txt --leet --suffix --prefix --toggle --max 50000 | aircrack-ng -w- -b <BSSID> capture.cap
# 3. Use without enhancements (just pass the base wordlist to aircrack-ng):
python3 gw_aircrack.py -i base_words.txt | aircrack-ng -w- -b <BSSID> capture.cap
```

---

# Enhance Your Wordlist

+ `python3 gw_enhancer.py` applies leetspeak, prefixes, suffixes, and case toggling to an existing wordlist to generate realistic password variants.

#### Basic Usage

```bash
python3 gw_enhancer.py -i base_words.txt -o enhanced.txt --leet --suffix --prefix --toggle
```

| Flag           | Description                                                           |
| -------------- | --------------------------------------------------------------------- |
| `-i, --input`  | Input file with base words (required)                                 |
| `-o, --output` | Output file to save enhanced wordlist (required unless `--overwrite`) |
| `--leet`       | Apply leetspeak substitutions                                         |
| `--suffix`     | Append common suffixes (numbers, symbols, etc.)                       |
| `--prefix`     | Add common prefixes (`!`, `VIP`, etc.)                                |
| `--toggle`     | Randomly toggle character case for realism                            |
| `--overwrite`  | Overwrite input file instead of writing to output                     |
| `--max`        | Max number of generated variants (default very high)                  |

---
```bash
# 1. Enhance with leetspeak and suffixes:
python3 gw_enhancer.py -i base_words.txt -o enhanced.txt --leet --suffix

# 2. Add prefixes and toggle case:
python3 gw_enhancer.py -i base_words.txt -o enhanced.txt --prefix --toggle

# 3. Apply all enhancements:
python3 gw_enhancer.py -i base_words.txt -o enhanced.txt --leet --suffix --prefix --toggle

# 4. Overwrite the original wordlist:
python3 gw_enhancer.py -i base_words.txt --overwrite --leet --suffix

# 5. Limit output to 10,000 variants:
python3 gw_enhancer.py -i base_words.txt -o enhanced.txt --leet --suffix --max 10000
```

---

# gw_merge

+ `python3 gw_merge.py`

### Merge and Clean Wordlists

This script combines all `.txt` files in the current directory, removes duplicates, sorts them, and saves the result to `wordlist_clean.txt`:

```bash
#!/usr/bin/env python3
import glob

output_file = "wordlist_clean.txt"
all_lines = set()

for filename in glob.glob("*.txt"):
    with open(filename, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if line:
                all_lines.add(line)

with open(output_file, "w", encoding="utf-8") as f:
    for line in sorted(all_lines):
        f.write(line + "\n")

print(f"[+] Combined {len(all_lines)} unique lines into {output_file}")
```

---


<style>
  footer {
    display: none;
  }
</style>