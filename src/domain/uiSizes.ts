/**
 * Interface sizes set from the admin panel. They are stored once (config/ui) and shared by
 * every tablet, and applied as CSS custom properties on the root element.
 */
export interface UiSizes {
  /** Overall interface scale, in % (zooms everything: text, buttons, spacing). */
  zoom: number;
  /** Menjar tile on the home screen compared with the other two, in %. */
  menjarTile: number;
  /** Minimum card width inside a category, in px. */
  cardSize: number;
  /** Minimum card width in "Tota la carta", in px. */
  cardSizeAll: number;
  /** Card name text size, in px. */
  cardTitle: number;
  /** Photo column width in the detail view, in % of the screen. */
  detailImage: number;
  /** Width of the side index, in px. */
  railWidth: number;
}

export type UiSizeKey = keyof UiSizes;

export interface UiSizeParam {
  key: UiSizeKey;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  unit: '%' | 'px';
}

export const DEFAULT_UI_SIZES: UiSizes = {
  zoom: 100,
  menjarTile: 140,
  cardSize: 240,
  cardSizeAll: 288,
  cardTitle: 21,
  detailImage: 44,
  railWidth: 232,
};

export const UI_SIZE_PARAMS: UiSizeParam[] = [
  {
    key: 'zoom',
    label: 'Mida general',
    hint: 'Fa més gran o més petit tot: text, botons i espais.',
    min: 80,
    max: 130,
    step: 5,
    unit: '%',
  },
  {
    key: 'menjarTile',
    label: 'Botó de Menjar a l’inici',
    hint: 'Mida respecte als botons de Begudes i Informació.',
    min: 100,
    max: 200,
    step: 10,
    unit: '%',
  },
  {
    key: 'cardSize',
    label: 'Targetes d’una categoria',
    hint: 'Amplada mínima de cada plat o beguda a la graella.',
    min: 160,
    max: 420,
    step: 10,
    unit: 'px',
  },
  {
    key: 'cardSizeAll',
    label: 'Targetes a «Tota la carta»',
    hint: 'Amplada mínima de cada plat quan es veu tota la carta.',
    min: 160,
    max: 480,
    step: 10,
    unit: 'px',
  },
  {
    key: 'cardTitle',
    label: 'Nom a les targetes',
    hint: 'Mida del text del nom sota la foto.',
    min: 14,
    max: 32,
    step: 1,
    unit: 'px',
  },
  {
    key: 'detailImage',
    label: 'Foto a la fitxa',
    hint: 'Amplada de la foto quan s’obre un plat o una beguda.',
    min: 30,
    max: 60,
    step: 2,
    unit: '%',
  },
  {
    key: 'railWidth',
    label: 'Índex lateral',
    hint: 'Amplada del panell de categories de la dreta.',
    min: 180,
    max: 340,
    step: 10,
    unit: 'px',
  },
];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Fills in missing or out-of-range values with the defaults. */
export function normalizeUiSizes(raw: Partial<Record<string, unknown>> | null | undefined): UiSizes {
  const out = { ...DEFAULT_UI_SIZES };
  for (const p of UI_SIZE_PARAMS) {
    const v = raw?.[p.key];
    if (typeof v === 'number' && Number.isFinite(v)) out[p.key] = clamp(v, p.min, p.max);
  }
  return out;
}

export function sameUiSizes(a: UiSizes, b: UiSizes): boolean {
  return UI_SIZE_PARAMS.every((p) => a[p.key] === b[p.key]);
}

/** CSS custom properties read by the stylesheets. */
export function uiSizeVars(sizes: UiSizes): Record<string, string> {
  return {
    '--ui-zoom': String(sizes.zoom / 100),
    '--home-menjar': `${sizes.menjarTile / 100}fr`,
    '--card-min': `${sizes.cardSize}px`,
    '--card-min-all': `${sizes.cardSizeAll}px`,
    '--card-title': `${sizes.cardTitle}px`,
    '--detail-image': `${sizes.detailImage}%`,
    '--rail-w': `${sizes.railWidth}px`,
  };
}

const CACHE_KEY = 'tavernapp.uiSizes';

/** Applies the sizes to the page and remembers them, so the next start opens at the right size. */
export function applyUiSizes(sizes: UiSizes) {
  const root = document.documentElement;
  for (const [name, value] of Object.entries(uiSizeVars(sizes))) root.style.setProperty(name, value);
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(sizes));
  } catch {
    // Storage unavailable: sizes still apply for this session.
  }
}

export function cachedUiSizes(): UiSizes {
  try {
    return normalizeUiSizes(JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null'));
  } catch {
    return DEFAULT_UI_SIZES;
  }
}
