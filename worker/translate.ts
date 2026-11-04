// /api/translate: proxies DeepL so the API key never reaches the browser.
// Request:  { texts: string[], targets: ('es' | 'en' | 'fr')[] }
// Response: { translations: { es?: string[], en?: string[], fr?: string[] } }

export const TARGETS = ['es', 'en', 'fr'] as const;
export type Target = (typeof TARGETS)[number];

const DEEPL_TARGET: Record<Target, string> = { es: 'ES', en: 'EN-GB', fr: 'FR' };
const MAX_TEXTS = 40;
const MAX_CHARS = 15_000;

export interface TranslateEnv {
  DEEPL_API_KEY?: string;
  DEEPL_API_URL?: string;
  TRANSLATE_MOCK?: string;
  ALLOWED_ORIGINS?: string;
  TRANSLATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

type ParsedRequest = { texts: string[]; targets: Target[] } | { error: string };

export function parseTranslateRequest(body: unknown): ParsedRequest {
  if (typeof body !== 'object' || body === null) return { error: 'invalid_body' };
  const { texts, targets } = body as { texts?: unknown; targets?: unknown };
  if (!Array.isArray(texts) || texts.length === 0 || texts.length > MAX_TEXTS) return { error: 'invalid_texts' };
  if (!texts.every((t) => typeof t === 'string')) return { error: 'invalid_texts' };
  const total = (texts as string[]).reduce((n, t) => n + t.length, 0);
  if (total > MAX_CHARS) return { error: 'too_long' };
  if (!Array.isArray(targets) || targets.length === 0) return { error: 'invalid_targets' };
  if (!targets.every((t) => (TARGETS as readonly unknown[]).includes(t))) return { error: 'invalid_targets' };
  return { texts: texts as string[], targets: [...new Set(targets as Target[])] };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function isAllowedOrigin(request: Request, env: TranslateEnv): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return true; // same-origin GET-less fetches from some browsers omit it; size and rate limits still apply
  const allowed = [new URL(request.url).origin, ...(env.ALLOWED_ORIGINS ?? '').split(',')]
    .map((o) => o.trim())
    .filter(Boolean);
  return allowed.includes(origin);
}

function mockTranslate(texts: string[], targets: Target[]): Record<string, string[]> {
  return Object.fromEntries(targets.map((t) => [t, texts.map((x) => (x.trim() ? `[${t.toUpperCase()}] ${x}` : x))]));
}

class UpstreamError extends Error {
  constructor(readonly status: number) {
    super(`DeepL ${status}`);
  }
}

export async function handleTranslate(
  request: Request,
  env: TranslateEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!isAllowedOrigin(request, env)) return json({ error: 'forbidden_origin' }, 403);

  if (env.TRANSLATE_LIMITER) {
    const key = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const { success } = await env.TRANSLATE_LIMITER.limit({ key });
    if (!success) return json({ error: 'rate_limited' }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = parseTranslateRequest(body);
  if ('error' in parsed) return json(parsed, 400);
  const { texts, targets } = parsed;

  if (env.TRANSLATE_MOCK === '1') return json({ translations: mockTranslate(texts, targets) });
  if (!env.DEEPL_API_KEY) return json({ error: 'not_configured' }, 503);

  // DeepL rejects empty strings, so only non-empty texts are sent and the gaps are refilled afterwards.
  const indexes = texts.flatMap((t, i) => (t.trim() ? [i] : []));
  const toSend = indexes.map((i) => texts[i]);
  const base = env.DEEPL_API_URL || 'https://api-free.deepl.com';

  try {
    const entries = await Promise.all(
      targets.map(async (target) => {
        const out = texts.map(() => '');
        if (toSend.length > 0) {
          const res = await fetchImpl(`${base}/v2/translate`, {
            method: 'POST',
            headers: {
              Authorization: `DeepL-Auth-Key ${env.DEEPL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            // Catalan supports neither glossaries, formality nor the latency_optimized model, so none are set.
            body: JSON.stringify({
              text: toSend,
              source_lang: 'CA',
              target_lang: DEEPL_TARGET[target],
              preserve_formatting: true,
            }),
          });
          if (!res.ok) throw new UpstreamError(res.status);
          const data = (await res.json()) as { translations: { text: string }[] };
          data.translations.forEach((tr, j) => {
            out[indexes[j]] = tr.text;
          });
        }
        return [target, out] as const;
      }),
    );
    return json({ translations: Object.fromEntries(entries) });
  } catch (err) {
    const status = err instanceof UpstreamError ? err.status : 0;
    // 456: monthly character quota exhausted; 403: invalid key.
    const error = status === 456 ? 'quota_exceeded' : status === 403 ? 'invalid_key' : 'upstream_error';
    return json({ error, status }, 502);
  }
}
