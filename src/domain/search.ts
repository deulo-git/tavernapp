/** Lowercases and strips accents and the Catalan middle dot, so "pa amb tomaquet" finds "Pa amb tomàquet". */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[·•]/g, '')
    .toLowerCase()
    .trim();
}

/** True when every word of the query appears somewhere in the given fields. */
export function matchesQuery(query: string, fields: (string | string[] | null | undefined)[]): boolean {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeText(fields.flat().filter(Boolean).join(' '));
  return words.every((w) => haystack.includes(w));
}
