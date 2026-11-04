import { useEffect, useState } from 'react';
import type { ImageRef } from '../domain/types';
import { useRepo } from '../data/store';

// Small in-memory cache of full-size photos (data URLs) so browsing back and forth
// between items doesn't hit IndexedDB every time. Kept short: iPad memory is limited.
const MAX_ENTRIES = 12;
const cache = new Map<string, string>();

function remember(key: string, data: string) {
  cache.delete(key);
  cache.set(key, data);
  while (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value!);
}

/** Full-size photo of an item; shows the thumbnail until it has loaded. */
export function useFullImage(itemId: string, image: ImageRef | null): string | null {
  const repo = useRepo();
  const key = image ? `${itemId}:${image.v}` : null;
  const version = image?.v;
  const [loaded, setLoaded] = useState<{ key: string; data: string | null } | null>(null);

  useEffect(() => {
    if (!key || version === undefined || cache.has(key)) return;
    let cancelled = false;
    repo.getImage(itemId, version).then((data) => {
      if (data) remember(key, data);
      if (!cancelled) setLoaded({ key, data });
    });
    return () => {
      cancelled = true;
    };
  }, [repo, itemId, key, version]);

  if (!image || !key) return null;
  return cache.get(key) ?? (loaded?.key === key ? loaded.data : null) ?? image.thumb;
}
