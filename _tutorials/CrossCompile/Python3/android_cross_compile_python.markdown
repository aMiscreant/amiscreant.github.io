---
layout: page
title: Python3
published: 2025-09-22
description: "Cross Compile Python3 for Android."
permalink: /tutorials/CC/python
category: crosscompile
subcategory: Python
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
# Python3 Android arm64 cross-compile script for OnePlus 3/3T (API 29)
# Tested with NDK r21e and Python 3.x
# aMiscreant

set -e  # Exit on error

export NDK=/root/android-ndk-r21e
export API=29

# Toolchain binaries
export CC="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android${API}-clang"
export CXX="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android${API}-clang++"
export AR="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
export RANLIB="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ranlib"
export LD="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/ld.lld"
export STRIP="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-strip"


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

# Compile Zstd
git clone https://github.com/facebook/zstd.git -b release
cd zstd

# Compilers already set
make -j$(nproc) \
  PREFIX=/root/static_prefix

make install \
  PREFIX=/root/static_prefix

cd ..

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

# Compile Readline
wget https://cgit.git.savannah.gnu.org/cgit/readline.git/snapshot/readline-8.3.tar.gz
tar -xf readline-8.3.tar.gz
rm -rf readline-8.3.tar.gz

cd readline-8.3

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

# Compile Python
wget https://www.python.org/ftp/python/3.12.3/Python-3.12.3.tgz
tar -xf Python-3.12.3.tgz
rm -rf Python-3.12.3.tgz

cd Python*

export NDK=/root/android-ndk-r21e
export API=29

export BUILD_PYTHON=/usr/bin/python3

export CC="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android29-clang"
export CXX="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android29-clang++"
export AR="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
export RANLIB="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ranlib"
export LD="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/ld.lld"
export STRIP="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-strip"

# Flags for Python cross-compilation on Android
export CFLAGS="-fPIE -fPIC -DANDROID -O2 -I/root/static_prefix/include"
export LDFLAGS="-pie -L/root/static_prefix/lib"
export LIBS="-lffi"

# export LDFLAGS="-pie -L/data/local/static_prefix/lib"
# Bugging out
export PATH=/root/android-ndk-r21e/toolchains/llvm/prebuilt/linux-x86_64/bin:$PATH

# Issues read the config.site file
cat > /root/config.site <<'EOF'
# Pretend the cross target has /dev/ptmx
ac_cv_file__dev_ptmx=yes
# Android does not have /dev/ptc
ac_cv_file__dev_ptc=no
EOF

export CONFIG_SITE=/root/config.site

./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --disable-shared \
  --without-ensurepip \
  --with-system-ffi \
  ac_cv_file__dev_ptmx=yes \
  ac_cv_file__dev_ptc=no \
  --without-pymalloc \
  --disable-test-modules \
  --without-lto \
  --disable-profiling \
  --disable-ipv6 \
  --with-build-python \
  --with-openssl=/root/static_prefix \
  --prefix=/root/static_prefix
      
make -j$(nproc)
make install
cd ..

echo -e "Python3 Compiled"
```

---

<style>
  footer {
    display: none;
  }
</style>