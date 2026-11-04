import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getThemePreference, setThemePreference, type ThemePreference } from '../../app/theme';
import { getDeviceName, setDeviceName } from '../../data/actions';
import { backupFileName, buildBackup, restoreOps, shareOrDownload, validateBackup } from '../../data/backup';
import { sampleDataOps } from '../../data/seed';
import { useData } from '../../data/store';
import { hashPin, randomToken } from '../../domain/security';
import { Button } from '../../ui/Button';
import { Segmented, TextField } from '../../ui/Field';
import { PinPad } from '../../ui/PinPad';
import { useFeedback } from '../../ui/feedback';
import ui from '../../ui/ui.module.css';
import { AllergenManager } from '../allergens/AllergenManager';
import { FormSection } from '../forms/FormSheet';
import overlay from '../../ui/overlay.module.css';
import form from '../forms/form.module.css';
import s from '../informacio/info.module.css';

function ChangePinDialog({ onClose }: { onClose: () => void }) {
  const { repo } = useData();
  const { toast, reportError } = useFeedback();
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onComplete = async (pin: string) => {
    if (!first) {
      setFirst(pin);
      setError(null);
      return true;
    }
    if (pin !== first) {
      setFirst(null);
      setError('Els PIN no coincideixen. Torna-ho a provar.');
      return true;
    }
    const pinSalt = randomToken(16);
    repo.putConfig({ pinSalt, pinHash: await hashPin(pin, pinSalt) }).catch(reportError);
    toast("S'ha canviat el PIN del mode edició.");
    onClose();
    return true;
  };

  return createPortal(
    <div className={overlay.backdrop} onClick={onClose}>
      <div className={overlay.dialog} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <PinPad
          key={first ?? 'first'}
          title={first ? 'Repeteix el PIN nou' : 'Escriu el PIN nou'}
          subtitle="4 xifres. El faran servir totes les tablets."
          error={error}
          onComplete={onComplete}
        />
        <Button size="lg" block onClick={onClose}>
          Cancel·la
        </Button>
      </div>
    </div>,
    document.body,
  );
}

export function SettingsPanel() {
  const data = useData();
  const { repo, info } = data;
  const { toast, confirm, reportError } = useFeedback();
  const [deviceName, setDeviceNameDraft] = useState(getDeviceName());
  const [changingPin, setChangingPin] = useState(false);
  const [managingAllergens, setManagingAllergens] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>(getThemePreference());
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveDeviceName = () => {
    const name = deviceName.trim();
    if (!name) return;
    setDeviceName(name);
    toast('Nom de la tablet desat.');
  };

  const exportBackup = async () => {
    setBusy(true);
    try {
      const backup = await buildBackup(repo, data);
      await shareOrDownload(JSON.stringify(backup), backupFileName());
    } catch (err) {
      reportError(err);
    } finally {
      setBusy(false);
    }
  };

  const importBackup = async (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = '';
    if (!file) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      toast('El fitxer no és vàlid.', { tone: 'error' });
      return;
    }
    const result = validateBackup(parsed);
    if (!result.ok) {
      toast(result.error, { tone: 'error' });
      return;
    }
    const b = result.backup;
    const ok = await confirm({
      title: 'Restaurar la còpia de seguretat?',
      message: `Còpia del ${new Date(b.exportedAt).toLocaleString('ca-ES')}:\n${b.dishes.length} plats, ${b.drinks.length} begudes, ${b.guides.length} fitxes.\n\nSubstituirà TOT el contingut actual a totes les tablets.`,
      confirmLabel: 'Restaura',
      danger: true,
    });
    if (!ok) return;
    await repo.writeBatch(restoreOps(b, data));
    toast("S'ha restaurat la còpia de seguretat.");
  };

  const loadSamples = async () => {
    const ok = await confirm({
      title: "Carregar les dades d'exemple?",
      message: "S'afegiran uns quants plats, begudes i fitxes d'exemple. No s'esborra res del que ja hi ha.",
      confirmLabel: 'Carrega',
    });
    if (ok) {
      await repo.writeBatch(sampleDataOps(info));
      toast("S'han carregat les dades d'exemple.");
    }
  };

  return (
    <div className={s.settings}>
      <FormSection title="Aquesta tablet" note="El nom ajuda a saber qui ha fet cada canvi.">
        <div className={form.row}>
          <TextField
            className={form.grow}
            label="Nom de la tablet"
            value={deviceName}
            placeholder="Sala, Barra, Terrassa…"
            onChange={setDeviceNameDraft}
          />
          <Button icon="check" onClick={saveDeviceName} style={{ alignSelf: 'end' }}>
            Desa
          </Button>
        </div>
      </FormSection>

      <FormSection
        title="Al·lèrgens"
        note="Afegeix, canvia o elimina al·lèrgens de la llista que fan servir els plats i les begudes."
        actions={
          <Button icon="edit" onClick={() => setManagingAllergens(true)}>
            Gestiona els al·lèrgens
          </Button>
        }
      />

      <FormSection
        title="PIN del mode edició"
        note="Evita canvis per error. És el mateix a totes les tablets."
        actions={
          <Button icon="key" onClick={() => setChangingPin(true)}>
            Canvia el PIN
          </Button>
        }
      />

      <FormSection
        title="Còpia de seguretat"
        note="Desa un fitxer amb tota la carta (fotos incloses). Recomanable fer-ne una de tant en tant."
      >
        <div className={form.row}>
          <Button icon="download" onClick={exportBackup} disabled={busy}>
            {busy ? 'Preparant…' : 'Exporta una còpia'}
          </Button>
          <Button icon="upload" onClick={() => fileRef.current?.click()}>
            Restaura una còpia
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className={ui.fileInput}
            onChange={(e) => importBackup(e.target.files?.[0])}
          />
        </div>
      </FormSection>

      <FormSection title="Aparença">
        <Segmented
          label="Tema"
          options={[
            { value: 'light', label: 'Clar' },
            { value: 'dark', label: 'Fosc' },
            { value: 'auto', label: 'Automàtic' },
          ]}
          value={theme}
          allowEmpty={false}
          onChange={(v) => {
            if (!v) return;
            setTheme(v);
            setThemePreference(v);
          }}
        />
      </FormSection>

      <FormSection
        title="Dades d'exemple"
        note="Plats, begudes i fitxes de mostra per veure com funciona l'app."
        actions={<Button onClick={loadSamples}>Carrega-les</Button>}
      />

      <p className={ui.hint}>
        TavernApp · {repo.mode === 'demo' ? 'Mode demo (dades només en aquesta tablet)' : 'Sincronitzat amb Firebase'}
      </p>

      {changingPin && <ChangePinDialog onClose={() => setChangingPin(false)} />}
      {managingAllergens && <AllergenManager onClose={() => setManagingAllergens(false)} />}
    </div>
  );
}
