---
layout: page
title: OpenSSL
published: 2025-09-22
description: "Cross Compile OpenSSL for Android."
permalink: /tutorials/CC/openssl
category: crosscompile
subcategory: OpenSSL
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
#!/usr/bin/env bash
# OpenSSL Android arm64 cross-compile script for OnePlus 3/3T (API 29)
# Tested with NDK r21e and OpenSSL 3.x
# ToDo Add zlib etc

set -e

export NDK=/root/android-ndk-r21e
export API=29
export PREFIX=/root/static_prefix

export CC="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android${API}-clang"
export AR="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
export RANLIB="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ranlib"
export STRIP="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-strip"

export CFLAGS="-fPIC -D__ANDROID_API__=$API -I$PREFIX/include"
export LDFLAGS="-L$PREFIX/lib"
export PATH="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin:$PATH"


git clone https://github.com/kobolabs/liblzma.git
cd liblzma

./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --disable-shared \
  --enable-static \
  CC="$CC" AR="$AR" RANLIB="$RANLIB" STRIP="$STRIP" \
  --prefix=/root/static_prefix

make -j$(nproc)
make install
cd ..

wget https://zlib.net/zlib-1.3.1.tar.gz
tar -xf zlib-1.3.1.tar.gz
rm -rf zlib-1.3.1.tar.gz

cd zlib-1.3.1

./configure \
  --static \
  --prefix=/root/static_prefix

make -j$(nproc)
make install
cd ..
    
wget https://github.com/facebook/zstd/releases/download/v1.5.7/zstd-1.5.7.tar.gz
tar xf zstd-1.5.7.tar.gz

cd zstd-1.5.7

make clean || true

make -C lib -j$(nproc) libzstd.a CC="$CC" AR="$AR" RANLIB="$RANLIB" CFLAGS="$CFLAGS"

mkdir -p /root/static_prefix/lib /root/static_prefix/include/zstd
cp lib/libzstd.a /root/static_prefix/lib/
cp -r lib/zstd.h lib/zdict.h /root/static_prefix/include/zstd/

cd ..

echo "Installing openssl"
git clone https://github.com/openssl/openssl.git

NDK_ROOT="/root/android-ndk-r21e"
OPENSSL_DIR="/root/openssl"
INSTALL_DIR="/root/static_prefix"
ANDROID_API=29

export ANDROID_NDK_ROOT="$NDK_ROOT"
export ANDROID_NDK_HOME="$NDK_ROOT"
export PATH="$NDK_ROOT/toolchains/llvm/prebuilt/linux-x86_64/bin:$PATH"

if [ ! -f "$NDK_ROOT/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android${ANDROID_API}-clang" ]; then
    echo "ERROR: Compiler not found at $NDK_ROOT/toolchains/llvm/prebuilt/linux-x86_64/bin/"
    exit 1
fi

cd "$OPENSSL_DIR"

make clean || true

./Configure android-arm64 -D__ANDROID_API__="$ANDROID_API" --prefix="$INSTALL_DIR" no-dso no-shared no-docs

make -j$(nproc)

make install

echo "OpenSSL successfully built and installed at $INSTALL_DIR"
echo "Headers: $INSTALL_DIR/include"
echo "Libraries: $INSTALL_DIR/lib"
```

---

<style>
  footer {
    display: none;
  }
</style>