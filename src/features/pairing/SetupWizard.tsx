import { useState, type FormEvent } from 'react';
import { setDeviceName } from '../../data/actions';
import { sampleDataOps } from '../../data/seed';
import { useData } from '../../data/store';
import { generatePairingCode, hashPin, isValidPin, randomToken } from '../../domain/security';
import { Button } from '../../ui/Button';
import { TextField, Toggle } from '../../ui/Field';
import { Icon } from '../../ui/Icon';
import ui from '../../ui/ui.module.css';
import s from './onboarding.module.css';

/** First run on the very first tablet: creates the restaurant, the edit PIN and the pairing code. */
export function SetupWizard() {
  const { repo, reinit } = useData();
  const [restaurantName, setRestaurantName] = useState('');
  const [deviceName, setDeviceNameDraft] = useState('Tablet 1');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [code] = useState(generatePairingCode);
  const [codeNoted, setCodeNoted] = useState(false);
  const [samples, setSamples] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firebase = repo.mode === 'firebase';

  const problem = !restaurantName.trim()
    ? 'Escriu el nom del restaurant.'
    : !deviceName.trim()
      ? 'Posa un nom a aquesta tablet.'
      : !isValidPin(pin)
        ? 'El PIN ha de tenir 4 xifres.'
        : pin !== pin2
          ? 'Els dos PIN no coincideixen.'
          : firebase && !codeNoted
            ? 'Confirma que has apuntat el codi del restaurant.'
            : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const pinSalt = randomToken(16);
      const name = restaurantName.trim();
      await repo.setup({
        restaurantName: name,
        deviceName: deviceName.trim(),
        pinSalt,
        pinHash: await hashPin(pin, pinSalt),
        pairingCode: code,
      });
      setDeviceName(deviceName);
      if (samples) await repo.writeBatch(sampleDataOps(name, null));
      reinit();
    } catch (err) {
      const c = (err as { code?: string }).code;
      setError(
        c === 'offline' || c === 'timeout'
          ? 'Cal connexió a internet per a la configuració inicial.'
          : c === 'permission-denied'
            ? 'Aquest restaurant ja està configurat. Torna a obrir l’app per vincular la tablet.'
            : "No s'ha pogut completar la configuració.",
      );
      setBusy(false);
    }
  };

  return (
    <div className={s.screen}>
      <form className={s.card} onSubmit={submit}>
        <div className={s.brand}>
          <span className={s.logo}>
            <Icon name="plate" size={36} />
          </span>
          <div>
            <h1 className={s.title}>Benvinguts a TavernApp</h1>
            <p className={s.lead}>Configuració inicial (només es fa un cop).</p>
          </div>
        </div>

        {!firebase && (
          <div className={s.note}>
            <Icon name="tablet" />
            Mode demo: no hi ha Firebase configurat. Les dades es guarden només en aquest dispositiu.
          </div>
        )}

        <div className={s.grid2}>
          <TextField
            label="Nom del restaurant"
            value={restaurantName}
            onChange={setRestaurantName}
            autoFocus
            placeholder="La Taverna"
          />
          <TextField
            label="Nom d'aquesta tablet"
            value={deviceName}
            onChange={setDeviceNameDraft}
            placeholder="Sala, Barra…"
          />
          <TextField
            label="PIN del mode edició"
            value={pin}
            onChange={(v) => setPin(v.replace(/\D/g, '').slice(0, 4))}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            hint="4 xifres. Es demana per afegir, modificar o eliminar contingut."
          />
          <TextField
            label="Repeteix el PIN"
            value={pin2}
            onChange={(v) => setPin2(v.replace(/\D/g, '').slice(0, 4))}
            type="password"
            inputMode="numeric"
            autoComplete="off"
          />
        </div>

        {firebase && (
          <div className={ui.field}>
            <span className={ui.label}>Codi del restaurant</span>
            <div className={s.code}>{code}</div>
            <span className={ui.hint}>
              Cal per vincular les altres tablets. Apunta’l en un lloc segur: per seguretat no es tornarà a mostrar (sí
              que en podràs generar un de nou).
            </span>
            <Toggle label="He apuntat el codi" checked={codeNoted} onChange={setCodeNoted} />
          </div>
        )}

        <Toggle
          label="Carrega dades d'exemple (plats, begudes i fitxes de mostra)"
          checked={samples}
          onChange={setSamples}
        />

        {error && <p className={ui.error}>{error}</p>}
        <Button type="submit" variant="primary" size="lg" icon="check" disabled={busy}>
          {busy ? 'Configurant…' : 'Comença'}
        </Button>
      </form>
    </div>
  );
}
