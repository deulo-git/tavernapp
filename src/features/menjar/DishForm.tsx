import { useState } from 'react';
import { newId, nextOrder } from '../../data/actions';
import { useData } from '../../data/store';
import { decimalToInput, parseDecimal } from '../../domain/format';
import { sourceFields } from '../../domain/translation';
import type { Dish } from '../../domain/types';
import { DISH_TAGS } from '../../domain/types';
import { AllergenPicker } from '../../ui/Allergens';
import { ChipInput } from '../../ui/ChipInput';
import { MultiSelect, Segmented, TextArea, TextField, Toggle } from '../../ui/Field';
import { ImagePicker } from '../../ui/ImagePicker';
import { FormSection, FormSheet } from '../forms/FormSheet';
import { TranslationEditor } from '../forms/TranslationEditor';
import { useItemForm } from '../forms/useItemForm';
import s from '../forms/form.module.css';

function emptyDish(categoryId: string, order: number): Dish {
  const now = Date.now();
  return {
    id: newId(),
    kind: 'dish',
    name: '',
    categoryId,
    price: null,
    tags: [],
    ingredients: [],
    allergens: [],
    traces: [],
    preparation: '',
    explanation: '',
    pairings: [],
    order,
    available: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  };
}

interface Props {
  dish: Dish | null;
  defaultCategoryId: string;
  onClose: () => void;
  onSaved: (dish: Dish) => void;
}

export function DishForm({ dish, defaultCategoryId, onClose, onSaved }: Props) {
  const { dishes, drinks, categories } = useData();
  const [initial] = useState(
    () => dish ?? emptyDish(defaultCategoryId, nextOrder(dishes.filter((d) => d.categoryId === defaultCategoryId))),
  );
  const live = dishes.find((d) => d.id === initial.id);
  const form = useItemForm(initial, dish ? live : undefined, onSaved);
  const { draft, set } = form;
  const [priceText, setPriceText] = useState(decimalToInput(initial.price));

  const validate = () => {
    if (!draft.name.trim()) return 'Cal posar un nom al plat.';
    if (!draft.categoryId) return 'Tria una categoria.';
    if (priceText.trim() && parseDecimal(priceText) === null) return 'El preu no és vàlid.';
    return null;
  };

  return (
    <FormSheet
      title={dish ? `Edita: ${dish.name}` : 'Nou plat'}
      dirty={form.dirty || priceText !== decimalToInput(initial.price)}
      conflict={form.conflict}
      saving={form.saving}
      onClose={onClose}
      onSave={() => form.save(validate)}
    >
      <FormSection title="Informació bàsica">
        <div className={s.grid2}>
          <TextField
            label="Nom del plat"
            value={draft.name}
            onChange={(v) => set('name', v)}
            placeholder="Escalivada amb anxoves"
            autoFocus={!dish}
          />
          <TextField
            label="Preu (€)"
            value={priceText}
            inputMode="decimal"
            placeholder="12,50"
            onChange={(v) => {
              setPriceText(v);
              set('price', parseDecimal(v));
            }}
          />
          <div className={s.span2}>
            <Segmented
              label="Categoria"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={draft.categoryId}
              allowEmpty={false}
              onChange={(v) => v && set('categoryId', v)}
            />
          </div>
          <div className={s.span2}>
            <MultiSelect
              label="Etiquetes"
              options={DISH_TAGS.map((t) => ({ value: t.key, label: t.label }))}
              value={draft.tags}
              onChange={(v) => set('tags', v)}
            />
          </div>
          <Toggle
            label="Disponible (desmarca-ho si està esgotat)"
            checked={draft.available}
            onChange={(v) => set('available', v)}
          />
        </div>
        <ImagePicker
          preview={form.previewImage}
          onSelect={(image) => form.setImageChange({ kind: 'set', image })}
          onRemove={() => form.setImageChange({ kind: 'remove' })}
        />
      </FormSection>

      <FormSection title="Per al client" note="Aquest text es tradueix automàticament i es pot ensenyar al client.">
        <TextArea
          label="Explicació del plat"
          value={draft.explanation}
          rows={5}
          placeholder="Què és, d'on ve, com es menja…"
          onChange={(v) => set('explanation', v)}
        />
        <ChipInput
          label="Ingredients"
          values={draft.ingredients}
          onChange={(v) => set('ingredients', v)}
          placeholder="Escriu un ingredient i prem Retorn"
          hint="Pots afegir-ne diversos separats per comes."
        />
      </FormSection>

      <TranslationEditor
        fields={sourceFields(draft)}
        draft={form.trDraft}
        onChange={form.setTrDraft}
        savedStatus={initial.tr?.status}
        savedError={initial.tr?.error}
      />

      <FormSection title="Al·lèrgens">
        <AllergenPicker
          allergens={draft.allergens}
          traces={draft.traces}
          onChange={({ allergens, traces }) => form.setDraft((d) => ({ ...d, allergens, traces }))}
        />
      </FormSection>

      <FormSection title="Cuina" note="Només per al personal: no es mostra mai al client.">
        <TextArea
          label="Manera de preparació"
          value={draft.preparation}
          rows={5}
          onChange={(v) => set('preparation', v)}
        />
        {drinks.length > 0 && (
          <MultiSelect
            label="Begudes recomanades (maridatge)"
            options={drinks.map((d) => ({ value: d.id, label: d.name }))}
            value={draft.pairings}
            onChange={(v) => set('pairings', v)}
          />
        )}
      </FormSection>
    </FormSheet>
  );
}
