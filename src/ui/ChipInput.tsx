import { useId, useState } from 'react';
import { Icon } from './Icon';
import { IconButton } from './Button';
import s from './ui.module.css';

interface Props {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hint?: string;
}

/** List editor: type a value and press Enter (or "+"); commas add several at once. */
export function ChipInput({ label, values, onChange, placeholder, hint }: Props) {
  const id = useId();
  const [draft, setDraft] = useState('');

  const commit = () => {
    const parts = draft
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .filter((p) => !values.some((v) => v.toLowerCase() === p.toLowerCase()));
    if (parts.length) onChange([...values, ...parts]);
    setDraft('');
  };

  return (
    <div className={s.field}>
      <label className={s.label} htmlFor={id}>
        {label}
      </label>
      {values.length > 0 && (
        <div className={s.chips}>
          {values.map((v) => (
            <span key={v} className={s.chip}>
              {v}
              <button
                type="button"
                className={s.chipRemove}
                aria-label={`Treu ${v}`}
                onClick={() => onChange(values.filter((x) => x !== v))}
              >
                <Icon name="close" size={18} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className={s.chipInputRow}>
        <input
          id={id}
          className={s.input}
          value={draft}
          placeholder={placeholder}
          enterKeyHint="done"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
        />
        <IconButton icon="plus" label="Afegeix" onClick={commit} disabled={!draft.trim()} />
      </div>
      {hint && <span className={s.hint}>{hint}</span>}
    </div>
  );
}
