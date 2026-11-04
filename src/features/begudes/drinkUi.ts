import { formatAbv, formatPrice } from '../../domain/format';
import type { Drink, DrinkType } from '../../domain/types';
import type { IconName } from '../../ui/Icon';

export const DRINK_ICON: Record<DrinkType, IconName> = { vi: 'wine', cervesa: 'beer', licor: 'bottle' };

export function drinkPriceLabel(d: Drink): string {
  const parts = [
    d.priceGlass !== null
      ? `${formatPrice(d.priceGlass)} ${d.type === 'vi' ? 'copa' : d.type === 'cervesa' ? 'canya' : 'got'}`
      : '',
    d.priceBottle !== null
      ? `${formatPrice(d.priceBottle)} ${d.type === 'licor' ? 'ampolla' : d.type === 'cervesa' ? 'unitat' : 'ampolla'}`
      : '',
  ].filter(Boolean);
  return parts.join(' · ');
}

export function drinkSubtitle(d: Drink): string {
  return [d.producer, d.origin, d.abv !== null ? formatAbv(d.abv) : ''].filter(Boolean).join(' · ');
}
