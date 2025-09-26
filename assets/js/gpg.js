document.addEventListener("DOMContentLoaded", () => {
  window.generateGPGKey = async function() {
    const name = document.getElementById("gpg-name").value;
    const email = document.getElementById("gpg-email").value;
    const passphrase = document.getElementById("gpg-passphrase").value;

    if (!name || !email) {
      document.getElementById("gpg-output").textContent = "Name and email are required.";
      return;
    }

    const { privateKey, publicKey } = await openpgp.generateKey({
      type: 'rsa',
      rsaBits: 2048,
      userIDs: [{ name, email }],
      passphrase
    });

    window.gpgKeys = { privateKey, publicKey };
    document.getElementById("gpg-output").textContent = "GPG Key pair generated!";
  }

  window.downloadGPGKey = function(type) {
    if (!window.gpgKeys) return alert("Generate keys first!");
    const key = type === "public" ? window.gpgKeys.publicKey : window.gpgKeys.privateKey;
    const blob = new Blob([key], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = type + "_key.asc";
    a.click();
  }
});
