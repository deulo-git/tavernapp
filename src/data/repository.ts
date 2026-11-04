import type { AppConfig, CollectionName, ItemCollection, RestaurantInfo, Translations } from '../domain/types';

// Storage abstraction with two implementations: Firestore (real, shared by the 3 tablets)
// and IndexedDB (demo mode, when no Firebase config is present).

export type InitResult = { status: 'ready' } | { status: 'error'; message: string };

export type SyncState = { online: boolean; pendingWrites: number };

export interface StoredImage {
  id: string;
  v: number;
  data: string;
}

/** Paths are "collection/id", e.g. "dishes/abc", "info/restaurant", "images/abc". */
export type WriteOp = { type: 'set'; path: string; data: object } | { type: 'delete'; path: string };

export class RepoError extends Error {
  constructor(
    readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export type Unsubscribe = () => void;
export type ErrorHandler = (error: RepoError) => void;

export interface Repository {
  readonly mode: 'firebase' | 'demo';

  init(): Promise<InitResult>;

  subscribeCollection<T>(name: CollectionName, onData: (items: T[]) => void, onError: ErrorHandler): Unsubscribe;
  subscribeInfo(onData: (info: RestaurantInfo | null) => void, onError: ErrorHandler): Unsubscribe;
  subscribeConfig(onData: (config: AppConfig | null) => void, onError: ErrorHandler): Unsubscribe;
  subscribeSync(onState: (state: SyncState) => void): Unsubscribe;

  // Writes resolve when the server confirms them. Offline they stay pending (and are
  // applied locally right away), so the UI must not block on them.
  put(name: CollectionName, item: { id: string }): Promise<void>;
  patch(name: CollectionName, id: string, fields: Record<string, unknown>): Promise<void>;
  remove(name: CollectionName, id: string): Promise<void>;
  putInfo(info: RestaurantInfo): Promise<void>;
  putConfig(config: AppConfig): Promise<void>;
  writeBatch(ops: WriteOp[]): Promise<void>;

  getImage(id: string, v: number): Promise<string | null>;
  putImage(image: StoredImage): Promise<void>;
  removeImage(id: string): Promise<void>;
  /** Downloads full-size images in the background so they are available offline. */
  prefetchImages(refs: { id: string; v: number }[]): void;

  /** Stores translations only if the item's Catalan source still hashes to `srcHash`. */
  applyTranslation(name: ItemCollection, id: string, srcHash: string, tr: Translations): Promise<boolean>;
}
