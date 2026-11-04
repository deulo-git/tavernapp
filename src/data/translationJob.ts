import type { CatalogItem, Lang, Translations } from '../domain/types';
import { COLLECTION_OF, TRANSLATED_LANGS } from '../domain/types';
import {
  TranslateError,
  fetchTranslations,
  hashFields,
  isPermanentTranslateError,
  sourceFields,
} from '../domain/translation';
import type { Repository } from './repository';

const RETRY_MS = 2 * 60_000;
const QUOTA_RETRY_MS = 6 * 60 * 60_000;
const PERIOD_MS = 5 * 60_000;

function keepLangs(tr: Translations | undefined): Pick<Translations, Lang> {
  return Object.fromEntries(TRANSLATED_LANGS.filter((l) => tr?.[l]).map((l) => [l, tr![l]]));
}

/**
 * Background worker that translates items marked as pending. Any online tablet can run it:
 * results are only stored if the Catalan text hasn't changed meanwhile (see applyTranslation).
 */
export class TranslationJob {
  private running = false;
  private retryAt = new Map<string, number>();
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private repo: Repository,
    private getItems: () => CatalogItem[],
  ) {}

  start() {
    window.addEventListener('online', this.kick);
    this.timer = setInterval(this.kick, PERIOD_MS);
    this.kick();
  }

  stop() {
    window.removeEventListener('online', this.kick);
    clearInterval(this.timer);
  }

  kick = () => {
    void this.run();
  };

  /** Forget back-off for an item (used by "Torna a traduir"). */
  retryNow(id: string) {
    this.retryAt.delete(id);
    this.kick();
  }

  private nextPending(): CatalogItem | undefined {
    const now = Date.now();
    return this.getItems().find((i) => i.tr?.status === 'pending' && (this.retryAt.get(i.id) ?? 0) <= now);
  }

  private async run() {
    if (this.running || !navigator.onLine) return;
    this.running = true;
    try {
      for (let item = this.nextPending(); item; item = this.nextPending()) {
        const keepGoing = await this.translate(item);
        if (!keepGoing) break;
      }
    } finally {
      this.running = false;
    }
  }

  /** Returns false when the remaining items shouldn't be tried now (e.g. no network). */
  private async translate(item: CatalogItem): Promise<boolean> {
    const fields = sourceFields(item);
    const srcHash = hashFields(fields);
    const col = COLLECTION_OF[item.kind];
    // Until the store reflects the result, don't pick this item again.
    this.retryAt.set(item.id, Date.now() + 15_000);
    try {
      const langs = await fetchTranslations(fields);
      await this.repo.applyTranslation(col, item.id, srcHash, { ...langs, srcHash, status: 'ok', manual: false });
      return true;
    } catch (err) {
      const code = err instanceof TranslateError ? err.code : 'unknown';
      if (isPermanentTranslateError(code)) {
        const tr: Translations = { ...keepLangs(item.tr), srcHash, status: 'error', error: code, manual: false };
        await this.repo.applyTranslation(col, item.id, srcHash, tr).catch(() => false);
        return true;
      }
      this.retryAt.set(item.id, Date.now() + (code === 'quota_exceeded' ? QUOTA_RETRY_MS : RETRY_MS));
      return code !== 'network' && code !== 'quota_exceeded' && code !== 'rate_limited';
    }
  }
}
