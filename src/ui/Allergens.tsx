import { ALLERGENS, ALLERGEN_HEADINGS, allergenLabel, type AllergenKey, type UiLang } from '../domain/allergens';
import { AllergenIcon } from './AllergenIcon';
import s from './ui.module.css';

/** Compact row of allergen icons for cards. */
export function AllergenBadges({
  allergens,
  traces = [],
  size = 30,
}: {
  allergens: readonly AllergenKey[];
  traces?: readonly AllergenKey[];
  size?: number;
}) {
  if (!allergens.length && !traces.length) return null;
  return (
    <div className={s.allergenRow}>
      {allergens.map((a) => (
        <span key={a} title={allergenLabel(a)} aria-label={allergenLabel(a)} role="img">
          <AllergenIcon allergen={a} size={size} />
        </span>
      ))}
      {traces.map((a) => (
        <span
          key={`t-${a}`}
          title={`Traces: ${allergenLabel(a)}`}
          aria-label={`Traces de ${allergenLabel(a)}`}
          role="img"
        >
          <AllergenIcon allergen={a} size={size} outline />
        </span>
      ))}
    </div>
  );
}

/** Allergens with icon + label, in the chosen language (detail and customer views). */
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
  const h = ALLERGEN_HEADINGS[lang];
  if (!allergens.length && !traces.length) {
    return <p className={s.hint}>{h.none}</p>;
  }
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {allergens.length > 0 && (
        <div className={s.allergenList}>
          {allergens.map((a) => (
            <span key={a} className={s.allergenItem}>
              <AllergenIcon allergen={a} size={size} />
              {allergenLabel(a, lang)}
            </span>
          ))}
        </div>
      )}
      {traces.length > 0 && (
        <div style={{ display: 'grid', gap: 10 }}>
          <span className={s.label}>{h.traces}</span>
          <div className={s.allergenList}>
            {traces.map((a) => (
              <span key={a} className={s.allergenItem}>
                <AllergenIcon allergen={a} size={size} outline />
                {allergenLabel(a, lang)}
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
}: {
  allergens: AllergenKey[];
  traces: AllergenKey[];
  onChange: (next: { allergens: AllergenKey[]; traces: AllergenKey[] }) => void;
}) {
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
      <span className={s.label}>Al·lèrgens</span>
      <span className={s.hint}>Toca un cop: “Conté”. Dos cops: “Traces”. Tres cops: cap.</span>
      <div className={s.allergenGrid}>
        {ALLERGENS.map(({ key }) => {
          const state = allergens.includes(key) ? 'contains' : traces.includes(key) ? 'traces' : 'off';
          return (
            <button
              key={key}
              type="button"
              className={[
                s.allergenToggle,
                state === 'off' && s.allergenOff,
                state === 'contains' && s.allergenContains,
                state === 'traces' && s.allergenTraces,
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`${allergenLabel(key)}: ${state === 'contains' ? 'conté' : state === 'traces' ? 'traces' : 'no'}`}
              onClick={() => cycle(key)}
            >
              <AllergenIcon allergen={key} size={44} outline={state === 'traces'} />
              {allergenLabel(key)}
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
