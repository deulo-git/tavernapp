import { createContext, useContext } from 'react';
import type { AllergenDef } from '../domain/allergens';
import type { AppConfig, Category, Dish, Drink, Guide, RestaurantInfo } from '../domain/types';
import type { Repository, SyncState } from './repository';

export type AppStatus = 'loading' | 'ready' | 'error';

export interface DataContextValue {
  repo: Repository;
  status: AppStatus;
  error: string | null;
  /** True once the first snapshot of every collection has arrived. */
  loaded: boolean;
  dishes: Dish[];
  drinks: Drink[];
  categories: Category[];
  guides: Guide[];
  /** Allergen list in use (the official 14 until customised). */
  allergens: AllergenDef[];
  /** True once the restaurant has saved its own allergen list. */
  allergensCustomized: boolean;
  info: RestaurantInfo | null;
  config: AppConfig | null;
  sync: SyncState;
  /** Re-runs initialization (after a connection error). */
  reinit(): void;
  /** Starts translating pending items now. */
  kickTranslations(itemId?: string): void;
}

export const DataContext = createContext<DataContextValue | null>(null);

export function useData(): DataContextValue {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData must be used inside <DataProvider>');
  return value;
}

export function useRepo(): Repository {
  return useData().repo;
}
