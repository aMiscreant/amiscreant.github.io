let onionKeyPair = null; // store generated keys globally

async function generateOnion() {
  try {
    // Generate Ed25519 keypair
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "Ed25519",
        namedCurve: "Ed25519"
      },
      true,
      ["sign", "verify"]
    );

    onionKeyPair = keyPair; // save for download

    // Export public key
    const publicKey = await window.crypto.subtle.exportKey("raw", keyPair.publicKey);

    // Convert public key to onion v3 hostname
    const publicKeyBytes = new Uint8Array(publicKey);
    const onion = toBase32(publicKeyBytes).slice(0, 56) + ".onion";

    document.getElementById("onion-output").innerText =
      "Generated Onion Address: " + onion;
  } catch (err) {
    console.error(err);
    document.getElementById("onion-output").innerText = "Failed to generate onion address.";
  }
}

function toBase32(buffer) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  let bits = 0, value = 0, output = "";
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

async function downloadOnionKey(type) {
  if (!onionKeyPair) {
    alert("Please generate an onion key first!");
    return;
  }

  try {
    let exported, blob, filename;

    if (type === "private") {
      exported = await window.crypto.subtle.exportKey("pkcs8", onionKeyPair.privateKey);
      blob = new Blob([new Uint8Array(exported)], { type: "application/octet-stream" });
      filename = "onion_private_key.pk8";
    } else if (type === "public") {
      exported = await window.crypto.subtle.exportKey("spki", onionKeyPair.publicKey);
      blob = new Blob([new Uint8Array(exported)], { type: "application/octet-stream" });
      filename = "onion_public_key.spki";
    } else {
      alert("Unknown key type!");
      return;
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Failed to export " + type + " key.");
  }
}
