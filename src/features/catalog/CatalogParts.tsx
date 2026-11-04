import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { TILE_COLORS, tileStyle, type TileColor } from '../../domain/colors';
import type { ImageRef } from '../../domain/types';
import { Button, IconButton } from '../../ui/Button';
import { RailContext, useRail } from './railContext';
import { Icon, type IconName } from '../../ui/Icon';
import { ItemImage } from '../../ui/ItemImage';
import ui from '../../ui/ui.module.css';
import s from './catalog.module.css';

export function CatalogLayout({
  rail,
  children,
  defaultOpen = true,
}: {
  rail: ReactNode;
  children: ReactNode;
  /** Whether the index on the right starts visible. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const context = useMemo(() => ({ open, toggle: () => setOpen((o) => !o) }), [open]);
  return (
    <RailContext.Provider value={context}>
      <div className={[s.layout, !open && s.layoutClosed].filter(Boolean).join(' ')}>
        <main className={s.main}>{children}</main>
        {open && <nav className={s.rail}>{rail}</nav>}
      </div>
    </RailContext.Provider>
  );
}

/** Toolbar button that shows or hides the index on the right. */
export function RailToggle({ label }: { label: string }) {
  const { open, toggle } = useRail();
  return (
    <Button icon="panel" className={open ? s.railToggleOn : undefined} aria-pressed={open} onClick={toggle}>
      {label}
    </Button>
  );
}

export function RailButton({
  label,
  count,
  icon,
  color,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  icon?: IconName;
  /** Shows the category's tile colour as a dot. */
  color?: TileColor;
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
      {color ? (
        <span className={s.railDot} style={{ background: TILE_COLORS[color].bg }} aria-hidden="true" />
      ) : (
        icon && <Icon name={icon} />
      )}
      <span className={s.railLabel}>{label}</span>
      {count !== undefined && <span className={s.railCount}>{count}</span>}
    </button>
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
  /** Tile colour of the item's category or type. */
  color: TileColor;
  unavailable?: boolean;
  /** Customer allergy filter: the item may contain traces. */
  warning?: boolean;
  onOpen: () => void;
  edit?: EditControls;
}

export function ItemCard(props: ItemCardProps) {
  const { itemId, image, icon, title, color, unavailable, warning, onOpen, edit } = props;
  return (
    <article
      className={[s.card, unavailable && s.unavailable, warning && s.cardWarning].filter(Boolean).join(' ')}
      style={tileStyle(color) as CSSProperties}
      aria-label={title}
    >
      <button type="button" className={s.cardOpen} onClick={onOpen}>
        <ItemImage itemId={itemId} image={image} alt={title} icon={icon} className={s.cardImage} />
        <h3 className={s.cardTitle}>{title}</h3>
      </button>
      <div className={s.cardBadges}>
        {unavailable && <span className={`${ui.badge} ${ui.badgeDanger}`}>Esgotat</span>}
        {warning && (
          <span className={`${ui.badge} ${ui.badgeWarning}`}>
            <Icon name="alert" size={16} /> Pot contenir traces
          </span>
        )}
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
      <Icon name="plus" size={40} />
      {label}
    </button>
  );
}
