import { useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { AllergenKey } from '../../domain/allergens';
import { useAllergens } from '../../data/useAllergens';
import { AllergenIcon } from '../../ui/AllergenIcon';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { AllergyFilterContext, useAllergyFilter, type AllergyFilterApi } from './allergyFilterContext';
import overlay from '../../ui/overlay.module.css';
import ui from '../../ui/ui.module.css';
import s from './catalog.module.css';

export function AllergyFilterProvider({ children }: { children: ReactNode }) {
  const [excluded, setExcluded] = useState<ReadonlySet<AllergenKey>>(new Set());
  const [open, setOpen] = useState(false);
  const { list } = useAllergens();
  const api = useMemo<AllergyFilterApi>(() => ({ excluded, setExcluded, openDialog: () => setOpen(true) }), [excluded]);

  const toggle = (key: AllergenKey) => {
    const next = new Set(excluded);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExcluded(next);
  };

  return (
    <AllergyFilterContext.Provider value={api}>
      {children}
      {open &&
        createPortal(
          <div className={overlay.backdrop} onClick={() => setOpen(false)}>
            <div
              className={overlay.dialog}
              style={{ width: 'min(900px, 100%)' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="allergy-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="allergy-title">Al·lèrgies del client</h2>
              <p className={overlay.dialogMessage}>
                Marca les al·lèrgies o intoleràncies. S’amagaran els plats i begudes que les contenen i s’avisarà dels
                que poden tenir-ne traces.
              </p>
              <div className={ui.allergenGrid}>
                {list.map((a) => {
                  const on = excluded.has(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      aria-pressed={on}
                      className={[ui.allergenToggle, on ? ui.allergenContains : ui.allergenOff].join(' ')}
                      onClick={() => toggle(a.id)}
                    >
                      <AllergenIcon allergen={a} size={44} />
                      {a.name}
                      <span className={ui.allergenState}>{on ? 'Al·lèrgic' : ' '}</span>
                    </button>
                  );
                })}
              </div>
              <div className={overlay.dialogActions}>
                <Button size="lg" icon="trash" onClick={() => setExcluded(new Set())} disabled={excluded.size === 0}>
                  Esborra-ho tot
                </Button>
                <Button size="lg" variant="primary" icon="check" onClick={() => setOpen(false)}>
                  Fet
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </AllergyFilterContext.Provider>
  );
}

export function AllergyFilterButton() {
  const { excluded, openDialog } = useAllergyFilter();
  const active = excluded.size > 0;
  return (
    <Button icon="filter" className={active ? s.filterActive : undefined} onClick={openDialog}>
      {active ? `Al·lèrgies (${excluded.size})` : 'Al·lèrgies del client'}
    </Button>
  );
}

/** Reminder bar shown while a customer allergy filter is active. */
export function AllergyFilterBar({ hiddenCount }: { hiddenCount: number }) {
  const { excluded, setExcluded, openDialog } = useAllergyFilter();
  const { byId } = useAllergens();
  if (excluded.size === 0) return null;
  return (
    <div className={s.filterBar} role="status">
      <Icon name="alert" />
      <span className={s.grow}>
        Sense: {[...excluded].map((a) => byId.get(a)?.name ?? a).join(', ')}
        {hiddenCount > 0 && ` · ${hiddenCount} amagats`}
      </span>
      <Button size="sm" onClick={openDialog}>
        Canvia
      </Button>
      <Button size="sm" icon="close" onClick={() => setExcluded(new Set())}>
        Treu el filtre
      </Button>
    </div>
  );
}
