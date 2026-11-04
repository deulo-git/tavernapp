import { describe, expect, it, vi } from 'vitest';
import { sourceHash } from '../src/domain/translation';
import type { Guide } from '../src/domain/types';
import { draftFromTranslations, finalizeTranslations } from '../src/features/forms/translationDraft';

const guide: Guide = {
  id: 'g1',
  kind: 'guide',
  title: 'Les Fires',
  topic: 'girona',
  body: 'Festa major de Girona.',
  order: 0,
  available: true,
  image: null,
  createdAt: 0,
  updatedAt: 0,
};

const okTr = (item: Guide, manual = false) => ({
  es: { title: 'Las Ferias', body: 'Fiesta mayor de Girona.' },
  srcHash: sourceHash(item),
  status: 'ok' as const,
  manual,
});

describe('finalizeTranslations', () => {
  it('keeps the stored translations when nothing changed', async () => {
    const tr = okTr(guide);
    const confirm = vi.fn();
    expect(await finalizeTranslations(guide, draftFromTranslations(tr), tr, confirm)).toBe(tr);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('stores hand edits made for the current text', async () => {
    const tr = okTr(guide);
    const draft = { ...draftFromTranslations(tr), touched: true, manual: true };
    draft.langs = { es: { title: 'Las Fiestas', body: 'Fiesta mayor.' } };
    const result = await finalizeTranslations(guide, draft, tr, vi.fn());
    expect(result).toMatchObject({ status: 'ok', manual: true, srcHash: sourceHash(guide) });
    expect(result?.es?.title).toBe('Las Fiestas');
  });

  it('marks automatic translations as pending when the Catalan text changed', async () => {
    const tr = okTr(guide);
    const edited = { ...guide, body: 'Festa major de Girona, a l’octubre.' };
    const confirm = vi.fn();
    const result = await finalizeTranslations(edited, draftFromTranslations(tr), tr, confirm);
    expect(result?.status).toBe('pending');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('asks before replacing hand-corrected translations, and keeps them on "no"', async () => {
    const tr = okTr(guide, true);
    const edited = { ...guide, body: 'Text nou.' };
    const confirm = vi.fn().mockResolvedValue(false);
    const result = await finalizeTranslations(edited, draftFromTranslations(tr), tr, confirm);
    expect(confirm).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ status: 'ok', manual: true, srcHash: sourceHash(edited) });
  });

  it('retranslates hand-corrected translations on "yes"', async () => {
    const tr = okTr(guide, true);
    const edited = { ...guide, body: 'Text nou.' };
    const result = await finalizeTranslations(edited, draftFromTranslations(tr), tr, vi.fn().mockResolvedValue(true));
    expect(result?.status).toBe('pending');
  });
});
