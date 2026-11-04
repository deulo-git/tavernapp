import { useState } from 'react';
import { newId, nextOrder } from '../../data/actions';
import { useData } from '../../data/store';
import { DRINK_TYPES, DRINK_TYPE_ORDER, type SpecField } from '../../domain/drinkSpecs';
import { decimalToInput, parseDecimal } from '../../domain/format';
import { sourceFields } from '../../domain/translation';
import type { Drink, DrinkType, SpecValue } from '../../domain/types';
import { AllergenPicker } from '../../ui/Allergens';
import { ChipInput } from '../../ui/ChipInput';
import { Segmented, TextArea, TextField, Toggle } from '../../ui/Field';
import { ImagePicker } from '../../ui/ImagePicker';
import { AllergenManager } from '../allergens/AllergenManager';
import { FormSection, FormSheet } from '../forms/FormSheet';
import { TranslationEditor } from '../forms/TranslationEditor';
import { useItemForm } from '../forms/useItemForm';
import s from '../forms/form.module.css';

function emptyDrink(type: DrinkType, order: number): Drink {
  const now = Date.now();
  return {
    id: newId(),
    kind: 'drink',
    type,
    name: '',
    producer: '',
    origin: '',
    abv: null,
    priceGlass: null,
    priceBottle: null,
    allergens: type === 'vi' ? ['sulfits'] : type === 'cervesa' ? ['gluten'] : [],
    traces: [],
    servingTemp: '',
    tastingNotes: '',
    pairing: '',
    explanation: '',
    specs: {},
    order,
    available: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  };
}

/** Number input that keeps what is being typed ("12," ) while storing a parsed number. */
function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(decimalToInput(value));
  const invalid = text.trim() !== '' && parseDecimal(text) === null;
  return (
    <TextField
      label={label}
      value={text}
      inputMode="decimal"
      placeholder={placeholder}
      error={invalid ? 'Ha de ser un número' : null}
      onChange={(v) => {
        setText(v);
        onChange(parseDecimal(v));
      }}
    />
  );
}

function SpecInput({
  field,
  value,
  onChange,
}: {
  field: SpecField;
  value: SpecValue | undefined;
  onChange: (v: SpecValue) => void;
}) {
  switch (field.kind) {
    case 'text':
      return (
        <TextField
          label={field.label}
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      );
    case 'textarea':
      return (
        <TextArea
          label={field.label}
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          rows={3}
          onChange={onChange}
        />
      );
    case 'number':
      return (
        <NumberField
          label={field.label}
          value={(value as number) ?? null}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      );
    case 'list':
      return (
        <ChipInput
          label={field.label}
          values={(value as string[]) ?? []}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      );
    case 'choice':
      return (
        <Segmented
          label={field.label}
          options={(field.options ?? []).map((o) => ({ value: o, label: o }))}
          value={(value as string) ?? null}
          onChange={onChange}
        />
      );
    case 'bool':
      return <Toggle label={field.label} checked={Boolean(value)} onChange={onChange} />;
  }
}

interface Props {
  drink: Drink | null;
  defaultType: DrinkType;
  onClose: () => void;
  onSaved: (drink: Drink) => void;
}

export function DrinkForm({ drink, defaultType, onClose, onSaved }: Props) {
  const { drinks } = useData();
  const [initial] = useState(
    () => drink ?? emptyDrink(defaultType, nextOrder(drinks.filter((d) => d.type === defaultType))),
  );
  const live = drinks.find((d) => d.id === initial.id);
  const form = useItemForm(initial, drink ? live : undefined, onSaved);
  const [managingAllergens, setManagingAllergens] = useState(false);
  const { draft, set } = form;
  const def = DRINK_TYPES[draft.type];

  const setSpec = (key: string, value: SpecValue) =>
    form.setDraft((d) => ({ ...d, specs: { ...d.specs, [key]: value } }));

  const validate = () => {
    if (!draft.name.trim()) return 'Cal posar un nom a la beguda.';
    return null;
  };

  const save = () => {
    // Drop spec values that belong to another drink type (if the type was changed).
    const keys = new Set(def.fields.map((f) => f.key));
    void form.save(validate, (d) => ({
      ...d,
      specs: Object.fromEntries(Object.entries(d.specs).filter(([k]) => keys.has(k))),
    }));
  };

  return (
    <FormSheet
      title={drink ? `Edita: ${drink.name}` : `Nova beguda: ${def.label.toLowerCase()}`}
      dirty={form.dirty}
      conflict={form.conflict}
      saving={form.saving}
      onClose={onClose}
      onSave={save}
    >
      <FormSection title="Informació bàsica">
        <Segmented
          label="Tipus de beguda"
          options={DRINK_TYPE_ORDER.map((t) => ({ value: t, label: DRINK_TYPES[t].label }))}
          value={draft.type}
          allowEmpty={false}
          onChange={(t) => t && set('type', t)}
        />
        <div className={s.grid2}>
          <TextField label="Nom" value={draft.name} onChange={(v) => set('name', v)} autoFocus={!drink} />
          <TextField label={def.producerLabel} value={draft.producer} onChange={(v) => set('producer', v)} />
          <TextField label={def.originLabel} value={draft.origin} onChange={(v) => set('origin', v)} />
          <NumberField
            label="Graduació (% vol.)"
            value={draft.abv}
            placeholder="13,5"
            onChange={(v) => set('abv', v)}
          />
          <NumberField
            label={
              draft.type === 'vi'
                ? 'Preu per copa (€)'
                : draft.type === 'cervesa'
                  ? 'Preu canya / got (€)'
                  : 'Preu per got (€)'
            }
            value={draft.priceGlass}
            onChange={(v) => set('priceGlass', v)}
          />
          <NumberField
            label={draft.type === 'cervesa' ? 'Preu per unitat (€)' : 'Preu per ampolla (€)'}
            value={draft.priceBottle}
            onChange={(v) => set('priceBottle', v)}
          />
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

      <FormSection title={`Especificacions: ${def.label.toLowerCase()}`}>
        <div className={s.grid2}>
          {def.fields.map((f) => (
            <div
              key={`${draft.type}-${f.key}`}
              className={f.kind === 'choice' || f.kind === 'textarea' ? s.span2 : undefined}
            >
              <SpecInput field={f} value={draft.specs[f.key]} onChange={(v) => setSpec(f.key, v)} />
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="Tast i servei">
        <div className={s.grid2}>
          <TextField
            label="Temperatura de servei"
            value={draft.servingTemp}
            placeholder="8–10 °C"
            onChange={(v) => set('servingTemp', v)}
          />
          <TextField
            label="Maridatge"
            value={draft.pairing}
            placeholder="Arrossos, peix…"
            onChange={(v) => set('pairing', v)}
          />
        </div>
        <TextArea label="Notes de tast" value={draft.tastingNotes} rows={3} onChange={(v) => set('tastingNotes', v)} />
      </FormSection>

      <FormSection title="Per al client" note="Aquest text es tradueix automàticament i es pot ensenyar al client.">
        <TextArea
          label="Explicació"
          value={draft.explanation}
          rows={5}
          placeholder="Com és, d'on ve, per què el recomanem…"
          onChange={(v) => set('explanation', v)}
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
          onManage={() => setManagingAllergens(true)}
        />
        {managingAllergens && <AllergenManager onClose={() => setManagingAllergens(false)} />}
      </FormSection>
    </FormSheet>
  );
}
