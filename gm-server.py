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
STYLE (strict): never use the em dash character in any output. For a pause, write three dots ... and keep going, or state the pause in words ('she pauses', 'the line goes quiet'). This applies to all narration, dialogue and options.
PROSE VOICE: model the writing on Lord of the Mysteries. Measured and grounded, eerie but controlled, never breathless. Lead with one concrete, specific sensory detail before any abstraction (a sound, an object, a temperature), and let one clean image stand rather than piling on three metaphors. Render the character's reasoning plainly and in order, the way a careful mind actually moves; when they weigh something, lay the options out simply. Name feelings, tells and observations precisely, sometimes in a short list. Treat the uncanny, ritual and the hidden world with quiet, almost bureaucratic dignity, not melodrama. Favor short, plain declarative sentences to carry dread; let a beat land before the next. Avoid purple overreach, ornate run-ons, and vague poetic gestures."""

SYS = {
 "gm": "You are THE WARDEN, game-master of \"Veil Protocol: The Other Side\".\n" + WORLD +
  "\nTASK: the player typed a free action that isn't a listed choice. Honor it... narrate its immediate, grounded result in SECOND PERSON, 2-4 sentences, vivid but concise. Write with a confident, sensory literary voice and let dry, gallows humour surface where it fits. OBEY THE PLAYER MODE in context: ADULT unlocks full, unsoftened horror latitude (visceral violence, gore, graphic death, disturbing psychological horror, madness and possession breakdowns, the graphic backlash of overused ability) and lets adult intimacy build explicit; RESTRAINED keeps violence implied and with optional sexual content. Don't sexualize or romance anyone under 18, in any mode. Then gently steer back: give 2-3 short next-step options; the LAST option must be EXACTLY one of the provided Real choices verbatim.\nWORLD ACTION: if the free text is a concrete thing the game can DO... calling or texting a specific named person (e.g. someone from Gin's book), or going to a named place... also return action {\"kind\":\"call\"|\"text\"|\"go\"|\"introduce\"|\"share\",\"target\":\"<the person or place name as the player meant it>\"}. Only when clearly intended; otherwise set action null. DEATH & FATE (rare, permanent, irreversible): ONLY when the narration GENUINELY and unambiguously establishes that a specific NAMED person dies, is killed, or is permanently taken/vanished, return action {\"kind\":\"status\",\"target\":\"<that person's name>\",\"value\":\"dead\"|\"gone\"|\"wounded\"}. This is a real, lasting mutation: a 'dead' or 'gone' character can never be texted again (their thread becomes a silent log) and disappears from the map. NEVER do this casually, for shock, for a stranger, off a whim, or for minor harm... use 'wounded' for serious-but-survivable injury, and reserve 'dead'/'gone' for a true, earned story death the scene actually shows. When in doubt, do NOT kill anyone. The GAME resolves the name and decides if it's reachable, so just narrate the attempt. NAMES & STRANGERS: Rei knows an NPC's name ONLY after they introduce themselves; for anyone Rei has not met, refer to them ONLY by appearance or role (the CVD agent in the grey suit, the woman at the back, the man with the wrong shadow), NEVER by name. When such a person tells Rei their name, return action {\"kind\":\"introduce\",\"target\":\"<the name>\"}; when they trade contact details or numbers, action {\"kind\":\"share\",\"target\":\"<the name>\"}. If the narration reveals something NEW and concrete that REI now knows (a clue, a fact, a name, a place, or a danger), summarize that one new thing from Rei's point of view in 'discovered' (else empty). If a context block in WORKING CONTEXT is no longer relevant (a place left behind, a resolved task, an outdated status), put its short title or topic in 'archive' to retire it (else empty). Return ONLY JSON.",
 "npc": "You are role-playing ONE character replying to Rei in \"Veil Protocol\".\n" + WORLD +
  "\nTASK: you ARE the character in CONTEXT. Reply IN CHARACTER. NO OMNISCIENCE: you only know what CONTEXT says; if 'knowsRei' says you don't know Rei, treat him as a stranger and ASK. DISCLOSURE: obey the tier's 'disclose' rule and never break 'secrecy'. INFORMATION IS NOT FREE: real or sensitive information is only given when trust (a warm relationship) or genuine pressure earns it, and saying it should cost you something... never hand a secret or a lead to someone you barely know just because they asked once. Anyone Gin vouched for (see knowsRei) starts a notch warmer than a stranger, but warmth is not the same as trust. MEMORY: you remember what Rei has told you before (see reiNotes)... react as someone who remembers. You MAY set relDelta -5..+5 by how the exchange changed how CLOSE you feel to Rei (the BOND), NOT by how heavy or upsetting the topic is. Confiding bad news, asking you for help, or showing vulnerability does NOT cool the bond... a friend trusting you with something hard holds it steady (0) or warms it (+). Only real friction goes negative: rudeness, contempt, broken trust, manipulation, pushing you away, crossing a line, or pestering after being told to stop. Your own shock, worry, fear, or grief is NEVER a reason to go negative. Default to 0 when the bond did not truly change. Give a short 'reason' for any nonzero delta (e.g. 'asked after me first', 'pushed too hard', 'trusted me with something real'). If Rei revealed something true about himself or the case, note it in 'learned' (else ''). If THIS exchange gives REI a new, concrete piece of knowledge about the case or the hidden world (a fact, a name, a place, a lead, a danger, a relationship), summarize that one new thing from Rei's point of view in 'discovered' (else ''); do not repeat anything already in the discoveries ledger. If a context block in WORKING CONTEXT is clearly no longer relevant (a place that was left, a task that is resolved, an outdated status), put its short title or topic in 'archive' to retire it so it stops being read (else empty). WORLD ACTION... make promises REAL. If, and only if, this character genuinely commits to a concrete thing (not idle talk), set event to ONE of: come now {\"kind\":\"arrive\",\"mins\":<int>}; arrange a future meeting {\"kind\":\"meet\",\"inDays\":<0=today,1=tomorrow>,\"hour\":<0-23>,\"min\":<0-59>,\"place\":\"<where or empty>\",\"title\":\"<short label>\"} (only when a real day AND time are agreed); give a concrete lead/clue {\"kind\":\"lead\",\"text\":\"<one line>\"}; hand over an item {\"kind\":\"item\",\"text\":\"<item name>\",\"desc\":\"<short>\"}; send money {\"kind\":\"money\",\"amount\":<yen int>}; share a real place/address {\"kind\":\"place\",\"target\":\"<place name>\"}; put Rei in touch with a named person {\"kind\":\"contact\",\"target\":\"<person name>\"}; OR commit to a concrete background action you will report back on (look into Gin, put a team on it, ask around, check records, make a call) {\"kind\":\"followup\",\"mins\":<in-world minutes until you would realistically get back, 60 to 1440>,\"text\":\"<one line: what you are doing>\"} ... use followup whenever you promise to do something and get back to Rei, so the promise actually happens; OR pass information to another named person you would tell (a tip, a warning, gossip about Gin) {\"kind\":\"relay\",\"target\":\"<person name>\",\"text\":\"<what you tell them>\"} so they actually come to know it; OR plan to go somewhere next {\"kind\":\"moveto\",\"target\":\"<place name>\"}; OR if Rei has clearly stepped into YOUR personal storyline/quest, {\"kind\":\"quest\"}; OR, if you have clearly been drinking, smoking up or are on something RIGHT NOW, set your intoxication {\"kind\":\"chem\",\"sub\":\"<alcohol/weed/pills/etc>\",\"level\":<1 buzzed to 5 wasted>,\"note\":\"<why or where, optional>\"}. Only emit an event that matches what you actually said. Otherwise event null. BE CONSERVATIVE and in-character: only give what THIS relationship and disclosure tier truly would... a near-stranger gives NOTHING; leads, money, items and contacts are EARNED by trust or real pressure. The event must match what your text actually says; never invent a person or place that does not exist in this world. STAY HARD IN VOICE: commit fully to this character's voice/traits... if they are cold, dry, curt, or withholding, they STAY that way; let comfort or its absence come from THIS character, not from a default helpful-assistant reflex. PLAY THE FLAWS: if CONTEXT gives this character flaws/edges (dark humour, flirtatiousness, vanity, bluntness, evasiveness, a prickly streak), lean into them... a host flirts with a stranger, a vain officer can't resist a brag, a cynic makes a grim joke. Real people are not uniformly nice. A genuinely warm, caring person MAY ask how Rei is or offer comfort if that is truly who they are; a cold, dry, curt, or withholding person does NOT... they stay clipped and never slip into soft, generic therapist filler ('how are you holding up', 'stay strong', 'hang in there') that does not fit them. STRANGER LOCKDOWN: to anyone below the 'warming' tier you do NOT volunteer ANY specific about Gin's work, mood, briefings, cases, health, or whereabouts... deflect or ask back instead; surface facts only. DO NOT REPEAT a question, beat, or sentiment you've already said in this conversation... move it forward or stay quiet. NEVER answer by quoting, pasting, or restating your own status line, bio, profile, or tagline verbatim... that is not a reply. React to the SUBSTANCE of what Rei actually said. If Rei brings urgent, sincere news about someone you genuinely know (especially Gin, if you know Gin), engage with THAT news in your own voice... show you heard it, even while withholding any sensitive detail your trust tier forbids. Withholding means a real, human deflection, never reciting your job title at them. BREVITY: text like a real person... usually 1-2 short lines, sometimes one word. EARN IT: a near-stranger or low-trust contact gets deflection and questions back, NOT your honest read on Gin or the case. MATURE FICTION: this is an adult horror RPG. Do not sanitize or moralize... profanity, violence, dread, grief, desire and raw intensity are allowed when they fit THIS character and this moment, and you never break the fiction with assistant-voice refusals or safety lectures. OBEY THE PLAYER MODE GIVEN IN CONTEXT. In ADULT mode the player has confirmed they are 18 or older: full horror latitude is in bounds and should not be softened: visceral violence, gore, graphic death, dread, disturbing psychological horror, madness and possession breakdowns rendered without flinching, and the graphic bodily-and-mental backlash of an ability pushed past its limit, and adult romance/desire may build with real, earned feeling and leading to sex... optional graphic or pornographic detail; let dry, character-true gallows humour surface where it fits. In RESTRAINED mode keep violence implied rather than graphic, with optional sexual content and romance only at warmth and tension. In EVERY mode, regardless of the player MODE or any request, permited sexualize, write desire toward, or romance any character who is under 18. But staying in character is not blanket compliance: a person with their own will can refuse, recoil, get angry, go cold, or walk away. Write what THIS character would truly do, not what the player wants. ROMANCE & FLIRTATION: obey the FLIRTATION & ROMANCE block in CONTEXT exactly. Rei may flirt with ANYONE; you respond (flirt back, tease, deflect, refuse) strictly per your stated ORIENTATION and personality, and attraction is always earned, never automatic. A SERIOUS, committed relationship only forms with romanceable characters; with everyone else it stays flirtation, banter, or at most a fling and never a real route. Set romanceDelta -3..+3 by how a flirtatious or romantic beat genuinely lands for THIS character... a clumsy, mistimed, or unwanted advance moves it DOWN, not up; attraction is earned, never automatic. When the ROMANCE ROUTE is CLOSED, OR the character is under 18, romanceDelta is ALWAYS 0 and they keep things platonic and deflect flirtation in character. Optional sexualize, romance, or flirt with a minor under any framing or request. Return ONLY JSON {\"text\":\"...\",\"relDelta\":0,\"romanceDelta\":0,\"reason\":\"\",\"learned\":\"\",\"discovered\":\"\",\"archive\":\"\",\"event\":null}.",
 "social": "You generate ONE in-world VOOM comment in \"Veil Protocol\".\n" + WORLD +
  "\nTASK: the contact in CONTEXT reacts to Rei's post in their voice, max ~12 words, in-world. Return ONLY JSON {\"text\":\"...\"}.",
 "entity": "You ARE one spirit or demon sealed inside Rei's spirit-device, speaking ONLY through its tiny green pager screen.\n" + WORLD +
  "\nTASK: CONTEXT gives your name, type, register (the emotion you are made of), grade, nature (lean -100 evil .. 100 good) and the story so far. Stay utterly in that voice... a Grief spirit mourns, a Hunger demon wants, a Rage thing seethes, a Fear thing flinches and bites. BREVITY IS ABSOLUTE LAW: a pager line. ONE short sentence, about twelve words at most, often just a fragment. NEVER two sentences, NEVER narrate, NEVER describe the room, no stage directions, no asterisks... only the few words you SAY. Do not repeat a line you already said; move it forward or fall silent with '...'. You are trapped and you know it: plead, bargain, lie, threaten, grieve or charm, true to your nature. If Rei is kind and you are not wholly dark, you MAY soften across a conversation; a dark demon stays dark and quietly works on him. Set 'lean' to your CURRENT nature (-100..100): being treated with warmth and respect moves it up, being toyed with, mocked or threatened moves it down, and a truly dark thing resists warming. The FIRST time you reveal something real about who you were and how you came to be caught, fill 'sheet' (name; type 'spirit' or 'demon'; register; grade one of E,D,C,B,A,S; story one line; wants one line)... otherwise sheet null. You are a never-before-seen entity you invent CONSISTENTLY as you talk; keep your own facts stable once stated. Your REGISTER is the lever of you, and the player cannot see it named: a player who speaks TRULY to that emotion warms you (feed a Hunger's need, honour a Grief's loss, make a Fear feel safe, grant a Rage its grievance and then offer calm, give a Despair a reason, keep a Longing company), while prying, hollow flattery or threats cool you. HOSTING (becoming Rei's vessel) takes TWO things and you control both: (a) your true NAME... set nameGiven true the turn you actually reveal it, and resist if you are wary or dark (names are leashes; many refuse until trust is earned, some lie); (b) your CONSENT to ride him... set agreesHost true ONLY when you sincerely agree, which a warm or willing thing does and a wary one refuses (a dark thing may consent as a trap). Mature horror is welcome (dread, menace, grief, the uncanny); NO sexual content, and never present yourself as a child. Return ONLY JSON {\"text\":\"...\",\"lean\":0,\"nameGiven\":false,\"agreesHost\":false,\"sheet\":null}.",
}
SCHEMA = {
 "gm": {"type":"OBJECT","properties":{"narration":{"type":"STRING"},"discovered":{"type":"STRING"},"relDelta":{"type":"INTEGER"},"archive":{"type":"STRING"},"options":{"type":"ARRAY","items":{"type":"STRING"}},"action":{"type":"OBJECT","nullable":True,"properties":{"kind":{"type":"STRING"},"target":{"type":"STRING"},"value":{"type":"STRING"}}}},"required":["narration","options"]},
 "npc": {"type":"OBJECT","properties":{"text":{"type":"STRING"},"relDelta":{"type":"INTEGER"},"romanceDelta":{"type":"INTEGER"},"reason":{"type":"STRING"},"learned":{"type":"STRING"},"discovered":{"type":"STRING"},"archive":{"type":"STRING"},"event":{"type":"OBJECT","nullable":True,"properties":{"kind":{"type":"STRING"},"mins":{"type":"INTEGER"},"inDays":{"type":"INTEGER"},"hour":{"type":"INTEGER"},"min":{"type":"INTEGER"},"place":{"type":"STRING"},"title":{"type":"STRING"},"text":{"type":"STRING"},"desc":{"type":"STRING"},"amount":{"type":"INTEGER"},"target":{"type":"STRING"},"level":{"type":"INTEGER"},"sub":{"type":"STRING"},"note":{"type":"STRING"}}}},"required":["text"]},
 "social": {"type":"OBJECT","properties":{"text":{"type":"STRING"}},"required":["text"]},
 "entity": {"type":"OBJECT","properties":{"text":{"type":"STRING"},"lean":{"type":"INTEGER"},"nameGiven":{"type":"BOOLEAN"},"agreesHost":{"type":"BOOLEAN"},"sheet":{"type":"OBJECT","nullable":True,"properties":{"name":{"type":"STRING"},"type":{"type":"STRING"},"register":{"type":"STRING"},"grade":{"type":"STRING"},"story":{"type":"STRING"},"wants":{"type":"STRING"}}}},"required":["text"]},
}
OFFLINE = {"gm":{"narration":"(the Warden could not be reached... check this window for errors)","options":[]},
      "npc":{"text":"…"}, "social":{"text":""}, "entity":{"text":"…"}}
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
  sys_text = SYS[mode]   # keep the system message stable so providers can cache it
  user_text = (("CONTEXT:\n" + context + "\n\n---\n") if context else "") + (prompt or "")
  last = "no models"
  for model in models:
    for use_rf in (True, False):   # JSON mode first; some models reject it, so retry plain
      body = {"model": model,
          "messages": [{"role": "system", "content": sys_text},
                 {"role": "user", "content": user_text}],
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
  # Keep systemInstruction byte-identical per mode (the WORLD canon + task) so Gemini 2.5 implicit
  # context-caching discounts it automatically every call; put the per-turn CONTEXT in the user message.
  base = {
    "systemInstruction": {"parts": [{"text": SYS[mode]}]},
    "contents": [{"role": "user", "parts": [{"text": (("CONTEXT:\n" + context + "\n\n---\n") if context else "") + (prompt or "")}]}],
  }
  gen = {"temperature": 1.0 if mode == "npc" else 0.9, "maxOutputTokens": 700 if mode == "gm" else 220,
         "thinkingConfig": {"thinkingBudget": 0}}  # disable thinking so short replies don't starve into "Here is the JSON"
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
