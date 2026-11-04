import { createContext, useContext } from 'react';
import type { AppConfig, Category, DeviceInfo, Dish, Drink, Guide, RestaurantInfo } from '../domain/types';
import type { Repository, SyncState } from './repository';

export type AppStatus = 'loading' | 'needsSetup' | 'needsPairing' | 'ready' | 'error';

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
  info: RestaurantInfo | null;
  config: AppConfig | null;
  devices: DeviceInfo[];
  sync: SyncState;
  /** Re-runs initialization (after setup, pairing or a connection error). */
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
