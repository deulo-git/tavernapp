import type { Category, CatalogItem, CollectionName } from '../domain/types';
import { COLLECTION_OF } from '../domain/types';
import { prepareTranslations } from '../domain/translation';
import type { CompressedImage } from '../domain/images';
import type { Repository } from './repository';

const DEVICE_NAME_KEY = 'tavernapp.deviceName';

export function getDeviceName(): string {
  return localStorage.getItem(DEVICE_NAME_KEY) || 'Tablet';
}

export function setDeviceName(name: string) {
  localStorage.setItem(DEVICE_NAME_KEY, name.trim());
}

export function newId(): string {
  return crypto.randomUUID();
}

export type ImageChange = { kind: 'keep' } | { kind: 'remove' } | { kind: 'set'; image: CompressedImage };

/** Saves an item (and its photo). Returns at once with the server confirmation as a promise. */
export function saveCatalogItem(repo: Repository, item: CatalogItem, imageChange: ImageChange): Promise<void> {
  const now = Date.now();
  const next: CatalogItem = { ...item, updatedAt: now, updatedBy: getDeviceName() };
  const writes: Promise<void>[] = [];
  if (imageChange.kind === 'set') {
    next.image = { v: now, thumb: imageChange.image.thumb };
    writes.push(repo.putImage({ id: item.id, v: now, data: imageChange.image.full }));
  } else if (imageChange.kind === 'remove') {
    next.image = null;
    writes.push(repo.removeImage(item.id));
  }
  next.tr = prepareTranslations(next);
  writes.push(repo.put(COLLECTION_OF[next.kind], next));
  return Promise.all(writes).then(() => undefined);
}

/**
 * Deletes an item and returns a function that restores it (for the "Desfer" toast).
 * The full-size photo is read first (from the local cache) so it can be restored too.
 */
export async function deleteCatalogItem(
  repo: Repository,
  item: CatalogItem,
  onError: (err: unknown) => void,
): Promise<() => void> {
  const col = COLLECTION_OF[item.kind];
  const fullImage = item.image ? await repo.getImage(item.id, item.image.v).catch(() => null) : null;
  repo.remove(col, item.id).catch(onError);
  if (item.image) repo.removeImage(item.id).catch(onError);
  return () => {
    repo.put(col, item).catch(onError);
    if (item.image && fullImage) repo.putImage({ id: item.id, v: item.image.v, data: fullImage }).catch(onError);
  };
}

/** Moves list[index] by `delta` positions and renumbers the group so orders stay unique. */
export function moveInList<T extends { id: string; order: number }>(
  repo: Repository,
  col: CollectionName,
  list: T[],
  index: number,
  delta: -1 | 1,
  onError: (err: unknown) => void,
) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return;
  const reordered = [...list];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  reordered.forEach((x, i) => {
    if (x.order !== i) repo.patch(col, x.id, { order: i }).catch(onError);
  });
}

export function nextOrder(list: { order: number }[]): number {
  return list.reduce((max, x) => Math.max(max, x.order + 1), 0);
}

export function saveCategory(repo: Repository, category: Category): Promise<void> {
  const item: Category = { ...category, updatedAt: Date.now() };
  return repo.put('categories', item);
}

/** Sorts by the manual order, then alphabetically. */
export function byOrder<T extends { order: number }>(nameOf: (x: T) => string) {
  return (a: T, b: T) => a.order - b.order || nameOf(a).localeCompare(nameOf(b), 'ca');
}
