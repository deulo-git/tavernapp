import { useData } from '../data/store';
import { Icon } from '../ui/Icon';
import s from './app.module.css';

export function SyncIndicator() {
  const { repo, sync } = useData();

  if (repo.mode === 'demo') {
    return (
      <span className={`${s.sync} ${s.syncDemo}`} title="Les dades només es desen en aquesta tablet">
        <Icon name="tablet" size={20} /> Mode demo
      </span>
    );
  }
  if (!sync.online) {
    return (
      <span className={`${s.sync} ${s.syncOffline}`} title="Els canvis s'enviaran quan torni la connexió">
        <Icon name="cloudOff" size={20} />
        {sync.pendingWrites > 0 ? `Sense connexió · ${sync.pendingWrites} pendents` : 'Sense connexió'}
      </span>
    );
  }
  if (sync.pendingWrites > 0) {
    return (
      <span className={s.sync}>
        <Icon name="refresh" size={20} /> Desant…
      </span>
    );
  }
  return (
    <span className={`${s.sync} ${s.syncOk}`}>
      <Icon name="cloud" size={20} /> Sincronitzat
    </span>
  );
}
