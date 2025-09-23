---
layout: page
title: Screen
published: 2025-09-22
description: "Cross Compile Screen for Android."
permalink: /tutorials/CC/
category: crosscompile
subcategory: Screen
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

- Add stub functions for missing Linux/Unix-only symbols

Create a new file in screen-5.0.1/ called android_stubs.c:

```bash
// android_stubs.c
#include <string.h>
#include <unistd.h>
#include <pwd.h>

char *crypt(const char *key, const char *salt) {
    static char buf[128];
    strncpy(buf, key, sizeof(buf)-1);
    buf[sizeof(buf)-1] = '\0';
    return buf;
}

struct spwd { char *sp_namp; };
struct spwd *getpwnam_shadow(const char *name) { return NULL; }

int getdtablesize(void) { return 1024; }

#ifndef index
#define index strchr
#endif
```

- Modify your Makefile.in to compile it

After CFILES= ..., append:

```bash
CFILES += android_stubs.c
```

----


- Patch termcap.c

At the top of termcap.c, add:

```bash
#ifndef index
#define index strchr
#endif
```

---

- Replace in configure.ac

```bash
AC_SEARCH_LIBS([crypt], [crypt], [], [
    AC_MSG_ERROR([unable to find crypt() function])
])
```


with:

```bash
# Skip crypt() check on Android NDK
AS_IF([test "$host" = "aarch64-linux-android"], [
    AC_DEFINE([HAVE_NO_CRYPT], [1], [crypt() not available on Android])
    AC_MSG_WARN([Skipping crypt() check on Android])
], [
    AC_SEARCH_LIBS([crypt], [crypt], [], [
        AC_MSG_ERROR([unable to find crypt() function])
    ])
])
```

---

```bash
#!/bin/bash
# aMiscreant

set -e
export NDK=/root/android-ndk-r21e
export API=29
export PREFIX=/root/static_prefix

export CC="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android${API}-clang"
export CXX="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android${API}-clang++"
export AR="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
export RANLIB="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ranlib"
export LD="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/ld.lld"
export STRIP="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-strip"
export CFLAGS="-fPIC -D__ANDROID_API__=$API"
export LDFLAGS=""
#export LDFLAGS="-L$PREFIX/lib"
export PATH="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin":$PATH

mkdir -p $PREFIX

# -------------------
# Build ncurses
# -------------------
wget -nc https://ftp.gnu.org/pub/gnu/ncurses/ncurses-6.5.tar.gz
tar xf ncurses-6.5.tar.gz
cd ncurses-6.5

# Only build C libraries (skip Ada95, progs)
./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --disable-shared \
  --enable-static \
  --without-progs \
  --without-tests \
  --without-manpages \
  --without-ada95 \
  --with-termlib \
  --prefix=$PREFIX \
  --with-default-terminfo-dir=$PREFIX/share/terminfo \
  CC="$CC" AR="$AR" RANLIB="$RANLIB" STRIP="$STRIP" \
  CFLAGS="$CFLAGS" LDFLAGS="$LDFLAGS"

make -j$(nproc)
make install
cd ..

# -------------------
# Build GNU Screen
# -------------------
wget -nc https://ftp.gnu.org/gnu/screen/screen-5.0.1.tar.gz
tar xf screen-5.0.1.tar.gz

cd screen-5.0.1

# Run autoreconf / autogen if needed
./autogen.sh

# Configure for cross-compiling
./configure --host=aarch64-linux-android --build=x86_64-pc-linux-gnu --disable-pam \
CC="$CC" CFLAGS="$CFLAGS -I$PREFIX/include/ncursesw -I$PREFIX/include/openssl" \
LDFLAGS="$LDFLAGS -L$PREFIX/lib -lncursesw -lformw -lmenuw -lpanelw" \
--prefix=$PREFIX

# Build and install
make -j$(nproc)
make install
```

---

<style>
  footer {
    display: none;
  }
</style>