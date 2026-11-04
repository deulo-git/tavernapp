import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import s from './ui.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerOutline' | 'edit';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  block?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  block,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [s.btn, s[variant], size !== 'md' && s[size], block && s.block, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 20 : 24} />}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Accessible name; also shown as a tooltip. */
  label: string;
  small?: boolean;
  danger?: boolean;
}

export function IconButton({ icon, label, small, danger, className, type = 'button', ...rest }: IconButtonProps) {
  const classes = [s.iconBtn, small && s.iconBtnSm, danger && s.iconBtnDanger, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={small ? 22 : 26} />
    </button>
  );
}
