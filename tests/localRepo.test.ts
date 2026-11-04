import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalRepository } from '../src/data/localRepo';
import { TranslationJob } from '../src/data/translationJob';
import { sourceHash } from '../src/domain/translation';
import type { CatalogItem, Guide } from '../src/domain/types';

let dbCount = 0;
const newRepo = () => new LocalRepository(`test-${dbCount++}`);

const guide = (overrides: Partial<Guide> = {}): Guide => ({
  id: 'g1',
  kind: 'guide',
  title: 'Temps de Flors',
  topic: 'girona',
  body: 'Exposició de flors al maig.',
  order: 0,
  available: true,
  image: null,
  createdAt: 0,
  updatedAt: 0,
  ...overrides,
});

function nextValue<T>(subscribe: (cb: (v: T) => void) => () => void, accept: (v: T) => boolean): Promise<T> {
  return new Promise((resolve) => {
    const unsub = subscribe((v) => {
      if (accept(v)) {
        queueMicrotask(() => unsub());
        resolve(v);
      }
    });
  });
}

describe('LocalRepository', () => {
  it('needs setup first, then is ready', async () => {
    const repo = newRepo();
    expect(await repo.init()).toEqual({ status: 'needsSetup' });
    await repo.setup({ restaurantName: 'Taverna', deviceName: 'Sala', pinHash: 'h', pinSalt: 's', pairingCode: 'x' });
    expect(await repo.init()).toEqual({ status: 'ready' });
  });

  it('notifies collection subscribers about writes', async () => {
    const repo = newRepo();
    const seen = nextValue<Guide[]>(
      (cb) => repo.subscribeCollection<Guide>('guides', cb, () => {}),
      (items) => items.length === 1,
    );
    await repo.put('guides', guide());
    expect((await seen)[0].title).toBe('Temps de Flors');
  });

  it('only applies translations made from the current text', async () => {
    const repo = newRepo();
    const g = guide();
    await repo.put('guides', g);
    const tr = {
      es: { title: 'Temps de Flors', body: 'Exposición de flores.' },
      srcHash: sourceHash(g),
      status: 'ok' as const,
    };
    expect(await repo.applyTranslation('guides', 'g1', 'stale-hash', tr)).toBe(false);
    expect(await repo.applyTranslation('guides', 'g1', sourceHash(g), tr)).toBe(true);
  });
});

describe('TranslationJob', () => {
  beforeEach(() => {
    vi.stubGlobal('window', new EventTarget());
    vi.stubGlobal('navigator', { onLine: true });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('translates pending items and stores the result', async () => {
    const repo = newRepo();
    const pending = guide({ tr: { srcHash: '', status: 'pending' } });
    await repo.put('guides', pending);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        const { texts } = JSON.parse(String(init.body)) as { texts: string[] };
        return Response.json({
          translations: {
            es: texts.map((t) => `es:${t}`),
            en: texts.map((t) => `en:${t}`),
            fr: texts.map((t) => `fr:${t}`),
          },
        });
      }),
    );

    let items: CatalogItem[] = [pending];
    const job = new TranslationJob(repo, () => items);
    const done = nextValue<Guide[]>(
      (cb) => repo.subscribeCollection<Guide>('guides', cb, () => {}),
      (list) => list[0]?.tr?.status === 'ok',
    );
    job.start();
    const [translated] = await done;
    items = [translated];
    job.stop();

    expect(translated.tr).toMatchObject({ status: 'ok', srcHash: sourceHash(pending), manual: false });
    expect(translated.tr?.fr?.title).toBe('fr:Temps de Flors');
  });

  it('stops retrying when translation is not configured', async () => {
    const repo = newRepo();
    const pending = guide({ tr: { srcHash: '', status: 'pending' } });
    await repo.put('guides', pending);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ error: 'not_configured' }, { status: 503 })),
    );

    const job = new TranslationJob(repo, () => [pending]);
    const done = nextValue<Guide[]>(
      (cb) => repo.subscribeCollection<Guide>('guides', cb, () => {}),
      (list) => list[0]?.tr?.status === 'error',
    );
    job.start();
    const [failed] = await done;
    job.stop();
    expect(failed.tr?.error).toBe('not_configured');
  });
});
