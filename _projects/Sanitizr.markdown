---
layout: page
title: Sanitizr
published: 2025-09-22
description: "Mobile App, Meta-Data Cleaner."
permalink: /projects/Sanitizr
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

<h1>Sanitizr</h1>

<p>powerful Android utility app for cleaning metadata and timestamps from various file types including images, videos, documents, PDFs, archives, and ebooks.</p>

---

- Your files, your privacy. Sanitizr helps you remove hidden data from files before sharing them.

---

## Features

- **Scan folders** like Downloads, Pictures, and Documents
- **Image metadata** removal (EXIF: GPS, camera info, etc.)
- **Video/audio stream sanitization** via FFmpeg (removes tags)
- **PDF metadata** stripping
- **Document metadata** cleanup (Word, Excel, PowerPoint)
- **Ebook sanitization** (EPUB .opf metadata)
- **Archive support**  
  - ZIP (.zip)  
  - TAR (.tar)  
  - GZ (.gz)  
  - BZ2 (.bz2)  
  - XZ (.xz)  
- Simple UI for selecting and sanitizing files in bulk

---

## How It Works

Sanitizr parses file types using known extensions and applies file-type-specific cleaning:

- **Images**: Clears EXIF tags using `ExifInterface`
- **PDFs**: Uses `OpenPDF` to remove PDF info
- **Office Docs**: `Apache POI` strips metadata
- **Videos/Audio**: Leverages `FFmpegKit` to drop metadata
- **EPUBs**: Parses and clears `<metadata>` from OPF
- **Archives**: Extract → sanitize → recompress using `Commons Compress`

---

## Supported File Types

| Type       | Extensions                                      |
|------------|--------------------------------------------------|
| Images     | jpg, jpeg, png, gif, webp, bmp, tiff, heic       |
| Videos     | mp4, mov, mkv, avi, webm, 3gp                    |
| Audio      | mp3, flac, wav, ogg, m4a, wma                    |
| PDFs       | pdf                                              |
| Docs       | doc, docx, pptx, xlsx, odt, rtf, csv, txt        |
| Ebooks     | epub, mobi, azw3, fb2                            |
| Archives   | zip, tar, gz, bz2, xz                            |

---

## Built With

- [AndroidX](https://developer.android.com/jetpack/androidx)
- [FFmpegKit](https://github.com/arthenica/ffmpeg-kit)
- [OpenPDF](https://github.com/LibrePDF/OpenPDF)
- [Apache POI](https://poi.apache.org/)
- [Commons Compress](https://commons.apache.org/proper/commons-compress/)
- [XZ for Java](https://tukaani.org/xz/java.html)

---

## Dev Features

- Modular sanitization functions (`sanitizeImage()`, `sanitizePdf()`, etc.)
- Archive-safe operations with temp files
- Non-destructive fallback if sanitization fails
- Scans `/Download`, `/Documents`, `/Pictures` by default


## Privacy First

Sanitizr works **offline**, never uploads files, and does **not** retain data after processing.

---

- Made with ❤️  by: **aMiscreant** to help people control their data.

---

# ~ **Still in testing all features may not work as intended** ~

---

<style>
  footer {
    display: none;
  }
</style>