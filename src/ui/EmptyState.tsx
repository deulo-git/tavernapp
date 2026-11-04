import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import s from './ui.module.css';

export function EmptyState({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <div className={s.empty}>
      <Icon name={icon} size={56} strokeWidth={1.5} />
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function Spinner() {
  return <div className={s.spinner} role="status" aria-label="Carregant" />;
}
