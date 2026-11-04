import { describe, expect, it, vi } from 'vitest';
import { handleTranslate, parseTranslateRequest } from '../worker/translate';

const ORIGIN = 'https://tavernapp.example.workers.dev';

function request(body: unknown, origin: string | null = ORIGIN) {
  return new Request(`${ORIGIN}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) },
    body: JSON.stringify(body),
  });
}

describe('parseTranslateRequest', () => {
  it('validates texts and targets', () => {
    expect(parseTranslateRequest({ texts: ['hola'], targets: ['es'] })).toEqual({ texts: ['hola'], targets: ['es'] });
    expect(parseTranslateRequest({ texts: [], targets: ['es'] })).toHaveProperty('error');
    expect(parseTranslateRequest({ texts: ['hola'], targets: ['de'] })).toHaveProperty('error');
    expect(parseTranslateRequest({ texts: ['x'.repeat(20_000)], targets: ['es'] })).toEqual({ error: 'too_long' });
  });
});

describe('handleTranslate', () => {
  it('returns mock translations in development', async () => {
    const res = await handleTranslate(request({ texts: ['Hola', ''], targets: ['es', 'fr'] }), { TRANSLATE_MOCK: '1' });
    expect(await res.json()).toEqual({ translations: { es: ['[ES] Hola', ''], fr: ['[FR] Hola', ''] } });
  });

  it('reports a missing DeepL key', async () => {
    const res = await handleTranslate(request({ texts: ['Hola'], targets: ['es'] }), {});
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'not_configured' });
  });

  it('rejects other origins', async () => {
    const res = await handleTranslate(request({ texts: ['Hola'], targets: ['es'] }, 'https://evil.example'), {
      TRANSLATE_MOCK: '1',
    });
    expect(res.status).toBe(403);
  });

  it('calls DeepL from Catalan once per language, skipping empty texts', async () => {
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init!.body)) as { text: string[]; target_lang: string };
      return Response.json({ translations: body.text.map((t) => ({ text: `${body.target_lang}:${t}` })) });
    });
    const res = await handleTranslate(
      request({ texts: ['Bon dia', '', 'Gràcies'], targets: ['es', 'en', 'fr'] }),
      { DEEPL_API_KEY: 'key:fx' },
      fetchMock as typeof fetch,
    );
    expect(await res.json()).toEqual({
      translations: {
        es: ['ES:Bon dia', '', 'ES:Gràcies'],
        en: ['EN-GB:Bon dia', '', 'EN-GB:Gràcies'],
        fr: ['FR:Bon dia', '', 'FR:Gràcies'],
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api-free.deepl.com/v2/translate');
    expect((init!.headers as Record<string, string>).Authorization).toBe('DeepL-Auth-Key key:fx');
    expect(JSON.parse(String(init!.body))).toMatchObject({ source_lang: 'CA', text: ['Bon dia', 'Gràcies'] });
  });

  it('maps an exhausted DeepL quota to a clear error', async () => {
    const fetchMock = vi.fn(async () => new Response('quota', { status: 456 }));
    const res = await handleTranslate(
      request({ texts: ['Hola'], targets: ['es'] }),
      { DEEPL_API_KEY: 'key:fx' },
      fetchMock as typeof fetch,
    );
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ error: 'quota_exceeded' });
  });

  it('applies the rate limiter', async () => {
    const res = await handleTranslate(request({ texts: ['Hola'], targets: ['es'] }), {
      TRANSLATE_MOCK: '1',
      TRANSLATE_LIMITER: { limit: async () => ({ success: false }) },
    });
    expect(res.status).toBe(429);
  });
});
