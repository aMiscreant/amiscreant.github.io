---
layout: page
title: Ruby
published: 2025-09-22
description: "Cross Compile Ruby for Android."
permalink: /tutorials/CC/ruby
category: crosscompile
subcategory: Ruby
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
export NDK=/root/android-ndk-r21e
export API=29

export CC="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android29-clang"
export CXX="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android29-clang++"
export AR="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
export RANLIB="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ranlib"
export LD="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/ld.lld"
export STRIP="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-strip"
export PATH=$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin:$PATH

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

git clone https://github.com/yaml/libyaml.git
cd libyaml
./bootstrap
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

git clone https://github.com/ruby/psych.git

wget https://cache.ruby-lang.org/pub/ruby/3.4/ruby-3.4.5.tar.gz
tar -xf ruby-3.4.5.tar.gz
cd ruby-3.4.5


./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --disable-shared \
  --disable-install-doc \
  --disable-install-rdoc \
  --disable-install-capi \
  --with-os-version-style=full \
  --without-gcc \
  --with-gems \
  CC="$CC" AR="$AR" RANLIB="$RANLIB" STRIP="$STRIP" \
  CFLAGS="-D__ANDROID_API__=$API" \
  --prefix=/root/static_prefix \
  --with-destdir=/root/static_prefix \
  --with-rubylibprefix=/root/static_prefix
  
make -j$(nproc)
make install 

mkdir -p /root/static_prefix/lib/ruby/gems/3.4.0
cp -a /var/lib/gems/3.4.0/* /root/static_prefix/lib/ruby/gems/3.4.0/
```

---

<style>
  footer {
    display: none;
  }
</style>