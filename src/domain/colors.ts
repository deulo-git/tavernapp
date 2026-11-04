import type { DrinkType, GuideTopic } from './types';

// Soft tile colours for the menu grid: every category (and drink type) gets its own.
export const TILE_COLORS = {
  blau: { label: 'Blau', bg: '#dcebfa', ink: '#173a5e' },
  verd: { label: 'Verd', bg: '#dcf2df', ink: '#1d4a29' },
  rosa: { label: 'Rosa', bg: '#fbe0ea', ink: '#6a1d3a' },
  groc: { label: 'Groc', bg: '#fff1bf', ink: '#574200' },
  lila: { label: 'Lila', bg: '#ebe2fa', ink: '#3c2868' },
  taronja: { label: 'Taronja', bg: '#ffe4cf', ink: '#6a3410' },
  menta: { label: 'Menta', bg: '#d5f4ee', ink: '#134e48' },
  gris: { label: 'Gris', bg: '#ececea', ink: '#262626' },
} as const;

export type TileColor = keyof typeof TILE_COLORS;
export const TILE_COLOR_KEYS = Object.keys(TILE_COLORS) as TileColor[];

export function isTileColor(value: unknown): value is TileColor {
  return typeof value === 'string' && value in TILE_COLORS;
}

/** Colour of a category: the chosen one, or one picked from its position. */
export function categoryColor(category: { color?: string; order: number } | undefined): TileColor {
  if (!category) return 'gris';
  if (isTileColor(category.color)) return category.color;
  return TILE_COLOR_KEYS[Math.abs(category.order) % TILE_COLOR_KEYS.length];
}

export const DRINK_TYPE_COLOR: Record<DrinkType, TileColor> = { vi: 'lila', cervesa: 'groc', licor: 'taronja' };

export const GUIDE_TOPIC_COLOR: Record<GuideTopic, TileColor> = {
  girona: 'blau',
  cultura: 'lila',
  gastronomia: 'taronja',
  serveis: 'menta',
  altres: 'gris',
};

/** CSS custom properties for a coloured tile. */
export function tileStyle(color: TileColor): Record<string, string> {
  return { '--tile-bg': TILE_COLORS[color].bg, '--tile-ink': TILE_COLORS[color].ink };
}
