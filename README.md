# Veil Protocol: The Other Side

An occult-investigation TTRPG set in a hidden Tokyo, August 2015... *Lord of the Mysteries* meets *The Seven Deaths of Evelyn Hardcastle*. You play Rei Uedera, searching for a missing brother across a thinning veil between the living and the dead.

This repository holds the full toolkit: a playable, AI-driven edition of the game, the player/Warden sourcebook, the master tracker, and the world database.

## Play it

1. Get a **free** API key at <https://console.groq.com/keys> (it starts with `gsk_`).
2. Paste it into `gemini-key.txt` (this file is git-ignored... your key never leaves your machine).
3. Double-click **`Start Veil Protocol.command`**. It launches the local server and opens the game in your browser.

The launcher runs `gm-server.py` (Python 3, no installs required), which serves the game and the AI from one local port. The AI drives the Warden (game master), every NPC's in-character chat, and the in-world social feed. Groq is free; Gemini and xAI keys also work.

## What's in here

| File | What it is |
| --- | --- |
| `veil-protocol-play-v2.html` | The playable, AI-driven game |
| `gm-server.py` | Local all-in-one server (game + AI) |
| `Start Veil Protocol.command` | Double-click launcher |
| `veil-protocol-book.html` | The sourcebook... player lore + a spoiler-walled Warden section |
| `veil-protocol-tracker.html` | Master production tracker |
| `veil-protocol-image-wishlist.html` | Art prompt / drop checklist |
| `veil-protocol-decision-map.html` | Endings & decision map |
| `veil-protocol-game-systems.html` | Systems reference |
| `veil-data/` | The world database... characters, places, the Thirteen, entities |

## Notes

- **Your API key stays local.** `gemini-key.txt` is git-ignored and is never committed.
- **Art assets** (`images/`) are large and managed outside git. The book embeds its art inline, and the game falls back gracefully when art is absent.
- The **Warden's book** sits behind a spoiler wall... readers are warned before they can open it.

## Tech

Single-file HTML/CSS/JS game, a Python standard-library server, and JSON world data. No build step, no dependencies.
