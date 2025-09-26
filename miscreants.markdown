---
layout: page
permalink: /miscreants/
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

<script src="{{ '/assets/js/nacl.min.js' | relative_url }}"></script>
<script src="{{ '/assets/js/openpgp.min.js' | relative_url }}"></script>

<script src="{{ '/assets/js/stego.js' | relative_url }}"></script>
<script src="{{ '/assets/js/encrypt_decrypt.js' | relative_url }}"></script>
<script src="{{ '/assets/js/gpg.js' | relative_url }}"></script>

---

<h1>Welcome to the Miscreant's Playground.</h1>  

---

<p>Here you can try:</p>

- Hiding messages in images (Steganography) / Re-Upload and reveal.


<style>
/* Stego Section Styling (Red Neon Theme) */
#stego {
  background: #0d0d0d;
  border: 1px solid #222;
  border-radius: 12px;
  padding: 20px;
  margin: 20px auto;
  max-width: 800px;
  color: #f2f2f2;
  font-family: monospace;
  box-shadow: 0 0 12px rgba(255, 6, 41, 0.2);
}

#stego h1 {
  margin-bottom: 10px;
  color: #FF0629;
  font-size: 1.6rem;
  text-align: center;
  text-shadow: 0 0 8px #FF0629, 0 0 12px #FF0629;
}

#stego textarea,
#stego input[type="password"] {
  width: 100%;
  margin: 8px 0;
  padding: 10px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e6e6e6;
  font-family: monospace;
  font-size: 0.95rem;
  resize: vertical;
  box-shadow: inset 0 0 6px rgba(255, 6, 41, 0.2);
}

#stego textarea:focus,
#stego input:focus {
  outline: none;
  border-color: #FF0629;
  box-shadow: 0 0 8px #FF0629, inset 0 0 4px #FF0629;
}

#stego .btn-neon,
#stego label.file-label {
  margin: 6px 4px;
  padding: 8px 16px;
  border-radius: 8px;
  font-family: monospace;
  font-weight: bold;
  color: #fff;
  background: #0d0d0d;
  border: 1px solid #FF0629;
  box-shadow: 0 0 8px #FF0629;
  transition: all 0.2s ease;
  display: inline-block;
  cursor: pointer;
}

#stego .btn-neon:hover,
#stego label.file-label:hover {
  color: #0d0d0d;
  background: #FF0629;
  box-shadow: 0 0 20px #FF0629, 0 0 30px #FF0629;
  transform: scale(1.05);
  text-decoration: underline;
}

/* Hide the raw file input */
#stego input[type="file"] {
  display: none;
}

#stego #stego-output,
#stego #stego-download {
  margin-top: 12px;
  padding: 10px;
  border-radius: 6px;
  background: #1a1a1a;
  border: 1px dashed #FF0629;
  color: #f2f2f2;
  min-height: 40px;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-shadow: inset 0 0 8px rgba(255, 6, 41, 0.3);
}

#stego canvas,
#stego #stego-preview {
  display: block;
  margin-top: 12px;
  max-width: 100%;
  border: 1px solid #333;
  background: #000;
  box-shadow: 0 0 8px rgba(255, 6, 41, 0.3);
}

.stego-label {
  color: #ffffff;
  font-weight: bold;
  display: block;
  margin-top: 12px;
  margin-bottom: 4px;
  text-shadow: 0 0 2px #000, 0 0 4px #000, 0 0 6px #000;
}
.stego-label:hover {
  text-shadow: 0 0 4px #000, 0 0 8px #000, 0 0 12px #000;
  cursor: default;
}

/* Crypto Section Styling (Red Neon Theme) */
#crypto {
  background: #0d0d0d;
  border: 1px solid #222;
  border-radius: 12px;
  padding: 20px;
  margin: 20px auto;
  max-width: 800px;
  color: #f2f2f2;
  font-family: monospace;
  box-shadow: 0 0 12px rgba(255, 6, 41, 0.2);
}

#crypto h1 {
  margin-bottom: 10px;
  color: #FF0629;
  font-size: 1.6rem;
  text-align: center;
  text-shadow: 0 0 8px #FF0629, 0 0 12px #FF0629;
}

#crypto select,
#crypto textarea,
#crypto input[type="password"] {
  width: 100%;
  margin: 8px 0;
  padding: 10px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e6e6e6;
  font-family: monospace;
  font-size: 0.95rem;
  resize: vertical;
  box-shadow: inset 0 0 6px rgba(255, 6, 41, 0.2);
}

#crypto textarea:focus,
#crypto select:focus,
#crypto input:focus {
  outline: none;
  border-color: #FF0629;
  box-shadow: 0 0 8px #FF0629, inset 0 0 4px #FF0629;
}

#crypto .btn-neon {
  margin: 6px 4px;
  padding: 8px 16px;
  border-radius: 8px;
  font-family: monospace;
  font-weight: bold;
  color: #fff;
  background: #0d0d0d;
  border: 1px solid #FF0629;
  box-shadow: 0 0 8px #FF0629;
  transition: all 0.2s ease;
}

#crypto .btn-neon:hover {
  color: #0d0d0d;
  background: #FF0629;
  box-shadow: 0 0 20px #FF0629, 0 0 30px #FF0629;
  transform: scale(1.05);
  text-decoration: underline;
}

#crypto #crypto-output {
  margin-top: 12px;
  padding: 10px;
  border-radius: 6px;
  background: #1a1a1a;
  border: 1px dashed #FF0629;
  color: #f2f2f2;
  min-height: 40px;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-shadow: inset 0 0 8px rgba(255, 6, 41, 0.3);
}

/* GPG Section Styling (Red Neon Theme) */
#gpg {
  background: #0d0d0d;
  border: 1px solid #222;
  border-radius: 12px;
  padding: 20px;
  margin: 20px auto;
  max-width: 800px;
  color: #f2f2f2;
  font-family: monospace;
  box-shadow: 0 0 12px rgba(255, 6, 41, 0.2);
}

#gpg input[type="text"],
#gpg input[type="email"],
#gpg input[type="password"] {
  width: 100%;
  margin: 8px 0;
  padding: 10px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e6e6e6;
  font-family: monospace;
  font-size: 0.95rem;
  box-shadow: inset 0 0 6px rgba(255, 6, 41, 0.2);
}

#gpg input:focus {
  outline: none;
  border-color: #FF0629;
  box-shadow: 0 0 8px #FF0629, inset 0 0 4px #FF0629;
}

#gpg .btn-neon {
  margin: 6px 4px;
  padding: 8px 16px;
  border-radius: 8px;
  font-family: monospace;
  font-weight: bold;
  color: #fff;
  background: #0d0d0d;
  border: 1px solid #FF0629;
  box-shadow: 0 0 8px #FF0629;
  transition: all 0.2s ease;
}

#gpg .btn-neon:hover {
  color: #0d0d0d;
  background: #FF0629;
  box-shadow: 0 0 20px #FF0629, 0 0 30px #FF0629;
  transform: scale(1.05);
  text-decoration: underline;
}

.gpg-label {
    color: #ffffff;
    font-weight: bold;
    display: block;
    margin-top: 12px;
    margin-bottom: 4px;
}
</style>



---

<div class="secret-container">
  <section id="stego">
    <h1>Steganography in Images</h1><br>

    <!-- Image upload & preview -->
    <label class="file-label" for="stego-upload">Choose Image</label>
    <input type="file" id="stego-upload" accept="image/*" />
    <canvas id="stego-canvas"></canvas>
    <img id="stego-preview" alt="Preview" style="max-width:100%; margin-top:10px;" />

    <!-- Message & encryption key -->
    <label class="stego-label" for="stego-message">Secret Message</label>
    <textarea id="stego-message" placeholder="Type a secret message"></textarea>
    
    <label class="stego-label" for="stego-key">Encryption Key (for hiding)</label>
    <input type="password" id="stego-key" placeholder="Enter encryption key">

    <label class="stego-label" for="stego-decrypt-key">Decryption Key (for revealing)</label>
    <input type="password" id="stego-decrypt-key" placeholder="Enter decryption key">

    <!-- Buttons -->
    <div style="margin-top:10px;">
      <button class="btn-neon" onclick="stegoHide()">Hide & Download</button>
      <button class="btn-neon" onclick="stegoReveal()">Reveal Message</button>
    </div>

    <!-- Outputs -->
    <div id="stego-download"></div>
    <div id="stego-output" aria-live="polite"></div>
  </section>
</div>

---

<p>Here you can try:</p>

- AES Encrypting/Decrypting messages using a variety of AES algorithms.

---

<div class="secret-container">
  <section id="crypto">
    <h1>Encrypt/Decrypt Messages</h1><br>

    <p>Select an algorithm and provide your message to encrypt or decrypt.</p>

    <!-- Algorithm selection -->
    <label for="crypto-algo" class="stego-label">Select Algorithm</label>
    <select id="crypto-algo" class="stego-select">
      <option value="AES-GCM">AES-GCM</option>
      <option value="AES-CBC">AES-CBC</option>
      <option value="AES-CTR">AES-CTR</option>
    </select>

    <!-- Message input -->
    <label class="stego-label" for="crypto-message">Message</label>
    <textarea id="crypto-message" placeholder="Enter your message"></textarea>

    <!-- Encryption/Decryption Key input -->
    <label class="stego-label" for="crypto-key">Key (Password)</label>
    <input type="password" id="crypto-key" placeholder="Enter encryption/decryption key">

    <!-- Buttons -->
    <div style="margin-top:10px;">
      <button class="btn-neon" onclick="cryptoEncrypt()">Encrypt</button>
      <button class="btn-neon" onclick="cryptoDecrypt()">Decrypt</button>
    </div>

    <!-- Outputs -->
    <div id="crypto-output"></div>
  </section>
</div>

---

<div class="gpg-container">
  <section id="gpg">
    <h1>GPG Key Generation</h1><br>

    <!-- User info -->
    <label class="gpg-label" for="gpg-name">Name</label>
    <input type="text" id="gpg-name" placeholder="Your name">

    <label class="gpg-label" for="gpg-email">Email</label>
    <input type="email" id="gpg-email" placeholder="Your email">

    <label class="gpg-label" for="gpg-passphrase">Passphrase (optional)</label>
    <input type="password" id="gpg-passphrase" placeholder="Enter passphrase">

    <!-- Buttons -->
    <div style="margin-top:10px;">
      <button class="btn-neon" onclick="generateGPGKey()">Generate GPG Key</button>
      <button class="btn-neon" onclick="downloadGPGKey('public')">Download Public Key</button>
      <button class="btn-neon" onclick="downloadGPGKey('private')">Download Private Key</button>
    </div>

    <!-- Output -->
    <div id="gpg-output" aria-live="polite" style="margin-top:12px; min-height:40px;"></div>
  </section>
</div>

---
