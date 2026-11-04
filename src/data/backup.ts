import type { AllergenDef } from '../domain/allergens';
import type { Category, CatalogItem, Dish, Drink, Guide, RestaurantInfo } from '../domain/types';
import type { Repository, StoredImage, WriteOp } from './repository';

export const BACKUP_FORMAT = 'tavernapp-backup';

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: 1;
  exportedAt: number;
  categories: Category[];
  dishes: Dish[];
  drinks: Drink[];
  guides: Guide[];
  info: RestaurantInfo | null;
  images: StoredImage[];
  /** Allergen list (missing in backups made before it became editable). */
  allergens?: AllergenDef[];
}

export interface BackupSource {
  categories: Category[];
  dishes: Dish[];
  drinks: Drink[];
  guides: Guide[];
  info: RestaurantInfo | null;
  allergens?: AllergenDef[];
}

export type BackupValidation = { ok: true; backup: BackupFile } | { ok: false; error: string };

const hasId = (x: unknown): boolean =>
  typeof x === 'object' && x !== null && typeof (x as { id?: unknown }).id === 'string';

export function validateBackup(raw: unknown): BackupValidation {
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: 'El fitxer no és una còpia de seguretat.' };
  const b = raw as Partial<BackupFile>;
  if (b.format !== BACKUP_FORMAT) return { ok: false, error: 'El fitxer no és una còpia de seguretat de TavernApp.' };
  if (b.version !== 1) return { ok: false, error: 'Aquesta còpia és d’una versió no compatible.' };
  for (const key of ['categories', 'dishes', 'drinks', 'guides', 'images'] as const) {
    if (!Array.isArray(b[key]) || !(b[key] as unknown[]).every(hasId)) {
      return { ok: false, error: `La còpia està malmesa (secció “${key}”).` };
    }
  }
  const kinds: [unknown[], string][] = [
    [b.dishes!, 'dish'],
    [b.drinks!, 'drink'],
    [b.guides!, 'guide'],
  ];
  for (const [items, kind] of kinds) {
    if (!items.every((i) => (i as CatalogItem).kind === kind)) return { ok: false, error: 'La còpia està malmesa.' };
  }
  const imagesOk = b.images!.every(
    (img) => typeof img.v === 'number' && typeof img.data === 'string' && img.data.startsWith('data:image/'),
  );
  if (!imagesOk) return { ok: false, error: 'La còpia conté imatges malmeses.' };
  return { ok: true, backup: b as BackupFile };
}

export async function buildBackup(repo: Repository, source: BackupSource): Promise<BackupFile> {
  const images: StoredImage[] = [];
  for (const item of [...source.dishes, ...source.drinks, ...source.guides]) {
    if (!item.image) continue;
    const data = await repo.getImage(item.id, item.image.v);
    if (data) images.push({ id: item.id, v: item.image.v, data });
  }
  const { categories, dishes, drinks, guides, info, allergens } = source;
  return {
    format: BACKUP_FORMAT,
    version: 1,
    exportedAt: Date.now(),
    categories,
    dishes,
    drinks,
    guides,
    info,
    images,
    allergens,
  };
}

/** Operations that make the stored data identical to the backup. */
export function restoreOps(backup: BackupFile, current: BackupSource): WriteOp[] {
  const ops: WriteOp[] = [];
  const sync = <T extends { id: string }>(col: string, wanted: T[], existing: T[]) => {
    const keep = new Set(wanted.map((x) => x.id));
    for (const x of existing) if (!keep.has(x.id)) ops.push({ type: 'delete', path: `${col}/${x.id}` });
    for (const x of wanted) ops.push({ type: 'set', path: `${col}/${x.id}`, data: x });
  };
  sync('categories', backup.categories, current.categories);
  sync('dishes', backup.dishes, current.dishes);
  sync('drinks', backup.drinks, current.drinks);
  sync('guides', backup.guides, current.guides);

  const currentImageIds = [...current.dishes, ...current.drinks, ...current.guides]
    .filter((i) => i.image)
    .map((i) => ({ id: i.id }));
  sync('images', backup.images, currentImageIds as StoredImage[]);

  if (backup.allergens?.length) sync('allergens', backup.allergens, current.allergens ?? []);
  if (backup.info) ops.push({ type: 'set', path: 'info/restaurant', data: backup.info });
  return ops;
}

export function backupFileName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `tavernapp-copia-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}

/** On iPad the share sheet is the reliable way to save a file ("Desa a Fitxers"). */
export async function shareOrDownload(content: string, fileName: string): Promise<void> {
  const file = new File([content], fileName, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: fileName });
      return;
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
