---
layout: page
title: Hcxtools
published: 2025-09-22
description: "Cross Compile Hcxtools for Android."
permalink: /tutorials/CC/hcxtools
category: crosscompile
subcategory: Hcxtools
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
# aMiscreant

set -e

# Toolchain
export NDK=/root/android-ndk-r21e
export API=29
export PREFIX=/root/static_prefix

export CC="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android${API}-clang"
export CXX="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android${API}-clang++"
export AR="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
export RANLIB="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ranlib"
export STRIP="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-strip"
export LD="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/ld.lld"

export PATH="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin:$PATH"
export PKG_CONFIG_LIBDIR=$PREFIX/lib/pkgconfig
export PKG_CONFIG_PATH=$PREFIX/lib/pkgconfig

export CFLAGS="-fPIC -D__ANDROID_API__=$API -I$PREFIX/include"
export CPPFLAGS="-I$PREFIX/include"
export LDFLAGS="-L$PREFIX/lib"


wget -nc https://ftp.gnu.org/gnu/libunistring/libunistring-1.3.tar.gz
tar xf libunistring-1.3.tar.gz
cd libunistring-1.3
./configure --host=aarch64-linux-android --build=x86_64-pc-linux-gnu \
  --disable-shared --enable-static --prefix=$PREFIX \
  CC="$CC" AR="$AR" RANLIB="$RANLIB"
make -j$(nproc) && make install
cd ..

# --------------------------------------------------------------------
# 2. libidn2
# --------------------------------------------------------------------
wget -nc https://ftp.gnu.org/gnu/libidn/libidn2-2.3.8.tar.gz
tar xf libidn2-2.3.8.tar.gz
cd libidn2-2.3.8
./configure --host=aarch64-linux-android --build=x86_64-pc-linux-gnu \
  --disable-shared --enable-static --prefix=$PREFIX \
  CC="$CC" AR="$AR" RANLIB="$RANLIB"
make -j$(nproc) && make install
cd ..

# --------------------------------------------------------------------
# 3. PCRE2
# --------------------------------------------------------------------
git clone https://github.com/PCRE2Project/pcre2.git || true
cd pcre2
git pull || true
git submodule update --init
./autogen.sh
./configure --host=aarch64-linux-android --build=x86_64-pc-linux-gnu \
  --disable-shared --enable-static --enable-fuzz-support \
  --enable-pcre2grep-libz=$PREFIX --enable-pcre2-16 --enable-pcre2-32 \
  --prefix=$PREFIX CC="$CC" AR="$AR" RANLIB="$RANLIB"
make -j$(nproc) && make install
cd ..

# --------------------------------------------------------------------
# 4. libpsl
# --------------------------------------------------------------------
git clone https://github.com/rockdaboot/libpsl.git || true
cd libpsl
git pull || true
./autogen.sh
./configure \
  --host=aarch64-linux-android --build=x86_64-pc-linux-gnu \
  --with-libintl-prefix=$PREFIX --with-libunistring-prefix=$PREFIX \
  --disable-shared --enable-static --prefix=$PREFIX \
  CC="$CC" AR="$AR" RANLIB="$RANLIB"
make -j$(nproc) && make install
cd ..


wget https://curl.se/download/curl-8.16.0.tar.xz
tar xf curl-8.16.0.tar.xz

cd curl-8.16.0

CPPFLAGS="-I$PREFIX/include" \
LDFLAGS="-L$PREFIX/lib" \
LIBS="-lpsl -lidn2 -lunistring -lssl -lcrypto -lz -ldl -lzstd -llzma -pthread" \
./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --disable-shared \
  --enable-static \
  --with-openssl=$PREFIX \
  --with-libidn2=$PREFIX \
  --with-libpsl=$PREFIX \
  --prefix=$PREFIX

  
make -j$(nproc)
make install

cd ..

git clone https://github.com/ZerBea/hcxtools.git

cd hcxtools

make clean
make -j$(nproc) \
  CC="$CC" \
  AR="$AR" \
  RANLIB="$RANLIB" \
  CFLAGS="$CFLAGS" \
  LDFLAGS="-L$PREFIX/lib -lunistring -lssl -lcrypto -lz -ldl -lzstd -llzma -pthread -lcurl" \
  DESTDIR=$PREFIX
```

---

<style>
  footer {
    display: none;
  }
</style>