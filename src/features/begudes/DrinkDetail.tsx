import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../../data/store';
import { DRINK_TYPES, drinkSpecRows, formatSpecValue } from '../../domain/drinkSpecs';
import { formatAbv, formatPrice } from '../../domain/format';
import { PRESENT_LABELS } from '../../domain/presentLabels';
import { hasTranslation, translatedField } from '../../domain/translation';
import type { Drink } from '../../domain/types';
import { AllergenList } from '../../ui/Allergens';
import { Button, IconButton } from '../../ui/Button';
import { ItemImage } from '../../ui/ItemImage';
import { Sheet } from '../../ui/Sheet';
import ui from '../../ui/ui.module.css';
import { useEditMode } from '../edit-mode/editMode';
import { PresentView } from '../present/PresentView';
import {
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
  const [presenting, setPresenting] = useState(false);
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
      <DetailLayout
        aside={
          <>
            <button
              type="button"
              style={{ padding: 0, border: 0, background: 'none' }}
              onClick={() => setPresenting(true)}
              aria-label="Mostra al client"
            >
              <ItemImage
                itemId={drink.id}
                image={drink.image}
                alt={drink.name}
                icon={icon}
                full
                contain
                className={s.image}
              />
            </button>
            <Button variant="primary" size="lg" icon="present" block onClick={() => setPresenting(true)}>
              Mostra al client
            </Button>
          </>
        }
      >
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

      {presenting && (
        <PresentView
          itemId={drink.id}
          image={drink.image}
          icon={icon}
          allergens={drink.allergens}
          traces={drink.traces}
          available={(l) => l === 'ca' || hasTranslation(drink, l)}
          onClose={() => setPresenting(false)}
          content={(lang) => {
            const grapes = drink.type === 'vi' ? formatSpecValue(drink.specs.varietats) : '';
            const vintage = drink.type === 'vi' ? formatSpecValue(drink.specs.anyada) : '';
            const facts = [
              { label: PRESENT_LABELS.producer[lang], value: drink.producer },
              { label: PRESENT_LABELS.origin[lang], value: drink.origin },
              { label: PRESENT_LABELS.grapes[lang], value: grapes },
              { label: PRESENT_LABELS.vintage[lang], value: vintage },
              { label: PRESENT_LABELS.abv[lang], value: drink.abv !== null ? formatAbv(drink.abv) : '' },
              { label: PRESENT_LABELS.glass[lang], value: formatPrice(drink.priceGlass) },
              { label: PRESENT_LABELS.bottle[lang], value: formatPrice(drink.priceBottle) },
            ].filter((f) => f.value);
            return { title: drink.name, description: translatedField(drink, lang, 'explanation'), facts };
          }}
        />
      )}
    </Sheet>
  );
}
