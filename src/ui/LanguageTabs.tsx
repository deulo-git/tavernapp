import type { UiLang } from '../domain/allergens';
import { LANG_NAMES } from '../domain/types';
import s from './ui.module.css';

const SHORT: Record<UiLang, string> = { ca: 'CA', es: 'ES', en: 'EN', fr: 'FR' };

interface Props {
  value: UiLang;
  onChange: (lang: UiLang) => void;
  /** Languages without a translation yet are shown dimmed. */
  available?: (lang: UiLang) => boolean;
  long?: boolean;
}

export function LanguageTabs({ value, onChange, available, long = false }: Props) {
  return (
    <div className={s.langTabs} role="tablist" aria-label="Idioma">
      {(['ca', 'es', 'en', 'fr'] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          role="tab"
          aria-selected={value === lang}
          title={LANG_NAMES[lang]}
          className={[s.langTab, value === lang && s.langTabOn, available && !available(lang) && s.langTabMissing]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onChange(lang)}
        >
          {long ? LANG_NAMES[lang] : SHORT[lang]}
        </button>
      ))}
    </div>
  );
}
