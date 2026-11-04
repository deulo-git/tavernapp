import type { AllergenKey } from './allergens';

export type Lang = 'es' | 'en' | 'fr';
export const TRANSLATED_LANGS: Lang[] = ['es', 'en', 'fr'];

export const LANG_NAMES: Record<'ca' | Lang, string> = {
  ca: 'Català',
  es: 'Castellano',
  en: 'English',
  fr: 'Français',
};

/** Auto-translated customer-facing text. Field keys match `sourceFields()` for each kind. */
export interface Translations {
  es?: Record<string, string>;
  en?: Record<string, string>;
  fr?: Record<string, string>;
  /** Hash of the Catalan source the translations were made from. */
  srcHash: string;
  status: 'ok' | 'pending' | 'error';
  /** True when someone corrected the translations by hand. */
  manual?: boolean;
  error?: string;
}

export interface ImageRef {
  /** Version, bumped whenever the image changes, so cached full-size copies can be invalidated. */
  v: number;
  /** Small JPEG data URL used in lists. The full-size image lives in images/{itemId}. */
  thumb: string;
}

interface BaseItem {
  id: string;
  order: number;
  available: boolean;
  image: ImageRef | null;
  tr?: Translations;
  createdAt: number;
  updatedAt: number;
  updatedBy?: string;
}

export const DISH_TAGS = [
  { key: 'recomanat', label: 'Recomanat de la casa' },
  { key: 'temporada', label: 'De temporada' },
  { key: 'vegetaria', label: 'Vegetarià' },
  { key: 'vega', label: 'Vegà' },
  { key: 'senseGluten', label: 'Apte per a celíacs' },
  { key: 'picant', label: 'Picant' },
] as const;
export type DishTag = (typeof DISH_TAGS)[number]['key'];

export interface Dish extends BaseItem {
  kind: 'dish';
  name: string;
  categoryId: string;
  price: number | null;
  tags: DishTag[];
  ingredients: string[];
  allergens: AllergenKey[];
  traces: AllergenKey[];
  /** Staff only: how it is prepared. Never shown in "show to customer" mode. */
  preparation: string;
  /** Customer-facing explanation, in Catalan. Translated to ES/EN/FR. */
  explanation: string;
  /** Recommended drinks (ids). */
  pairings: string[];
}

export type DrinkType = 'vi' | 'cervesa' | 'licor';

export type SpecValue = string | string[] | number | boolean | null;

export interface Drink extends BaseItem {
  kind: 'drink';
  type: DrinkType;
  name: string;
  producer: string;
  origin: string;
  abv: number | null;
  priceGlass: number | null;
  priceBottle: number | null;
  allergens: AllergenKey[];
  traces: AllergenKey[];
  servingTemp: string;
  tastingNotes: string;
  pairing: string;
  explanation: string;
  /** Type-specific fields, defined in drinkSpecs.ts. */
  specs: Record<string, SpecValue>;
}

export const GUIDE_TOPICS = [
  { key: 'girona', label: 'Girona' },
  { key: 'cultura', label: 'Cultura i tradicions' },
  { key: 'gastronomia', label: 'Gastronomia' },
  { key: 'serveis', label: 'Serveis i consells' },
  { key: 'altres', label: 'Altres' },
] as const;
export type GuideTopic = (typeof GUIDE_TOPICS)[number]['key'];

export interface Guide extends BaseItem {
  kind: 'guide';
  title: string;
  topic: GuideTopic;
  /** Catalan text for the staff to explain to customers. Translated to ES/EN/FR. */
  body: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface InfoSection {
  title: string;
  body: string;
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  web: string;
  instagram: string;
  hours: string;
  wifiSsid: string;
  wifiPassword: string;
  history: string;
  sections: InfoSection[];
  updatedAt: number;
}

export interface AppConfig {
  pinHash: string;
  pinSalt: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  pairedAt: number;
  lastSeen?: number;
}

export type CatalogItem = Dish | Drink | Guide;
export type ItemCollection = 'dishes' | 'drinks' | 'guides';
export type CollectionName = ItemCollection | 'categories';

export const COLLECTION_OF: Record<CatalogItem['kind'], ItemCollection> = {
  dish: 'dishes',
  drink: 'drinks',
  guide: 'guides',
};

export function itemTitle(item: CatalogItem): string {
  return item.kind === 'guide' ? item.title : item.name;
}

export function emptyRestaurantInfo(name = ''): RestaurantInfo {
  return {
    name,
    tagline: '',
    address: '',
    phone: '',
    email: '',
    web: '',
    instagram: '',
    hours: '',
    wifiSsid: '',
    wifiPassword: '',
    history: '',
    sections: [],
    updatedAt: Date.now(),
  };
}
