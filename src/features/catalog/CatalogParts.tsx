import type { ReactNode } from 'react';
import type { AllergenKey } from '../../domain/allergens';
import type { ImageRef } from '../../domain/types';
import { AllergenBadges } from '../../ui/Allergens';
import { IconButton } from '../../ui/Button';
import { Icon, type IconName } from '../../ui/Icon';
import { ItemImage } from '../../ui/ItemImage';
import ui from '../../ui/ui.module.css';
import s from './catalog.module.css';

export function CatalogLayout({ rail, children }: { rail: ReactNode; children: ReactNode }) {
  return (
    <div className={s.layout}>
      <nav className={s.rail}>{rail}</nav>
      <main className={s.main}>{children}</main>
    </div>
  );
}

export function RailButton({
  label,
  count,
  icon,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  icon?: IconName;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={[s.railButton, active && s.railActive].filter(Boolean).join(' ')}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      {icon && <Icon name={icon} />}
      <span>{label}</span>
      {count !== undefined && <span className={s.railCount}>{count}</span>}
    </button>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className={s.search}>
      <Icon name="search" className={s.searchIcon} />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className={s.searchClear} aria-label="Esborra la cerca" onClick={() => onChange('')}>
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}

export interface EditControls {
  onEdit: () => void;
  onDelete: () => void;
  /** Present when the item can be reordered; a missing direction is shown disabled. */
  move?: { up?: () => void; down?: () => void };
}

interface ItemCardProps {
  itemId: string;
  image: ImageRef | null;
  icon: IconName;
  title: string;
  subtitle?: string;
  price?: string;
  allergens?: readonly AllergenKey[];
  traces?: readonly AllergenKey[];
  unavailable?: boolean;
  /** Customer allergy filter: the item may contain traces. */
  warning?: boolean;
  badges?: ReactNode;
  onOpen: () => void;
  edit?: EditControls;
}

export function ItemCard(props: ItemCardProps) {
  const { itemId, image, icon, title, subtitle, price, allergens, traces, unavailable, warning, badges, onOpen, edit } =
    props;
  return (
    <article
      className={[s.card, unavailable && s.unavailable, warning && s.cardWarning].filter(Boolean).join(' ')}
      aria-label={title}
    >
      <button type="button" className={s.cardOpen} onClick={onOpen}>
        <ItemImage itemId={itemId} image={image} alt={title} icon={icon} className={s.cardImage} />
        <div className={s.cardBody}>
          <h3 className={s.cardTitle}>{title}</h3>
          {subtitle && <p className={s.cardSubtitle}>{subtitle}</p>}
          <div className={s.cardFooter}>
            {allergens || traces ? <AllergenBadges allergens={allergens ?? []} traces={traces} size={28} /> : <span />}
            {price && <span className={s.price}>{price}</span>}
          </div>
        </div>
      </button>
      <div className={s.cardBadges}>
        {unavailable && <span className={`${ui.badge} ${ui.badgeDanger}`}>Esgotat</span>}
        {warning && (
          <span className={`${ui.badge} ${ui.badgeWarning}`}>
            <Icon name="alert" size={16} /> Pot contenir traces
          </span>
        )}
        {badges}
      </div>
      {edit && (
        <div className={s.cardEdit}>
          <IconButton icon="edit" label={`Edita ${title}`} small onClick={edit.onEdit} />
          <IconButton icon="trash" label={`Elimina ${title}`} small danger onClick={edit.onDelete} />
          <span className={s.grow} />
          {edit.move && (
            <>
              <IconButton icon="up" label="Mou amunt" small onClick={edit.move.up} disabled={!edit.move.up} />
              <IconButton icon="down" label="Mou avall" small onClick={edit.move.down} disabled={!edit.move.down} />
            </>
          )}
        </div>
      )}
    </article>
  );
}

export function AddCard({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={s.addCard} onClick={onClick}>
      <Icon name="plus" size={48} />
      {label}
    </button>
  );
}
