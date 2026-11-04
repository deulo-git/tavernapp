import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocFromCache,
  getDocFromServer,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  runTransaction,
  setDoc,
  updateDoc,
  waitForPendingWrites,
  writeBatch,
  type DocumentData,
  type Firestore,
  type FirestoreError,
} from 'firebase/firestore';
import type {
  AppConfig,
  CatalogItem,
  CollectionName,
  ItemCollection,
  RestaurantInfo,
  Translations,
} from '../domain/types';
import { sourceHash } from '../domain/translation';
import { firebaseConfig } from './firebaseConfig';
import {
  RepoError,
  type ErrorHandler,
  type InitResult,
  type Repository,
  type StoredImage,
  type SyncState,
  type Unsubscribe,
  type WriteOp,
} from './repository';

const PREFETCHED_KEY = 'tavernapp.prefetchedImages';
const NETWORK_TIMEOUT_MS = 20_000;
// Firestore batches allow 500 writes and ~10 MiB; images can be ~0.7 MB each.
const BATCH_MAX_OPS = 400;
const BATCH_MAX_BYTES = 7_000_000;

function toRepoError(err: unknown): RepoError {
  const fsErr = err as Partial<FirestoreError>;
  return new RepoError(fsErr.code ?? 'unknown', fsErr.message);
}

function withTimeout<T>(promise: Promise<T>, ms = NETWORK_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new RepoError('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

function readJson<T>(key: string, fallback: T): T {
  try {
    return (JSON.parse(localStorage.getItem(key) ?? '') as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export class FirestoreRepository implements Repository {
  readonly mode = 'firebase' as const;
  private auth: Auth;
  private db: Firestore;
  private pendingWrites = 0;
  private syncListeners = new Set<(state: SyncState) => void>();
  private prefetching = false;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    this.db = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: 400 * 1024 * 1024,
      }),
    });
    window.addEventListener('online', () => this.emitSync());
    window.addEventListener('offline', () => this.emitSync());
  }

  // --- identity ------------------------------------------------------------------------

  /** Every tablet signs in anonymously (invisible to staff); firestore.rules require it. */
  async init(): Promise<InitResult> {
    try {
      await this.auth.authStateReady();
      if (!this.auth.currentUser) await signInAnonymously(this.auth);
    } catch {
      return {
        status: 'error',
        message: "No s'ha pogut connectar amb el servidor. La primera vegada cal connexió a internet.",
      };
    }
    this.track(waitForPendingWrites(this.db));
    return { status: 'ready' };
  }

  // --- sync state ------------------------------------------------------------------------

  private emitSync() {
    const state = { online: navigator.onLine, pendingWrites: this.pendingWrites };
    this.syncListeners.forEach((fn) => fn(state));
  }

  private track<T>(promise: Promise<T>): Promise<T> {
    this.pendingWrites++;
    this.emitSync();
    return promise.finally(() => {
      this.pendingWrites--;
      this.emitSync();
    });
  }

  subscribeSync(onState: (state: SyncState) => void): Unsubscribe {
    this.syncListeners.add(onState);
    onState({ online: navigator.onLine, pendingWrites: this.pendingWrites });
    return () => this.syncListeners.delete(onState);
  }

  // --- reads -------------------------------------------------------------------------------

  subscribeCollection<T>(name: CollectionName, onData: (items: T[]) => void, onError: ErrorHandler): Unsubscribe {
    return onSnapshot(
      collection(this.db, name),
      (snap) => onData(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as T)),
      (err) => onError(toRepoError(err)),
    );
  }

  private subscribeDoc<T>(path: [string, string], onData: (data: T | null) => void, onError: ErrorHandler) {
    return onSnapshot(
      doc(this.db, ...path),
      (snap) => onData(snap.exists() ? (snap.data() as T) : null),
      (err) => onError(toRepoError(err)),
    );
  }

  subscribeInfo(onData: (info: RestaurantInfo | null) => void, onError: ErrorHandler): Unsubscribe {
    return this.subscribeDoc(['info', 'restaurant'], onData, onError);
  }

  subscribeConfig(onData: (config: AppConfig | null) => void, onError: ErrorHandler): Unsubscribe {
    return this.subscribeDoc(['config', 'app'], onData, onError);
  }

  // --- writes ------------------------------------------------------------------------------

  private ref(path: string) {
    const [col, id] = path.split('/');
    return doc(this.db, col, id);
  }

  put(name: CollectionName, item: { id: string }): Promise<void> {
    return this.track(setDoc(doc(this.db, name, item.id), item));
  }

  patch(name: CollectionName, id: string, fields: Record<string, unknown>): Promise<void> {
    return this.track(updateDoc(doc(this.db, name, id), fields as DocumentData));
  }

  remove(name: CollectionName, id: string): Promise<void> {
    return this.track(deleteDoc(doc(this.db, name, id)));
  }

  putInfo(info: RestaurantInfo): Promise<void> {
    return this.track(setDoc(doc(this.db, 'info', 'restaurant'), info));
  }

  putConfig(config: AppConfig): Promise<void> {
    return this.track(setDoc(doc(this.db, 'config', 'app'), config));
  }

  async writeBatch(ops: WriteOp[]): Promise<void> {
    const chunks: WriteOp[][] = [];
    let current: WriteOp[] = [];
    let bytes = 0;
    for (const op of ops) {
      const size = op.type === 'set' ? JSON.stringify(op.data).length : 100;
      if (current.length >= BATCH_MAX_OPS || (current.length > 0 && bytes + size > BATCH_MAX_BYTES)) {
        chunks.push(current);
        current = [];
        bytes = 0;
      }
      current.push(op);
      bytes += size;
    }
    if (current.length) chunks.push(current);

    for (const chunk of chunks) {
      const batch = writeBatch(this.db);
      for (const op of chunk) {
        if (op.type === 'set') batch.set(this.ref(op.path), op.data);
        else batch.delete(this.ref(op.path));
      }
      // Not awaited: offline, commits only resolve once synced, but they apply locally at once.
      void this.track(batch.commit()).catch(() => {});
    }
  }

  // --- images ------------------------------------------------------------------------------

  async getImage(id: string, v: number): Promise<string | null> {
    const ref = doc(this.db, 'images', id);
    let stale: string | null = null;
    try {
      const cached = (await getDocFromCache(ref)).data() as StoredImage | undefined;
      if (cached?.v === v) return cached.data;
      stale = cached?.data ?? null;
    } catch {
      // Not in the local cache yet.
    }
    if (!navigator.onLine) return stale;
    try {
      const fresh = (await withTimeout(getDocFromServer(ref))).data() as StoredImage | undefined;
      return fresh?.data ?? stale;
    } catch {
      return stale;
    }
  }

  putImage(image: StoredImage): Promise<void> {
    this.markPrefetched(image.id, image.v);
    return this.track(setDoc(doc(this.db, 'images', image.id), image));
  }

  removeImage(id: string): Promise<void> {
    return this.track(deleteDoc(doc(this.db, 'images', id)));
  }

  private markPrefetched(id: string, v: number) {
    const done = readJson<Record<string, number>>(PREFETCHED_KEY, {});
    done[id] = v;
    localStorage.setItem(PREFETCHED_KEY, JSON.stringify(done));
  }

  prefetchImages(refs: { id: string; v: number }[]): void {
    if (this.prefetching || !navigator.onLine) return;
    const done = readJson<Record<string, number>>(PREFETCHED_KEY, {});
    const todo = refs.filter((r) => done[r.id] !== r.v);
    if (todo.length === 0) return;
    this.prefetching = true;
    void (async () => {
      try {
        for (const r of todo) {
          if (!navigator.onLine) break;
          // Loading it once is enough: Firestore keeps it in the persistent cache.
          if ((await this.getImage(r.id, r.v)) !== null) this.markPrefetched(r.id, r.v);
        }
      } finally {
        this.prefetching = false;
      }
    })();
  }

  // --- translations ---------------------------------------------------------------------

  async applyTranslation(name: ItemCollection, id: string, srcHash: string, tr: Translations): Promise<boolean> {
    const ref = doc(this.db, name, id);
    return runTransaction(this.db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return false;
      const item = { ...snap.data(), id } as CatalogItem;
      if (sourceHash(item) !== srcHash) return false;
      tx.update(ref, { tr });
      return true;
    });
  }
}
