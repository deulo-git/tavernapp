import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../../data/store';
import { formatPrice } from '../../domain/format';
import { PRESENT_LABELS, TAG_LABELS } from '../../domain/presentLabels';
import { hasTranslation, translatedField } from '../../domain/translation';
import type { Dish } from '../../domain/types';
import { DISH_TAGS } from '../../domain/types';
import { AllergenList } from '../../ui/Allergens';
import { Button, IconButton } from '../../ui/Button';
import { ItemImage } from '../../ui/ItemImage';
import { Sheet } from '../../ui/Sheet';
import ui from '../../ui/ui.module.css';
import { useEditMode } from '../edit-mode/editMode';
import { PresentView } from '../present/PresentView';
import { DetailLayout, DetailSection, ExplanationBlock, UnavailableNotice, UpdatedNote } from '../catalog/DetailParts';
import s from '../catalog/detail.module.css';

interface Props {
  dish: Dish;
  categoryName: string;
  prev?: () => void;
  next?: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DishDetail({ dish, categoryName, prev, next, onClose, onEdit, onDelete }: Props) {
  const { drinks } = useData();
  const { editing } = useEditMode();
  const navigate = useNavigate();
  const [presenting, setPresenting] = useState(false);
  const pairings = dish.pairings.map((id) => drinks.find((d) => d.id === id)).filter((d) => d !== undefined);

  return (
    <Sheet
      title={categoryName}
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
              <ItemImage itemId={dish.id} image={dish.image} alt={dish.name} icon="plate" full className={s.image} />
            </button>
            <Button variant="primary" size="lg" icon="present" block onClick={() => setPresenting(true)}>
              Mostra al client
            </Button>
          </>
        }
      >
        <div className={s.headline}>
          <h1 className={s.name}>{dish.name}</h1>
          <div className={s.metaRow}>
            {dish.price !== null && <span className={s.bigPrice}>{formatPrice(dish.price)}</span>}
            {DISH_TAGS.filter((t) => dish.tags.includes(t.key)).map((t) => (
              <span key={t.key} className={`${ui.badge} ${ui.badgeInfo}`}>
                {t.label}
              </span>
            ))}
          </div>
          {!dish.available && <UnavailableNotice />}
        </div>

        <ExplanationBlock item={dish} field="explanation" titleField="name" />

        <DetailSection title="Al·lèrgens">
          <AllergenList allergens={dish.allergens} traces={dish.traces} />
        </DetailSection>

        {dish.ingredients.length > 0 && (
          <DetailSection title="Ingredients">
            <div className={ui.chips}>
              {dish.ingredients.map((i) => (
                <span key={i} className={ui.chip}>
                  {i}
                </span>
              ))}
            </div>
          </DetailSection>
        )}

        {dish.preparation.trim() && (
          <DetailSection title="Preparació" staff>
            <p className={s.text}>{dish.preparation}</p>
          </DetailSection>
        )}

        {pairings.length > 0 && (
          <DetailSection title="Marida amb">
            <div className={s.linkList}>
              {pairings.map((d) => (
                <Button
                  key={d.id}
                  icon={d.type === 'cervesa' ? 'beer' : d.type === 'licor' ? 'bottle' : 'wine'}
                  onClick={() => navigate(`/begudes/${d.type}?item=${d.id}`)}
                >
                  {d.name}
                </Button>
              ))}
            </div>
          </DetailSection>
        )}

        <UpdatedNote item={dish} />
      </DetailLayout>

      {presenting && (
        <PresentView
          itemId={dish.id}
          image={dish.image}
          icon="plate"
          allergens={dish.allergens}
          traces={dish.traces}
          available={(l) => l === 'ca' || hasTranslation(dish, l)}
          onClose={() => setPresenting(false)}
          content={(lang) => {
            const ingredients = translatedField(dish, lang, 'ingredients').split('\n').filter(Boolean).join(', ');
            const diet = dish.tags
              .filter((t) => t !== 'recomanat' && t !== 'temporada')
              .map((t) => TAG_LABELS[t][lang]);
            return {
              title: translatedField(dish, lang, 'name'),
              originalTitle: lang === 'ca' ? undefined : dish.name,
              description: translatedField(dish, lang, 'explanation'),
              price: formatPrice(dish.price),
              facts: [
                ...(ingredients ? [{ label: PRESENT_LABELS.ingredients[lang], value: ingredients }] : []),
                ...(diet.length ? [{ label: PRESENT_LABELS.diet[lang], value: diet.join(' · ') }] : []),
              ],
            };
          }}
        />
      )}
    </Sheet>
  );
}
