import { ALLERGEN_HEADINGS, allergenName, type AllergenDef, type AllergenKey, type UiLang } from '../domain/allergens';
import { useAllergens } from '../data/useAllergens';
import { AllergenIcon } from './AllergenIcon';
import { Button } from './Button';
import s from './ui.module.css';

function known(keys: readonly AllergenKey[], byId: Map<string, AllergenDef>): AllergenDef[] {
  return keys.flatMap((k) => byId.get(k) ?? []);
}

/** Allergens with icon + label, in the chosen language. */
export function AllergenList({
  allergens,
  traces = [],
  lang = 'ca',
  size = 44,
}: {
  allergens: readonly AllergenKey[];
  traces?: readonly AllergenKey[];
  lang?: UiLang;
  size?: number;
}) {
  const { byId } = useAllergens();
  const h = ALLERGEN_HEADINGS[lang];
  const contains = known(allergens, byId);
  const mayContain = known(traces, byId);
  if (!contains.length && !mayContain.length) {
    return <p className={s.hint}>{h.none}</p>;
  }
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {contains.length > 0 && (
        <div className={s.allergenList}>
          {contains.map((a) => (
            <span key={a.id} className={s.allergenItem}>
              <AllergenIcon allergen={a} size={size} />
              {allergenName(a, lang)}
            </span>
          ))}
        </div>
      )}
      {mayContain.length > 0 && (
        <div style={{ display: 'grid', gap: 10 }}>
          <span className={s.label}>{h.traces}</span>
          <div className={s.allergenList}>
            {mayContain.map((a) => (
              <span key={a.id} className={s.allergenItem}>
                <AllergenIcon allergen={a} size={size} outline />
                {allergenName(a, lang)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Edit grid: each tap cycles none → contains → traces → none. */
export function AllergenPicker({
  allergens,
  traces,
  onChange,
  onManage,
}: {
  allergens: AllergenKey[];
  traces: AllergenKey[];
  onChange: (next: { allergens: AllergenKey[]; traces: AllergenKey[] }) => void;
  /** Opens the editor of the allergen list itself. */
  onManage?: () => void;
}) {
  const { list } = useAllergens();

  const cycle = (key: AllergenKey) => {
    if (allergens.includes(key)) {
      onChange({ allergens: allergens.filter((a) => a !== key), traces: [...traces, key] });
    } else if (traces.includes(key)) {
      onChange({ allergens, traces: traces.filter((a) => a !== key) });
    } else {
      onChange({ allergens: [...allergens, key], traces });
    }
  };

  return (
    <div className={s.field}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span className={s.hint}>Toca un cop: “Conté”. Dos cops: “Traces”. Tres cops: cap.</span>
        {onManage && (
          <Button size="sm" icon="settings" onClick={onManage}>
            Gestiona la llista
          </Button>
        )}
      </div>
      <div className={s.allergenGrid}>
        {list.map((a) => {
          const state = allergens.includes(a.id) ? 'contains' : traces.includes(a.id) ? 'traces' : 'off';
          return (
            <button
              key={a.id}
              type="button"
              className={[
                s.allergenToggle,
                state === 'off' && s.allergenOff,
                state === 'contains' && s.allergenContains,
                state === 'traces' && s.allergenTraces,
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`${a.name}: ${state === 'contains' ? 'conté' : state === 'traces' ? 'traces' : 'no'}`}
              onClick={() => cycle(a.id)}
            >
              <AllergenIcon allergen={a} size={44} outline={state === 'traces'} />
              {a.name}
              <span className={s.allergenState}>
                {state === 'contains' ? 'Conté' : state === 'traces' ? 'Traces' : ' '}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
