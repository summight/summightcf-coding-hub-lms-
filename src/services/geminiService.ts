/**
 * Browser-safe Gemini helper for Vite.
 * - Reads key from import.meta.env.VITE_GEMINI_API_KEY (preferred)
 * - Falls back to window.__ENV.* if provided at runtime
 * - Does NOT dereference `process` at module top-level (avoids "process is not defined")
 */

type GeminiResponse = any;

const getApiKey = (): string | undefined => {
  // Vite env (preferred)
  try {
    const viteEnv = (import.meta as any)?.env;
    if (viteEnv && viteEnv.VITE_GEMINI_API_KEY) return viteEnv.VITE_GEMINI_API_KEY;
  } catch {
    /* ignore */
  }

  // runtime injection via window.__ENV
  if (typeof window !== 'undefined') {
    const w = window as any;
    if (w.__ENV) {
      if (w.__ENV.VITE_GEMINI_API_KEY) return w.__ENV.VITE_GEMINI_API_KEY;
      if (w.__ENV.GEMINI_API_KEY) return w.__ENV.GEMINI_API_KEY;
    }
  }

  return undefined;
};

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta2';

export async function callGeminiModel(prompt: string): Promise<GeminiResponse> {
  const key = getApiKey();
  if (!key) {
    throw new Error(
      'Missing Gemini API key. Set VITE_GEMINI_API_KEY in .env or provide window.__ENV.VITE_GEMINI_API_KEY.'
    );
  }

  const url = `${API_BASE}/models/chat-bison-001:generateMessage?key=${encodeURIComponent(key)}`;

  const body = {
    messages: [{ author: 'user', content: { text: prompt } }],
    temperature: 0.2,
    maxOutputTokens: 512,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Gemini API error: ${res.status} ${txt}`);
  }

  return res.json();
}