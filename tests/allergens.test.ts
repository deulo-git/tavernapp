import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { LocalRepository } from '../src/data/localRepo';
import { deleteAllergen, saveAllergen } from '../src/data/allergenActions';
import { DEFAULT_ALLERGENS, allergenName, resolveAllergens, type AllergenDef } from '../src/domain/allergens';
import type { Dish } from '../src/domain/types';

let n = 0;
const repo = () => new LocalRepository(`allergens-${n++}`);
const read = (r: LocalRepository, col: 'allergens' | 'dishes') =>
  new Promise<unknown[]>((res) => {
    const un = r.subscribeCollection(
      col,
      (items) => {
        queueMicrotask(() => un());
        res(items);
      },
      () => {},
    );
  });

const dish = (allergens: string[], traces: string[] = []): Dish => ({
  id: 'd1',
  kind: 'dish',
  name: 'Plat',
  categoryId: 'c',
  price: null,
  tags: [],
  ingredients: [],
  allergens,
  traces,
  preparation: '',
  explanation: '',
  pairings: [],
  order: 0,
  available: true,
  image: null,
  createdAt: 0,
  updatedAt: 0,
});

describe('allergen list', () => {
  it('uses the 14 official allergens until customised', () => {
    expect(resolveAllergens([])).toHaveLength(14);
    expect(resolveAllergens([{ ...DEFAULT_ALLERGENS[0], order: 0 }])).toHaveLength(1);
  });

  it('falls back to the Catalan name when a translation is empty', () => {
    const def: AllergenDef = { id: 'x', name: 'Pinyons', es: '', en: 'Pine nuts', fr: '', color: '#000', order: 0 };
    expect(allergenName(def, 'en')).toBe('Pine nuts');
    expect(allergenName(def, 'fr')).toBe('Pinyons');
  });

  it('the first change stores the whole official list plus the new one', async () => {
    const r = repo();
    const custom: AllergenDef = { id: 'pinyons', name: 'Pinyons', es: '', en: '', fr: '', color: '#000', order: 14 };
    await saveAllergen(r, DEFAULT_ALLERGENS, false, custom);
    expect(await read(r, 'allergens')).toHaveLength(15);
  });

  it('deleting an allergen removes it from the dishes that had it', async () => {
    const r = repo();
    await r.put('dishes', dish(['gluten', 'ous'], ['gluten']));
    await deleteAllergen(r, DEFAULT_ALLERGENS, false, 'gluten', [dish(['gluten', 'ous'], ['gluten'])], []);
    const [saved] = (await read(r, 'dishes')) as Dish[];
    expect(saved.allergens).toEqual(['ous']);
    expect(saved.traces).toEqual([]);
    expect(await read(r, 'allergens')).toHaveLength(13);
  });
});
