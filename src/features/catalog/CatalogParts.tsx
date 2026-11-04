import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { TILE_COLORS, tileStyle, type TileColor } from '../../domain/colors';
import type { ImageRef } from '../../domain/types';
import { IconButton } from '../../ui/Button';
import { Icon, type IconName } from '../../ui/Icon';
import { ItemImage } from '../../ui/ItemImage';
import ui from '../../ui/ui.module.css';
import s from './catalog.module.css';

const SWIPE_EDGE_PX = 48;
const SWIPE_MIN_PX = 60;

/**
 * Main column plus an index on the right that opens and closes from the right edge:
 * a pull tab on the edge, or a swipe (from the edge to open, towards the edge to close).
 */
export function CatalogLayout({
  rail,
  railLabel,
  children,
  defaultOpen = true,
}: {
  rail: ReactNode;
  /** Name shown on the pull tab, e.g. "Categories". */
  railLabel: string;
  children: ReactNode;
  /** Whether the index starts visible. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const swipe = useRef<{ x: number; y: number; fromEdge: boolean } | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    swipe.current = { x: e.clientX, y: e.clientY, fromEdge: box.right - e.clientX < SWIPE_EDGE_PX };
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(e.clientY - start.y) > Math.abs(dx)) return;
    if (!open && start.fromEdge && dx < 0) setOpen(true);
    if (open && dx > 0 && (e.target as HTMLElement).closest('nav')) setOpen(false);
  };

  return (
    <div
      className={[s.layout, !open && s.layoutClosed].filter(Boolean).join(' ')}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
    >
      <main className={s.main}>{children}</main>
      {open && <nav className={s.rail}>{rail}</nav>}
      <button
        type="button"
        className={s.railHandle}
        aria-expanded={open}
        aria-label={open ? `Amaga ${railLabel.toLowerCase()}` : `Mostra ${railLabel.toLowerCase()}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name={open ? 'chevronRight' : 'chevronLeft'} size={22} />
        <span className={s.railHandleLabel}>{railLabel}</span>
      </button>
    </div>
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
