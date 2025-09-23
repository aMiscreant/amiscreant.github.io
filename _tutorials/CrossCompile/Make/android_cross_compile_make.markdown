---
layout: page
title: Make
published: 2025-09-22
description: "Cross Compile Make for Android."
permalink: /tutorials/CC/make
category: crosscompile
subcategory: Make
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

<h1>Patch File:</h1>

```patch
--- a/src/job.c
+++ b/src/job.c
@@ -2387,11 +2387,20 @@
     /*
      * Initialize shell search PATH from configuration.
      * Default to the standard system path if not found.
      */
-    {
-        size_t l = confstr(_CS_PATH, NULL, 0);
-        char *dp;
-        if (l > 0 && (dp = malloc(l)) != NULL) {
-            confstr(_CS_PATH, dp, l);
-            path = dp;
-        }
-    }
+    {
+#if defined(__ANDROID__)
+        /* Android (bionic libc) does not support confstr/_CS_PATH */
+        const char *def_path = "/system/bin:/system/xbin:/sbin";
+        path = strdup(def_path);
+        if (path == NULL) goto no_mem;
+#else
+        size_t l = confstr(_CS_PATH, NULL, 0);
+        char *dp;
+        if (l > 0 && (dp = malloc(l)) != NULL) {
+            confstr(_CS_PATH, dp, l);
+            path = dp;
+        }
+#endif
+    }
 
     if (path == NULL) {
         path = getenv("PATH");
@@ -3112,11 +3121,19 @@
     /* execvp() will use a default PATH if none is set; emulate that.  */
     if (p == NULL)
       {
-        size_t l = confstr (_CS_PATH, NULL, 0);
-        if (l)
-          {
-            char *dp = alloca (l);
-            confstr (_CS_PATH, dp, l);
-            p = dp;
-          }
+#if defined(__ANDROID__)
+        /* Android has no confstr/_CS_PATH, so provide a sane fallback. */
+        p = "/system/bin:/system/xbin:/sbin";
+#else
+        size_t l = confstr(_CS_PATH, NULL, 0);
+        if (l)
+          {
+            char *dp = alloca(l);
+            confstr(_CS_PATH, dp, l);
+            p = dp;
+          }
+#endif
       }

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

wget https://ftp.gnu.org/pub/gnu/libiconv/libiconv-1.18.tar.gz

tar xf libiconv-1.18.tar.gz
cd libiconv-1.18

./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --disable-shared \
  --enable-static \
  --prefix=/root/static_prefix

make -j$(nproc)
make install

cd ..

wget https://ftp.gnu.org/pub/gnu/gettext/gettext-0.26.tar.gz

tar xf gettext-0.26.tar.gz
cd gettext-0.26

export CFLAGS="-fPIC -I/root/static_prefix/include"
export LDFLAGS="-L/root/static_prefix/lib"
export PKG_CONFIG_LIBDIR=/root/static_prefix/lib/pkgconfig
export PKG_CONFIG_PATH=/root/static_prefix/lib/pkgconfig

./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --disable-shared \
  --enable-static \
  --prefix=/root/static_prefix

make -j$(nproc)
make install

cd ..
  
  
wget https://ftp.gnu.org/gnu/make/make-4.4.tar.gz

tar xf make-4.4.tar.gz
cd make-4.4

export CFLAGS="-fPIC -I/root/static_prefix/include"
export LDFLAGS="-L/root/static_prefix/lib"
export PKG_CONFIG_LIBDIR=/root/static_prefix/lib/pkgconfig
export PKG_CONFIG_PATH=/root/static_prefix/lib/pkgconfig
export PATH=$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin:$PATH

./configure \
  --host=aarch64-linux-android \
  --build=x86_64-pc-linux-gnu \
  --prefix=/root/static_prefix \
  CC="$CC" AR="$AR" RANLIB="$RANLIB" STRIP="$STRIP" \
  CFLAGS="-D__ANDROID_API__=$API -fPIC -I/root/static_prefix/include" \
  LDFLAGS="-L/root/static_prefix/lib"
  
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