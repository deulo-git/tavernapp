import type { CatalogItem, Lang, Translations } from '../../domain/types';
import { TRANSLATED_LANGS } from '../../domain/types';
import { sourceHash } from '../../domain/translation';
import type { ConfirmOptions } from '../../ui/feedback';

/** Translations as edited in a form, before deciding what to store. */
export interface TranslationDraft {
  langs: Pick<Translations, Lang>;
  /** Hash of the Catalan text these translations correspond to. */
  basisHash: string | null;
  manual: boolean;
  /** Changed in this form (translated now or edited by hand). */
  touched: boolean;
}

export function draftFromTranslations(tr: Translations | undefined): TranslationDraft {
  const langs: Pick<Translations, Lang> = {};
  for (const l of TRANSLATED_LANGS) if (tr?.[l]) langs[l] = { ...tr[l] };
  return { langs, basisHash: tr?.srcHash ?? null, manual: tr?.manual ?? false, touched: false };
}

function hasText(langs: Pick<Translations, Lang>): boolean {
  return TRANSLATED_LANGS.some((l) => Object.values(langs[l] ?? {}).some((v) => v.trim()));
}

/**
 * Decides the translations to save with an item. Hand-corrected translations are never
 * overwritten silently: if the Catalan text changed, the user chooses.
 */
export async function finalizeTranslations(
  item: CatalogItem,
  draft: TranslationDraft,
  original: Translations | undefined,
  confirm: (options: ConfirmOptions) => Promise<boolean>,
): Promise<Translations | undefined> {
  const hash = sourceHash(item);
  const withText = hasText(draft.langs);

  if (draft.basisHash === hash) {
    if (!draft.touched || !withText) return original;
    return { ...draft.langs, srcHash: hash, status: 'ok', manual: draft.manual };
  }

  if (withText && draft.manual) {
    const retranslate = await confirm({
      title: 'Has canviat el text en català',
      message: 'Les traduccions s’havien corregit a mà. Vols que es tornin a traduir automàticament?',
      confirmLabel: 'Retradueix',
      cancelLabel: 'Mantén les meves',
    });
    if (!retranslate) return { ...draft.langs, srcHash: hash, status: 'ok', manual: true };
  }
  // Stale: saving marks it as pending and the background job translates it.
  return { ...draft.langs, srcHash: '', status: 'pending', manual: false };
}
