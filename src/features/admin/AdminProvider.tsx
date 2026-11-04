import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ADMIN_PIN_CONFIG, hashPin } from '../../domain/security';
import { Button } from '../../ui/Button';
import { PinPad } from '../../ui/PinPad';
import { AdminContext, type AdminApi } from './adminMode';
import { SizesPanel } from './SizesPanel';
import overlay from '../../ui/overlay.module.css';

/**
 * Admin access (password 1111): opens a panel docked on the left to tune the interface sizes.
 * The panel is not modal, so the screens behind it can be browsed to see the changes live.
 */
export function AdminProvider({ children }: { children: ReactNode }) {
  const [askingPin, setAskingPin] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const requestAdmin = useCallback(() => {
    setAskingPin(true);
  }, []);

  const checkPin = async (pin: string) => {
    const ok = (await hashPin(pin, ADMIN_PIN_CONFIG.pinSalt)) === ADMIN_PIN_CONFIG.pinHash;
    if (ok) {
      setAskingPin(false);
      setPanelOpen(true);
    }
    return ok;
  };

  const api = useMemo<AdminApi>(() => ({ requestAdmin, panelOpen }), [requestAdmin, panelOpen]);

  return (
    <AdminContext.Provider value={api}>
      {children}
      {panelOpen && <SizesPanel onClose={() => setPanelOpen(false)} />}
      {askingPin &&
        createPortal(
          <div className={overlay.backdrop} onClick={() => setAskingPin(false)}>
            <div className={overlay.dialog} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <PinPad
                title="Administració"
                subtitle="Introdueix la contrasenya d’administrador"
                onComplete={checkPin}
              />
              <Button size="lg" block onClick={() => setAskingPin(false)}>
                Cancel·la
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </AdminContext.Provider>
  );
}
