import type { ReactNode } from 'react';
import type { AllergenKey } from '../domain/allergens';
import { allergenInfo } from '../domain/allergens';

// Original pictograms for the 14 EU allergens, drawn white on the allergen's colour.
const seed = (x: number, y: number, rot: number) => (
  <path d="M0 -3c1.6 1.4 1.6 4.6 0 6-1.6-1.4-1.6-4.6 0-6z" transform={`translate(${x} ${y}) rotate(${rot})`} />
);

const ART: Record<AllergenKey, ReactNode> = {
  gluten: (
    <>
      <path d="M12 21V6" />
      <path d="M12 9c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4zM12 9c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4z" />
      <path d="M12 13c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4zM12 13c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4z" />
      <path d="M12 17c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4zM12 17c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4z" />
    </>
  ),
  crustacis: (
    <>
      <path d="M18.5 6C12 6 7 10 7 14.5 7 17 9 19 11.5 19H14" />
      <path d="M14 19l-1.5 2.5M14 19l1.8 2" />
      <path d="M15.5 6.4 14 10.5M11.6 7.6l.9 4.2M8.6 10.3l2.4 3.2" />
      <path d="M18.5 6 21 4M18.5 6H22" />
    </>
  ),
  ous: <path d="M12 3c-3.5 0-6 5.5-6 10a6 6 0 0 0 12 0c0-4.5-2.5-10-6-10z" />,
  peix: (
    <>
      <path d="M2.5 7.5 6 12l-3.5 4.5" />
      <path d="M6 12c2.5-3.5 6-5.5 9-5.5 3.5 0 6 2.5 7 5.5-1 3-3.5 5.5-7 5.5-3 0-6.5-2-9-5.5z" />
      <circle cx="17.5" cy="11" r="0.9" fill="currentColor" />
    </>
  ),
  cacauets: (
    <>
      <path d="M12 3a4 4 0 0 0-4 4c0 1.6.8 2.6.8 3.5S8 12.4 8 14a4 4 0 0 0 8 0c0-1.6-.8-2.5-.8-3.5S16 8.6 16 7a4 4 0 0 0-4-4z" />
      <path d="M10.5 6.5h.01M13.5 7.5h.01M10.5 15h.01M13.5 16h.01" />
    </>
  ),
  soja: (
    <>
      <path d="M5 19c-1-4 1-9 6-12s9-3 9-3 0 5-3 9-8 7-12 6z" />
      <circle cx="9" cy="15" r="1.6" />
      <circle cx="12.5" cy="11.5" r="1.6" />
      <circle cx="16" cy="8" r="1.6" />
    </>
  ),
  llet: (
    <>
      <path d="M9 3h6M9.5 3v3L7 9.5V21h10V9.5L14.5 6V3" />
      <path d="M7 13h10" />
    </>
  ),
  fruitsClosca: (
    <>
      <path d="M5 10.5c0-3.5 3-6 7-6s7 2.5 7 6z" />
      <path d="M6.5 10.5c0 5 2.5 9 5.5 10 3-1 5.5-5 5.5-10" />
      <path d="M12 4.5V2.5" />
    </>
  ),
  api: (
    <>
      <path d="M8.5 21c0-5 .8-9.5 2.5-13M12 21V8M15.5 21c0-5-.8-9.5-2.5-13" />
      <path d="M9 7.5a2 2 0 1 1 2.6-2.8 2 2 0 0 1 3.4.4 2 2 0 1 1 0 2.8" />
    </>
  ),
  mostassa: (
    <>
      <path d="M8 8h8v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z" />
      <path d="M9.5 8V5h5v3M12 5V2.5" />
      <circle cx="10.5" cy="14" r="0.9" fill="currentColor" />
      <circle cx="13.5" cy="14" r="0.9" fill="currentColor" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" />
    </>
  ),
  sesam: (
    <>
      {seed(8, 7, -20)}
      {seed(15.5, 6.5, 25)}
      {seed(11.5, 13, 5)}
      {seed(6.5, 16.5, 40)}
      {seed(16.5, 16, -35)}
    </>
  ),
  sulfits: (
    <>
      <circle cx="12" cy="13" r="3" />
      <circle cx="5.5" cy="7.5" r="2.2" />
      <circle cx="18.5" cy="7.5" r="2.2" />
      <path d="M7.3 9l2.4 2.2M16.7 9l-2.4 2.2" />
      <path d="M12 16v4" />
    </>
  ),
  tramussos: (
    <>
      <path d="M12 22V6" />
      <path d="M12 19c-3 0-5-1-6-3 3 0 5 1 6 3z" />
      <circle cx="12" cy="4.5" r="1.5" />
      <circle cx="9.5" cy="8" r="1.5" />
      <circle cx="14.5" cy="8" r="1.5" />
      <circle cx="9.5" cy="11.5" r="1.5" />
      <circle cx="14.5" cy="11.5" r="1.5" />
    </>
  ),
  molluscs: (
    <>
      <path d="M12 20 4 10a8 8 0 0 1 16 0z" />
      <path d="M12 20 8.5 5.2M12 20V4M12 20l3.5-14.8" />
      <path d="M10 20h4v1.5h-4z" />
    </>
  ),
};

interface Props {
  allergen: AllergenKey;
  size?: number;
  /** Outlined style, used for "may contain traces". */
  outline?: boolean;
}

export function AllergenIcon({ allergen, size = 40, outline = false }: Props) {
  const { color } = allergenInfo(allergen);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle
        cx="16"
        cy="16"
        r="15"
        fill={outline ? 'var(--surface)' : color}
        stroke={color}
        strokeWidth={outline ? 2 : 0}
        strokeDasharray={outline ? '3 2.4' : undefined}
      />
      <g
        transform="translate(4 4)"
        fill="none"
        stroke={outline ? color : '#fff'}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ART[allergen]}
      </g>
    </svg>
  );
}
