---
layout: page
title: Discord Bot
published: 2025-07-08
date: 2024-10-19
description:  An encrypted Python Discord bot for secure messaging and file sharing.
permalink: /snippets/python/bots/discord
category: Bots
subcategory: Discord
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

<p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
<p>{{ page.description }}</p>

---

#### This Python-based Discord bot brings powerful end-to-end encryption into your server. Users can generate public/private key pairs, send each other encrypted messages or files, and decrypt them privately—all from simple Discord slash commands. It’s perfect for communities or teams who value privacy and want to keep their conversations and documents secure, seamlessly integrated inside Discord’s chat environment.

---

Full Source:

```python
import os
from dotenv import load_dotenv

import discord
from discord import app_commands
from discord.ext import commands
from nacl.public import PrivateKey, PublicKey, SealedBox

# Load variables from .env file
load_dotenv()

TOKEN = os.getenv("DISCORD_TOKEN")

# This is a demo storage for user keys:
# In real life you'd store this securely in a DB
user_keys = {}

intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"Bot connected as {bot.user}")
    try:
        synced = await bot.tree.sync()
        print(f"Synced {len(synced)} commands")
    except Exception as e:
        print(e)


# Command: /generate_keys
@bot.tree.command(name="generate_keys", description="Generate a new public/private key pair.")
async def generate_keys(interaction: discord.Interaction):
    private_key = PrivateKey.generate()
    public_key = private_key.public_key
    user_keys[interaction.user.id] = {
        "private_key": private_key.encode().hex(),
        "public_key": public_key.encode().hex()
    }
    await interaction.response.send_message(
        f"✅ Your keypair has been generated!\nPublic Key:\n`{public_key.encode().hex()}`",
        ephemeral=True
    )


# Command: /encrypt
@bot.tree.command(name="encrypt", description="Encrypt a message for another user.")
@app_commands.describe(to_user="User to encrypt message for", message="Message to encrypt")
async def encrypt(interaction: discord.Interaction, to_user: discord.User, message: str):
    if to_user.id not in user_keys:
        await interaction.response.send_message(
            "❌ That user has not generated keys yet. Ask them to run /generate_keys.",
            ephemeral=True
        )
        return

    pub_key_hex = user_keys[to_user.id]["public_key"]
    recipient_pub_key = PublicKey(bytes.fromhex(pub_key_hex))

    sealed_box = SealedBox(recipient_pub_key)
    encrypted = sealed_box.encrypt(message.encode())

    await interaction.response.send_message(
        f"🔒 Message for {to_user.mention}:\n```\n{encrypted.hex()}\n```"
    )


# Command: /decrypt
@bot.tree.command(name="decrypt", description="Decrypt an encrypted message.")
@app_commands.describe(ciphertext="Encrypted message in hex")
async def decrypt(interaction: discord.Interaction, ciphertext: str):
    if interaction.user.id not in user_keys:
        await interaction.response.send_message(
            "❌ You don't have a keypair. Run /generate_keys first.",
            ephemeral=True
        )
        return

    priv_key_hex = user_keys[interaction.user.id]["private_key"]
    private_key = PrivateKey(bytes.fromhex(priv_key_hex))

    sealed_box = SealedBox(private_key)
    try:
        decrypted = sealed_box.decrypt(bytes.fromhex(ciphertext))
        plaintext = decrypted.decode()
        await interaction.response.send_message(
            f"✅ Decrypted message:\n```\n{plaintext}\n```",
            ephemeral=True
        )
    except Exception as e:
        await interaction.response.send_message(
            f"❌ Failed to decrypt: {str(e)}",
            ephemeral=True
        )

# Command: /encrypt_file
@bot.tree.command(name="encrypt_file", description="Encrypt a file for another user.")
@app_commands.describe(to_user="User to encrypt file for")
async def encrypt_file(interaction: discord.Interaction, to_user: discord.User, attachment: discord.Attachment):
    await interaction.response.defer(thinking=True, ephemeral=True)

    if to_user.id not in user_keys:
        await interaction.followup.send(
            "❌ That user has not generated keys yet. Ask them to run /generate_keys.",
            ephemeral=True
        )
        return

    # Download the uploaded file
    file_bytes = await attachment.read()

    # Encrypt the file
    pub_key_hex = user_keys[to_user.id]["public_key"]
    recipient_pub_key = PublicKey(bytes.fromhex(pub_key_hex))
    sealed_box = SealedBox(recipient_pub_key)
    encrypted_bytes = sealed_box.encrypt(file_bytes)

    # Save to a temporary file
    enc_filename = f"encrypted_{attachment.filename}.bin"
    with open(enc_filename, "wb") as f:
        f.write(encrypted_bytes)

    # Send the encrypted file as an attachment
    file_to_send = discord.File(enc_filename, filename=enc_filename)

    await interaction.followup.send(
        f"🔒 Encrypted file for {to_user.mention} attached.\nRun `/decrypt_file` to recover it.",
        file=file_to_send
    )

    # Clean up temp file
    os.remove(enc_filename)


# Command: /decrypt_file
@bot.tree.command(name="decrypt_file", description="Decrypt an encrypted file sent to you.")
async def decrypt_file(interaction: discord.Interaction, attachment: discord.Attachment):
    await interaction.response.defer(thinking=True, ephemeral=True)

    if interaction.user.id not in user_keys:
        await interaction.followup.send(
            "❌ You don't have a keypair. Run /generate_keys first.",
            ephemeral=True
        )
        return

    # Download the encrypted file
    encrypted_bytes = await attachment.read()

    priv_key_hex = user_keys[interaction.user.id]["private_key"]
    private_key = PrivateKey(bytes.fromhex(priv_key_hex))
    sealed_box = SealedBox(private_key)

    try:
        decrypted_bytes = sealed_box.decrypt(encrypted_bytes)
    except Exception as e:
        await interaction.followup.send(
            f"❌ Failed to decrypt file: {str(e)}",
            ephemeral=True
        )
        return

    # Write decrypted file
    decrypted_filename = attachment.filename.replace("encrypted_", "").replace(".bin", "")
    with open(decrypted_filename, "wb") as f:
        f.write(decrypted_bytes)

    # Send back the decrypted file privately
    decrypted_file = discord.File(decrypted_filename, filename=decrypted_filename)

    await interaction.followup.send(
        f"✅ File decrypted successfully!",
        file=decrypted_file,
        ephemeral=True
    )

    # Clean up temp file
    os.remove(decrypted_filename)


if __name__ == "__main__":
    bot.run(TOKEN)

```

---

- **Must create .env file** 
  - **Inside the file:**
    - _DISCORD_TOKEN=YOUR_TOKEN_HERE_ 

---