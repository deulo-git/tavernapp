import { useState } from 'react';
import type { Lang, Translations } from '../../domain/types';
import { LANG_NAMES, TRANSLATED_LANGS } from '../../domain/types';
import {
  FIELD_LABELS,
  TranslateError,
  fetchTranslations,
  hashFields,
  translateErrorMessage,
} from '../../domain/translation';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/EmptyState';
import { Icon } from '../../ui/Icon';
import ui from '../../ui/ui.module.css';
import { FormSection } from './FormSheet';
import type { TranslationDraft } from './translationDraft';
import s from './form.module.css';

interface Props {
  /** Current Catalan source texts, keyed by field. */
  fields: Record<string, string>;
  draft: TranslationDraft;
  onChange: (draft: TranslationDraft) => void;
  savedStatus?: Translations['status'];
  savedError?: string;
  /** Fields edited with a single-line input. */
  singleLine?: string[];
}

export function TranslationEditor({
  fields,
  draft,
  onChange,
  savedStatus,
  savedError,
  singleLine = ['name', 'title'],
}: Props) {
  const [lang, setLang] = useState<Lang>('es');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentHash = hashFields(fields);
  const keys = Object.keys(fields).filter((k) => fields[k].trim());
  const upToDate = draft.basisHash === currentHash && TRANSLATED_LANGS.some((l) => draft.langs[l]);

  const translateNow = async () => {
    setBusy(true);
    setError(null);
    try {
      const langs = await fetchTranslations(fields);
      onChange({ langs, basisHash: currentHash, manual: false, touched: true });
    } catch (err) {
      setError(translateErrorMessage(err instanceof TranslateError ? err.code : 'unknown'));
    } finally {
      setBusy(false);
    }
  };

  const edit = (key: string, value: string) => {
    onChange({
      langs: { ...draft.langs, [lang]: { ...draft.langs[lang], [key]: value } },
      basisHash: currentHash,
      manual: true,
      touched: true,
    });
  };

  let status;
  if (busy) status = <Spinner />;
  else if (upToDate)
    status = (
      <span className={`${ui.badge} ${ui.badgeSuccess}`}>
        <Icon name="check" size={16} /> {draft.manual ? 'Revisades a mà' : 'Al dia'}
      </span>
    );
  else if (savedStatus === 'error' && draft.basisHash === currentHash)
    status = <span className={`${ui.badge} ${ui.badgeDanger}`}>{translateErrorMessage(savedError ?? '')}</span>;
  else status = <span className={`${ui.badge} ${ui.badgeInfo}`}>Es traduirà automàticament en desar</span>;

  return (
    <FormSection
      title="Explicació en altres idiomes"
      note="Traducció automàtica al castellà, anglès i francès (DeepL). La pots corregir a mà."
      actions={
        <div className={s.row}>
          {status}
          <Button icon="translate" onClick={translateNow} disabled={busy || keys.length === 0}>
            Tradueix ara
          </Button>
        </div>
      }
    >
      {error && <span className={ui.error}>{error}</span>}
      <div className={s.trTabs}>
        <div className={ui.langTabs} role="tablist">
          {TRANSLATED_LANGS.map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={lang === l}
              className={[ui.langTab, lang === l && ui.langTabOn].filter(Boolean).join(' ')}
              onClick={() => setLang(l)}
            >
              {LANG_NAMES[l]}
            </button>
          ))}
        </div>
      </div>
      {keys.length === 0 ? (
        <p className={ui.hint}>Escriu primer el text en català.</p>
      ) : (
        keys.map((key) => {
          const value = draft.langs[lang]?.[key] ?? '';
          const multiline = !singleLine.includes(key);
          return (
            <div key={key} className={s.trField}>
              <span className={ui.label}>
                {FIELD_LABELS[key] ?? key} · {LANG_NAMES[lang]}
              </span>
              <div className={s.trOriginal}>{fields[key]}</div>
              {multiline ? (
                <textarea
                  className={ui.textarea}
                  value={value}
                  rows={key === 'ingredients' ? 4 : 5}
                  lang={lang}
                  placeholder="Encara sense traduir"
                  onChange={(e) => edit(key, e.target.value)}
                />
              ) : (
                <input
                  className={ui.input}
                  value={value}
                  lang={lang}
                  placeholder="Encara sense traduir"
                  onChange={(e) => edit(key, e.target.value)}
                />
              )}
            </div>
          );
        })
      )}
    </FormSection>
  );
}
