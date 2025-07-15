---
layout: page
title: Discord YouTube Download Bot
published: 2025-07-08
date: 2024-10-19
description:  Download YouTube videos or audio straight from Discord commands.
permalink: /snippets/python/bots/youtube
category: Bots
subcategory: YouTube
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

#### This Python-powered bot lets Discord users download YouTube videos or extract audio directly from chat. Enter a simple command, and the bot fetches the media, processes it, and shares the file back in the channel. Ideal for grabbing music, educational clips, or saving content for offline use—all without leaving Discord.

---

```python
import discord
from discord import app_commands
from discord.ext import commands
import yt_dlp
import os
import re
import asyncio
from functools import partial

from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("DISCORD_DOWNLOADER")

intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)

# Ensure downloads folder exists
os.makedirs("downloads", exist_ok=True)


class YTDLSource:
    @staticmethod
    def is_youtube_url(url):
        youtube_regex = r"(https?://)?(www\.)?(youtube\.com|youtu\.be)/"
        return re.match(youtube_regex, url) is not None

    @staticmethod
    def search(query):
        ydl_opts = {
            'quiet': True,
            'skip_download': True,
            'extract_flat': 'in_playlist',
            'default_search': 'ytsearch5',
            'format': 'bestaudio/best'
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(query, download=False)
                if 'entries' in info:
                    return info['entries']
                else:
                    return [info]
        except yt_dlp.utils.DownloadError as e:
            print(f"[ERROR] yt-dlp search error: {e}")
            return None
        except Exception as e:
            print(f"[ERROR] yt-dlp unknown search error: {e}")
            return None

    @staticmethod
    def extract_from_url(url):
        ydl_opts = {
            'quiet': True,
            'skip_download': True,
            'extract_flat': 'in_playlist',
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)

                if info.get('_type') == 'playlist':
                    entries = info['entries']
                    return entries
                else:
                    return [info]
        except yt_dlp.utils.DownloadError as e:
            print(f"[ERROR] yt-dlp extract error: {e}")
            return None
        except Exception as e:
            print(f"[ERROR] yt-dlp unknown extract error: {e}")
            return None

    @staticmethod
    def download_audio(url):
        output_path = "downloads/%(title)s.%(ext)s"
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': output_path,
            'quiet': True,
            'noplaylist': True,
            'cookiefile': 'cookies.txt',
            'user_agent': 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '128',
            }],
            'postprocessor_args': ['-t', '300'],
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                filename = ydl.prepare_filename(info)
                audio_file = os.path.splitext(filename)[0] + ".mp3"
                return audio_file
        except yt_dlp.utils.DownloadError as e:
            print(f"[ERROR] yt-dlp download error: {e}")
            raise e
        except Exception as e:
            print(f"[ERROR] yt-dlp unknown download error: {e}")
            raise e


async def run_in_executor(func, *args, **kwargs):
    loop = asyncio.get_running_loop()
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


@bot.tree.command(name="discord-dl", description="Search YouTube or paste a link to download audio")
@app_commands.describe(query="Search term or YouTube link")
async def discord_dl(interaction: discord.Interaction, query: str):
    await interaction.response.defer(thinking=True)

    # Check if query is a direct YouTube link
    if YTDLSource.is_youtube_url(query):
        results = YTDLSource.extract_from_url(query)
    else:
        results = YTDLSource.search(query)

    if not results:
        await interaction.followup.send("❌ No results found or an error occurred while searching.")
        return

    # Clip options to max 25 to avoid Discord error
    results = results[:25]

    options = []
    for video in results:
        title = video.get("title", "Unknown Title")
        video_id = video.get("id")
        if not video_id:
            continue
        url = f"https://www.youtube.com/watch?v={video_id}"
        options.append(
            discord.SelectOption(
                label=title[:100],
                value=url,
                description=url[:100]
            )
        )

    if not options:
        await interaction.followup.send("❌ No valid videos found.")
        return

    class VideoSelect(discord.ui.Select):
        def __init__(self):
            super().__init__(
                placeholder="Choose a video or playlist item...",
                options=options,
                min_values=1,
                max_values=1,
            )

        async def callback(self, select_interaction: discord.Interaction):
            chosen_url = self.values[0]
            await select_interaction.response.defer(thinking=True)

            entries = YTDLSource.extract_from_url(chosen_url)
            if entries is None:
                await select_interaction.followup.send(
                    f"❌ Failed to extract data for: <{chosen_url}>"
                )
                return

            if len(entries) > 1:
                await download_queue(select_interaction, entries)
            else:
                try:
                    audio_file = await run_in_executor(
                        YTDLSource.download_audio, chosen_url
                    )
                except yt_dlp.utils.DownloadError as e:
                    await select_interaction.followup.send(
                        f"❌ Download error:\n```{str(e)}```"
                    )
                    return
                except Exception as e:
                    await select_interaction.followup.send(
                        f"❌ Unknown error occurred:\n```{str(e)}```"
                    )
                    return

                await select_interaction.followup.send(
                    content=f"✅ **Done:** <{chosen_url}>",
                    file=discord.File(audio_file)
                )
                os.remove(audio_file)

    view = discord.ui.View()
    view.add_item(VideoSelect())

    await interaction.followup.send(
        "Select the video you want to download audio from:",
        view=view
    )


async def download_queue(interaction, video_entries):
    # clip large playlists to avoid overwhelming Discord
    video_entries = video_entries[:25]

    for video in video_entries:
        title = video.get("title", "Untitled")
        video_id = video.get("id")
        if not video_id:
            continue
        url = f"https://www.youtube.com/watch?v={video_id}"

        await interaction.followup.send(f"▶️ **Downloading:** {title}")

        try:
            audio_file = await run_in_executor(
                YTDLSource.download_audio, url
            )
        except yt_dlp.utils.DownloadError as e:
            await interaction.followup.send(
                f"❌ Download error for {title}:\n```{str(e)}```"
            )
            continue
        except Exception as e:
            await interaction.followup.send(
                f"❌ Unknown error for {title}:\n```{str(e)}```"
            )
            continue

        await interaction.followup.send(
            content=f"✅ **Done:** {title}\n<{url}>",
            file=discord.File(audio_file)
        )
        os.remove(audio_file)

    await interaction.followup.send("✅ **All playlist downloads finished!**")


bot.run(TOKEN)

```

---