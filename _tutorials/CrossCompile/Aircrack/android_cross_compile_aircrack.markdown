---
layout: page
title: Aircrack-ng
published: 2025-09-22
description: "Cross Compile Aircrack-ng Suite for Android."
permalink: /tutorials/CC/aircrack
category: crosscompile
subcategory: Aircrack
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


# Compile Zlib
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

# Compile 
git clone https://github.com/PCRE2Project/pcre2.git
cd pcre2
git submodule update --init

./autogen.sh

./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --disable-shared \
  --enable-static \
  --enable-fuzz-support \
  --prefix=/root/static_prefix
  
make -j$(nproc)
make install

cd ..

# Compile hwlock
git clone  https://github.com/open-mpi/hwloc.git
cd hwloc

./autogen.sh

./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --disable-shared \
  --enable-static \
  --prefix=/root/static_prefix
  
# Compile libpcap
git clone https://github.com/the-tcpdump-group/libpcap.git 
cd libpcap

./autogen.sh

./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --disable-shared \
  CC="$CC" AR="$AR" RANLIB="$RANLIB" STRIP="$STRIP" \
  CFLAGS="-D__ANDROID_API__=$API" \
  --prefix=/root/static_prefix
  
make -j$(nproc)
make install

cd ..

# Compile tcpdump
git clone https://github.com/the-tcpdump-group/tcpdump.git 
cd tcpdump

export CFLAGS="-fPIC -I/root/static_prefix/include"
export LDFLAGS="-L/root/static_prefix/lib"
export PKG_CONFIG_LIBDIR=/root/static_prefix/lib/pkgconfig
export PKG_CONFIG_PATH=/root/static_prefix/lib/pkgconfig
./autogen.sh

./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  CC="$CC" AR="$AR" RANLIB="$RANLIB" STRIP="$STRIP" \
  CFLAGS="-D__ANDROID_API__=$API" \
  PKG_CONFIG_PATH=/root/static_prefix/lib/pkgconfig \
  --prefix=/root/static_prefix
  
make -j$(nproc)
make install

cd ..

# Compile Libffi
git clone https://github.com/libffi/libffi.git
cd libffi

./autogen.sh

# Remove docs..
#rm -rf doc
./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --disable-shared \
  --enable-static \
  --disable-docs \
  CC="$CC" AR="$AR" RANLIB="$RANLIB" STRIP="$STRIP" \
  --prefix=/root/static_prefix

make -j$(nproc)
make install
cd ..

# Compile aircrack
git clone https://github.com/aircrack-ng/aircrack-ng.git

export CFLAGS="-fPIC -I/root/static_prefix/include"
export LDFLAGS="-L/root/static_prefix/lib"
export LIBS="-lssl -lcrypto -lpcap -lz -lffi -lpcap"
export PKG_CONFIG_LIBDIR=/root/static_prefix/lib/pkgconfig
export PKG_CONFIG_PATH=/root/static_prefix/lib/pkgconfig

cd aircrack-ng
autoreconf -i

./configure \
  --host=aarch64-linux-android \
  --disable-shared \
  --enable-static \
  --without-libnl \
  --without-sqlite3 \
  --enable-hwloc \
  --with-pcre2=/root/static_prefix \
  --with-libpcap-lib=/root/static_prefix \
  --with-pcap=/root/static_prefix \
  --with-openssl=/root/static_prefix \
  --with-zlib=/root/static_prefix \
  --prefix=/root/static_prefix \
  CFLAGS="-I/root/static_prefix/include -O2 -fPIE -fPIC" \
  PKG_CONFIG_PATH=/root/static_prefix/lib/pkgconfig \
  LDFLAGS="-L/root/static_prefix/lib -pie"


make -j$(nproc)
make install

cd ..
```
---

<style>
  footer {
    display: none;
  }
</style>