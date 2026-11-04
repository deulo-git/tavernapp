import { useNavigate } from 'react-router';
import { useData } from '../../data/store';
import { DRINK_TYPES, drinkSpecRows, formatSpecValue } from '../../domain/drinkSpecs';
import { formatAbv } from '../../domain/format';
import type { Drink } from '../../domain/types';
import { AllergenList } from '../../ui/Allergens';
import { Button, IconButton } from '../../ui/Button';
import { Sheet } from '../../ui/Sheet';
import ui from '../../ui/ui.module.css';
import { useEditMode } from '../edit-mode/editMode';
import {
  DetailImage,
  DetailLayout,
  DetailSection,
  ExplanationBlock,
  SpecTable,
  UnavailableNotice,
  UpdatedNote,
} from '../catalog/DetailParts';
import { DRINK_ICON, drinkPriceLabel } from './drinkUi';
import s from '../catalog/detail.module.css';

interface Props {
  drink: Drink;
  prev?: () => void;
  next?: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DrinkDetail({ drink, prev, next, onClose, onEdit, onDelete }: Props) {
  const { dishes } = useData();
  const { editing } = useEditMode();
  const navigate = useNavigate();
  const def = DRINK_TYPES[drink.type];
  const icon = DRINK_ICON[drink.type];
  const pairedDishes = dishes.filter((d) => d.pairings.includes(drink.id));
  const style = formatSpecValue(drink.specs[def.filterKey]);

  return (
    <Sheet
      title={def.plural}
      onClose={onClose}
      actions={
        <>
          {editing && (
            <>
              <Button variant="edit" icon="edit" onClick={onEdit}>
                Edita
              </Button>
              <IconButton icon="trash" label="Elimina" danger onClick={onDelete} />
            </>
          )}
          <div className={s.navArrows}>
            <IconButton icon="chevronLeft" label="Anterior" onClick={prev} disabled={!prev} />
            <IconButton icon="chevronRight" label="Següent" onClick={next} disabled={!next} />
          </div>
        </>
      }
    >
      <DetailLayout aside={<DetailImage itemId={drink.id} image={drink.image} alt={drink.name} icon={icon} contain />}>
        <div className={s.headline}>
          <h1 className={s.name}>{drink.name}</h1>
          <div className={s.metaRow}>
            {style && <span className={`${ui.badge} ${ui.badgeInfo}`}>{style}</span>}
            {drinkPriceLabel(drink) && <span className={s.bigPrice}>{drinkPriceLabel(drink)}</span>}
          </div>
          {!drink.available && <UnavailableNotice />}
        </div>

        <ExplanationBlock item={drink} field="explanation" />

        <DetailSection title="Fitxa tècnica">
          <SpecTable rows={drinkSpecRows(drink, formatAbv)} />
        </DetailSection>

        {drink.tastingNotes.trim() && (
          <DetailSection title="Notes de tast">
            <p className={s.text}>{drink.tastingNotes}</p>
          </DetailSection>
        )}

        {(drink.pairing.trim() || pairedDishes.length > 0) && (
          <DetailSection title="Maridatge">
            {drink.pairing.trim() && <p className={s.text}>{drink.pairing}</p>}
            {pairedDishes.length > 0 && (
              <div className={s.linkList}>
                {pairedDishes.map((d) => (
                  <Button key={d.id} icon="plate" onClick={() => navigate(`/menjar?item=${d.id}`)}>
                    {d.name}
                  </Button>
                ))}
              </div>
            )}
          </DetailSection>
        )}

        <DetailSection title="Al·lèrgens">
          <AllergenList allergens={drink.allergens} traces={drink.traces} />
        </DetailSection>

        <UpdatedNote item={drink} />
      </DetailLayout>
    </Sheet>
  );
}
