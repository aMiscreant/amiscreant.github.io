---
layout: page
title: Discord Bandcamp Download Bot
published: 2025-07-08
date: 2024-10-19
description:  Search Bandcamp and download tracks directly inside Discord.
permalink: /snippets/python/bots/bandcamp
category: Bots
subcategory: Bandcamp
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

####  This bot lets you explore Bandcamp’s massive music library without leaving Discord. Search for albums or tracks, preview details like track length, and instantly download MP3s—all delivered seamlessly in your Discord server. Perfect for music lovers who want quick access to Bandcamp’s indie gems.

---

```python
import discord
from discord import app_commands
from discord.ext import commands
import os
import asyncio
import yt_dlp
import requests
from bs4 import BeautifulSoup
from functools import partial
from dotenv import load_dotenv
import time
import yt_dlp
from yt_dlp.utils import DownloadError


load_dotenv()
TOKEN = os.getenv("DISCORD_BANDCAMP")

intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)

os.makedirs("downloads", exist_ok=True)

# Updated search_bandcamp
def search_bandcamp(query):
    url = f"https://bandcamp.com/search?q={query.replace(' ', '+')}"
    resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(resp.text, "html.parser")

    items = []
    for div in soup.find_all("li", class_="searchresult"):
        heading_div = div.find("div", class_="heading")
        if not heading_div:
            continue

        link_tag = heading_div.find("a")
        if not link_tag:
            continue

        title = link_tag.get_text(strip=True)
        url = link_tag.get("href", "").strip()

        # Find result type (album, track, etc.)
        type_div = div.find("div", class_="itemtype")
        result_type = type_div.get_text(strip=True) if type_div else None

        # Only albums have length in search results
        length_div = div.find("div", class_="length") if result_type == "ALBUM" else None
        length_text = length_div.get_text(strip=True) if length_div else None

        items.append({
            "title": title,
            "url": url,
            "type": result_type,
            "length": length_text
        })

        if len(items) >= 10:
            break

    return items

# Download audio using yt-dlp
def download_bandcamp_audio(url, retries=3):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': 'downloads/%(title)s.%(ext)s',
        'quiet': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '128',
        }],
    }

    for attempt in range(1, retries+1):
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                filename = ydl.prepare_filename(info)
                audio_file = os.path.splitext(filename)[0] + ".mp3"
                return audio_file
        except DownloadError as e:
            if 'Failed to resolve' in str(e):
                print(f"DNS resolution error on attempt {attempt} for {url}")
                if attempt < retries:
                    time.sleep(2 ** attempt)  # exponential backoff
                    continue
            raise
    return None

# Run sync functions in background
async def run_in_executor(func, *args, **kwargs):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, partial(func, *args, **kwargs))


@bot.event
async def on_ready():
    print(f"Bot connected as {bot.user}")
    try:
        synced = await bot.tree.sync()
        print(f"Synced {len(synced)} commands")
        for cmd in synced:
            print(f"- {cmd.name}: {cmd.description}")
    except Exception as e:
        print(e)


@bot.tree.command(name="bc-dl", description="Search Bandcamp and download audio")
@app_commands.describe(query="Search term for Bandcamp")
async def bc_dl(interaction: discord.Interaction, query: str):
    await interaction.response.defer(thinking=True)
    results = await run_in_executor(search_bandcamp, query)

    if not results:
        await interaction.followup.send("❌ No Bandcamp results found.")
        return

    options = []
    for i, item in enumerate(results):
        display = f"{item['title']} [{item['type']}"
        if item['length']:
            display += f" • {item['length']}"
        display += "]"
        display = display[:100]
        options.append(
            discord.SelectOption(
                label=display,
                value=str(i)   # ✅ index instead of URL
            )
        )

    class BandcampSelect(discord.ui.Select):
        def __init__(self):
            super().__init__(
                placeholder="🎵 Choose a track or album to download",
                min_values=1,
                max_values=1,
                options=options
            )

        async def callback(self, select_interaction: discord.Interaction):
            index = int(self.values[0])
            selected_url = results[index]["url"]
            await select_interaction.response.defer(thinking=True)
            try:
                audio_file = await run_in_executor(download_bandcamp_audio, selected_url)
                await select_interaction.followup.send(
                    content=f"✅ Downloaded from: <{selected_url}>",
                    file=discord.File(audio_file)
                )
                os.remove(audio_file)
            except Exception as e:
                await select_interaction.followup.send(f"❌ Download failed:\n```{str(e)}```")

    view = discord.ui.View()
    view.add_item(BandcampSelect())

    await interaction.followup.send(
        content="🔍 Found Bandcamp results. Select one to download:",
        view=view
    )

bot.run(TOKEN)

```

---