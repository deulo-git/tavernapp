import type { ReactNode } from 'react';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { Sheet } from '../../ui/Sheet';
import { useFeedback } from '../../ui/feedback';
import s from './form.module.css';

interface Props {
  title: string;
  dirty: boolean;
  /** Another tablet saved this item while it was being edited here. */
  conflict?: boolean;
  saving?: boolean;
  canSave?: boolean;
  onSave: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function FormSheet({ title, dirty, conflict, saving, canSave = true, onSave, onClose, children }: Props) {
  const { confirm } = useFeedback();

  const close = async () => {
    if (
      dirty &&
      !(await confirm({
        title: 'Vols descartar els canvis?',
        message: 'Has fet canvis que encara no has desat.',
        confirmLabel: 'Descarta',
        cancelLabel: 'Continua editant',
        danger: true,
      }))
    ) {
      return;
    }
    onClose();
  };

  return (
    <Sheet
      title={title}
      editing
      onClose={close}
      actions={
        <Button variant="primary" size="lg" icon="check" onClick={onSave} disabled={saving || !canSave}>
          Desa
        </Button>
      }
    >
      <div className={s.form}>
        {conflict && (
          <div className={s.conflict} role="alert">
            <Icon name="alert" />
            Una altra tablet ha modificat aquest element mentre l’editaves. Si deses, els teus canvis el substituiran.
          </div>
        )}
        {children}
      </div>
    </Sheet>
  );
}

export function FormSection({
  title,
  note,
  actions,
  children,
}: {
  title: string;
  note?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className={s.section}>
      <div className={s.sectionHead}>
        <div>
          <h3 className={s.sectionTitle}>{title}</h3>
          {note && <p className={s.sectionNote}>{note}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
