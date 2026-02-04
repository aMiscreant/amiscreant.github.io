---
layout: page
title: Kernel-Level Instrumentation of User-Space File Opens via do_sys_openat2()
published: 2026-02-03
description: "This patch instruments the Linux do_sys_openat2() syscall to log successful file open operations initiated by user-space processes. By observing file access at a central VFS entry point, it provides low-level visibility into process behavior without altering syscall semantics."
permalink: /tutorials/Linux/kernel/patches
category: linux
subcategory: Kernel
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

## Security Rationale & Detection Value

From a security standpoint, file-open behavior is one of the most revealing low-level signals of process intent. Malware, compromised applications, and post-exploitation tooling often betray themselves not through network traffic alone, but through unexpected or anomalous filesystem access patterns.

By observing file opens at the syscall boundary, this instrumentation enables:

- **Early malware detection**  
  Malicious binaries frequently probe sensitive paths such as credential stores, configuration files, or persistence locations. Even simple logging can surface suspicious access sequences that would otherwise go unnoticed.

- **Compromised process identification**  
  Legitimate processes accessing files outside their normal operational profile (e.g., a user application opening `/proc/kcore` or `/etc/shadow`) can indicate runtime compromise or abuse.

- **Behavioral forensics and research**  
  Because this hook sits below libc and language runtimes, it captures real behavior rather than high-level intent, making it useful for studying loaders, droppers, and living-off-the-land techniques.

- **Low-impact observability**  
  Rate-limited logging prevents kernel log flooding, making this suitable for debugging, research kernels, and controlled monitoring scenarios without destabilizing the system.

This approach does **not** enforce policy or block access; instead, it provides transparent observability — a foundational capability for intrusion detection, threat modeling, and kernel-level telemetry experiments.

---

## Notes & Scope

- Logged paths are user-supplied strings, not fully resolved filesystem paths  
- Events may be dropped due to rate limiting  
- Intended for research, instrumentation, and documentation — not production enforcement  
- Superseded in modern systems by LSM or eBPF-based solutions, but valuable as a minimal, direct kernel hook example
