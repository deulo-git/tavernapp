import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useEditMode } from '../features/edit-mode/editMode';
import { Button, IconButton } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { SyncIndicator } from './SyncIndicator';
import s from './app.module.css';

interface Props {
  title: string;
  subtitle?: string;
  /** Show the "home" button (every screen except the home screen). */
  showHome?: boolean;
  extra?: ReactNode;
}

export function TopBar({ title, subtitle, showHome = true, extra }: Props) {
  const navigate = useNavigate();
  const { editing, requestEdit, exitEdit } = useEditMode();

  return (
    <header className={[s.topbar, editing && s.topbarEditing].filter(Boolean).join(' ')}>
      {showHome && <IconButton icon="home" label="Inici" onClick={() => navigate('/')} />}
      <div className={s.titleBlock}>
        <h1 className={s.title}>{title}</h1>
        {subtitle && <span className={s.subtitle}>{subtitle}</span>}
      </div>
      <div className={s.right}>
        {extra}
        {editing && (
          <span className={s.editLabel}>
            <Icon name="edit" size={18} /> Mode edició
          </span>
        )}
        <SyncIndicator />
        {editing ? (
          <Button variant="edit" icon="check" onClick={exitEdit}>
            Surt
          </Button>
        ) : (
          <Button icon="lock" onClick={requestEdit}>
            Edita
          </Button>
        )}
      </div>
    </header>
  );
}
