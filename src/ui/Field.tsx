import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import s from './ui.module.css';

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: (id: string) => ReactNode;
  className?: string;
}

export function Field({ label, hint, error, children, className }: FieldProps) {
  const id = useId();
  return (
    <div className={[s.field, className].filter(Boolean).join(' ')}>
      <label className={s.label} htmlFor={id}>
        {label}
      </label>
      {children(id)}
      {error ? <span className={s.error}>{error}</span> : hint ? <span className={s.hint}>{hint}</span> : null}
    </div>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  error?: string | null;
}

export function TextField({ label, value, onChange, hint, error, className, ...rest }: TextFieldProps) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {(id) => (
        <input
          id={id}
          className={[s.input, error && s.invalid].filter(Boolean).join(' ')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
      )}
    </Field>
  );
}

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
}

export function TextArea({ label, value, onChange, hint, className, rows = 4, ...rest }: TextAreaProps) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <textarea
          id={id}
          className={s.textarea}
          value={value}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
      )}
    </Field>
  );
}

interface ToggleProps {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={checked} className={s.toggle} onClick={() => onChange(!checked)}>
      <span>{label}</span>
      <span className={[s.switch, checked && s.switchOn].filter(Boolean).join(' ')} />
    </button>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  /** When true, tapping the selected option clears it. */
  allowEmpty?: boolean;
}

export function Segmented<T extends string>({ label, options, value, onChange, allowEmpty = true }: SegmentedProps<T>) {
  return (
    <div className={s.field} role="group" aria-label={label}>
      <span className={s.label}>{label}</span>
      <div className={s.segmented}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              className={[s.segment, on && s.segmentOn].filter(Boolean).join(' ')}
              onClick={() => onChange(on && allowEmpty ? null : o.value)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface MultiSelectProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: readonly T[];
  onChange: (value: T[]) => void;
}

export function MultiSelect<T extends string>({ label, options, value, onChange }: MultiSelectProps<T>) {
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className={s.field} role="group" aria-label={label}>
      <span className={s.label}>{label}</span>
      <div className={s.segmented}>
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              className={[s.segment, on && s.segmentOn].filter(Boolean).join(' ')}
              onClick={() => toggle(o.value)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
