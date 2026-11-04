import { useMemo } from 'react';
import type { AllergenDef } from '../domain/allergens';
import { useData } from './store';

/** The allergen list in use, plus a lookup by id (ids of deleted allergens are simply not found). */
export function useAllergens(): { list: AllergenDef[]; byId: Map<string, AllergenDef> } {
  const { allergens } = useData();
  return useMemo(() => ({ list: allergens, byId: new Map(allergens.map((a) => [a.id, a])) }), [allergens]);
}
