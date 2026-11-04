import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../data/store';
import { DEFAULT_PIN_CONFIG, hashPin } from '../../domain/security';
import { Button } from '../../ui/Button';
import { PinPad } from '../../ui/PinPad';
import { useFeedback } from '../../ui/feedback';
import { EditModeContext, type EditModeApi } from './editMode';
import s from '../../ui/overlay.module.css';

const IDLE_LIMIT_MS = 10 * 60_000;
const BACKGROUND_LIMIT_MS = 2 * 60_000;

export function EditModeProvider({ children }: { children: ReactNode }) {
  const { config } = useData();
  const { toast } = useFeedback();
  const [editing, setEditing] = useState(false);
  const [askingPin, setAskingPin] = useState(false);
  const lastActivity = useRef(0);

  const exitEdit = useCallback(() => setEditing(false), []);

  const requestEdit = useCallback(() => {
    setAskingPin(true);
  }, []);

  const checkPin = async (pin: string) => {
    const { pinSalt, pinHash } = config?.pinHash ? config : DEFAULT_PIN_CONFIG;
    const ok = (await hashPin(pin, pinSalt)) === pinHash;
    if (ok) {
      lastActivity.current = Date.now();
      setAskingPin(false);
      setEditing(true);
    }
    return ok;
  };

  // Safety net: leave edit mode after a while without touches or when the app is put away.
  useEffect(() => {
    if (!editing) return;
    lastActivity.current = Date.now();
    let hiddenAt = 0;
    const touch = () => {
      lastActivity.current = Date.now();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > BACKGROUND_LIMIT_MS) setEditing(false);
    };
    const timer = setInterval(() => {
      if (Date.now() - lastActivity.current > IDLE_LIMIT_MS) {
        setEditing(false);
        toast("S'ha sortit del mode edició per inactivitat.");
      }
    }, 30_000);
    window.addEventListener('pointerdown', touch);
    window.addEventListener('keydown', touch);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      window.removeEventListener('pointerdown', touch);
      window.removeEventListener('keydown', touch);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [editing, toast]);

  const api = useMemo<EditModeApi>(() => ({ editing, requestEdit, exitEdit }), [editing, requestEdit, exitEdit]);

  return (
    <EditModeContext.Provider value={api}>
      {children}
      {askingPin &&
        createPortal(
          <div className={s.backdrop} onClick={() => setAskingPin(false)}>
            <div className={s.dialog} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <PinPad title="Mode edició" subtitle="Introdueix el PIN de 4 xifres" onComplete={checkPin} />
              <Button size="lg" block onClick={() => setAskingPin(false)}>
                Cancel·la
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </EditModeContext.Provider>
  );
}
