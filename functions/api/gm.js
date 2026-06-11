// Veil Protocol — Warden AI, Cloudflare Pages Function (route: /api/gm).
// Same behavior as the local gm-server.py; prompts come from _prompts.json (one source of truth).
// The API key lives ONLY as a Cloudflare encrypted Environment Variable / Secret, never in the repo or browser.
//   Set one of: OPENROUTER_API_KEY (sk-or-…), GROQ_API_KEY (gsk_…), XAI_API_KEY (xai-…), GEMINI_API_KEY (AIza…)
//   Optional: GM_MODEL to override the model.
import PROMPTS from "./_prompts.json";
const SYS = PROMPTS.SYS, OAI = PROMPTS.OAI;

const J = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const fallback = (mode, raw) => (mode === "gm" ? { narration: raw || "", options: [] } : { text: raw || "…" });
const tryParse = (raw, mode) => { try { return JSON.parse(raw); } catch { return fallback(mode, raw); } };
function providerFor(key) {
  if (key.startsWith("gsk_")) return "groq";
  if (key.startsWith("xai-")) return "xai";
  if (key.startsWith("sk-or-")) return "openrouter";
  return "gemini";
}

async function callOAI(provider, mode, prompt, context, key, env) {
  let [url, models] = OAI[provider];
  if (env.GM_MODEL) models = [env.GM_MODEL, ...models];
  const sysText = SYS[mode] + (context ? ("\n\nCONTEXT: " + context) : "");
  let last = "no models";
  for (const model of models) {
    for (const useRF of [true, false]) {
      const body = {
        model,
        messages: [{ role: "system", content: sysText }, { role: "user", content: prompt || "" }],
        temperature: mode === "npc" ? 1.0 : 0.9,
        max_tokens: mode === "gm" ? 400 : 180,
      };
      if (useRF) body.response_format = { type: "json_object" };
      let r;
      try {
        r = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json", "authorization": "Bearer " + key, "HTTP-Referer": "https://veil-protocol.pages.dev", "X-Title": "Veil Protocol" },
          body: JSON.stringify(body),
        });
      } catch (e) { last = String(e); break; }
      if (!r.ok) { last = "HTTP " + r.status; if (r.status === 400 && useRF) continue; break; }
      const j = await r.json();
      const raw = (((j.choices || [{}])[0] || {}).message || {}).content || "";
      if (!raw.trim()) { last = "empty from " + model; break; }
      return tryParse(raw.trim(), mode);
    }
  }
  return { err: last, ...fallback(mode, "") };
}

async function callGemini(mode, prompt, context, key, env) {
  const models = env.GM_MODEL ? [env.GM_MODEL] : ["gemini-2.0-flash", "gemini-1.5-flash"];
  const sysText = SYS[mode] + (context ? ("\n\nCONTEXT: " + context) : "");
  let last = "no models";
  for (const model of models) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;
    try {
      const r = await fetch(url, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sysText + "\n\n" + (prompt || "") }] }],
          generationConfig: { temperature: mode === "npc" ? 1.0 : 0.9, maxOutputTokens: mode === "gm" ? 400 : 200, responseMimeType: "application/json" },
        }),
      });
      if (!r.ok) { last = "HTTP " + r.status; continue; }
      const j = await r.json();
      const raw = (((j.candidates || [{}])[0].content || {}).parts || [{}])[0].text || "";
      if (raw.trim()) return tryParse(raw.trim(), mode);
      last = "empty from " + model;
    } catch (e) { last = String(e); }
  }
  return { err: last, ...fallback(mode, "") };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let b;
  try { b = await request.json(); } catch { b = {}; }
  const mode = b.mode || "gm", prompt = b.prompt || "", ctx = b.context || "";
  if (!SYS[mode]) return J({ err: "bad mode" }, 400);
  const key = (env.OPENROUTER_API_KEY || env.GROQ_API_KEY || env.XAI_API_KEY || env.GEMINI_API_KEY || env.GM_API_KEY || "").trim();
  if (!key) return J({ err: "no key set on server", ...fallback(mode, "") });
  try {
    const provider = providerFor(key);
    const out = provider === "gemini"
      ? await callGemini(mode, prompt, ctx, key, env)
      : await callOAI(provider, mode, prompt, ctx, key, env);
    return J(out);
  } catch (e) {
    return J({ err: String(e), ...fallback(mode, "") });
  }
}
