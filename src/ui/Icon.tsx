import type { SVGProps } from 'react';

// Small hand-drawn 24×24 line icon set (no icon font, so it works offline and stays tiny).
type Shape =
  string | { c: [number, number, number]; fill?: boolean } | { r: [number, number, number, number, number?] };

const ICONS = {
  home: ['M3 11 12 4l9 7', 'M5 10v10h5v-6h4v6h5V10'],
  back: ['M19 12H5', 'M11 6l-6 6 6 6'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  plus: ['M12 5v14', 'M5 12h14'],
  edit: ['M4 20h4L19 9l-4-4L4 16z', 'M13.5 6.5l4 4'],
  trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13', 'M10 11v6', 'M14 11v6'],
  up: ['M12 19V5', 'M6 11l6-6 6 6'],
  down: ['M12 5v14', 'M6 13l6 6 6-6'],
  search: [{ c: [11, 11, 7] }, 'M20 20l-4-4'],
  filter: ['M4 5h16l-6 8v6l-4-2v-4z'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  wifi: [
    'M2.5 9a14 14 0 0 1 19 0',
    'M5.5 12.5a9.5 9.5 0 0 1 13 0',
    'M8.5 16a5 5 0 0 1 7 0',
    { c: [12, 19.5, 1], fill: true },
  ],
  globe: [
    { c: [12, 12, 9] },
    'M3 12h18',
    'M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
  ],
  present: [{ r: [3, 4, 18, 12, 2] }, 'M8 20h8', 'M12 16v4'],
  lock: [{ r: [5, 11, 14, 10, 2] }, 'M8 11V8a4 4 0 0 1 8 0v3'],
  unlock: [{ r: [5, 11, 14, 10, 2] }, 'M8 11V8a4 4 0 0 1 7.6-1.7'],
  cloud: ['M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 10.5 3.75 3.75 0 0 1 17.5 18z'],
  cloudOff: ['M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 10.5 3.75 3.75 0 0 1 17.5 18z', 'M3 3l18 18'],
  chevronLeft: ['M15 5l-7 7 7 7'],
  chevronRight: ['M9 5l7 7-7 7'],
  camera: ['M4 8h3l2-3h6l2 3h3v11H4z', { c: [12, 13, 3.5] }],
  image: [{ r: [3, 4, 18, 16, 2] }, { c: [8.5, 9.5, 1.5] }, 'M21 16l-5-5L5 20'],
  translate: [
    'M4 5h9',
    'M8.5 3v2',
    'M11 5c-1 4-3.5 7-7 9',
    'M6.5 8.5c1.5 2.5 3.5 4 6 5',
    'M13 21l4-9 4 9',
    'M14.5 18h5',
  ],
  settings: [
    'M4 6h9',
    'M17 6h3',
    { c: [15, 6, 2] },
    'M4 12h3',
    'M11 12h9',
    { c: [9, 12, 2] },
    'M4 18h11',
    'M19 18h1',
    { c: [17, 18, 2] },
  ],
  info: [{ c: [12, 12, 9] }, 'M12 11v6', { c: [12, 7.5, 1], fill: true }],
  plate: ['M7 3v18', 'M4.5 3v5a2.5 2.5 0 0 0 5 0V3', 'M17 21V3c-2 1.5-3 4-3 7v3h3'],
  wine: ['M7 3h10l-.5 6a4.5 4.5 0 0 1-9 0z', 'M12 13.5V20', 'M8 21h8', 'M7.3 7h9.4'],
  beer: [
    'M5 7h11v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z',
    'M16 10h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2',
    'M9 11v6',
    'M12 11v6',
    'M5 7a2.5 2.5 0 0 1 4-2.4 2.5 2.5 0 0 1 4 0A2.5 2.5 0 0 1 16 7',
  ],
  bottle: ['M10 2h4v4l2 3v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3z', 'M8 13h8', 'M8 17h8'],
  refresh: ['M20 11a8 8 0 0 0-14.5-4.5L4 8', 'M4 3v5h5', 'M4 13a8 8 0 0 0 14.5 4.5L20 16', 'M20 21v-5h-5'],
  download: ['M12 3v12', 'M7 10l5 5 5-5', 'M4 20h16'],
  upload: ['M12 15V3', 'M7 8l5-5 5 5', 'M4 20h16'],
  tablet: [{ r: [3, 5, 18, 14, 2] }, { c: [18, 12, 0.8], fill: true }],
  star: ['M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'],
  leaf: ['M5 19c0-8 5-14 15-14 0 10-6 15-14 15', 'M5 19l7-7'],
  chili: ['M14 6c3 0 5 2 5 5 0 6-7 10-14 10 4-3 5-6 5-10 0-3 2-5 4-5z', 'M14 6c0-2 1-3 3-3'],
  alert: ['M12 3 2 20h20z', 'M12 10v4', { c: [12, 17, 0.9], fill: true }],
  qr: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h2v2h-2z', 'M18 18h2v2h-2z', 'M14 19h2', 'M19 14h1'],
  phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2'],
  mapPin: ['M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z', { c: [12, 10, 2.5] }],
  clock: [{ c: [12, 12, 9] }, 'M12 7v5l3 2'],
  link: ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1', 'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'],
  book: ['M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z', 'M4 21a2 2 0 0 1 2-2h13'],
  sun: [
    { c: [12, 12, 4] },
    'M12 2v2',
    'M12 20v2',
    'M2 12h2',
    'M20 12h2',
    'M4.9 4.9l1.4 1.4',
    'M17.7 17.7l1.4 1.4',
    'M4.9 19.1l1.4-1.4',
    'M17.7 6.3l1.4-1.4',
  ],
  moon: ['M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z'],
  mail: [{ r: [3, 5, 18, 14, 2] }, 'M3 7l9 6 9-6'],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z', { c: [12, 12, 3] }],
  key: [{ c: [8, 15, 4] }, 'M11 12l9-9', 'M17 6l3 3', 'M15 8l2 2'],
  backspace: ['M9 5h11v14H9l-6-7z', 'M12 9l5 6', 'M17 9l-5 6'],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 24, strokeWidth = 2, ...rest }: Props) {
  const shapes: Shape[] = ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {shapes.map((s, i) => {
        if (typeof s === 'string') return <path key={i} d={s} />;
        if ('c' in s)
          return <circle key={i} cx={s.c[0]} cy={s.c[1]} r={s.c[2]} fill={s.fill ? 'currentColor' : 'none'} />;
        return <rect key={i} x={s.r[0]} y={s.r[1]} width={s.r[2]} height={s.r[3]} rx={s.r[4] ?? 0} />;
      })}
    </svg>
  );
}
