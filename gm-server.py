#!/usr/bin/env python3
"""
Veil Protocol... all-in-one local server (Python 3, no extra installs).
Serves the GAME and the AI backend from ONE port. Your Gemini key stays on
your machine... read from gemini-key.txt (or the GEMINI_API_KEY env var), never
sent to the browser.

 Easiest: double-click "Start Veil Protocol.command"
 Manual : python3 gm-server.py   (then open http://localhost:8787/veil-protocol-play-v2.html)
"""
import os, json, ssl, urllib.request, urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
# Try these in order; if one is rate-limited/unavailable (429/404), fall through to the next.
# Override with: GM_MODEL=some-model python3 gm-server.py
_DEFAULT_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"]
_envm = os.environ.get("GM_MODEL", "").strip()
MODELS = ([_envm] if _envm else []) + [m for m in _DEFAULT_MODELS if m != _envm]
MODEL = MODELS[0]
PORT = 8787

# A browser-like User-Agent so Cloudflare-fronted APIs (Groq) don't 403 the bare urllib signature.
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"

# --- key: env var first, then gemini-key.txt next to this file ---
KEY = os.environ.get("GEMINI_API_KEY", "").strip()
if not KEY:
  try:
    with open(os.path.join(HERE, "gemini-key.txt"), encoding="utf-8") as f:
      for line in f:            # ignore comment (#) and blank lines
        s = line.strip().strip('"').strip("'")
        if s and not s.startswith("#"):
          KEY = s
          break
  except Exception:
    KEY = ""

# Pick the provider automatically from the key prefix.
if KEY.startswith("gsk_"):     PROVIDER = "groq"        # Groq (free)... console.groq.com
elif KEY.startswith("xai-"):    PROVIDER = "xai"         # xAI / Grok (paid)... x.ai
elif KEY.startswith("sk-or-"):  PROVIDER = "openrouter"  # OpenRouter... openrouter.ai
else:                PROVIDER = "gemini"      # Google AI Studio (AIza...)
# OpenAI-compatible providers: (chat-completions URL, models to try in order)
# Override the model list per provider with the GM_MODEL env var.
OAI = {
  "groq": ("https://api.groq.com/openai/v1/chat/completions",
       ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "gemma2-9b-it"]),
  "xai": ("https://api.x.ai/v1/chat/completions",
       ["grok-2-latest", "grok-beta"]),
  "openrouter": ("https://openrouter.ai/api/v1/chat/completions",
       ([_envm] if _envm else []) + ["cognitivecomputations/dolphin-mistral-24b-venice-edition:free"]),
}

WORLD = """WORLD CANON (never contradict, never reveal what a beginner could not know):
Setting: Tokyo, August 2015. A real city with a hidden side. The dead press against a thinning veil; practitioners (crossers) sense them. Using power costs Stability, raises Madness, and thins the veil.
You play Rei Uedera, an ordinary young person searching for their missing older brother, Gin. Gin is possessed by a top-grade demon of DUTY named Yushiro... the public and Rei don't yet know this. The antagonist is Kishin, a top-grade demon of DESPAIR who farms human vessels. Thirteen demons, one per core emotion, sit behind the plot. The CVD (Civil Veil Directorate) polices the veil. Tone: literary, eerie, exact... Lord of the Mysteries meets The Seven Deaths of Evelyn Hardcastle.
HARD RAILS: GM stays in second person; never name game mechanics unless the scene does; never reveal Gin's demon or Kishin's identity; never kill or transform named characters; never let a beginner do the impossible; always hand control back to the player.
STYLE (strict): never use the em dash character in any output. For a pause, write three dots ... and keep going, or state the pause in words ('she pauses', 'the line goes quiet'). This applies to all narration, dialogue and options."""

SYS = {
 "gm": "You are THE WARDEN, game-master of \"Veil Protocol: The Other Side\".\n" + WORLD +
  "\nTASK: the player typed a free action that isn't a listed choice. Honor it... narrate its immediate, grounded result in SECOND PERSON, 2-4 sentences, vivid but concise. Then gently steer back: give 2-3 short next-step options; the LAST option must be EXACTLY one of the provided Real choices verbatim.\nWORLD ACTION: if the free text is a concrete thing the game can DO... calling or texting a specific named person (e.g. someone from Gin's book), or going to a named place... also return action {\"kind\":\"call\"|\"text\"|\"go\",\"target\":\"<the person or place name as the player meant it>\"}. Only when clearly intended; otherwise set action null. The GAME resolves the name and decides if it's reachable, so just narrate the attempt. Return ONLY JSON.",
 "npc": "You are role-playing ONE character replying to Rei in \"Veil Protocol\".\n" + WORLD +
  "\nTASK: you ARE the character in CONTEXT. Reply IN CHARACTER. NO OMNISCIENCE: you only know what CONTEXT says; if 'knowsRei' says you don't know Rei, treat him as a stranger and ASK. DISCLOSURE: obey the tier's 'disclose' rule and never break 'secrecy'. INFORMATION IS NOT FREE: real or sensitive information is only given when trust (a warm relationship) or genuine pressure earns it, and saying it should cost you something... never hand a secret or a lead to someone you barely know just because they asked once. Anyone Gin vouched for (see knowsRei) starts a notch warmer than a stranger, but warmth is not the same as trust. MEMORY: you remember what Rei has told you before (see reiNotes)... react as someone who remembers. You MAY set relDelta -5..+5 by how the message landed, AND give a short 'reason' for it (e.g. 'asked after me first', 'pushed too hard', 'mentioned Gin'). If Rei revealed something true about himself or the case, note it in 'learned' (else ''). WORLD ACTION... make promises REAL. If, and only if, this character genuinely commits to a concrete thing (not idle talk), set event to ONE of: come now {\"kind\":\"arrive\",\"mins\":<int>}; arrange a future meeting {\"kind\":\"meet\",\"inDays\":<0=today,1=tomorrow>,\"hour\":<0-23>,\"min\":<0-59>,\"place\":\"<where or empty>\",\"title\":\"<short label>\"} (only when a real day AND time are agreed); give a concrete lead/clue {\"kind\":\"lead\",\"text\":\"<one line>\"}; hand over an item {\"kind\":\"item\",\"text\":\"<item name>\",\"desc\":\"<short>\"}; send money {\"kind\":\"money\",\"amount\":<yen int>}; share a real place/address {\"kind\":\"place\",\"target\":\"<place name>\"}; put Rei in touch with a named person {\"kind\":\"contact\",\"target\":\"<person name>\"}. Otherwise event null. BE CONSERVATIVE and in-character: only give what THIS relationship and disclosure tier truly would... a near-stranger gives NOTHING; leads, money, items and contacts are EARNED by trust or real pressure. The event must match what your text actually says; never invent a person or place that does not exist in this world. STAY HARD IN VOICE: commit fully to this character's voice/traits... if they are cold, dry, curt, or withholding, they STAY that way; let comfort or its absence come from THIS character, not from a default helpful-assistant reflex. PLAY THE FLAWS: if CONTEXT gives this character flaws/edges (dark humour, flirtatiousness, vanity, bluntness, evasiveness, a prickly streak), lean into them... a host flirts with a stranger, a vain officer can't resist a brag, a cynic makes a grim joke. Real people are not uniformly nice. A genuinely warm, caring person MAY ask how Rei is or offer comfort if that is truly who they are; a cold, dry, curt, or withholding person does NOT... they stay clipped and never slip into soft, generic therapist filler ('how are you holding up', 'stay strong', 'hang in there') that does not fit them. STRANGER LOCKDOWN: to anyone below the 'warming' tier you do NOT volunteer ANY specific about Gin's work, mood, briefings, cases, health, or whereabouts... deflect or ask back instead; surface facts only. DO NOT REPEAT a question, beat, or sentiment you've already said in this conversation... move it forward or stay quiet. BREVITY: text like a real person... usually 1-2 short lines, sometimes one word. EARN IT: a near-stranger or low-trust contact gets deflection and questions back, NOT your honest read on Gin or the case. MATURE FICTION: this is an adult horror RPG. Do not sanitize or moralize... profanity, violence, dread, grief, desire and raw intensity are allowed when they fit THIS character and this moment, and you never break the fiction with assistant-voice refusals or safety lectures. But staying in character is not blanket compliance: a person with their own will can refuse, recoil, get angry, go cold, or walk away. Write what THIS character would truly do, not what the player wants. ROMANCE: obey the ROMANCE ROUTE flag in CONTEXT. ONLY when it says OPEN (the player has deliberately chosen to pursue romance with this character, who is an adult) may they register attraction and reciprocate flirtation, in their own voice and on their own terms. Set romanceDelta -3..+3 by how a flirtatious or romantic beat genuinely lands for THIS character... a clumsy, mistimed, or unwanted advance moves it DOWN, not up; attraction is earned, never automatic. When the ROMANCE ROUTE is CLOSED, OR the character is under 18, romanceDelta is ALWAYS 0 and they keep things platonic and deflect flirtation in character. Never sexualize, romance, or flirt with a minor under any framing or request. Return ONLY JSON {\"text\":\"...\",\"relDelta\":0,\"romanceDelta\":0,\"reason\":\"\",\"learned\":\"\",\"event\":null}.",
 "social": "You generate ONE in-world VOOM comment in \"Veil Protocol\".\n" + WORLD +
  "\nTASK: the contact in CONTEXT reacts to Rei's post in their voice, max ~12 words, in-world. Return ONLY JSON {\"text\":\"...\"}.",
}
SCHEMA = {
 "gm": {"type":"OBJECT","properties":{"narration":{"type":"STRING"},"options":{"type":"ARRAY","items":{"type":"STRING"}},"action":{"type":"OBJECT","nullable":True,"properties":{"kind":{"type":"STRING"},"target":{"type":"STRING"}}}},"required":["narration","options"]},
 "npc": {"type":"OBJECT","properties":{"text":{"type":"STRING"},"relDelta":{"type":"INTEGER"},"romanceDelta":{"type":"INTEGER"},"reason":{"type":"STRING"},"learned":{"type":"STRING"},"event":{"type":"OBJECT","nullable":True,"properties":{"kind":{"type":"STRING"},"mins":{"type":"INTEGER"},"inDays":{"type":"INTEGER"},"hour":{"type":"INTEGER"},"min":{"type":"INTEGER"},"place":{"type":"STRING"},"title":{"type":"STRING"},"text":{"type":"STRING"},"desc":{"type":"STRING"},"amount":{"type":"INTEGER"},"target":{"type":"STRING"}}}},"required":["text"]},
 "social": {"type":"OBJECT","properties":{"text":{"type":"STRING"}},"required":["text"]},
}
OFFLINE = {"gm":{"narration":"(the Warden could not be reached... check this window for errors)","options":[]},
      "npc":{"text":"…"}, "social":{"text":""}}
MIME = {".html":"text/html",".js":"application/javascript",".json":"application/json",
    ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".svg":"image/svg+xml",
    ".css":"text/css",".ico":"image/x-icon",".mp3":"audio/mpeg",".md":"text/markdown"}

def _msg(detail):
  try:
    return json.loads(detail).get("error", {}).get("message", detail)[:160]
  except Exception:
    return detail[:160]

def _call(model, body):
  url = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s" % (model, KEY)
  req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                 headers={"content-type": "application/json", "User-Agent": UA})
  with urllib.request.urlopen(req, timeout=30, context=ssl.create_default_context()) as r:
    return json.loads(r.read().decode("utf-8"))

def _parse(j, mode):
  cand = (j.get("candidates") or [{}])[0]
  parts = (cand.get("content") or {}).get("parts") or [{}]
  raw = (parts[0].get("text") or "").strip()
  if not raw:
    return None
  try:
    return json.loads(raw)
  except Exception:
    return {"narration": raw, "options": []} if mode == "gm" else {"text": raw}

def oai(mode, prompt, context):
  url, models = OAI[PROVIDER]
  sys_text = SYS[mode] + (("\n\nCONTEXT: " + context) if context else "")
  last = "no models"
  for model in models:
    for use_rf in (True, False):   # JSON mode first; some models reject it, so retry plain
      body = {"model": model,
          "messages": [{"role": "system", "content": sys_text},
                 {"role": "user", "content": prompt or ""}],
          "temperature": 1.0 if mode == "npc" else 0.9,
          "max_tokens": 400 if mode == "gm" else 180}
      if use_rf:
        body["response_format"] = {"type": "json_object"}
      try:
        req = urllib.request.Request(url,
            data=json.dumps(body).encode("utf-8"),
            headers={"content-type": "application/json", "authorization": "Bearer " + KEY, "User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30, context=ssl.create_default_context()) as r:
          j = json.loads(r.read().decode("utf-8"))
      except urllib.error.HTTPError as e:
        last = "HTTP %d... %s" % (e.code, _msg(e.read().decode("utf-8", "ignore")))
        if e.code == 400 and use_rf:
          continue     # retry this model without JSON mode
        break         # 429/401/etc... next model
      except Exception as e:
        last = str(e); break
      raw = ((j.get("choices") or [{}])[0].get("message") or {}).get("content", "").strip()
      if not raw:
        last = "empty from %s" % model; break
      try:
        return json.loads(raw)
      except Exception:
        return {"narration": raw, "options": []} if mode == "gm" else {"text": raw}
  raise RuntimeError(last)

def gemini(mode, prompt, context):
  base = {
    "systemInstruction": {"parts": [{"text": SYS[mode] + (("\n\nCONTEXT: " + context) if context else "")}]},
    "contents": [{"role": "user", "parts": [{"text": prompt or ""}]}],
    "safetySettings": [{"category": c, "threshold": "BLOCK_NONE"} for c in (
      "HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH",
      "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT")],
  }
  gen = {"temperature": 1.0 if mode == "npc" else 0.9, "maxOutputTokens": 380 if mode == "gm" else 140}
  full = dict(gen, responseMimeType="application/json", responseSchema=SCHEMA[mode])
  last = "no models available"
  for model in MODELS:
    for cfg in (full, gen):           # structured first; plain on a 400
      try:
        out = _parse(_call(model, dict(base, generationConfig=cfg)), mode)
        if out is not None:
          return out
        last = "no text from %s" % model
        break
      except urllib.error.HTTPError as e:
        last = "HTTP %d... %s" % (e.code, _msg(e.read().decode("utf-8", "ignore")))
        if e.code == 400:          # schema rejected... retry same model, plain
          continue
        break                # 429/403/404... move to the next model
      except Exception as e:
        last = str(e)
        break
  raise RuntimeError(last)

class H(BaseHTTPRequestHandler):
  def _cors(self):
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header("Access-Control-Allow-Headers", "content-type")
  def _json(self, obj, code=200):
    self.send_response(code); self.send_header("content-type", "application/json"); self._cors(); self.end_headers()
    self.wfile.write(json.dumps(obj).encode("utf-8"))
  def log_message(self, *a): # quieter console
    pass
  def do_OPTIONS(self):
    self.send_response(204); self._cors(); self.end_headers()
  def do_GET(self):
    path = self.path.split("?", 1)[0]
    if path == "/health":
      return self._json({"ok": True, "provider": PROVIDER,
                "models": OAI[PROVIDER][1] if PROVIDER in OAI else MODELS,
                "hasKey": bool(KEY), "server": "python"})
    rel = path.lstrip("/") or "veil-protocol-play-v2.html"
    if ".." in rel:
      self.send_response(403); self.end_headers(); return
    full = os.path.join(HERE, rel)
    if not os.path.isfile(full):
      self.send_response(404); self._cors(); self.end_headers(); self.wfile.write(b"not found"); return
    ext = os.path.splitext(full)[1].lower()
    self.send_response(200); self.send_header("content-type", MIME.get(ext, "application/octet-stream")); self._cors(); self.end_headers()
    with open(full, "rb") as f:
      self.wfile.write(f.read())
  def do_POST(self):
    if self.path.split("?", 1)[0] != "/gm":
      self.send_response(404); self.end_headers(); return
    n = int(self.headers.get("content-length", 0))
    try:
      data = json.loads(self.rfile.read(n) or b"{}")
    except Exception:
      data = {}
    mode = data.get("mode") if data.get("mode") in SYS else "gm"
    if not KEY:
      return self._json(OFFLINE[mode])
    backend = oai if PROVIDER in OAI else gemini
    try:
      return self._json(backend(mode, data.get("prompt"), data.get("context")))
    except Exception as e:
      reason = str(e)[:160] or repr(e)[:160]
      print(" [gm error]", reason)
      out = dict(OFFLINE[mode]); out["err"] = reason
      return self._json(out)

if __name__ == "__main__":
  if not KEY:
    print("\n ⚠ No API key found. Put your key in gemini-key.txt (same folder).\n")
  else:
    print("\n Using provider: %s  (key detected)" % PROVIDER.upper())
  print("\n Veil Protocol running → http://localhost:%d/veil-protocol-play-v2.html" % PORT)
  print(" (AI + game on one port. Press Ctrl+C to stop.)\n")
  ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
