import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import s from './overlay.module.css';

interface Props {
  title: string;
  subtitle?: string;
  /** Called with the 4 digits; return false to signal a wrong PIN (shake and clear). */
  onComplete: (pin: string) => boolean | Promise<boolean>;
  error?: string | null;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function PinPad({ title, subtitle, onComplete, error: externalError }: Props) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const press = async (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(null);
    if (next.length === 4) {
      const ok = await onComplete(next);
      if (!ok) {
        setShake(true);
        setError('PIN incorrecte');
        setTimeout(() => {
          setShake(false);
          setPin('');
        }, 400);
      } else {
        setPin('');
      }
    }
  };

  // Physical keyboards (and testing on a computer).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // preventDefault keeps the digit from also landing in a field focused right after unlocking.
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        void press(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setPin((p) => p.slice(0, -1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className={s.pin}>
      <div>
        <h2>{title}</h2>
        {subtitle && <p className={s.dialogMessage}>{subtitle}</p>}
      </div>
      <div
        className={[s.pinDots, shake && s.pinShake].filter(Boolean).join(' ')}
        aria-label={`${pin.length} de 4 xifres`}
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={[s.pinDot, i < pin.length && s.pinDotOn].filter(Boolean).join(' ')} />
        ))}
      </div>
      <div className={s.pinError} role="alert">
        {error ?? externalError ?? ''}
      </div>
      <div className={s.pinGrid}>
        {KEYS.map((k) => (
          <button key={k} type="button" className={s.pinKey} onClick={() => press(k)}>
            {k}
          </button>
        ))}
        <span />
        <button type="button" className={s.pinKey} onClick={() => press('0')}>
          0
        </button>
        <button type="button" className={s.pinKey} aria-label="Esborra" onClick={() => setPin((p) => p.slice(0, -1))}>
          <Icon name="backspace" size={30} />
        </button>
      </div>
    </div>
  );
}
