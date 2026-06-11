# Veil Protocol — Cloudflare deploy (for a developer)

Everything is already built. This wires the game **and** the live AI Warden onto Cloudflare. ~15 min.

## What's here
- `veil-protocol-play-v2.html` — the game (single file). Its `GM_ENDPOINT` already resolves to `/api` when served over http, so on Cloudflare it talks to the function below **same-origin** (no CORS needed).
- `functions/api/gm.js` — the Warden AI endpoint (Cloudflare Pages Function). Handles `mode: gm | npc | social`.
- `functions/api/health.js` — health check the game pings on load.
- `functions/api/_prompts.json` — the system prompts (generated from `gm-server.py`, single source of truth).
- `veil-data/*.json` — the game database (characters, places, etc.), fetched at runtime.

## The one gotcha
`veil-protocol-book.html` is **39 MB** and Cloudflare Pages rejects files over **25 MB**. So exclude it from the Cloudflare build. The book stays hosted on GitHub Pages (already live at https://betstg.github.io/veil-protocol-game/veil-protocol-book.html).

## Steps (Cloudflare dashboard)
1. **Workers & Pages → Create → Pages → Connect to Git** → pick `betstg/veil-protocol-game` (branch `master`).
2. **Build settings:**
   - Framework preset: **None**
   - **Build command:**
     ```
     mkdir -p _site && rsync -a --exclude '_site' --exclude 'veil-protocol-book.html' --exclude '.git' ./ _site/
     ```
   - **Build output directory:** `_site`
   - (This copies everything except the oversized book into the deployed site. `functions/` is detected automatically.)
3. **Deploy.** You get a `*.pages.dev` URL.
4. **Settings → Environment variables → add a Secret:**
   - Name: `OPENROUTER_API_KEY`  Value: Betty's `sk-or-…` key (she has it; it must NOT be committed to the repo).
   - (Provider auto-detects from the key prefix. `gsk_`=Groq, `xai-`=xAI, `AIza…`=Gemini also work.)
5. **Redeploy** so the secret is picked up.

## Verify
- Open the `*.pages.dev` URL → the game loads.
- Open `/api/health` → should return `{"ok":true,"provider":"openrouter",...}`.
- In the game, open the **Phone**, message a contact → the Warden replies in character. Done.

## Notes
- The AI logic mirrors `gm-server.py` exactly (same prompts, same JSON contract: `{text, relDelta, romanceDelta, reason, learned, event}` for npc; `{narration, options, action}` for gm).
- Local dev still works unchanged: `python3 gm-server.py` then open `localhost:8787`.
