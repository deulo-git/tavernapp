import { Navigate, useNavigate, useParams } from 'react-router';
import { TopBar } from '../../app/TopBar';
import { useData } from '../../data/store';
import { useEditMode } from '../edit-mode/editMode';
import { CatalogLayout, RailButton } from '../catalog/CatalogParts';
import { SettingsPanel } from '../settings/SettingsPanel';
import { GuidesView } from './GuidesView';
import { RestaurantView } from './RestaurantView';
import s from '../catalog/catalog.module.css';

const TABS = ['restaurant', 'fitxes', 'configuracio'] as const;
type Tab = (typeof TABS)[number];

export function InformacioScreen() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { guides } = useData();
  const { editing } = useEditMode();

  if (!TABS.includes(tab as Tab)) return <Navigate to="/informacio/restaurant" replace />;
  if (tab === 'configuracio' && !editing) return <Navigate to="/informacio/restaurant" replace />;
  const go = (t: Tab) => navigate(`/informacio/${t}`, { replace: true });

  return (
    <>
      <TopBar title="Informació" />
      <CatalogLayout
        railLabel="Seccions"
        rail={
          <>
            <RailButton
              label="El restaurant"
              icon="home"
              active={tab === 'restaurant'}
              onClick={() => go('restaurant')}
            />
            <RailButton
              label="Fitxes per al client"
              icon="globe"
              count={guides.length}
              active={tab === 'fitxes'}
              onClick={() => go('fitxes')}
            />
            <span className={s.railSpacer} />
            {editing && (
              <RailButton
                label="Configuració"
                icon="settings"
                active={tab === 'configuracio'}
                onClick={() => go('configuracio')}
              />
            )}
          </>
        }
      >
        <div className={s.scroll} style={{ paddingTop: 20 }}>
          {tab === 'restaurant' && <RestaurantView />}
          {tab === 'fitxes' && <GuidesView />}
          {tab === 'configuracio' && <SettingsPanel />}
        </div>
      </CatalogLayout>
    </>
  );
}
