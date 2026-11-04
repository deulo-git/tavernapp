import type { UiLang } from './allergens';
import type { DishTag } from './types';

// Fixed labels for the customer-facing view (the content itself is translated by DeepL).

export const PRESENT_LABELS = {
  ingredients: { ca: 'Ingredients', es: 'Ingredientes', en: 'Ingredients', fr: 'Ingrédients' },
  origin: { ca: 'Origen', es: 'Origen', en: 'Origin', fr: 'Origine' },
  producer: { ca: 'Elaborat per', es: 'Elaborado por', en: 'Made by', fr: 'Élaboré par' },
  grapes: { ca: 'Varietats', es: 'Variedades', en: 'Grape varieties', fr: 'Cépages' },
  vintage: { ca: 'Anyada', es: 'Añada', en: 'Vintage', fr: 'Millésime' },
  abv: { ca: 'Graduació', es: 'Graduación', en: 'Alcohol', fr: 'Alcool' },
  glass: { ca: 'Copa', es: 'Copa', en: 'Glass', fr: 'Verre' },
  bottle: { ca: 'Ampolla', es: 'Botella', en: 'Bottle', fr: 'Bouteille' },
  diet: { ca: 'Apte per a', es: 'Apto para', en: 'Suitable for', fr: 'Convient aux' },
} satisfies Record<string, Record<UiLang, string>>;

export const TAG_LABELS: Record<DishTag, Record<UiLang, string>> = {
  recomanat: { ca: 'Recomanat de la casa', es: 'Recomendado de la casa', en: 'House favourite', fr: 'Coup de cœur' },
  temporada: { ca: 'De temporada', es: 'De temporada', en: 'Seasonal', fr: 'De saison' },
  vegetaria: { ca: 'Vegetarià', es: 'Vegetariano', en: 'Vegetarian', fr: 'Végétarien' },
  vega: { ca: 'Vegà', es: 'Vegano', en: 'Vegan', fr: 'Végétalien' },
  senseGluten: { ca: 'Apte per a celíacs', es: 'Apto para celíacos', en: 'Gluten-free', fr: 'Sans gluten' },
  picant: { ca: 'Picant', es: 'Picante', en: 'Spicy', fr: 'Épicé' },
};
