import { useNavigate } from 'react-router';
import { TopBar } from '../../app/TopBar';
import { useData } from '../../data/store';
import type { CatalogItem } from '../../domain/types';
import { RESTAURANT_NAME } from '../../domain/types';
import { Icon, type IconName } from '../../ui/Icon';
import s from './home.module.css';

const COLLAGE_SIZE = 4;

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Up to four photos, taking one per group first so the collage shows variety. */
function collagePhotos(items: CatalogItem[], groupOf: (item: CatalogItem) => string): string[] {
  const withPhoto = items.filter((i) => i.image);
  const firstOfEachGroup = [...new Map(withPhoto.map((i) => [groupOf(i), i] as const)).values()];
  const rest = withPhoto.filter((i) => !firstOfEachGroup.includes(i));
  return [...firstOfEachGroup, ...rest].slice(0, COLLAGE_SIZE).map((i) => i.image!.thumb);
}

function Collage({ photos, icon }: { photos: string[]; icon: IconName }) {
  if (!photos.length) {
    return (
      <span className={`${s.collage} ${s.collageEmpty}`}>
        <Icon name={icon} size={72} strokeWidth={1.4} />
      </span>
    );
  }
  return (
    <span className={s.collage} data-count={photos.length}>
      {photos.map((src, i) => (
        <img key={i} src={src} alt="" loading="lazy" decoding="async" />
      ))}
    </span>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { info, dishes, drinks, guides, categories } = useData();

  const tiles: {
    to: string;
    label: string;
    icon: IconName;
    className: string;
    count: string;
    photos: string[];
  }[] = [
    {
      to: '/menjar',
      label: 'Menjar',
      icon: 'plate',
      className: s.menjar,
      count: `${plural(dishes.length, 'plat', 'plats')} · ${plural(categories.length, 'categoria', 'categories')}`,
      photos: collagePhotos(dishes, (i) => (i.kind === 'dish' ? i.categoryId : '')),
    },
    {
      to: '/begudes',
      label: 'Begudes',
      icon: 'wine',
      className: s.begudes,
      count: `${plural(drinks.filter((d) => d.type === 'vi').length, 'vi', 'vins')} · ${plural(
        drinks.filter((d) => d.type === 'cervesa').length,
        'cervesa',
        'cerveses',
      )} · ${plural(drinks.filter((d) => d.type === 'licor').length, 'licor', 'licors')}`,
      photos: collagePhotos(drinks, (i) => (i.kind === 'drink' ? i.type : '')),
    },
    {
      to: '/informacio',
      label: 'Informació',
      icon: 'info',
      className: s.informacio,
      count: `El restaurant · ${plural(guides.length, 'fitxa', 'fitxes')}`,
      photos: collagePhotos(guides, (i) => (i.kind === 'guide' ? i.topic : '')),
    },
  ];

  return (
    <>
      <TopBar title={info?.name || RESTAURANT_NAME} subtitle={info?.tagline} showHome={false} />
      <main className={s.home}>
        {tiles.map((t) => (
          <button key={t.to} type="button" className={`${s.tile} ${t.className}`} onClick={() => navigate(t.to)}>
            <Collage photos={t.photos} icon={t.icon} />
            <span className={s.caption}>
              <span className={s.label}>{t.label}</span>
              <span className={s.count}>{t.count}</span>
            </span>
          </button>
        ))}
      </main>
    </>
  );
}
