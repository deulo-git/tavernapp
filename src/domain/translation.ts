import type { CatalogItem, Lang, Translations } from './types';
import { TRANSLATED_LANGS } from './types';

export const FIELD_LABELS: Record<string, string> = {
  name: 'Nom',
  explanation: 'Explicació',
  ingredients: 'Ingredients',
  title: 'Títol',
  body: 'Text',
};

/** The Catalan texts of an item that get translated, keyed by field. */
export function sourceFields(item: CatalogItem): Record<string, string> {
  switch (item.kind) {
    case 'dish':
      return { name: item.name, explanation: item.explanation, ingredients: item.ingredients.join('\n') };
    case 'drink':
      return { explanation: item.explanation };
    case 'guide':
      return { title: item.title, body: item.body };
  }
}

/** Stable 32-bit FNV-1a hash of the source texts, used to detect when translations are stale. */
export function hashFields(fields: Record<string, string>): string {
  const text = JSON.stringify(
    Object.keys(fields)
      .sort()
      .map((k) => [k, fields[k].trim()]),
  );
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function sourceHash(item: CatalogItem): string {
  return hashFields(sourceFields(item));
}

function pickLangs(tr: Translations | undefined): Pick<Translations, Lang> {
  const out: Pick<Translations, Lang> = {};
  for (const lang of TRANSLATED_LANGS) if (tr?.[lang]) out[lang] = tr[lang];
  return out;
}

/**
 * Decides the translation block to store when an item is saved:
 * translations that still match the Catalan source are kept, otherwise the item is
 * marked as pending (the previous texts stay visible until the new ones arrive).
 */
export function prepareTranslations(item: CatalogItem): Translations {
  const fields = sourceFields(item);
  const srcHash = hashFields(fields);
  const tr = item.tr;
  if (tr && tr.srcHash === srcHash && tr.status === 'ok') return tr;
  if (!Object.values(fields).some((v) => v.trim())) return { srcHash, status: 'ok' };
  return { ...pickLangs(tr), srcHash, status: 'pending', manual: false };
}

/** Text of a field in the requested language, falling back to the Catalan original. */
export function translatedField(item: CatalogItem, lang: 'ca' | Lang, field: string): string {
  const original = sourceFields(item)[field] ?? '';
  if (lang === 'ca') return original;
  return item.tr?.[lang]?.[field]?.trim() || original;
}

export function hasTranslation(item: CatalogItem, lang: Lang): boolean {
  return Boolean(item.tr?.[lang] && Object.values(item.tr[lang]!).some((v) => v.trim()));
}

export class TranslateError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

/** Errors that won't go away by retrying later. */
export function isPermanentTranslateError(code: string): boolean {
  return ['not_configured', 'invalid_key', 'too_long', 'invalid_texts'].includes(code);
}

export function translateErrorMessage(code: string): string {
  switch (code) {
    case 'not_configured':
      return 'La traducció automàtica no està configurada (falta la clau de DeepL al servidor).';
    case 'invalid_key':
      return 'La clau de DeepL no és vàlida.';
    case 'quota_exceeded':
      return "S'ha esgotat la quota mensual gratuïta de DeepL. Es tornarà a provar més endavant.";
    case 'rate_limited':
      return "Massa traduccions seguides. Torna-ho a provar d'aquí a un minut.";
    case 'too_long':
      return 'El text és massa llarg per traduir-lo de cop.';
    case 'network':
      return 'Sense connexió. Es traduirà quan torni la connexió.';
    default:
      return "No s'ha pogut traduir ara mateix. Es tornarà a provar automàticament.";
  }
}

/** Calls the Worker's /api/translate endpoint for every translated language. */
export async function fetchTranslations(
  fields: Record<string, string>,
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): Promise<Pick<Translations, Lang>> {
  const keys = Object.keys(fields);
  let res: Response;
  try {
    res = await fetchImpl('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: keys.map((k) => fields[k]), targets: TRANSLATED_LANGS }),
    });
  } catch {
    throw new TranslateError('network');
  }
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    translations?: Partial<Record<Lang, unknown>>;
  };
  if (!res.ok) throw new TranslateError(data.error ?? `http_${res.status}`);

  const out: Pick<Translations, Lang> = {};
  for (const lang of TRANSLATED_LANGS) {
    const texts = data.translations?.[lang];
    if (!Array.isArray(texts) || texts.length !== keys.length) throw new TranslateError('bad_response');
    out[lang] = Object.fromEntries(keys.map((k, i) => [k, String(texts[i] ?? '')]));
  }
  return out;
}
