import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ALLERGEN_HEADINGS, type AllergenKey, type UiLang } from '../../domain/allergens';
import type { ImageRef } from '../../domain/types';
import { AllergenList } from '../../ui/Allergens';
import { Button } from '../../ui/Button';
import type { IconName } from '../../ui/Icon';
import { ItemImage } from '../../ui/ItemImage';
import { LanguageTabs } from '../../ui/LanguageTabs';
import s from '../catalog/detail.module.css';

export interface PresentContent {
  title: string;
  /** Catalan title, shown under a translated one. */
  originalTitle?: string;
  description: string;
  facts?: { label: string; value: string }[];
  price?: string;
}

interface Props {
  itemId: string;
  image: ImageRef | null;
  icon: IconName;
  initialLang?: UiLang;
  /** Builds the customer-facing content in the chosen language. */
  content: (lang: UiLang) => PresentContent;
  allergens?: readonly AllergenKey[];
  traces?: readonly AllergenKey[];
  available?: (lang: UiLang) => boolean;
  onClose: () => void;
}

const CLOSE_LABEL: Record<UiLang, string> = { ca: 'Tanca', es: 'Cerrar', en: 'Close', fr: 'Fermer' };

/** Full-screen, customer-facing view: photo, translated text and allergens. No staff-only info. */
export function PresentView({
  itemId,
  image,
  icon,
  initialLang = 'ca',
  content,
  allergens,
  traces,
  available,
  onClose,
}: Props) {
  const [lang, setLang] = useState<UiLang>(initialLang);
  const c = content(lang);
  const showAllergens = allergens !== undefined;

  return createPortal(
    <div className={s.present} role="dialog" aria-modal="true" aria-label={c.title} lang={lang}>
      <div className={s.presentBar}>
        <LanguageTabs value={lang} onChange={setLang} available={available} long />
        <Button size="lg" icon="close" onClick={onClose}>
          {CLOSE_LABEL[lang]}
        </Button>
      </div>
      <div className={[s.presentBody, !image && s.presentNoImage].filter(Boolean).join(' ')}>
        {image && <ItemImage itemId={itemId} image={image} alt={c.title} icon={icon} full className={s.presentImage} />}
        <div className={s.presentText}>
          <h1 className={s.presentTitle}>{c.title}</h1>
          {c.originalTitle && c.originalTitle !== c.title && <p className={s.presentOriginal}>{c.originalTitle}</p>}
          {c.price && <p className={s.presentPrice}>{c.price}</p>}
          {c.description && <p className={s.presentDescription}>{c.description}</p>}
          {c.facts && c.facts.length > 0 && (
            <div className={s.presentFacts}>
              {c.facts.map((f) => (
                <span key={f.label}>
                  <strong>{f.label}</strong>
                  {f.value}
                </span>
              ))}
            </div>
          )}
          {showAllergens && (
            <section className={s.section}>
              <h2 className={s.sectionTitle}>{ALLERGEN_HEADINGS[lang].contains}</h2>
              <AllergenList allergens={allergens} traces={traces} lang={lang} size={48} />
            </section>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
