import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../data/store';
import {
  DEFAULT_UI_SIZES,
  UI_SIZE_PARAMS,
  applyUiSizes,
  sameUiSizes,
  type UiSizeParam,
  type UiSizes,
} from '../../domain/uiSizes';
import { Button, IconButton } from '../../ui/Button';
import { useFeedback } from '../../ui/feedback';
import s from './admin.module.css';

function SizeRow({ param, value, onChange }: { param: UiSizeParam; value: number; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.min(param.max, Math.max(param.min, v)));
  const isDefault = value === DEFAULT_UI_SIZES[param.key];
  return (
    <div className={s.row}>
      <div className={s.rowHead}>
        <label className={s.rowLabel} htmlFor={`size-${param.key}`}>
          {param.label}
        </label>
        <span className={[s.value, !isDefault && s.valueChanged].filter(Boolean).join(' ')}>
          {value}
          {param.unit}
        </span>
      </div>
      <div className={s.control}>
        <IconButton
          icon="minus"
          label={`Redueix: ${param.label}`}
          small
          onClick={() => set(value - param.step)}
          disabled={value <= param.min}
        />
        <input
          id={`size-${param.key}`}
          className={s.range}
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={value}
          onChange={(e) => set(Number(e.target.value))}
        />
        <IconButton
          icon="plus"
          label={`Augmenta: ${param.label}`}
          small
          onClick={() => set(value + param.step)}
          disabled={value >= param.max}
        />
      </div>
      <p className={s.hint}>{param.hint}</p>
    </div>
  );
}

/** Left-docked panel: changes preview live on this tablet and reach every tablet on "Desa". */
export function SizesPanel({ onClose }: { onClose: () => void }) {
  const { repo, uiSizes } = useData();
  const { toast, confirm, reportError } = useFeedback();
  const [draft, setDraft] = useState<UiSizes>(uiSizes);
  const dirty = !sameUiSizes(draft, uiSizes);

  // Live preview of the draft; the saved sizes are put back when the panel closes.
  useEffect(() => applyUiSizes(draft), [draft]);
  useEffect(() => () => applyUiSizes(uiSizes), [uiSizes]);

  const save = async () => {
    try {
      await repo.putUiSizes(draft);
      toast('Mides desades a totes les tablets.');
      onClose();
    } catch (err) {
      reportError(err);
    }
  };

  const close = async () => {
    if (dirty) {
      const discard = await confirm({
        title: 'Descartar els canvis?',
        message: 'Les mides noves no s’han desat.',
        confirmLabel: 'Descarta',
        danger: true,
      });
      if (!discard) return;
    }
    onClose();
  };

  return createPortal(
    <aside className={s.panel} aria-label="Mides de la interfície">
      <header className={s.header}>
        <h2 className={s.title}>Mides</h2>
        <IconButton icon="close" label="Tanca" onClick={close} />
      </header>
      <p className={s.intro}>Els canvis es veuen al moment. Pots navegar per l’app amb el panell obert.</p>
      <div className={s.body}>
        {UI_SIZE_PARAMS.map((p) => (
          <SizeRow
            key={p.key}
            param={p}
            value={draft[p.key]}
            onChange={(v) => setDraft((d) => ({ ...d, [p.key]: v }))}
          />
        ))}
      </div>
      <footer className={s.footer}>
        <Button
          icon="refresh"
          onClick={() => setDraft(DEFAULT_UI_SIZES)}
          disabled={sameUiSizes(draft, DEFAULT_UI_SIZES)}
        >
          Per defecte
        </Button>
        <Button variant="primary" icon="check" onClick={save} disabled={!dirty}>
          Desa
        </Button>
      </footer>
    </aside>,
    document.body,
  );
}
