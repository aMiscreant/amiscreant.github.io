/* stego.js — WebCrypto + robust LSB stego
   Drop into /assets/js/stego.js and include AFTER other scripts.
   No CryptoJS required.
*/

(function () {
  "use strict";

  // ---------- Crypto helpers (Web Crypto) ----------
  async function deriveKey(password, salt, iterations = 100000) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  // returns Uint8Array [ salt(16) | iv(12) | ciphertext... ]
  async function encryptMessage(message, password) {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(message)
    );
    const cipherBytes = new Uint8Array(ciphertext);
    const out = new Uint8Array(salt.length + iv.length + cipherBytes.length);
    out.set(salt, 0);
    out.set(iv, salt.length);
    out.set(cipherBytes, salt.length + iv.length);
    console.log("Encrypt → salt", salt, "iv", iv, "cipher length", cipherBytes.length);
    return out;
  }

  // accepts Uint8Array [ salt(16) | iv(12) | ciphertext... ], returns string
  async function decryptMessage(data, password) {
    if (!(data instanceof Uint8Array) || data.length < 29) {
      throw new Error("Invalid encrypted payload length");
    }
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const ciphertext = data.slice(28);
    console.log("Decrypt → salt", salt, "iv", iv, "cipher length", ciphertext.length);
    const key = await deriveKey(password, salt);
    const plainBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    const dec = new TextDecoder();
    return dec.decode(plainBuffer);
  }

  // ---------- LSB stego core (consistent) ----------
  // We pack payload as: [4-byte little-endian length][payload bytes]
  // We store 3 bits per pixel: R, G, B LSB (alpha untouched).
  function embedPayloadInCanvas(canvas, payloadBytes) {
    const ctx = canvas.getContext("2d");
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data; // Uint8ClampedArray

    const headerAndPayload = new Uint8Array(4 + payloadBytes.length);
    new DataView(headerAndPayload.buffer).setUint32(0, payloadBytes.length, true); // little-endian
    headerAndPayload.set(payloadBytes, 4);

    const totalBits = headerAndPayload.length * 8;
    const capacity = (pixels.length / 4) * 3; // 3 usable bits per pixel
    if (totalBits > capacity) return false;

    for (let bitIndex = 0; bitIndex < totalBits; bitIndex++) {
      const byteIndex = Math.floor(bitIndex / 8);
      const bitInByte = bitIndex % 8;
      const bit = (headerAndPayload[byteIndex] >> bitInByte) & 1;

      const pixelNum = Math.floor(bitIndex / 3);
      const channel = bitIndex % 3; // 0=R,1=G,2=B
      const dataIdx = pixelNum * 4 + channel;

      pixels[dataIdx] = (pixels[dataIdx] & 0xfe) | bit;
    }

    ctx.putImageData(imgData, 0, 0);
    return true;
  }

  function extractPayloadFromCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    const capacity = (pixels.length / 4) * 3;

    // Read first 32 bits to get length (little-endian)
    let length = 0;
    for (let bit = 0; bit < 32; bit++) {
      const pixelNum = Math.floor(bit / 3);
      const channel = bit % 3;
      const idx = pixelNum * 4 + channel;
      length |= (pixels[idx] & 1) << bit;
    }

    if (length < 0 || (4 + length) * 8 > capacity) {
      // length impossible — probably no payload or corrupted
      console.warn("Extract: claimed payload length", length, "capacity", Math.floor(capacity / 8));
      return null;
    }

    const totalBits = (4 + length) * 8;
    const out = new Uint8Array(4 + length);

    for (let bitIndex = 0; bitIndex < totalBits; bitIndex++) {
      const pixelNum = Math.floor(bitIndex / 3);
      const channel = bitIndex % 3;
      const idx = pixelNum * 4 + channel;
      const bit = pixels[idx] & 1;
      out[Math.floor(bitIndex / 8)] |= bit << (bitIndex % 8);
    }

    return out.slice(4); // strip header and return payload bytes
  }

  // ---------- DOM helpers ----------
  function el(id) { return document.getElementById(id); }
  function showMessage(s) {
    const node = el("stego-output");
    if (node) node.textContent = s;
    else console.info("stego:", s);
  }
  function setCapacity(canvas) {
    const capNode = el("stego-capacity");
    if (!canvas || !capNode) return;
    const ctx = canvas.getContext("2d");
    if (!canvas.width || !canvas.height) return;
    const capacityBytes = Math.floor(((canvas.width * canvas.height) * 3) / 8);
    capNode.textContent = `Capacity ≈ ${capacityBytes} bytes`;
  }

  // load image file into given canvas and optional preview img
  function loadFileToCanvas(file, canvas, previewImg, callback) {
    const img = new Image();
    img.onload = function () {
      // preserve original pixel dimensions (no scaling) — important
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (previewImg) previewImg.src = canvas.toDataURL("image/png");
      setCapacity(canvas);
      console.info("Loaded image to canvas:", canvas.width + "x" + canvas.height);
      if (typeof callback === "function") callback();
    };
    img.onerror = function (err) {
      console.error("Image load error", err);
      showMessage("Failed to load image.");
    };
    img.src = URL.createObjectURL(file);
  }

  // ---------- UI actions ----------
  async function stegoHide() {
    try {
      const fileInput = el("stego-upload");
      const msg = (el("stego-message") && el("stego-message").value) || "";
      const pass = (el("stego-key") && el("stego-key").value) || "";
      const canvas = el("stego-canvas");
      const preview = el("stego-preview");
      const dlContainer = el("stego-download");

      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        return showMessage("Please upload an image first.");
      }
      if (!msg || !pass) return showMessage("Enter message & encryption key.");

      // load image into canvas then embed
      loadFileToCanvas(fileInput.files[0], canvas, preview, async () => {
        try {
          const encrypted = await encryptMessage(msg, pass); // Uint8Array [salt|iv|cipher]
          const ok = embedPayloadInCanvas(canvas, encrypted);
          if (!ok) {
            return showMessage("Message too large for this image. Try a larger image or shorten message.");
          }

          // create download link
          const dataURL = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = dataURL;
          a.download = "stego.png";
          a.className = "btn-neon";
          a.textContent = "Download Stego Image";
          dlContainer.innerHTML = "";
          dlContainer.appendChild(a);

          showMessage("Used " + encrypted.length + " bytes. Message hidden! You can download the image.");
          console.info("stegoHide: embedded bytes", encrypted.length);
        } catch (err) {
          console.error("Hide error:", err);
          showMessage("Error hiding message: " + (err.message || err));
        }
      });
    } catch (e) {
      console.error("stegoHide top error:", e);
      showMessage("Unexpected error hiding message.");
    }
  }

  async function stegoReveal() {
    try {
      const fileInput = el("stego-upload");
      const pass = (el("stego-decrypt-key") && el("stego-decrypt-key").value) || "";
      const canvas = el("stego-canvas");
      const preview = el("stego-preview");

      if (!pass) return showMessage("Enter the decryption key.");
      // if canvas already has image drawn (from previous hide), we can extract directly
      const hasCanvasImage = canvas && canvas.width > 0 && canvas.height > 0;
      const needToLoad = !(hasCanvasImage && preview && preview.src);

      if (needToLoad) {
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
          return showMessage("Please upload the stego image (or use the one you've already loaded).");
        }
        // load then extract
        loadFileToCanvas(fileInput.files[0], canvas, preview, async () => {
          await doExtractAndDecrypt(canvas, pass);
        });
      } else {
        // canvas already contains image (user hid or reloaded)
        await doExtractAndDecrypt(canvas, pass);
      }
    } catch (err) {
      console.error("stegoReveal top error:", err);
      showMessage("Unexpected error revealing message.");
    }
  }

  async function doExtractAndDecrypt(canvas, pass) {
    try {
      const payload = extractPayloadFromCanvas(canvas); // Uint8Array or null
      if (!payload) {
        return showMessage("No hidden payload found or image corrupted.");
      }
      console.info("Extract → got", payload.length, "bytes");
      // attempt decrypt
      try {
        const plain = await decryptMessage(payload, pass);
        showMessage("Decrypted message:\n\n" + plain);
        console.info("Decryption success");
      } catch (de) {
        console.error("Decrypt error:", de);
        showMessage("Wrong key or corrupted payload.");
      }
    } catch (ex) {
      console.error("Extract/Decrypt error:", ex);
      showMessage("Error extracting or decrypting payload.");
    }
  }

  // ---------- Init wiring ----------
  document.addEventListener("DOMContentLoaded", function () {
    const upload = el("stego-upload"), canvas = el("stego-canvas"), preview = el("stego-preview");
    if (upload && canvas) {
      // attach preview on change (so canvas is filled for reveal without separate upload)
      upload.addEventListener("change", () => {
        const f = upload.files[0];
        if (!f) return;
        loadFileToCanvas(f, canvas, preview);
      });
    }
    // export functions to window for inline onclicks
    window.stegoHide = stegoHide;
    window.stegoReveal = stegoReveal;

    console.info("stego.js initialized (WebCrypto version).");
  });
})();
