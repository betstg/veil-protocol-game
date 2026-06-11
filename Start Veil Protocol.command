#!/bin/bash
# Double-click this to play Veil Protocol with the live AI.
# It runs the all-in-one Python server and opens the game in your browser.
cd "$(dirname "$0")"

# 1) Make sure we have a Gemini key (free from https://aistudio.google.com/apikey)
if [ -z "$GEMINI_API_KEY" ] && [ ! -s gemini-key.txt ]; then
  echo ""
  echo "  First-time setup: paste your FREE Gemini API key."
  echo "  Get one at  https://aistudio.google.com/apikey  (sign in, Create API key, copy it)."
  echo ""
  printf "  Paste your key here and press Enter: "
  read -r KEY
  echo "$KEY" > gemini-key.txt
  echo "  Saved. (You won't be asked again.)"
fi

# 2) Open the game once the server is up
( sleep 2; open "http://localhost:8787/veil-protocol-play-v2.html" ) &

# 3) Start the all-in-one server (game + AI on one port)
echo ""
echo "  Starting Veil Protocol…  (keep this window open while you play; close it to stop)"
echo ""
python3 gm-server.py
