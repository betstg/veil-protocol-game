#!/bin/bash
# Usage: canon/check.sh 12.txt [13.txt ...]
for f in "$@"; do
  echo "== $f"
  grep -n -i -E "\brats?\b|\bowed\b|\bdebt|nineteen|level (one|two|three|four|five|[0-9])|class [a-e]\b|percent|%|white (chess )?king|\bking\b|yushiro|hunger demon|demon of (joy|hunger)|delivered|read it (twice|three times)|in plain words|trainee" "$f"
  # Rejected by Betty (invencoes-livro-um, invencoes-livro-dois, decisoes 19 Nov). Must be zero.
  grep -n -i -E "door in (his|my|your) chest|empty frame|\blatch|his door\b|\bFujii\b|\bMitsu\b|\bTakuya\b|\bcousins?\b|teapot|her tea|drinking (her|the) tea|white table|hollow ones?|kintsugi" "$f" | sed 's/^/   REJEITADO /' | head -20
  echo "   'the way' count: $(grep -o -i 'the way' "$f" | wc -l)"
  grep -n -E "[;:—–]" "$f" | grep -v -E "^\S*:\[(need|img|break|doc|/doc)" | grep -v "^[0-9]*:#title" | head -5
done
