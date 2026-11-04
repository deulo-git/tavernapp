import { useMemo, useState } from 'react';
import { saveCatalogItem, type ImageChange } from '../../data/actions';
import { useData } from '../../data/store';
import type { CatalogItem } from '../../domain/types';
import { useFeedback } from '../../ui/feedback';
import { draftFromTranslations, finalizeTranslations, type TranslationDraft } from './translationDraft';

/**
 * Shared state for the dish/drink/guide edit forms: draft, photo change, translations,
 * unsaved-changes detection and the save flow.
 */
export function useItemForm<T extends CatalogItem>(initial: T, live: T | undefined, onSaved: (item: T) => void) {
  const { repo } = useData();
  const { confirm, reportError, toast } = useFeedback();
  const [draft, setDraft] = useState<T>(initial);
  const [trDraft, setTrDraft] = useState<TranslationDraft>(() => draftFromTranslations(initial.tr));
  const [imageChange, setImageChange] = useState<ImageChange>({ kind: 'keep' });
  const [saving, setSaving] = useState(false);

  const initialJson = useMemo(() => JSON.stringify(initial), [initial]);
  const dirty = JSON.stringify(draft) !== initialJson || imageChange.kind !== 'keep' || trDraft.touched;
  const conflict = Boolean(live && live.updatedAt > initial.updatedAt);

  const set = <K extends keyof T>(key: K, value: T[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const previewImage =
    imageChange.kind === 'set'
      ? imageChange.image.thumb
      : imageChange.kind === 'remove'
        ? null
        : (draft.image?.thumb ?? null);

  /**
   * `validate` returns an error message to show, or null when the draft can be saved.
   * `prepare` can clean up the draft right before it is stored.
   */
  const save = async (validate: () => string | null, prepare: (item: T) => T = (x) => x) => {
    const problem = validate();
    if (problem) {
      toast(problem, { tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      const tr = await finalizeTranslations(draft, trDraft, initial.tr, confirm);
      const item = prepare({ ...draft, tr });
      // Not awaited: offline the write is queued and applied locally right away.
      saveCatalogItem(repo, item, imageChange).catch(reportError);
      onSaved(item);
    } finally {
      setSaving(false);
    }
  };

  return {
    draft,
    set,
    setDraft,
    trDraft,
    setTrDraft,
    imageChange,
    setImageChange,
    previewImage,
    dirty,
    conflict,
    saving,
    save,
  };
}
