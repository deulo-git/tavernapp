import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './Button';
import s from './overlay.module.css';

interface Props {
  title: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
  /** Amber header used by edit forms. */
  editing?: boolean;
  closeIcon?: 'close' | 'back';
  children: ReactNode;
}

/** Full-screen panel used for item details and edit forms. */
export function Sheet({ title, onClose, actions, editing, closeIcon = 'close', children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className={[s.sheet, editing && s.sheetEdit].filter(Boolean).join(' ')} role="dialog" aria-modal="true">
      <header className={s.sheetHeader}>
        <IconButton icon={closeIcon} label={closeIcon === 'back' ? 'Enrere' : 'Tanca'} onClick={onClose} />
        <h2 className={s.sheetTitle}>{title}</h2>
        {actions && <div className={s.sheetActions}>{actions}</div>}
      </header>
      <div className={s.sheetBody}>{children}</div>
    </div>,
    document.body,
  );
}
