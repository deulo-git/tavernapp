import { useData } from '../data/store';
import { Icon } from '../ui/Icon';
import s from './app.module.css';

/** Only visible when the tablet is offline: changes are kept and sent later. */
export function SyncIndicator() {
  const { sync } = useData();
  if (sync.online) return null;
  return (
    <span className={`${s.sync} ${s.syncOffline}`} title="Els canvis s'enviaran quan torni la connexió">
      <Icon name="cloudOff" size={20} />
      {sync.pendingWrites > 0 ? `Sense connexió · ${sync.pendingWrites} pendents` : 'Sense connexió'}
    </span>
  );
}
