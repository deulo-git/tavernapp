import { useState, type ReactNode } from 'react';
import type { UiLang } from '../../domain/allergens';
import type { CatalogItem } from '../../domain/types';
import { hasTranslation, translatedField } from '../../domain/translation';
import { relativeTime } from '../../domain/format';
import { Icon } from '../../ui/Icon';
import { LanguageTabs } from '../../ui/LanguageTabs';
import ui from '../../ui/ui.module.css';
import s from './detail.module.css';

export function DetailLayout({ aside, children }: { aside: ReactNode; children: ReactNode }) {
  return (
    <div className={s.detail}>
      <aside className={s.aside}>{aside}</aside>
      <div className={s.content}>{children}</div>
    </div>
  );
}

export function DetailSection({
  title,
  actions,
  staff,
  children,
}: {
  title: string;
  actions?: ReactNode;
  staff?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={[s.section, staff && s.staff].filter(Boolean).join(' ')}>
      <div className={s.sectionHeader}>
        <h3 className={s.sectionTitle}>
          {staff ? (
            <span className={s.staffLabel}>
              <Icon name="lock" size={18} /> {title} · només personal
            </span>
          ) : (
            title
          )}
        </h3>
        {actions}
      </div>
      {children}
    </section>
  );
}

/** Customer explanation with CA/ES/EN/FR tabs. */
export function ExplanationBlock({
  item,
  field,
  title = 'Explicació per al client',
  titleField,
}: {
  item: CatalogItem;
  field: string;
  title?: string;
  /** Field whose translation is shown as a heading above the text (e.g. the dish name). */
  titleField?: string;
}) {
  const [lang, setLang] = useState<UiLang>('ca');
  const text = translatedField(item, lang, field);
  const heading = titleField && lang !== 'ca' ? translatedField(item, lang, titleField) : null;
  const missing = lang !== 'ca' && !hasTranslation(item, lang);

  return (
    <DetailSection
      title={title}
      actions={
        <LanguageTabs value={lang} onChange={setLang} available={(l) => l === 'ca' || hasTranslation(item, l)} />
      }
    >
      {missing && (
        <div className={s.notice}>
          <Icon name="translate" />
          {item.tr?.status === 'pending'
            ? 'La traducció està pendent: es farà automàticament quan hi hagi connexió.'
            : 'Encara no hi ha traducció. Es mostra el text en català.'}
        </div>
      )}
      {heading && <h4 style={{ fontSize: 26 }}>{heading}</h4>}
      {text ? <p className={s.text}>{text}</p> : <p className={ui.hint}>Sense explicació.</p>}
    </DetailSection>
  );
}

export function SpecTable({ rows }: { rows: { label: string; value: string }[] }) {
  if (!rows.length) return null;
  return (
    <dl className={s.specs}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'contents' }}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function UpdatedNote({ item }: { item: CatalogItem }) {
  return (
    <p className={ui.hint}>
      Actualitzat {relativeTime(item.updatedAt)}
      {item.updatedBy ? ` · ${item.updatedBy}` : ''}
    </p>
  );
}

export function UnavailableNotice() {
  return (
    <div className={s.notice} style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
      <Icon name="alert" /> Esgotat: ara mateix no es pot servir.
    </div>
  );
}
