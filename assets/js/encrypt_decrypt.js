// Function to derive the key for AES
async function deriveKey(password, salt, algo) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  if (algo === "AES-GCM") {
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  if (algo === "AES-CBC") {
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-CBC", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
  if (algo === "AES-CTR") {
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-CTR", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
}

async function cryptoEncrypt() {
  const algo = document.getElementById("crypto-algo").value;
  const message = document.getElementById("crypto-message").value;
  const password = document.getElementById("crypto-key").value;

  if (!message || !password) {
    document.getElementById("crypto-output").textContent = "Message and key required.";
    return;
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(16));  // 16 bytes for CBC/CTR/ECB, 12 bytes for GCM

  const key = await deriveKey(password, salt, algo);

  let ciphertext;
  if (algo === "AES-GCM") {
    ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(message)
    );
  } else if (algo === "AES-CBC") {
    ciphertext = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      new TextEncoder().encode(message)
    );
  } else if (algo === "AES-CTR") {
    ciphertext = await crypto.subtle.encrypt(
      { name: "AES-CTR", counter: iv, length: 64 }, // AES-CTR requires a counter & length
      key,
      new TextEncoder().encode(message)
    );
  }

  const cipherBytes = new Uint8Array(ciphertext);
  const fullMessage = new Uint8Array(salt.length + iv.length + cipherBytes.length);
  fullMessage.set(salt, 0);
  fullMessage.set(iv, salt.length);
  fullMessage.set(cipherBytes, salt.length + iv.length);

  document.getElementById("crypto-output").textContent = "Encrypted message: " + Array.from(fullMessage).join(", ");
}

async function cryptoDecrypt() {
  const algo = document.getElementById("crypto-algo").value;
  const encryptedData = document.getElementById("crypto-message").value; // Encrypted message entered by user
  const password = document.getElementById("crypto-key").value;

  if (!encryptedData || !password) {
    document.getElementById("crypto-output").textContent = "Encrypted data and key required.";
    return;
  }

  const data = new Uint8Array(encryptedData.split(",").map(Number));
  const salt = data.slice(0, 16);

  let ivLength = 16; // Default for CBC/CTR/ECB
  if (algo === "AES-GCM") ivLength = 12; // GCM uses 12-byte IV

  const iv = data.slice(16, 16 + ivLength);
  const ciphertext = data.slice(16 + ivLength);

  const key = await deriveKey(password, salt, algo);

  let plaintext;
  try {
    if (algo === "AES-GCM") {
      plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
      );
    } else if (algo === "AES-CBC") {
      plaintext = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        key,
        ciphertext
      );
    } else if (algo === "AES-CTR") {
      plaintext = await crypto.subtle.decrypt(
        { name: "AES-CTR", counter: iv, length: 64 }, // AES-CTR needs counter & length
        key,
        ciphertext
      );
    }

    document.getElementById("crypto-output").textContent = "Decrypted message: " + new TextDecoder().decode(plaintext);
  } catch (e) {
    document.getElementById("crypto-output").textContent = "Failed to decrypt message.";
    console.error("Decryption error:", e);
  }
}

// Reset message, key, and output when algorithm changes
document.getElementById("crypto-algo").addEventListener("change", () => {
  document.getElementById("crypto-message").value = "";
  document.getElementById("crypto-key").value = "";
  document.getElementById("crypto-output").textContent = "";
});
