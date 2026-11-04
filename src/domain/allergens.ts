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

/** Allergens are stored by id; the 14 official ones use their key as id. */
export type AllergenKey = string;
export type UiLang = 'ca' | 'es' | 'en' | 'fr';

/** An allergen of the restaurant's list (editable in Configuració). */
export interface AllergenDef {
  id: string;
  /** Catalan name. */
  name: string;
  es: string;
  en: string;
  fr: string;
  color: string;
  order: number;
  updatedAt?: number;
}

/** The 14 EU allergens, used until the restaurant edits its own list. */
export const DEFAULT_ALLERGENS: AllergenDef[] = ALLERGENS.map((a, order) => ({
  id: a.key,
  name: a.ca,
  es: a.es,
  en: a.en,
  fr: a.fr,
  color: a.color,
  order,
}));

/** The stored list once the restaurant has customised it, otherwise the official 14. */
export function resolveAllergens(stored: readonly AllergenDef[]): AllergenDef[] {
  const list = stored.length ? [...stored] : [...DEFAULT_ALLERGENS];
  return list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ca'));
}

export function allergenName(def: AllergenDef, lang: UiLang = 'ca'): string {
  return (lang === 'ca' ? def.name : def[lang])?.trim() || def.name;
}

/** Strong colours for allergen badges (white pictogram on top). */
export const ALLERGEN_COLORS = [
  '#b7862c',
  '#d0573a',
  '#c49a12',
  '#2f6f9f',
  '#4f86c6',
  '#4e9a52',
  '#2c8c8c',
  '#7b5ea7',
  '#7a2e4a',
  '#9b6a3c',
  '#5b5b5b',
  '#c2185b',
];

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
