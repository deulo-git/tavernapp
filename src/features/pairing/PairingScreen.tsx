import { useState, type FormEvent } from 'react';
import { setDeviceName } from '../../data/actions';
import { useData } from '../../data/store';
import { normalizePairingCode } from '../../domain/security';
import { Button } from '../../ui/Button';
import { TextField } from '../../ui/Field';
import { Icon } from '../../ui/Icon';
import ui from '../../ui/ui.module.css';
import s from './onboarding.module.css';

/** Shown on a tablet that hasn't been linked to the restaurant yet. */
export function PairingScreen() {
  const { repo, reinit } = useData();
  const [code, setCode] = useState('');
  const [deviceName, setDeviceNameDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (normalizePairingCode(code).length < 8) {
      setError('Escriu el codi complet del restaurant.');
      return;
    }
    if (!deviceName.trim()) {
      setError('Posa un nom a aquesta tablet.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await repo.pair(code, deviceName.trim());
    setBusy(false);
    if (result === 'ok') {
      setDeviceName(deviceName);
      reinit();
    } else {
      setError(
        result === 'wrong_code'
          ? 'El codi no és correcte. Revisa’l o demana’l a qui va configurar l’app.'
          : result === 'offline'
            ? 'Cal connexió a internet per vincular la tablet.'
            : "No s'ha pogut vincular. Torna-ho a provar.",
      );
    }
  };

  return (
    <div className={s.screen}>
      <form className={s.card} onSubmit={submit}>
        <div className={s.brand}>
          <span className={s.logo}>
            <Icon name="tablet" size={36} />
          </span>
          <div>
            <h1 className={s.title}>Vincula aquesta tablet</h1>
            <p className={s.lead}>Només cal fer-ho un cop. Després ja no es demana res més.</p>
          </div>
        </div>
        <TextField
          label="Codi del restaurant"
          value={code}
          onChange={(v) => setCode(v.toUpperCase())}
          placeholder="TAVERNA-XXXX-XXXX"
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          className={s.codeInput}
          autoFocus
        />
        <TextField
          label="Nom d'aquesta tablet"
          value={deviceName}
          onChange={setDeviceNameDraft}
          placeholder="Sala, Barra, Terrassa…"
        />
        {error && <p className={ui.error}>{error}</p>}
        <Button type="submit" variant="primary" size="lg" icon="link" disabled={busy}>
          {busy ? 'Vinculant…' : 'Vincula'}
        </Button>
      </form>
    </div>
  );
}
