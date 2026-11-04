import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppConfig, Category, CatalogItem, DeviceInfo, Dish, Drink, Guide, RestaurantInfo } from '../domain/types';
import { itemTitle } from '../domain/types';
import type { Repository, SyncState } from './repository';
import { DataContext, type AppStatus, type DataContextValue } from './store';
import { TranslationJob } from './translationJob';
import { byOrder } from './actions';

const sortItems = byOrder<CatalogItem>(itemTitle);
const sortCategories = byOrder<Category>((c) => c.name);

interface Props {
  repo: Repository;
  children: ReactNode;
}

export function DataProvider({ repo, children }: Props) {
  const [status, setStatus] = useState<AppStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [initRun, setInitRun] = useState(0);
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [drinks, setDrinks] = useState<Drink[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [info, setInfo] = useState<RestaurantInfo | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [sync, setSync] = useState<SyncState>({ online: true, pendingWrites: 0 });

  const reinit = useCallback(() => setInitRun((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    repo.init().then((result) => {
      if (cancelled) return;
      setError(result.status === 'error' ? result.message : null);
      setStatus(result.status);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, initRun]);

  useEffect(() => repo.subscribeSync(setSync), [repo]);

  // Live subscriptions while the tablet is ready (paired).
  useEffect(() => {
    if (status !== 'ready') return;
    const onError = (err: { code: string }) => {
      // Access revoked: this tablet was unlinked from another one.
      if (err.code === 'permission-denied') {
        repo.resetPairing();
        reinit();
      } else {
        console.error(err);
      }
    };
    const unsubs = [
      repo.subscribeCollection<Dish>('dishes', (x) => setDishes([...x].sort(sortItems) as Dish[]), onError),
      repo.subscribeCollection<Drink>('drinks', (x) => setDrinks([...x].sort(sortItems) as Drink[]), onError),
      repo.subscribeCollection<Guide>('guides', (x) => setGuides([...x].sort(sortItems) as Guide[]), onError),
      repo.subscribeCollection<Category>('categories', (x) => setCategories([...x].sort(sortCategories)), onError),
      repo.subscribeInfo(setInfo, onError),
      repo.subscribeConfig(setConfig, onError),
      repo.subscribeDevices(setDevices, onError),
    ];
    return () => unsubs.forEach((u) => u());
  }, [repo, status, reinit]);

  // Background jobs: translations and offline copies of full-size photos.
  const itemsRef = useRef<CatalogItem[]>([]);
  const jobRef = useRef<TranslationJob | null>(null);
  useEffect(() => {
    if (status !== 'ready') return;
    const job = new TranslationJob(repo, () => itemsRef.current);
    jobRef.current = job;
    job.start();
    return () => {
      job.stop();
      jobRef.current = null;
    };
  }, [repo, status]);

  useEffect(() => {
    const items: CatalogItem[] = [...(dishes ?? []), ...(drinks ?? []), ...(guides ?? [])];
    itemsRef.current = items;
    if (items.some((i) => i.tr?.status === 'pending')) jobRef.current?.kick();
    repo.prefetchImages(items.flatMap((i) => (i.image ? [{ id: i.id, v: i.image.v }] : [])));
  }, [repo, dishes, drinks, guides]);

  const kickTranslations = useCallback((itemId?: string) => {
    if (itemId) jobRef.current?.retryNow(itemId);
    else jobRef.current?.kick();
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      repo,
      status,
      error,
      loaded: dishes !== null && drinks !== null && guides !== null && categories !== null,
      dishes: dishes ?? [],
      drinks: drinks ?? [],
      categories: categories ?? [],
      guides: guides ?? [],
      info,
      config,
      devices,
      sync,
      reinit,
      kickTranslations,
    }),
    [repo, status, error, dishes, drinks, categories, guides, info, config, devices, sync, reinit, kickTranslations],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
