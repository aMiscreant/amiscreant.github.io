---
layout: page
title: Npth
published: 2025-09-22
description: "Cross Compile Npth for Android."
permalink: /tutorials/CC/npth
category: crosscompile
subcategory: Npth
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

<h1>android.site</h1>

```bash
# /root/android.site
# Autoconf cache overrides for Android cross-compilation

# --- Threads ---
ac_cv_func_pthread_create=yes
ac_cv_func_pthread_cancel=yes
ac_cv_lib_pthread_pthread_create=yes
ac_cv_lib_pthread_pthread_cancel=yes
ac_cv_header_pthread_h=yes

# --- Clocks & time ---
ac_cv_func_clock_gettime=yes
ac_cv_lib_rt_clock_gettime=no   # clock_gettime is in libc, not librt
ac_cv_func_nanosleep=yes

# --- Poll/select ---
ac_cv_func_poll=yes
ac_cv_func_ppoll=yes
ac_cv_func_select=yes

# --- Misc common funcs ---
ac_cv_func_fcntl=yes
ac_cv_func_getaddrinfo=yes
ac_cv_func_gettimeofday=yes
ac_cv_func_setrlimit=yes
ac_cv_func_sysconf=yes
ac_cv_func_utimes=yes

# --- Libraries that Android doesn't need ---
ac_cv_lib_pthread=yes
ac_cv_lib_dl_dlopen=no   # Bionic has dlopen in libc, not libdl
```

---

<h1>npth_cross.sh</h1>

```bash

wget https://github.com/gpg/npth/archive/refs/tags/npth-1.6.zip
unzip npth-1.6.zip

NPTH_FILENAME=npth-npth-1.6

# Compile NPTH
export NDK=/root/android-ndk-r21e
export API=29

# Toolchain binaries
export CC="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android$API-clang"
export AR="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
export RANLIB="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ranlib"
export STRIP="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-strip"

cd $NPTH_FILENAME

CONFIG_SITE=/root/android.site \
git clean -xfd
./autogen.sh

CONFIG_SITE=/root/android.site \
./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --disable-shared \
  --enable-static \
  --disable-tests \
  CC="$CC" AR="$AR" RANLIB="$RANLIB" STRIP="$STRIP" \
  CFLAGS="-D__ANDROID_API__=$API" \
  LDFLAGS="-pthread" \
  --prefix=/root/static_prefix

make -j$(nproc)
make install
```

---

<style>
  footer {
    display: none;
  }
</style>