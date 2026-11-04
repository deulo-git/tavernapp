import { createContext, useContext } from 'react';
import type { AllergenKey } from '../../domain/allergens';

/** Allergies declared by the customer being served; shared by the food and drinks screens. */
export interface AllergyFilterApi {
  excluded: ReadonlySet<AllergenKey>;
  setExcluded(next: ReadonlySet<AllergenKey>): void;
  openDialog(): void;
}

export const AllergyFilterContext = createContext<AllergyFilterApi | null>(null);

export function useAllergyFilter(): AllergyFilterApi {
  const api = useContext(AllergyFilterContext);
  if (!api) throw new Error('useAllergyFilter must be used inside <AllergyFilterProvider>');
  return api;
}
