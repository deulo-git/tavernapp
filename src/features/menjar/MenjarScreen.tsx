import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { TopBar } from '../../app/TopBar';
import { useData } from '../../data/store';
import { allergenStatus } from '../../domain/allergens';
import { TILE_COLORS, categoryColor } from '../../domain/colors';
import type { Category, Dish } from '../../domain/types';
import { Button } from '../../ui/Button';
import { EmptyState, Spinner } from '../../ui/EmptyState';
import { useEditMode } from '../edit-mode/editMode';
import { AllergyFilterBar, AllergyFilterButton } from '../catalog/AllergyFilter';
import { useAllergyFilter } from '../catalog/allergyFilterContext';
import { AddCard, CatalogLayout, ItemCard, RailButton, RailToggle } from '../catalog/CatalogParts';
import { useCatalogActions } from '../catalog/useCatalogActions';
import { useItemRoute } from '../catalog/useItemRoute';
import { CategoryManager } from './CategoryManager';
import { DishDetail } from './DishDetail';
import { DishForm } from './DishForm';
import s from '../catalog/catalog.module.css';

const ALL = 'tots';
const UNCATEGORIZED: Category = { id: '', name: 'Sense categoria', order: 9999, createdAt: 0, updatedAt: 0 };

export function MenjarScreen() {
  const { cat = ALL } = useParams();
  const navigate = useNavigate();
  const { dishes, categories, loaded } = useData();
  const { editing } = useEditMode();
  const { excluded } = useAllergyFilter();
  const { deleteItem, moveHandlers } = useCatalogActions();
  const route = useItemRoute();
  const [managingCategories, setManagingCategories] = useState(false);

  const knownCategory = new Set(categories.map((c) => c.id));
  const categoryOf = (d: Dish) => (knownCategory.has(d.categoryId) ? d.categoryId : '');

  const filtered = dishes;
  const visible = filtered.filter((d) => allergenStatus(d, excluded) !== 'contains');
  const hiddenCount = filtered.length - visible.length;

  const showAll = cat === ALL;
  const sectionCategories = [
    ...categories,
    ...(dishes.some((d) => categoryOf(d) === '') ? [UNCATEGORIZED] : []),
  ].filter((c) => showAll || c.id === cat);
  const sections = sectionCategories.map((c) => ({
    category: c,
    items: visible.filter((d) => categoryOf(d) === c.id),
    // Reordering uses the full, unfiltered group so orders stay consistent.
    group: dishes.filter((d) => categoryOf(d) === c.id),
  }));
  const ordered = sections.flatMap((x) => x.items);
  const canReorder = editing && excluded.size === 0;

  const selectedDish = route.itemId ? dishes.find((d) => d.id === route.itemId) : undefined;
  const selectedIndex = selectedDish ? ordered.indexOf(selectedDish) : -1;
  const editTarget = route.editId;
  const editingDish = editTarget && !editTarget.startsWith('new') ? dishes.find((d) => d.id === editTarget) : null;
  const newCategoryId = editTarget?.startsWith('new:') ? editTarget.slice(4) : (categories[0]?.id ?? '');

  return (
    <>
      <TopBar title="Menjar" />
      <CatalogLayout
        defaultOpen={false}
        rail={
          <>
            <RailButton
              label="Tota la carta"
              icon="book"
              count={dishes.length}
              active={cat === ALL}
              onClick={() => navigate('/menjar', { replace: true })}
            />
            {categories.map((c) => (
              <RailButton
                key={c.id}
                label={c.name}
                color={categoryColor(c)}
                count={dishes.filter((d) => d.categoryId === c.id).length}
                active={cat === c.id}
                onClick={() => navigate(`/menjar/${c.id}`, { replace: true })}
              />
            ))}
            <span className={s.railSpacer} />
            {editing && (
              <Button variant="edit" icon="settings" block onClick={() => setManagingCategories(true)}>
                Categories
              </Button>
            )}
          </>
        }
      >
        <div className={s.toolbar}>
          <AllergyFilterButton />
          <RailToggle label="Categories" />
        </div>
        <AllergyFilterBar hiddenCount={hiddenCount} />
        <div className={s.scroll}>
          {!loaded ? (
            <EmptyState icon="plate" title="Carregant la carta…">
              <Spinner />
            </EmptyState>
          ) : categories.length === 0 && dishes.length === 0 ? (
            <EmptyState icon="plate" title="Encara no hi ha cap plat">
              {editing ? (
                <Button variant="edit" size="lg" icon="settings" onClick={() => setManagingCategories(true)}>
                  Crea la primera categoria
                </Button>
              ) : (
                <p>Entra al mode edició per afegir categories i plats.</p>
              )}
            </EmptyState>
          ) : (
            <>
              {sections.map(({ category, items, group }) => {
                if (!items.length && !(editing && category.id)) return null;
                return (
                  <section key={category.id || 'none'} className={s.section}>
                    {showAll && (
                      <h2 className={s.sectionTitle}>
                        <span
                          className={s.railDot}
                          style={{ background: TILE_COLORS[categoryColor(category)].bg }}
                          aria-hidden="true"
                        />
                        {category.name} <small>{items.length === 1 ? '1 plat' : `${items.length} plats`}</small>
                      </h2>
                    )}
                    <div className={s.grid}>
                      {editing && category.id && (
                        <AddCard
                          label={`Afegeix a ${category.name}`}
                          onClick={() => route.openEdit(`new:${category.id}`)}
                        />
                      )}
                      {items.map((d) => {
                        const status = allergenStatus(d, excluded);
                        const index = group.indexOf(d);
                        return (
                          <ItemCard
                            key={d.id}
                            itemId={d.id}
                            image={d.image}
                            icon="plate"
                            color={categoryColor(category)}
                            title={d.name}
                            unavailable={!d.available}
                            warning={status === 'traces'}
                            onOpen={() => route.openItem(d.id)}
                            edit={
                              editing
                                ? {
                                    onEdit: () => route.openEdit(d.id),
                                    onDelete: () => void deleteItem(d),
                                    move: canReorder ? moveHandlers('dishes', group, index) : undefined,
                                  }
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })}
              {ordered.length === 0 && !editing && (
                <EmptyState icon="search" title="Cap plat coincideix">
                  {hiddenCount > 0 && <p>{hiddenCount} plats amagats pel filtre d’al·lèrgies.</p>}
                </EmptyState>
              )}
            </>
          )}
        </div>
      </CatalogLayout>

      {selectedDish && (
        <DishDetail
          key={selectedDish.id}
          dish={selectedDish}
          categoryName={categories.find((c) => c.id === selectedDish.categoryId)?.name ?? 'Menjar'}
          prev={selectedIndex > 0 ? () => route.openItem(ordered[selectedIndex - 1].id) : undefined}
          next={
            selectedIndex >= 0 && selectedIndex < ordered.length - 1
              ? () => route.openItem(ordered[selectedIndex + 1].id)
              : undefined
          }
          onClose={route.close}
          onEdit={() => route.openEdit(selectedDish.id)}
          onDelete={async () => {
            if (await deleteItem(selectedDish)) route.close();
          }}
        />
      )}
      {editing && editTarget && (editingDish || editTarget.startsWith('new')) && (
        <DishForm
          key={editTarget}
          dish={editingDish ?? null}
          defaultCategoryId={newCategoryId}
          onClose={route.close}
          onSaved={(d) => route.openItem(d.id)}
        />
      )}
      {managingCategories && <CategoryManager onClose={() => setManagingCategories(false)} />}
    </>
  );
}
