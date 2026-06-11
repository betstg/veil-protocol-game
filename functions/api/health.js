// Veil Protocol — Warden health check, Cloudflare Pages Function (route: /api/health).
export async function onRequestGet(context) {
  const env = context.env || {};
  const key = (env.OPENROUTER_API_KEY || env.GROQ_API_KEY || env.XAI_API_KEY || env.GEMINI_API_KEY || env.GM_API_KEY || "").trim();
  let provider = "none";
  if (key.startsWith("gsk_")) provider = "groq";
  else if (key.startsWith("xai-")) provider = "xai";
  else if (key.startsWith("sk-or-")) provider = "openrouter";
  else if (key) provider = "gemini";
  return new Response(JSON.stringify({ ok: !!key, provider, hasKey: !!key, server: "vercel" }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
