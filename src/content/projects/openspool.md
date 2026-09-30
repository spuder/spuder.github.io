---
title: OpenSpool
tagline: Open-source RFID tags for 3D printer filament. Tap a spool on the reader and the printer loads the right filament settings.
repo: spuder/OpenSpool
group: hardware
featured: true
order: 1
tags: [ESP32, ESPHome, NFC, C++]
image: /projects/openspool.png
imageAlt: The OpenSpool reader, a small white 3D-printed enclosure with the OpenSpool logo, sitting next to a 3D printer.
stars: 771
links:
  - { label: Docs at openspool.io, url: "https://openspool.io" }
  - { label: Discord, url: "https://discord.gg/4EaXHu9CEj" }
  - { label: r/openspool, url: "https://www.reddit.com/r/openspool" }
---

## The problem

Bambu Lab printers can read filament settings from RFID chips on their own spools when those spools are loaded through the AMS. Filament from any other brand has no tag, so you have to enter the type and color by hand every time you change spools.

## What I built

OpenSpool gives any spool that same tap-to-load experience:

1. Put an NTAG215 or NTAG216 NFC sticker on each spool.
2. Build a small ESP32-based OpenSpool reader and place it next to the printer.
3. Touch the spool to the reader. It sends the filament type and color to the printer, almost as smoothly as a Bambu spool in an AMS.

The tag format is kept as simple as possible, so tags are cheap and easy to write, including from the [OpenSpool mobile app](/projects/openspool-mobile/).

## Protocol support

OpenSpool reads and writes its own tag format, and support for other formats is in progress:

- **OpenSpool:** read and write, on NTAG215/216 tags
- **TigerTag and OpenTag3D:** in progress. OpenTag3D is an open standard that several filament makers are adopting.
- **Bambu:** read support in progress
- **Creality, Elegoo, Anycubic:** planned or being researched

## The community

OpenSpool has grown into a community project with a Discord server and a subreddit. It's one of the most-starred projects on my GitHub.
