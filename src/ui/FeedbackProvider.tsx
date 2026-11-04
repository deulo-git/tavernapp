import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { Icon } from './Icon';
import { FeedbackContext, errorMessage, type ConfirmOptions, type FeedbackApi, type ToastOptions } from './feedback';
import s from './overlay.module.css';

interface ToastItem extends ToastOptions {
  id: number;
  message: string;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<PendingConfirm | null>(null);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { ...options, id, message }]);
      const duration = options.durationMs ?? (options.action ? 8000 : options.tone === 'error' ? 6000 : 3500);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setConfirmState({ ...options, resolve })),
    [],
  );

  const reportError = useCallback(
    (err: unknown) => {
      console.error(err);
      toast(errorMessage(err), { tone: 'error' });
    },
    [toast],
  );

  const api = useMemo<FeedbackApi>(() => ({ toast, confirm, reportError }), [toast, confirm, reportError]);

  const closeConfirm = (ok: boolean) => {
    confirmState?.resolve(ok);
    setConfirmState(null);
  };

  return (
    <FeedbackContext.Provider value={api}>
      {children}
      {createPortal(
        <>
          {confirmState && (
            <div className={s.backdrop} onClick={() => closeConfirm(false)}>
              <div
                className={s.dialog}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="confirm-title">{confirmState.title}</h2>
                {confirmState.message && <p className={`${s.dialogMessage} pre-line`}>{confirmState.message}</p>}
                <div className={s.dialogActions}>
                  <Button size="lg" onClick={() => closeConfirm(false)}>
                    {confirmState.cancelLabel ?? 'Cancel·la'}
                  </Button>
                  <Button
                    size="lg"
                    variant={confirmState.danger ? 'danger' : 'primary'}
                    onClick={() => closeConfirm(true)}
                    autoFocus
                  >
                    {confirmState.confirmLabel ?? "D'acord"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className={s.toasts} aria-live="polite">
            {toasts.map((t) => (
              <div key={t.id} className={[s.toast, t.tone === 'error' && s.toastError].filter(Boolean).join(' ')}>
                <span className={s.toastText}>{t.message}</span>
                {t.action && (
                  <button
                    type="button"
                    className={s.toastAction}
                    onClick={() => {
                      t.action!.onClick();
                      dismiss(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                )}
                <button type="button" className={s.toastClose} aria-label="Tanca" onClick={() => dismiss(t.id)}>
                  <Icon name="close" />
                </button>
              </div>
            ))}
          </div>
        </>,
        document.body,
      )}
    </FeedbackContext.Provider>
  );
}
