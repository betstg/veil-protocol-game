# Veil Protocol — the Database

This folder is the **single source of truth** for the game's data. Everything else
(the book, the game, the tracker) is just a *view* of what lives here. You edit a
thing **once**, here, and every view can read from it. No more typing Kishin twice.

## The idea: nodes + links = a network

Think of it as a **recipe box**. Each file is a stack of cards (nodes). Each card
has an `id` (its unique name) and some fields. Cards point at each other through
`links` — and those links are what make it a **network/tree** instead of flat lists.

```
character ──member_of──▶ faction
    │
    ├──lives_at──▶ place
    ├──works_at──▶ place
    ├──knows─────▶ character   (with a number: −100..+100)
    └──involved_in▶ quest
```

So "where is everyone, who do they trust, what faction, what quest" is not written
out by hand — it's **walked** along the links. That's the tree you asked for.

## The files (the node types)

| File | What it holds | Key fields |
|------|---------------|-----------|
| `characters.json` | every person (69) | `id, name, faction, role, location, links[]` |
| `places.json` | every location (16) | `id, name, faction, lat, lng, hours, known, art` |
| `factions.json` | the groups | `id, name, what` |
| `thirteen.json` | the 13 emotion-seats | `seat, emotion, demon, holder` |
| `ranks.json` | the power ladder | `rank, name, flags` |

### A character card looks like this
```json
{
  "id": "kuroda-sei",
  "name": "Kuroda Sei",
  "faction": "towers",
  "role": "Teleportation master",
  "location": "Kuroda compound, Nezu",
  "links": [
    { "type": "member_of",  "to": "towers" },
    { "type": "lives_at",   "to": "kurodacompound" },
    { "type": "knows",      "to": "kuroda-itsuki", "value": -20 },
    { "type": "gatekeeps",  "to": "teleportation" }
  ]
}
```
To **add a character**: copy a card, change the `id` (lowercase-with-dashes,
unique) and the fields. To **link** two things, add a `{ "type": ..., "to": ... }`
to `links`. That's the whole skill.

### Link types we use
`member_of` · `lives_at` · `works_at` · `knows` (with `value`) · `romance`
(with `opensAt`) · `involved_in` · `gatekeeps` · `rides` (a demon → its host).

## How the views read it
- **The game** loads these JSON files at startup and builds the world from them.
- **The book** can be regenerated from them too (so a character only exists once).
- **You** edit the JSON (or a connected Airtable/Sheet that exports to JSON).

## Editing without code (recommended for you)
Import these JSON files into **Airtable** or **Google Sheets** as tables, edit
visually, then export back to JSON. I can do the export step. That keeps *you* in a
friendly grid and the *game* on clean data.

---

## Hosting it (so the map and everything load live)

The app's preview can't reach the internet, so the live map only shows in a real
browser. Put the project on **GitHub Pages** (free) and it works everywhere.

**Easiest path — no commands (web upload):**
1. Make a free account at github.com (if you don't have one).
2. Click **New repository** → name it `veil-protocol` → **Public** → Create.
3. On the repo page: **Add file ▸ Upload files** → drag in
   `veil-protocol-play-v2.html`, `veil-protocol-book.html`,
   `veil-protocol-tracker.html`, the `veil-data` folder, and the `place_*.png`
   images → **Commit**.
4. **Settings ▸ Pages** → Source: **Deploy from a branch** → Branch: **main /(root)** → Save.
5. Wait ~1 minute. Your game is live at:
   `https://YOUR-USERNAME.github.io/veil-protocol/veil-protocol-play-v2.html`
   Open that in Chrome/Safari — the real map loads.

**Command path (if you prefer the terminal):** tell me and I'll write the exact
`git` commands; you paste them once.

I can't log into your GitHub or push for you (that needs your password), but I've
prepared every file so the upload above is all that's left.
