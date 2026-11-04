import { useState } from 'react';
import { useData } from '../../data/store';
import type { RestaurantInfo } from '../../domain/types';
import { emptyRestaurantInfo } from '../../domain/types';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import { Icon, type IconName } from '../../ui/Icon';
import { useEditMode } from '../edit-mode/editMode';
import { RestaurantForm } from './RestaurantForm';
import { WifiQr } from './WifiQr';
import s from './info.module.css';

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className={s.fact}>
      <span className={s.factIcon}>
        <Icon name={icon} />
      </span>
      <div>
        <div className={s.factLabel}>{label}</div>
        <div className={s.factValue}>{value}</div>
      </div>
    </div>
  );
}

export function RestaurantView() {
  const { info } = useData();
  const { editing } = useEditMode();
  const [editingInfo, setEditingInfo] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const data: RestaurantInfo = info ?? emptyRestaurantInfo();
  const hasFacts = [data.hours, data.address, data.phone, data.email, data.web, data.instagram].some((v) => v.trim());
  const hasStory = data.history.trim() || data.sections.length > 0;

  return (
    <>
      <div className={s.toolbarRow}>
        <div>
          <h2 style={{ fontSize: 34 }}>{data.name || 'El restaurant'}</h2>
          {data.tagline && <p style={{ color: 'var(--muted)' }}>{data.tagline}</p>}
        </div>
        {editing && (
          <Button variant="edit" size="lg" icon="edit" onClick={() => setEditingInfo(true)}>
            Edita les dades
          </Button>
        )}
      </div>

      {!hasFacts && !hasStory && !data.wifiSsid ? (
        <EmptyState icon="info" title="Encara no hi ha dades del restaurant">
          {!editing && <p>Entra al mode edició per afegir horaris, contacte, wifi i història.</p>}
        </EmptyState>
      ) : (
        <div className={s.page}>
          <div className={s.stack}>
            {data.wifiSsid && (
              <div className={s.wifi}>
                <div className={s.factLabel}>
                  <Icon name="wifi" size={18} /> Wi-Fi per als clients
                </div>
                <div className={s.factValue}>{data.wifiSsid}</div>
                {data.wifiPassword && <div className={s.wifiPass}>{data.wifiPassword}</div>}
                <Button variant="primary" size="lg" icon="qr" onClick={() => setShowQr(true)}>
                  Mostra el QR del wifi
                </Button>
              </div>
            )}
            {hasFacts && (
              <section className={s.card}>
                <h3 className={s.cardTitle}>Fitxa ràpida</h3>
                <div className={s.facts}>
                  <Fact icon="clock" label="Horari" value={data.hours} />
                  <Fact icon="mapPin" label="Adreça" value={data.address} />
                  <Fact icon="phone" label="Telèfon" value={data.phone} />
                  <Fact icon="mail" label="Correu" value={data.email} />
                  <Fact icon="link" label="Web" value={data.web} />
                  <Fact icon="camera" label="Instagram" value={data.instagram} />
                </div>
              </section>
            )}
          </div>
          <div className={s.stack}>
            {data.history.trim() && (
              <section className={s.card}>
                <h3 className={s.cardTitle}>La nostra història</h3>
                <p className={s.text}>{data.history}</p>
              </section>
            )}
            {data.sections.map((sec, i) => (
              <section key={i} className={s.card}>
                <h3 className={s.cardTitle}>{sec.title}</h3>
                <p className={s.text}>{sec.body}</p>
              </section>
            ))}
          </div>
        </div>
      )}

      {editingInfo && <RestaurantForm info={data} onClose={() => setEditingInfo(false)} />}
      {showQr && <WifiQr ssid={data.wifiSsid} password={data.wifiPassword} onClose={() => setShowQr(false)} />}
    </>
  );
}
