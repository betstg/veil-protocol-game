// Veil Protocol — Warden AI, Vercel serverless function.
// Mirrors gm-server.py's oai()/gemini() so the online Warden behaves exactly like local play.
// Prompts come from api/_prompts.json (generated from gm-server.py — single source of truth).
// The API key lives ONLY in a Vercel Environment Variable, never in the repo or the browser.
//   Set one of: OPENROUTER_API_KEY (sk-or-…), GROQ_API_KEY (gsk_…), XAI_API_KEY (xai-…), GEMINI_API_KEY (AIza…)
//   Optional: GM_MODEL to override the model.
const PROMPTS = require('./_prompts.json');
const SYS = PROMPTS.SYS, OAI = PROMPTS.OAI;

function pickKey() {
  return (process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY || process.env.XAI_API_KEY ||
          process.env.GEMINI_API_KEY || process.env.GM_API_KEY || '').trim();
}
function providerFor(key) {
  if (key.startsWith('gsk_')) return 'groq';
  if (key.startsWith('xai-')) return 'xai';
  if (key.startsWith('sk-or-')) return 'openrouter';
  return 'gemini';
}
function fallback(mode, raw) {
  return mode === 'gm' ? { narration: raw || '', options: [] } : { text: raw || '…' };
}
function tryParse(raw, mode) { try { return JSON.parse(raw); } catch (e) { return fallback(mode, raw); } }

async function callOAI(provider, mode, prompt, context, key) {
  let [url, models] = OAI[provider];
  if (process.env.GM_MODEL) models = [process.env.GM_MODEL, ...models];
  const sysText = SYS[mode] + (context ? ('\n\nCONTEXT: ' + context) : '');
  let last = 'no models';
  for (const model of models) {
    for (const useRF of [true, false]) {            // JSON mode first; retry plain on 400
      const body = {
        model,
        messages: [{ role: 'system', content: sysText }, { role: 'user', content: prompt || '' }],
        temperature: mode === 'npc' ? 1.0 : 0.9,
        max_tokens: mode === 'gm' ? 400 : 180,
      };
      if (useRF) body.response_format = { type: 'json_object' };
      let r;
      try {
        r = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + key,
            'HTTP-Referer': 'https://veil-protocol.vercel.app',
            'X-Title': 'Veil Protocol',
          },
          body: JSON.stringify(body),
        });
      } catch (e) { last = String(e); break; }
      if (!r.ok) {
        last = 'HTTP ' + r.status;
        if (r.status === 400 && useRF) continue;     // retry this model without JSON mode
        break;                                        // 401/429/etc → next model
      }
      const j = await r.json();
      const raw = (((j.choices || [{}])[0] || {}).message || {}).content || '';
      if (!raw.trim()) { last = 'empty from ' + model; break; }
      return tryParse(raw.trim(), mode);
    }
  }
  return { err: last, ...fallback(mode, '') };
}

async function callGemini(mode, prompt, context, key) {
  const models = process.env.GM_MODEL ? [process.env.GM_MODEL] : ['gemini-2.0-flash', 'gemini-1.5-flash'];
  const sysText = SYS[mode] + (context ? ('\n\nCONTEXT: ' + context) : '');
  let last = 'no models';
  for (const model of models) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key;
    try {
      const r = await fetch(url, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sysText + '\n\n' + (prompt || '') }] }],
          generationConfig: { temperature: mode === 'npc' ? 1.0 : 0.9, maxOutputTokens: mode === 'gm' ? 400 : 200, responseMimeType: 'application/json' },
        }),
      });
      if (!r.ok) { last = 'HTTP ' + r.status; continue; }
      const j = await r.json();
      const raw = (((j.candidates || [{}])[0].content || {}).parts || [{}])[0].text || '';
      if (raw.trim()) return tryParse(raw.trim(), mode);
      last = 'empty from ' + model;
    } catch (e) { last = String(e); }
  }
  return { err: last, ...fallback(mode, '') };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ err: 'POST only' }); return; }
  let b = req.body;
  if (!b || typeof b === 'string') { try { b = JSON.parse(b || '{}'); } catch (e) { b = {}; } }
  const mode = (b.mode || 'gm'), prompt = b.prompt || '', context = b.context || '';
  if (!SYS[mode]) { res.status(400).json({ err: 'bad mode' }); return; }
  const key = pickKey();
  if (!key) { res.status(200).json({ err: 'no key set on server', ...fallback(mode, '') }); return; }
  try {
    const provider = providerFor(key);
    const out = provider === 'gemini'
      ? await callGemini(mode, prompt, context, key)
      : await callOAI(provider, mode, prompt, context, key);
    res.status(200).json(out);
  } catch (e) {
    res.status(200).json({ err: String(e), ...fallback(mode, '') });
  }
};
