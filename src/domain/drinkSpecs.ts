import type { Drink, DrinkType, SpecValue } from './types';

// Single source of truth for the type-specific drink fields: the edit form and the
// detail spec table are both generated from these definitions.

export type SpecFieldKind = 'text' | 'textarea' | 'number' | 'list' | 'choice' | 'bool';

export interface SpecField {
  key: string;
  label: string;
  kind: SpecFieldKind;
  options?: string[];
  placeholder?: string;
}

export interface DrinkTypeDef {
  label: string;
  plural: string;
  producerLabel: string;
  originLabel: string;
  /** Spec field used for the filter chips in the drinks list. */
  filterKey: string;
  fields: SpecField[];
}

export const DRINK_TYPE_ORDER: DrinkType[] = ['vi', 'cervesa', 'licor'];

export const DRINK_TYPES: Record<DrinkType, DrinkTypeDef> = {
  vi: {
    label: 'Vi',
    plural: 'Vins',
    producerLabel: 'Celler',
    originLabel: 'D.O. / Regió',
    filterKey: 'estil',
    fields: [
      {
        key: 'estil',
        label: 'Tipus de vi',
        kind: 'choice',
        options: ['Negre', 'Blanc', 'Rosat', 'Escumós', 'Dolç', 'Ranci', 'Taronja'],
      },
      { key: 'varietats', label: 'Varietats de raïm', kind: 'list', placeholder: 'Garnatxa, Carinyena…' },
      { key: 'anyada', label: 'Anyada', kind: 'number', placeholder: '2022' },
      { key: 'crianca', label: 'Criança', kind: 'text', placeholder: '12 mesos en bóta de roure francès' },
      {
        key: 'elaboracio',
        label: 'Elaboració',
        kind: 'choice',
        options: ['Convencional', 'Ecològic', 'Biodinàmic', 'Natural'],
      },
    ],
  },
  cervesa: {
    label: 'Cervesa',
    plural: 'Cerveses',
    producerLabel: 'Cerveseria',
    originLabel: 'Origen',
    filterKey: 'estil',
    fields: [
      {
        key: 'estil',
        label: 'Estil',
        kind: 'choice',
        options: [
          'Lager',
          'Pilsner',
          'IPA',
          'APA',
          'Pale Ale',
          'Blat',
          'Stout',
          'Porter',
          'Amber',
          'Sour',
          'Sense alcohol',
          'Altres',
        ],
      },
      { key: 'format', label: 'Format', kind: 'choice', options: ['Ampolla', 'Llauna', 'Barril'] },
      { key: 'ibu', label: 'Amargor (IBU)', kind: 'number', placeholder: '35' },
      { key: 'artesana', label: 'Cervesa artesana', kind: 'bool' },
    ],
  },
  licor: {
    label: 'Licor',
    plural: 'Licors',
    producerLabel: 'Marca / Destil·leria',
    originLabel: 'Origen',
    filterKey: 'categoria',
    fields: [
      {
        key: 'categoria',
        label: 'Categoria',
        kind: 'choice',
        options: [
          'Whisky',
          'Rom',
          'Ginebra',
          'Vodka',
          'Brandi / Conyac',
          'Tequila / Mescal',
          "Licor d'herbes",
          'Ratafia',
          'Vermut',
          'Crema / Licor dolç',
          'Aiguardent',
          'Altres',
        ],
      },
      { key: 'envelliment', label: 'Envelliment', kind: 'text', placeholder: '12 anys en bóta de roure' },
      {
        key: 'servei',
        label: 'Com servir-lo',
        kind: 'textarea',
        placeholder: 'Sol, amb gel, amb tònica i pell de llimona…',
      },
    ],
  },
};

export function formatSpecValue(value: SpecValue | undefined): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Sí' : '';
  return String(value);
}

/** Label/value rows for the drink detail table, skipping empty values. */
export function drinkSpecRows(drink: Drink, formatAbv: (n: number) => string): { label: string; value: string }[] {
  const def = DRINK_TYPES[drink.type];
  const rows: { label: string; value: string }[] = [
    { label: def.producerLabel, value: drink.producer },
    { label: def.originLabel, value: drink.origin },
    ...def.fields.map((f) => ({ label: f.label, value: formatSpecValue(drink.specs[f.key]) })),
    { label: 'Graduació', value: drink.abv !== null ? formatAbv(drink.abv) : '' },
    { label: 'Temperatura de servei', value: drink.servingTemp },
  ];
  return rows.filter((r) => r.value.trim() !== '');
}

export function drinkFilterValue(drink: Drink): string {
  return formatSpecValue(drink.specs[DRINK_TYPES[drink.type].filterKey]);
}
