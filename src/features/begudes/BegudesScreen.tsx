import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { TopBar } from '../../app/TopBar';
import { useData } from '../../data/store';
import { allergenStatus } from '../../domain/allergens';
import { DRINK_TYPES, DRINK_TYPE_ORDER, drinkFilterValue } from '../../domain/drinkSpecs';
import { matchesQuery } from '../../domain/search';
import { DRINK_TYPE_COLOR } from '../../domain/colors';
import type { DrinkType } from '../../domain/types';
import { EmptyState, Spinner } from '../../ui/EmptyState';
import ui from '../../ui/ui.module.css';
import { useEditMode } from '../edit-mode/editMode';
import { AllergyFilterBar, AllergyFilterButton } from '../catalog/AllergyFilter';
import { useAllergyFilter } from '../catalog/allergyFilterContext';
import { AddCard, CatalogLayout, ItemCard, RailButton, SearchBox } from '../catalog/CatalogParts';
import { useCatalogActions } from '../catalog/useCatalogActions';
import { useItemRoute } from '../catalog/useItemRoute';
import { DrinkDetail } from './DrinkDetail';
import { DrinkForm } from './DrinkForm';
import { DRINK_ICON, drinkPriceLabel, drinkSubtitle } from './drinkUi';
import s from '../catalog/catalog.module.css';

function isDrinkType(value: string | undefined): value is DrinkType {
  return DRINK_TYPE_ORDER.includes(value as DrinkType);
}

export function BegudesScreen() {
  const { tipus } = useParams();
  if (!isDrinkType(tipus)) return <Navigate to="/begudes/vi" replace />;
  return <DrinksOfType key={tipus} type={tipus} />;
}

function DrinksOfType({ type }: { type: DrinkType }) {
  const navigate = useNavigate();
  const { drinks, loaded } = useData();
  const { editing } = useEditMode();
  const { excluded } = useAllergyFilter();
  const { deleteItem, moveHandlers } = useCatalogActions();
  const route = useItemRoute();
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState<string | null>(null);
  const def = DRINK_TYPES[type];

  const ofType = useMemo(() => drinks.filter((d) => d.type === type), [drinks, type]);
  const styles = def.fields
    .find((f) => f.key === def.filterKey)!
    .options!.filter((o) => ofType.some((d) => drinkFilterValue(d) === o));

  const filtered = ofType.filter(
    (d) =>
      (!style || drinkFilterValue(d) === style) &&
      matchesQuery(query, [d.name, d.producer, d.origin, d.explanation, d.tastingNotes, drinkFilterValue(d)]),
  );
  const visible = filtered.filter((d) => allergenStatus(d, excluded) !== 'contains');
  const hiddenCount = filtered.length - visible.length;
  const canReorder = editing && !query.trim() && !style && excluded.size === 0;

  const selected = route.itemId ? drinks.find((d) => d.id === route.itemId) : undefined;
  const selectedIndex = selected ? visible.indexOf(selected) : -1;
  const editingDrink = route.editId && route.editId !== 'new' ? drinks.find((d) => d.id === route.editId) : null;

  return (
    <>
      <TopBar title="Begudes" />
      <CatalogLayout
        rail={DRINK_TYPE_ORDER.map((t) => (
          <RailButton
            key={t}
            label={DRINK_TYPES[t].plural}
            color={DRINK_TYPE_COLOR[t]}
            count={drinks.filter((d) => d.type === t).length}
            active={t === type}
            onClick={() => navigate(`/begudes/${t}`, { replace: true })}
          />
        ))}
      >
        <div className={s.toolbar}>
          <SearchBox value={query} onChange={setQuery} placeholder={`Cerca ${def.plural.toLowerCase()}`} />
          <AllergyFilterButton />
        </div>
        {styles.length > 1 && (
          <div className={s.chipsRow}>
            <button
              type="button"
              className={[ui.segment, !style && ui.segmentOn].filter(Boolean).join(' ')}
              onClick={() => setStyle(null)}
            >
              Tots
            </button>
            {styles.map((st) => (
              <button
                key={st}
                type="button"
                className={[ui.segment, style === st && ui.segmentOn].filter(Boolean).join(' ')}
                onClick={() => setStyle(style === st ? null : st)}
              >
                {st}
              </button>
            ))}
          </div>
        )}
        <AllergyFilterBar hiddenCount={hiddenCount} />
        <div className={s.scroll}>
          {!loaded ? (
            <EmptyState icon={DRINK_ICON[type]} title="Carregant…">
              <Spinner />
            </EmptyState>
          ) : (
            <div className={s.grid}>
              {editing && (
                <AddCard label={`Afegeix ${def.label.toLowerCase()}`} onClick={() => route.openEdit('new')} />
              )}
              {visible.map((d) => (
                <ItemCard
                  key={d.id}
                  itemId={d.id}
                  image={d.image}
                  icon={DRINK_ICON[type]}
                  color={DRINK_TYPE_COLOR[type]}
                  title={d.name}
                  subtitle={drinkSubtitle(d)}
                  price={drinkPriceLabel(d)}
                  allergens={d.allergens}
                  traces={d.traces}
                  unavailable={!d.available}
                  warning={allergenStatus(d, excluded) === 'traces'}
                  badges={drinkFilterValue(d) ? <span className={ui.badge}>{drinkFilterValue(d)}</span> : undefined}
                  onOpen={() => route.openItem(d.id)}
                  edit={
                    editing
                      ? {
                          onEdit: () => route.openEdit(d.id),
                          onDelete: () => void deleteItem(d),
                          move: canReorder ? moveHandlers('drinks', ofType, ofType.indexOf(d)) : undefined,
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          )}
          {loaded && visible.length === 0 && !editing && (
            <EmptyState
              icon={DRINK_ICON[type]}
              title={ofType.length ? 'Cap beguda coincideix' : `Encara no hi ha ${def.plural.toLowerCase()}`}
            >
              {!ofType.length && <p>Entra al mode edició per afegir-ne.</p>}
              {hiddenCount > 0 && <p>{hiddenCount} amagades pel filtre d’al·lèrgies.</p>}
            </EmptyState>
          )}
        </div>
      </CatalogLayout>

      {selected && (
        <DrinkDetail
          key={selected.id}
          drink={selected}
          prev={selectedIndex > 0 ? () => route.openItem(visible[selectedIndex - 1].id) : undefined}
          next={
            selectedIndex >= 0 && selectedIndex < visible.length - 1
              ? () => route.openItem(visible[selectedIndex + 1].id)
              : undefined
          }
          onClose={route.close}
          onEdit={() => route.openEdit(selected.id)}
          onDelete={async () => {
            if (await deleteItem(selected)) route.close();
          }}
        />
      )}
      {editing && route.editId && (editingDrink || route.editId === 'new') && (
        <DrinkForm
          key={route.editId}
          drink={editingDrink ?? null}
          defaultType={type}
          onClose={route.close}
          onSaved={(d) =>
            d.type === type ? route.openItem(d.id) : navigate(`/begudes/${d.type}?item=${d.id}`, { replace: true })
          }
        />
      )}
    </>
  );
}
