import { describe, expect, it } from 'vitest';
import { allergenStatus } from '../src/domain/allergens';
import { decimalToInput, formatPrice, parseDecimal, wifiQrPayload } from '../src/domain/format';
import { fitWithin } from '../src/domain/images';
import { DEFAULT_PIN_CONFIG, hashPin, isValidPin } from '../src/domain/security';
import { categoryColor } from '../src/domain/colors';
import { hashFields, prepareTranslations, sourceHash, translatedField } from '../src/domain/translation';
import type { Dish } from '../src/domain/types';

function dish(overrides: Partial<Dish> = {}): Dish {
  return {
    id: 'd1',
    kind: 'dish',
    name: 'Pa amb tomàquet',
    categoryId: 'c1',
    price: 3.5,
    tags: [],
    ingredients: ['Pa', 'Tomàquet'],
    allergens: ['gluten'],
    traces: ['sesam'],
    preparation: '',
    explanation: 'Pa torrat amb tomàquet.',
    pairings: [],
    order: 0,
    available: true,
    image: null,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('allergenStatus', () => {
  it('is safe when the customer declared nothing', () => {
    expect(allergenStatus(dish(), new Set())).toBe('safe');
  });
  it('detects contained allergens before traces', () => {
    expect(allergenStatus(dish(), new Set(['gluten', 'sesam'] as const))).toBe('contains');
  });
  it('reports traces', () => {
    expect(allergenStatus(dish(), new Set(['sesam'] as const))).toBe('traces');
  });
  it('is safe for unrelated allergies', () => {
    expect(allergenStatus(dish(), new Set(['peix'] as const))).toBe('safe');
  });
});

describe('format', () => {
  it('parses Catalan decimal input', () => {
    expect(parseDecimal('12,50')).toBe(12.5);
    expect(parseDecimal('12.5 €')).toBe(12.5);
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('-3')).toBeNull();
  });
  it('round-trips prices to the input format', () => {
    expect(decimalToInput(12.5)).toBe('12,5');
    expect(decimalToInput(null)).toBe('');
  });
  it('formats euros the Catalan way', () => {
    expect(formatPrice(3.5)).toMatch(/^3,50\s€$/);
    expect(formatPrice(null)).toBe('');
  });
  it('builds and escapes Wi-Fi QR payloads', () => {
    expect(wifiQrPayload('Taverna', 'a;b:c')).toBe('WIFI:T:WPA;S:Taverna;P:a\\;b\\:c;;');
    expect(wifiQrPayload('Oberta', '')).toBe('WIFI:T:nopass;S:Oberta;;');
  });
});

describe('fitWithin', () => {
  it('scales the longest side down to the limit', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });
  it('never upscales', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});

describe('edit PIN', () => {
  it('accepts the default PIN and only 4 digits', async () => {
    expect(await hashPin('6998', DEFAULT_PIN_CONFIG.pinSalt)).toBe(DEFAULT_PIN_CONFIG.pinHash);
    expect(await hashPin('1234', DEFAULT_PIN_CONFIG.pinSalt)).not.toBe(DEFAULT_PIN_CONFIG.pinHash);
    expect(isValidPin('6998')).toBe(true);
    expect(isValidPin('69a8')).toBe(false);
  });
});

describe('category colours', () => {
  it('uses the chosen colour, or one from the position', () => {
    expect(categoryColor({ color: 'rosa', order: 0 })).toBe('rosa');
    expect(categoryColor({ order: 1 })).toBe('verd');
    expect(categoryColor({ color: 'invent', order: 0 })).toBe('blau');
    expect(categoryColor(undefined)).toBe('gris');
  });
});

describe('translations', () => {
  it('hashes are stable and ignore key order and surrounding spaces', () => {
    expect(hashFields({ a: 'x', b: 'y' })).toBe(hashFields({ b: 'y ', a: 'x' }));
    expect(hashFields({ a: 'x' })).not.toBe(hashFields({ a: 'z' }));
  });

  it('keeps translations that still match the source', () => {
    const d = dish();
    const tr = { es: { name: 'Pan con tomate' }, srcHash: sourceHash(d), status: 'ok' as const };
    expect(prepareTranslations({ ...d, tr })).toBe(tr);
  });

  it('marks changed sources as pending but keeps the old texts meanwhile', () => {
    const d = dish();
    const tr = { es: { name: 'Pan con tomate' }, srcHash: sourceHash(d), status: 'ok' as const };
    const next = prepareTranslations({ ...d, name: 'Pa amb tomàquet i pernil', tr });
    expect(next.status).toBe('pending');
    expect(next.es?.name).toBe('Pan con tomate');
  });

  it('retries items whose last translation failed', () => {
    const d = dish();
    const next = prepareTranslations({ ...d, tr: { srcHash: sourceHash(d), status: 'error', error: 'x' } });
    expect(next.status).toBe('pending');
  });

  it('has nothing to translate when the texts are empty', () => {
    const next = prepareTranslations(dish({ name: '', explanation: '', ingredients: [] }));
    expect(next.status).toBe('ok');
  });

  it('falls back to Catalan when a translation is missing', () => {
    const d = dish({ tr: { en: { name: 'Bread with tomato' }, srcHash: 'x', status: 'ok' } });
    expect(translatedField(d, 'en', 'name')).toBe('Bread with tomato');
    expect(translatedField(d, 'fr', 'name')).toBe('Pa amb tomàquet');
    expect(translatedField(d, 'en', 'explanation')).toBe('Pa torrat amb tomàquet.');
  });
});
