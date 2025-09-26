// shamir.js

function shamirSplit() {
  const secret = document.getElementById("shamir-secret").value.trim();
  const n = parseInt(document.getElementById("shamir-n").value, 10);
  const k = parseInt(document.getElementById("shamir-k").value, 10);

  if (!secret) {
    document.getElementById("shamir-shares").innerText = "Please enter a secret.";
    return;
  }

  if (k > n) {
    document.getElementById("shamir-shares").innerText = "Threshold (k) must be ≤ total shares (n).";
    return;
  }

  // Convert secret to hex
  const hexSecret = secrets.str2hex(secret);

  // Split into n shares, threshold k
  const shares = secrets.share(hexSecret, n, k);

  // Display shares
  document.getElementById("shamir-shares").innerHTML =
    shares.map((s, i) => `<div><strong>Share ${i + 1}:</strong> ${s}</div>`).join("");
}

function shamirCombine() {
  const sharesInput = document.getElementById("shamir-input-shares").value.trim();

  if (!sharesInput) {
    document.getElementById("shamir-output").innerText = "Please paste shares.";
    return;
  }

  const shares = sharesInput.split(/\s+/);

  try {
    const combinedHex = secrets.combine(shares);
    const combinedSecret = secrets.hex2str(combinedHex);
    document.getElementById("shamir-output").innerText = `✅ Recovered secret: ${combinedSecret}`;
  } catch (err) {
    document.getElementById("shamir-output").innerText = `❌ Error: ${err.message}`;
  }
}

function shamirClear() {
  document.getElementById("shamir-secret").value = "";
  document.getElementById("shamir-shares").innerText = "Shares cleared.";
  document.getElementById("shamir-input-shares").value = "";
  document.getElementById("shamir-output").innerText = "";
}

function shamirDownloadAll() {
  const sharesDiv = document.getElementById("shamir-shares");
  const text = sharesDiv.innerText.trim();

  if (!text) {
    alert("No shares to download. Split a secret first.");
    return;
  }

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shamir-shares.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
