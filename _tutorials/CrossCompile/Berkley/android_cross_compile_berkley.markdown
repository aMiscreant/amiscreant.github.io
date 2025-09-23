---
layout: page
title: Berkley
published: 2025-09-22
description: "Cross Compile Berkley DB for Android."
permalink: /tutorials/CC/berkley
category: crosscompile
subcategory: Berkley
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

<h1>Requirements:</h1>

<p>Download the Android NDK:</p>
<a href="https://dl.google.com/android/repository/android-ndk-r21e-linux-x86_64.zip" target="_blank" rel="noopener noreferrer">
  Android NDK r21e (Linux x86_64)
</a>
<p>OpenSSL cross-compiled: </p>
<a href="" target="_blank" rel="noopener noreferrer">
  OpenSSL (Cross-Compiled) for Android
</a>
<p>Install dependencies for cross-compiling:</p>

```bash
sudo apt update
sudo apt install -y \
    autoconf \
    automake \
    bison \
    bc \
    build-essential \
    clang \
    cpio \
    cmake \
    cmake-format \
    curl \
    debhelper \
    debhelper-compat \
    device-tree-compiler \
    dpkg-dev \
    dwarves \
    file \
    fakeroot \
    flex \
    g++ \
    g++-multilib \
    git \
    gawk \
    gettext \
    libdb-dev \
    libelf-dev \
    libffi-dev \
    libgmp-dev \
    liblzma-dev \
    libmpc-dev \
    libmpfr-dev \
    libncurses-dev \
    libncurses5-dev \
    libssl-dev \
    libtool \
    make \
    ninja-build \
    patch \
    pkg-config \
    python3 \
    python3-pip \
    python3-setuptools \
    rsync \
    unzip \
    wget \
    xsltproc \
    zip \
    zlib1g-dev
```

---

```bash
#!/bin/bash
# aMiscreant

export NDK=/root/android-ndk-r21e
export API=29

export CC="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android29-clang"
export CXX="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android29-clang++"
export AR="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
export RANLIB="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ranlib"
export LD="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/ld.lld"
export STRIP="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-strip"

export CFLAGS="-fPIC -I/root/static_prefix/include"
export LDFLAGS="-L/root/static_prefix/lib"
export PKG_CONFIG_LIBDIR=/root/static_prefix/lib/pkgconfig
export PKG_CONFIG_PATH=/root/static_prefix/lib/pkgconfig

wget http://download.oracle.com/berkeley-db/db-18.1.40.tar.gz
tar xzf db-18.1.40.tar.gz
cd db-18.1.40

./dist/configure \
  --host=aarch64-linux-android \
  --prefix=$PWD/../install \
  CC="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android29-clang" \
  CFLAGS="--sysroot=$NDK/toolchains/llvm/prebuilt/linux-x86_64/sysroot -I$HOME/static_prefix/include -fPIC" \
  LDFLAGS="-L$HOME/static_prefix/lib" \
  LIBS="-lssl -lcrypto -lz" \
  CPPFLAGS="-I$HOME/static_prefix/include" \
  --with-repmgr-ssl=yes
```

---

<style>
  footer {
    display: none;
  }
</style>