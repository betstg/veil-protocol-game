#!/usr/bin/env bash
# Runs during the Cloudflare build. Copies the OPENROUTER_API_KEY *build variable*
# into the Worker's RUNTIME secret, so the running Worker can read it.
set +e
if [ -n "$OPENROUTER_API_KEY" ]; then
  echo ">> Injecting OPENROUTER_API_KEY into the Worker runtime secret..."
  printf '%s' "$OPENROUTER_API_KEY" | npx wrangler secret put OPENROUTER_API_KEY && echo ">> Secret set OK" || echo ">> secret put failed (continuing build)"
else
  echo ">> No OPENROUTER_API_KEY build variable present; skipping."
fi
exit 0
