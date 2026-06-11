// Veil Protocol — Warden health check (Vercel serverless).
// The game pings this on load; if it answers ok, the online Warden is live.
module.exports = (req, res) => {
  const key = (process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY || process.env.XAI_API_KEY ||
               process.env.GEMINI_API_KEY || process.env.GM_API_KEY || '').trim();
  let provider = 'none';
  if (key.startsWith('gsk_')) provider = 'groq';
  else if (key.startsWith('xai-')) provider = 'xai';
  else if (key.startsWith('sk-or-')) provider = 'openrouter';
  else if (key) provider = 'gemini';
  res.status(200).json({ ok: !!key, provider, hasKey: !!key, server: 'vercel' });
};
