#!/bin/bash
# Double-click to pull the latest commits and rebuild everything.
# Pull only (never pushes). Rebuilds: the playable game bundle, the Story page, and re-embeds the wishlist into the tracker.
cd "$(dirname "$0")" || exit 1
echo "================================================"
echo " Veil Protocol · update + rebuild"
echo "================================================"

if git rev-parse --git-dir >/dev/null 2>&1; then
  echo "› git pull (fast-forward only)…"
  git pull --ff-only || echo "  ! pull skipped/failed — you may have local changes or a diverged branch. Resolve in a terminal if needed."
else
  echo "  (this folder isn't a git repo — skipping pull)"
fi

if command -v python3 >/dev/null 2>&1; then
  echo "› rebuilding the playable game bundle…"
  python3 tools/build_game.py || echo "  ! game build failed"
else
  echo "  ! python3 not found — skipped game build"
fi

if command -v node >/dev/null 2>&1; then
  echo "› rebuilding the Story page…"
  node tools/build_story.mjs || echo "  ! story build failed"
  echo "› re-embedding the wishlist into the tracker…"
  node tools/embed_wishlist.mjs || echo "  ! wishlist embed failed"
else
  echo "  ! node not found — skipped story/tracker rebuild"
fi

echo "================================================"
echo " done."
echo "================================================"
echo "Press any key to close."
read -n 1 -s
