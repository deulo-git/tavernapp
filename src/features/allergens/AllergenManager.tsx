import { useState } from 'react';
import { newId } from '../../data/actions';
import {
  deleteAllergen,
  itemsUsingAllergen,
  moveAllergen,
  nextAllergenOrder,
  saveAllergen,
} from '../../data/allergenActions';
import { useData } from '../../data/store';
import { ALLERGEN_COLORS, type AllergenDef } from '../../domain/allergens';
import { TranslateError, fetchTranslations, translateErrorMessage } from '../../domain/translation';
import { AllergenIcon } from '../../ui/AllergenIcon';
import { Button, IconButton } from '../../ui/Button';
import { Sheet } from '../../ui/Sheet';
import { useFeedback } from '../../ui/feedback';
import ui from '../../ui/ui.module.css';
import { FormSection } from '../forms/FormSheet';
import s from '../forms/form.module.css';

/** Translates an allergen name to ES/EN/FR with DeepL (empty strings if it isn't available). */
async function translateName(name: string): Promise<Pick<AllergenDef, 'es' | 'en' | 'fr'>> {
  const t = await fetchTranslations({ name });
  return { es: t.es?.name ?? '', en: t.en?.name ?? '', fr: t.fr?.name ?? '' };
}

function AllergenRow({ allergen, index, count }: { allergen: AllergenDef; index: number; count: number }) {
  const { repo, allergens, allergensCustomized, dishes, drinks } = useData();
  const { confirm, toast, reportError } = useFeedback();
  const [draft, setDraft] = useState(allergen);
  const [translating, setTranslating] = useState(false);
  const usedBy = itemsUsingAllergen(allergen.id, dishes, drinks).length;

  const save = (next: AllergenDef) => {
    if (!next.name.trim()) {
      setDraft(allergen);
      return;
    }
    setDraft(next);
    if (JSON.stringify(next) !== JSON.stringify(allergen)) {
      saveAllergen(repo, allergens, allergensCustomized, { ...next, name: next.name.trim() }).catch(reportError);
    }
  };

  const translate = async () => {
    setTranslating(true);
    try {
      save({ ...draft, ...(await translateName(draft.name)) });
    } catch (err) {
      toast(translateErrorMessage(err instanceof TranslateError ? err.code : 'unknown'), { tone: 'error' });
    } finally {
      setTranslating(false);
    }
  };

  const remove = async () => {
    const ok = await confirm({
      title: `Vols eliminar «${allergen.name}»?`,
      message: usedBy
        ? `El tenen ${usedBy} plats o begudes; se’ls traurà d’aquests elements.`
        : 'Ara mateix no el té cap plat ni beguda.',
      confirmLabel: 'Elimina',
      danger: true,
    });
    if (ok) deleteAllergen(repo, allergens, allergensCustomized, allergen.id, dishes, drinks).catch(reportError);
  };

  const text = (key: 'name' | 'es' | 'en' | 'fr', label: string) => (
    <input
      className={ui.input}
      value={draft[key]}
      aria-label={label}
      placeholder={label}
      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
      onBlur={() => save(draft)}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
    />
  );

  return (
    <div className={s.listRow} style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <AllergenIcon allergen={draft} size={52} />
      <div className={s.grow} style={{ display: 'grid', gap: 8 }}>
        <div className={s.row}>
          <div className={s.grow}>{text('name', 'Nom en català')}</div>
          <span className={ui.hint}>{usedBy ? `${usedBy} elements` : 'Sense ús'}</span>
          <IconButton
            icon="up"
            label="Mou amunt"
            disabled={index === 0}
            onClick={() => moveAllergen(repo, allergens, index, -1).catch(reportError)}
          />
          <IconButton
            icon="down"
            label="Mou avall"
            disabled={index === count - 1}
            onClick={() => moveAllergen(repo, allergens, index, 1).catch(reportError)}
          />
          <IconButton icon="trash" label="Elimina" danger onClick={remove} />
        </div>
        <div className={s.grid3}>
          {text('es', 'Castellano')}
          {text('en', 'English')}
          {text('fr', 'Français')}
        </div>
        <div className={s.row}>
          <div className={ui.swatches} style={{ width: 'auto', flex: 1 }} role="radiogroup" aria-label="Color">
            {ALLERGEN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={c === draft.color}
                aria-label={c}
                className={[ui.swatch, c === draft.color && ui.swatchOn].filter(Boolean).join(' ')}
                style={{ background: c, width: 36, height: 36, borderRadius: 18 }}
                onClick={() => save({ ...draft, color: c })}
              />
            ))}
          </div>
          <Button size="sm" icon="translate" onClick={translate} disabled={translating}>
            {translating ? 'Traduint…' : 'Tradueix'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Editor of the restaurant's allergen list: add, rename, translate, recolour, reorder, delete. */
export function AllergenManager({ onClose }: { onClose: () => void }) {
  const { repo, allergens, allergensCustomized } = useData();
  const { reportError } = useFeedback();
  const [newName, setNewName] = useState('');

  const add = async () => {
    const name = newName.trim();
    if (!name) return;
    setNewName('');
    const def: AllergenDef = {
      id: newId(),
      name,
      es: '',
      en: '',
      fr: '',
      color: ALLERGEN_COLORS[allergens.length % ALLERGEN_COLORS.length],
      order: nextAllergenOrder(allergens),
    };
    saveAllergen(repo, allergens, allergensCustomized, def).catch(reportError);
    // Best effort: fill in the translations if DeepL is reachable.
    translateName(name)
      .then((t) => saveAllergen(repo, [...allergens, def], true, { ...def, ...t }))
      .catch(() => {});
  };

  return (
    <Sheet title="Al·lèrgens" editing onClose={onClose}>
      <div className={s.form}>
        <FormSection
          title="Llista d’al·lèrgens"
          note="Els canvis es desen automàticament i es veuen a totes les tablets. Per defecte hi ha els 14 al·lèrgens oficials de la UE."
        >
          {allergens.map((a, i) => (
            <AllergenRow key={`${a.id}-${a.updatedAt ?? 0}`} allergen={a} index={i} count={allergens.length} />
          ))}
        </FormSection>
        <FormSection title="Nou al·lergen">
          <div className={s.row}>
            <input
              className={`${ui.input} ${s.grow}`}
              value={newName}
              placeholder="Per exemple: Pinyons"
              aria-label="Nom del nou al·lergen"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <Button variant="primary" icon="plus" onClick={add} disabled={!newName.trim()}>
              Afegeix
            </Button>
          </div>
        </FormSection>
      </div>
    </Sheet>
  );
}
