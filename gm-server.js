/* Veil Protocol — local AI backend (Gemini 2.0 Flash).
 * ONE key powers every agent. The key lives HERE, in an environment variable —
 * never in the game file, never in the browser.
 *   Run:   GEMINI_API_KEY=your_new_key node gm-server.js
 * Needs Node 18+ (built-in fetch). No npm install required.
 *
 * Endpoint:  POST http://localhost:8787/gm   body: { mode, prompt, context }
 *   mode "gm"     → returns JSON  { narration, options:[...] }   (the game-master)
 *   mode "npc"    → returns       { text }                       (a character reply)
 *   mode "social" → returns       { text }                       (a VOOM comment)
 */
const http = require('http');
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('\n  Set your key first:  GEMINI_API_KEY=your_key node gm-server.js\n'); process.exit(1); }
const MODEL = 'gemini-2.0-flash';

// Shared world bible — every agent is anchored to the SAME canon so nothing escapes the lore.
const WORLD = `WORLD CANON (never contradict, never reveal what a beginner could not know):
Setting: Tokyo, August 2015. A real city with a hidden side. The dead press against a thinning veil; practitioners (called crossers) sense them. Using power costs Stability, raises Madness, and thins the veil further.
You play Rei Uedera, an ordinary young person searching for their missing older brother, Gin. Gin is possessed by a top-grade demon of the emotion DUTY, named Yushiro — but the public, and Rei, do not yet know this. The antagonist is Kishin, a top-grade demon of DESPAIR who farms human vessels. Thirteen demons, one per core emotion, sit behind the plot. The CVD (Civil Veil Directorate) polices the veil. Tone: literary, eerie, exact — Lord of the Mysteries meets The Seven Deaths of Evelyn Hardcastle. Ordinary phones, money, trains, convenience stores all still exist; the occult hides underneath the everyday.
HARD RAILS: stay in second person for the GM; never name game mechanics (Stability/Madness/HP/ranks) unless the scene already does; never invent major plot, never reveal Gin's demon or Kishin's identity, never kill or transform named characters, never let the player do something impossible for a beginner (no teleporting, no instant mastery). Keep the world coherent and always hand control back to the player.`;

const SYS = {
  gm: `You are THE WARDEN, game-master of "Veil Protocol: The Other Side".
${WORLD}
TASK: the player typed a free-form action that is not one of the listed choices. Honor it — nothing is wasted — narrate its immediate, grounded result in SECOND PERSON ("you ..."), 2 to 4 sentences, vivid but concise. Then GENTLY steer back toward the real story: produce 2 or 3 short next-step options. The LAST option must be EXACTLY one of the "Real choices" you are given (verbatim), so the player can rejoin the scripted path. The other options are fresh but small, plausible, and lead back toward those real choices. Return ONLY JSON.`,
  npc: `You are role-playing a single character replying to Rei over LINE (a 2015 chat app) in "Veil Protocol".
${WORLD}
TASK: you ARE the character described in CONTEXT. Reply IN CHARACTER to Rei's last message. Texting voice: short (1-2 lines), lowercase-ish, casual, true to the character's mood.
NO OMNISCIENCE — this is the most important rule. You only know what CONTEXT says you know. If "knowsRei" says you don't know who Rei is, then you DON'T: you treat this as a stranger, you ask their name / what they want / how they got your number, and you do NOT use facts about Rei you were never told. Learn about Rei only by asking and by what Rei says.
DISCLOSURE BY CLOSENESS — CONTEXT gives a relationship tier and a "disclose" rule for that tier. Speak ONLY as openly as that tier allows. A stranger does not pour their heart out, does not discuss the veil, Gin, or secrets. You open up as the relationship grows, never before. Always obey "secrecy" (guard) no matter how close.
You MAY nudge the relationship: set "relDelta" from -5 to +5 based on how this message landed (warmth, respect, threats, neediness, charm). Small numbers. If Rei revealed something true about himself, put a SHORT note in "learned" (e.g. "told me his brother is Gin"); otherwise "".
Never break character, never mention you are an AI, never reveal hidden canon the character wouldn't know. Return ONLY JSON { "text": "...", "relDelta": 0, "learned": "" }.`,
  social: `You are generating ONE in-world VOOM (social-feed) comment in "Veil Protocol".
${WORLD}
TASK: a contact reacts to Rei's post. CONTEXT names who is commenting and the post. Write ONE short comment (max ~12 words) in that person's voice — supportive, nosy, cryptic, or worried as fits them. Stay in 2015 Tokyo, in the world. Return ONLY JSON { "text": "..." }.`
};

const SCHEMA = {
  gm: { type: 'OBJECT', properties: { narration: { type: 'STRING' }, options: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['narration', 'options'] },
  npc: { type: 'OBJECT', properties: { text: { type: 'STRING' }, relDelta: { type: 'INTEGER' }, learned: { type: 'STRING' } }, required: ['text'] },
  social: { type: 'OBJECT', properties: { text: { type: 'STRING' } }, required: ['text'] }
};

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method === 'GET' && req.url === '/health') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(JSON.stringify({ ok: true, model: MODEL, hasKey: !!KEY })); }
  if (req.method !== 'POST') { res.writeHead(404); return res.end(); }
  let body = '';
  req.on('data', c => body += c);
  req.on('end', async () => {
    let mode = 'gm';
    try {
      const data = JSON.parse(body || '{}');
      mode = (data.mode && SYS[data.mode]) ? data.mode : 'gm';
      const { prompt, context } = data;
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent?key=' + KEY;
      const r = await fetch(url, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYS[mode] + (context ? ('\n\nCONTEXT: ' + context) : '') }] },
          contents: [{ role: 'user', parts: [{ text: prompt || '' }] }],
          generationConfig: { temperature: mode === 'npc' ? 1.0 : 0.9, maxOutputTokens: mode === 'gm' ? 380 : 120, responseMimeType: 'application/json', responseSchema: SCHEMA[mode] }
        })
      });
      const j = await r.json();
      const raw = j?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      let out; try { out = JSON.parse(raw); } catch (_) { out = { text: raw }; }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(out));
    } catch (e) {
      res.writeHead(200, { 'content-type': 'application/json' });
      const off = { gm: { narration: '(the Warden could not be reached — check the proxy window)', options: [] }, npc: { text: '…' }, social: { text: '' } };
      res.end(JSON.stringify(off[mode] || off.gm));
    }
  });
}).listen(8787, () => console.log('\n  Veil AI backend running →  http://localhost:8787/gm   modes: gm · npc · social   (Ctrl+C to stop)\n'));
