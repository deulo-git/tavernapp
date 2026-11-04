import { useState } from 'react';
import { useData } from '../../data/store';
import type { InfoSection, RestaurantInfo } from '../../domain/types';
import { Button, IconButton } from '../../ui/Button';
import { TextArea, TextField } from '../../ui/Field';
import { useFeedback } from '../../ui/feedback';
import { FormSection, FormSheet } from '../forms/FormSheet';
import s from '../forms/form.module.css';

export function RestaurantForm({ info, onClose }: { info: RestaurantInfo; onClose: () => void }) {
  const { repo } = useData();
  const { reportError, toast } = useFeedback();
  const [draft, setDraft] = useState(info);
  const set = <K extends keyof RestaurantInfo>(key: K, value: RestaurantInfo[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const setSection = (i: number, patch: Partial<InfoSection>) =>
    set(
      'sections',
      draft.sections.map((sec, j) => (j === i ? { ...sec, ...patch } : sec)),
    );
  const moveSection = (i: number, delta: -1 | 1) => {
    const next = [...draft.sections];
    [next[i], next[i + delta]] = [next[i + delta], next[i]];
    set('sections', next);
  };

  const save = () => {
    if (!draft.name.trim()) {
      toast('Cal posar el nom del restaurant.', { tone: 'error' });
      return;
    }
    const cleaned = {
      ...draft,
      sections: draft.sections.filter((sec) => sec.title.trim() || sec.body.trim()),
      updatedAt: Date.now(),
    };
    repo.putInfo(cleaned).catch(reportError);
    onClose();
  };

  return (
    <FormSheet
      title="Dades del restaurant"
      dirty={JSON.stringify(draft) !== JSON.stringify(info)}
      onClose={onClose}
      onSave={save}
    >
      <FormSection title="Restaurant">
        <div className={s.grid2}>
          <TextField label="Nom" value={draft.name} onChange={(v) => set('name', v)} />
          <TextField label="Eslògan" value={draft.tagline} onChange={(v) => set('tagline', v)} />
        </div>
        <TextArea
          label="Horari"
          value={draft.hours}
          rows={3}
          placeholder="Dimarts a diumenge: 13:00–16:00 i 20:00–23:00"
          onChange={(v) => set('hours', v)}
        />
      </FormSection>

      <FormSection title="Contacte">
        <div className={s.grid2}>
          <TextField label="Adreça" value={draft.address} onChange={(v) => set('address', v)} />
          <TextField label="Telèfon" value={draft.phone} inputMode="tel" onChange={(v) => set('phone', v)} />
          <TextField label="Correu" value={draft.email} inputMode="email" onChange={(v) => set('email', v)} />
          <TextField label="Web" value={draft.web} inputMode="url" onChange={(v) => set('web', v)} />
          <TextField
            label="Instagram"
            value={draft.instagram}
            placeholder="@restaurant"
            onChange={(v) => set('instagram', v)}
          />
        </div>
      </FormSection>

      <FormSection title="Wi-Fi per als clients" note="Es pot mostrar com a codi QR perquè el client s'hi connecti.">
        <div className={s.grid2}>
          <TextField label="Nom de la xarxa" value={draft.wifiSsid} onChange={(v) => set('wifiSsid', v)} />
          <TextField
            label="Contrasenya"
            value={draft.wifiPassword}
            autoCapitalize="off"
            autoCorrect="off"
            onChange={(v) => set('wifiPassword', v)}
          />
        </div>
      </FormSection>

      <FormSection title="Història">
        <TextArea label="La nostra història" value={draft.history} rows={6} onChange={(v) => set('history', v)} />
      </FormSection>

      <FormSection
        title="Altres seccions"
        note="Normes de la casa, informació per al personal, etc."
        actions={
          <Button icon="plus" onClick={() => set('sections', [...draft.sections, { title: '', body: '' }])}>
            Afegeix secció
          </Button>
        }
      >
        {draft.sections.map((sec, i) => (
          <div key={i} className={s.section} style={{ background: 'var(--surface-2)' }}>
            <div className={s.row}>
              <TextField
                className={s.grow}
                label={`Títol de la secció ${i + 1}`}
                value={sec.title}
                onChange={(v) => setSection(i, { title: v })}
              />
              <IconButton icon="up" label="Mou amunt" disabled={i === 0} onClick={() => moveSection(i, -1)} />
              <IconButton
                icon="down"
                label="Mou avall"
                disabled={i === draft.sections.length - 1}
                onClick={() => moveSection(i, 1)}
              />
              <IconButton
                icon="trash"
                label="Elimina la secció"
                danger
                onClick={() =>
                  set(
                    'sections',
                    draft.sections.filter((_, j) => j !== i),
                  )
                }
              />
            </div>
            <TextArea label="Text" value={sec.body} rows={4} onChange={(v) => setSection(i, { body: v })} />
          </div>
        ))}
      </FormSection>
    </FormSheet>
  );
}
