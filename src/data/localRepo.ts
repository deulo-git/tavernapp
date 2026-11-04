import { openDB, type IDBPDatabase } from 'idb';
import type {
  AppConfig,
  CatalogItem,
  CollectionName,
  DeviceInfo,
  ItemCollection,
  RestaurantInfo,
  Translations,
} from '../domain/types';
import { emptyRestaurantInfo } from '../domain/types';
import { sourceHash } from '../domain/translation';
import type {
  ErrorHandler,
  InitResult,
  PairResult,
  Repository,
  SetupOptions,
  StoredImage,
  SyncState,
  Unsubscribe,
  WriteOp,
} from './repository';

// Demo-mode repository: everything lives in this browser's IndexedDB. Other tabs of the
// same browser are kept in sync through a BroadcastChannel.

interface DocRecord {
  path: string;
  col: string;
  data: Record<string, unknown>;
}

const DEVICE_ID = 'demo-device';

export class LocalRepository implements Repository {
  readonly mode = 'demo' as const;
  readonly deviceId = DEVICE_ID;
  private dbPromise: Promise<IDBPDatabase>;
  private listeners = new Map<string, Set<() => void>>();
  private channel: BroadcastChannel | null =
    typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('tavernapp-demo') : null;

  constructor(dbName = 'tavernapp-demo') {
    this.dbPromise = openDB(dbName, 1, {
      upgrade(db) {
        const store = db.createObjectStore('docs', { keyPath: 'path' });
        store.createIndex('col', 'col');
      },
    });
    this.channel?.addEventListener('message', (e: MessageEvent<string[]>) => this.emit(e.data, false));
  }

  async init(): Promise<InitResult> {
    const config = await this.getDoc('config/app');
    return config ? { status: 'ready' } : { status: 'needsSetup' };
  }

  async setup(options: SetupOptions): Promise<void> {
    const now = Date.now();
    await this.writeBatch([
      { type: 'set', path: 'config/app', data: { pinHash: options.pinHash, pinSalt: options.pinSalt } },
      { type: 'set', path: 'config/public', data: { initialized: true, restaurantName: options.restaurantName } },
      { type: 'set', path: `devices/${DEVICE_ID}`, data: { name: options.deviceName, pairedAt: now } },
      { type: 'set', path: 'info/restaurant', data: emptyRestaurantInfo(options.restaurantName) },
    ]);
  }

  async pair(): Promise<PairResult> {
    return 'ok';
  }

  resetPairing(): void {}

  // --- reads -------------------------------------------------------------------------

  private async getDoc(path: string): Promise<Record<string, unknown> | null> {
    const rec = (await (await this.dbPromise).get('docs', path)) as DocRecord | undefined;
    return rec?.data ?? null;
  }

  private async getCol(col: string): Promise<Record<string, unknown>[]> {
    const recs = (await (await this.dbPromise).getAllFromIndex('docs', 'col', col)) as DocRecord[];
    return recs.map((r) => r.data);
  }

  private listen(key: string, read: () => Promise<void>): Unsubscribe {
    let active = true;
    const run = () => {
      if (active) void read();
    };
    const set = this.listeners.get(key) ?? new Set();
    set.add(run);
    this.listeners.set(key, set);
    run();
    return () => {
      active = false;
      set.delete(run);
    };
  }

  private emit(keys: string[], broadcast = true) {
    for (const key of new Set(keys)) this.listeners.get(key)?.forEach((fn) => fn());
    if (broadcast) this.channel?.postMessage(keys);
  }

  subscribeCollection<T>(name: CollectionName, onData: (items: T[]) => void, onError: ErrorHandler): Unsubscribe {
    return this.listen(name, () =>
      this.getCol(name).then(
        (items) => onData(items as T[]),
        (e) => onError(e),
      ),
    );
  }

  private subscribeDoc<T>(path: string, onData: (d: T | null) => void, onError: ErrorHandler): Unsubscribe {
    return this.listen(path, () =>
      this.getDoc(path).then(
        (d) => onData(d as T | null),
        (e) => onError(e),
      ),
    );
  }

  subscribeInfo(onData: (info: RestaurantInfo | null) => void, onError: ErrorHandler): Unsubscribe {
    return this.subscribeDoc('info/restaurant', onData, onError);
  }

  subscribeConfig(onData: (config: AppConfig | null) => void, onError: ErrorHandler): Unsubscribe {
    return this.subscribeDoc('config/app', onData, onError);
  }

  subscribeDevices(onData: (devices: DeviceInfo[]) => void, onError: ErrorHandler): Unsubscribe {
    return this.listen('devices', () =>
      (this.dbPromise.then((db) => db.getAllFromIndex('docs', 'col', 'devices')) as Promise<DocRecord[]>).then(
        (recs) => onData(recs.map((r) => ({ ...(r.data as Omit<DeviceInfo, 'id'>), id: r.path.split('/')[1] }))),
        (e) => onError(e),
      ),
    );
  }

  subscribeSync(onState: (state: SyncState) => void): Unsubscribe {
    onState({ online: true, pendingWrites: 0 });
    return () => {};
  }

  // --- writes ------------------------------------------------------------------------

  async writeBatch(ops: WriteOp[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('docs', 'readwrite');
    for (const op of ops) {
      if (op.type === 'set') {
        const record: DocRecord = { path: op.path, col: op.path.split('/')[0], data: { ...op.data } };
        await tx.store.put(record);
      } else {
        await tx.store.delete(op.path);
      }
    }
    await tx.done;
    this.emit(ops.flatMap((op) => [op.path.split('/')[0], op.path]));
  }

  put(name: CollectionName, item: { id: string }): Promise<void> {
    return this.writeBatch([{ type: 'set', path: `${name}/${item.id}`, data: item }]);
  }

  async patch(name: CollectionName, id: string, fields: Record<string, unknown>): Promise<void> {
    const current = await this.getDoc(`${name}/${id}`);
    if (!current) return;
    await this.writeBatch([{ type: 'set', path: `${name}/${id}`, data: { ...current, ...fields } }]);
  }

  remove(name: CollectionName, id: string): Promise<void> {
    return this.writeBatch([{ type: 'delete', path: `${name}/${id}` }]);
  }

  putInfo(info: RestaurantInfo): Promise<void> {
    return this.writeBatch([{ type: 'set', path: 'info/restaurant', data: info }]);
  }

  putConfig(config: AppConfig): Promise<void> {
    return this.writeBatch([{ type: 'set', path: 'config/app', data: config }]);
  }

  async getImage(id: string): Promise<string | null> {
    const img = (await this.getDoc(`images/${id}`)) as StoredImage | null;
    return img?.data ?? null;
  }

  putImage(image: StoredImage): Promise<void> {
    return this.writeBatch([{ type: 'set', path: `images/${image.id}`, data: image }]);
  }

  removeImage(id: string): Promise<void> {
    return this.writeBatch([{ type: 'delete', path: `images/${id}` }]);
  }

  prefetchImages(): void {
    // Everything is already local.
  }

  async applyTranslation(name: ItemCollection, id: string, srcHash: string, tr: Translations): Promise<boolean> {
    const current = (await this.getDoc(`${name}/${id}`)) as CatalogItem | null;
    if (!current || sourceHash(current) !== srcHash) return false;
    await this.writeBatch([{ type: 'set', path: `${name}/${id}`, data: { ...current, tr } }]);
    return true;
  }

  async setPairingCode(): Promise<void> {
    // Pairing is not used in demo mode.
  }

  async renameDevice(name: string): Promise<void> {
    const current = await this.getDoc(`devices/${DEVICE_ID}`);
    await this.writeBatch([{ type: 'set', path: `devices/${DEVICE_ID}`, data: { ...current, name } }]);
  }

  async unpairDevice(): Promise<void> {
    // Pairing is not used in demo mode.
  }
}
