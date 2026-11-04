import { useNavigate } from 'react-router';
import { TopBar } from '../../app/TopBar';
import { useData } from '../../data/store';
import { RESTAURANT_NAME } from '../../domain/types';
import { Icon, type IconName } from '../../ui/Icon';
import s from './home.module.css';

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { info, dishes, drinks, guides, categories } = useData();

  const tiles: { to: string; label: string; icon: IconName; className: string; count: string }[] = [
    {
      to: '/menjar',
      label: 'Menjar',
      icon: 'plate',
      className: s.menjar,
      count: `${plural(dishes.length, 'plat', 'plats')} · ${plural(categories.length, 'categoria', 'categories')}`,
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
    },
    {
      to: '/informacio',
      label: 'Informació',
      icon: 'info',
      className: s.informacio,
      count: `El restaurant · ${plural(guides.length, 'fitxa', 'fitxes')}`,
    },
  ];

  return (
    <>
      <TopBar title={info?.name || RESTAURANT_NAME} subtitle={info?.tagline} showHome={false} />
      <main className={s.home}>
        {tiles.map((t) => (
          <button key={t.to} type="button" className={`${s.tile} ${t.className}`} onClick={() => navigate(t.to)}>
            <span className={s.iconWrap}>
              <Icon name={t.icon} size={48} strokeWidth={1.6} />
            </span>
            <span>
              <span className={s.label}>{t.label}</span>
              <span className={s.count}>{t.count}</span>
            </span>
          </button>
        ))}
      </main>
    </>
  );
}
