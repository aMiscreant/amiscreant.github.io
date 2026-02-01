---
layout: page
title: Windows - Hidden World
published: 2026-01-31
description: "A curated list of undocumented Windows keybindings involving F14–F24 and the hidden Office key, observed across modern Windows systems."
permalink: /windows/hidden_world
category: windows
subcategory: HiddenWorld
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

# Hidden Windows Keybindings (F14–F24 & Office Key)

**Overview**

### Modern Windows systems expose a number of undocumented or rarely documented keybindings, particularly involving extended function keys (F14–F24) and modifier combinations. These shortcuts appear to be tied to accessibility, touch, pen, and OEM keyboard features.

### This page documents observed behavior only—no drivers, hooks, or remapping required.

---

## Extended Function Key Bindings
## F14 – F24 Behavior

| Key Combination              | Observed Action            | Notes                         |
| ---------------------------- | -------------------------- | ----------------------------- |
| **Win + Ctrl + F14**         | Narrator                   | Same as `Win + Ctrl + Enter`  |
| **Win + F15**                | Screenshot                 | Same as `Win + PrtSc`         |
| **Win + F16**                | Slide to Shutdown          | Opens a hidden shutdown UI    |
| **F17**                      | —                          | No binding observed           |
| **Win + F18**                | Cortana                    | Same as `Win + C`             |
| **Win + F19**                | Snip & Sketch (fullscreen) | Immediate capture             |
| **Win + Ctrl + F19**         | Ink Workspace              | Same as `Win + W`             |
| **Win + F20**                | Microsoft Whiteboard       | App launch                    |
| **Win + F21**                | Settings                   | Same as `Win + I`             |
| **Win + Ctrl + F21**         | Connect                    | Same as `Win + K`             |
| **Win + Shift + F21**        | Search                     | Same as `Win + S` / `Win + Q` |
| **Win + F22**                | Project                    | Same as `Win + P`             |
| **Win + Ctrl + Shift + F22** | Touchpad Action            | Matches 3-finger tap binding  |
| **F23**                      | —                          | No binding observed           |
| **Win + F24**                | Screenshot                 | Same as `Win + PrtSc`         |
| **Win + Ctrl + F24**         | Toggle Touchpad            | Hardware / driver dependent   |


## Bonus: The Hidden “Office Key”

#### Pressing all four modifier keys at once:

```bash
Shift + Ctrl + Alt + Win
```

### …acts as the Microsoft Office key, present on some official MS keyboards. This works even on keyboards without a dedicated Office key.


## Office Key Shortcuts

| Key Combo      | Action                            |
| -------------- | --------------------------------- |
| **Office**     | Open Office app                   |
| **Office + W** | Word                              |
| **Office + X** | Excel                             |
| **Office + P** | PowerPoint                        |
| **Office + O** | Outlook                           |
| **Office + D** | OneDrive (Explorer)               |
| **Office + L** | LinkedIn (browser)                |
| **Office + T** | Teams (browser if not installed)  |
| **Office + Y** | Yammer (browser if not installed) |
| **Office + N** | OneNote                           |

---

### Notes & Observations
### Many of these shortcuts appear tied to OEM keyboards, touch devices, or accessibility features
### Behavior may vary by:
### Windows version
###  firmware
### Touchpad / HID drivers
### Several bindings are active even without visible UI references

---
