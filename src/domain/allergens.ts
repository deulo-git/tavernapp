// The 14 allergens that EU Regulation 1169/2011 requires restaurants to declare.
export const ALLERGENS = [
  { key: 'gluten', ca: 'Gluten', es: 'Gluten', en: 'Gluten', fr: 'Gluten', color: '#b7862c' },
  { key: 'crustacis', ca: 'Crustacis', es: 'Crustáceos', en: 'Crustaceans', fr: 'Crustacés', color: '#d0573a' },
  { key: 'ous', ca: 'Ous', es: 'Huevos', en: 'Eggs', fr: 'Œufs', color: '#d9a21b' },
  { key: 'peix', ca: 'Peix', es: 'Pescado', en: 'Fish', fr: 'Poisson', color: '#2f6f9f' },
  { key: 'cacauets', ca: 'Cacauets', es: 'Cacahuetes', en: 'Peanuts', fr: 'Arachides', color: '#9b6a3c' },
  { key: 'soja', ca: 'Soja', es: 'Soja', en: 'Soy', fr: 'Soja', color: '#6c8f3a' },
  { key: 'llet', ca: 'Llet i lactis', es: 'Leche y lácteos', en: 'Milk', fr: 'Lait', color: '#4f86c6' },
  {
    key: 'fruitsClosca',
    ca: 'Fruits de closca',
    es: 'Frutos de cáscara',
    en: 'Tree nuts',
    fr: 'Fruits à coque',
    color: '#8a5a2b',
  },
  { key: 'api', ca: 'Api', es: 'Apio', en: 'Celery', fr: 'Céleri', color: '#4e9a52' },
  { key: 'mostassa', ca: 'Mostassa', es: 'Mostaza', en: 'Mustard', fr: 'Moutarde', color: '#c49a12' },
  { key: 'sesam', ca: 'Sèsam', es: 'Sésamo', en: 'Sesame', fr: 'Sésame', color: '#a88b5a' },
  { key: 'sulfits', ca: 'Sulfits', es: 'Sulfitos', en: 'Sulphites', fr: 'Sulfites', color: '#7a2e4a' },
  { key: 'tramussos', ca: 'Tramussos', es: 'Altramuces', en: 'Lupin', fr: 'Lupin', color: '#7b5ea7' },
  { key: 'molluscs', ca: 'Mol·luscs', es: 'Moluscos', en: 'Molluscs', fr: 'Mollusques', color: '#2c8c8c' },
] as const;

export type AllergenKey = (typeof ALLERGENS)[number]['key'];
export type UiLang = 'ca' | 'es' | 'en' | 'fr';

const BY_KEY = new Map(ALLERGENS.map((a) => [a.key, a]));

export function allergenInfo(key: AllergenKey) {
  return BY_KEY.get(key)!;
}

export function allergenLabel(key: AllergenKey, lang: UiLang = 'ca'): string {
  return BY_KEY.get(key)?.[lang] ?? key;
}

export function isAllergenKey(value: unknown): value is AllergenKey {
  return typeof value === 'string' && BY_KEY.has(value as AllergenKey);
}

export type AllergenStatus = 'safe' | 'traces' | 'contains';

/** How an item relates to the allergies a customer has declared. */
export function allergenStatus(
  item: { allergens: readonly AllergenKey[]; traces?: readonly AllergenKey[] },
  excluded: ReadonlySet<AllergenKey>,
): AllergenStatus {
  if (excluded.size === 0) return 'safe';
  if (item.allergens.some((a) => excluded.has(a))) return 'contains';
  if ((item.traces ?? []).some((a) => excluded.has(a))) return 'traces';
  return 'safe';
}

export const ALLERGEN_HEADINGS: Record<UiLang, { contains: string; traces: string; none: string }> = {
  ca: { contains: 'Al·lèrgens', traces: 'Pot contenir traces de', none: 'Sense al·lèrgens declarats' },
  es: { contains: 'Alérgenos', traces: 'Puede contener trazas de', none: 'Sin alérgenos declarados' },
  en: { contains: 'Allergens', traces: 'May contain traces of', none: 'No declared allergens' },
  fr: { contains: 'Allergènes', traces: 'Peut contenir des traces de', none: 'Aucun allergène déclaré' },
};
