#!/usr/bin/env bash
# Runs during the Cloudflare build. Copies the API_KEY *build variable*
# into the Worker's RUNTIME secret, so the running Worker can read it.
# Provider + models are auto-detected from the key prefix, so you only ever
# change the VALUE of API_KEY — never the name, never the model.
# (Still accepts the old OPENROUTER_API_KEY name as a fallback.)
set +e
KEY="${API_KEY:-$OPENROUTER_API_KEY}"
if [ -n "$KEY" ]; then
  echo ">> Injecting API_KEY into the Worker runtime secret..."
  printf '%s' "$KEY" | npx wrangler secret put API_KEY && echo ">> Secret set OK" || echo ">> secret put failed (continuing build)"
else
  echo ">> No API_KEY build variable present; skipping."
fi
exit 0
