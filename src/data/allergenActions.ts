import type { AllergenDef } from '../domain/allergens';
import type { Dish, Drink } from '../domain/types';
import type { Repository, WriteOp } from './repository';

// Until the restaurant edits its allergen list, the official 14 live only in code. The first
// change writes the whole list to Firestore so every tablet sees the same customised list.

function materialize(list: AllergenDef[], customized: boolean, except?: string): WriteOp[] {
  if (customized) return [];
  return list.filter((a) => a.id !== except).map((a) => ({ type: 'set', path: `allergens/${a.id}`, data: a }));
}

export function saveAllergen(repo: Repository, list: AllergenDef[], customized: boolean, def: AllergenDef) {
  return repo.writeBatch([
    ...materialize(list, customized, def.id),
    { type: 'set', path: `allergens/${def.id}`, data: { ...def, updatedAt: Date.now() } },
  ]);
}

/** Moves list[index] by delta and writes the whole list renumbered (which also materializes it). */
export function moveAllergen(repo: Repository, list: AllergenDef[], index: number, delta: -1 | 1) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return Promise.resolve();
  const reordered = [...list];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  return repo.writeBatch(
    reordered.map((a, order): WriteOp => ({ type: 'set', path: `allergens/${a.id}`, data: { ...a, order } })),
  );
}

/** Items that list the allergen as "contains" or "traces". */
export function itemsUsingAllergen(id: string, dishes: Dish[], drinks: Drink[]): (Dish | Drink)[] {
  return [...dishes, ...drinks].filter((i) => i.allergens.includes(id) || i.traces.includes(id));
}

/** Deletes an allergen and removes it from every dish and drink that had it. */
export function deleteAllergen(
  repo: Repository,
  list: AllergenDef[],
  customized: boolean,
  id: string,
  dishes: Dish[],
  drinks: Drink[],
) {
  const ops: WriteOp[] = [...materialize(list, customized, id)];
  if (customized) ops.push({ type: 'delete', path: `allergens/${id}` });
  for (const item of itemsUsingAllergen(id, dishes, drinks)) {
    const col = item.kind === 'dish' ? 'dishes' : 'drinks';
    ops.push({
      type: 'set',
      path: `${col}/${item.id}`,
      data: { ...item, allergens: item.allergens.filter((a) => a !== id), traces: item.traces.filter((a) => a !== id) },
    });
  }
  return repo.writeBatch(ops);
}

export function nextAllergenOrder(list: AllergenDef[]): number {
  return list.reduce((max, a) => Math.max(max, a.order + 1), 0);
}
