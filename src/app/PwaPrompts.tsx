import { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import s from './app.module.css';

const INSTALL_DISMISSED_KEY = 'tavernapp.installHintDismissed';

/** iPadOS Safari reports itself as a Mac; touch support tells them apart. */
function isIosSafariNotInstalled(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios && nav.standalone === false;
}

/** "New version available" banner, plus update checks whenever the app comes back to the foreground. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {});
      });
      setInterval(() => registration.update().catch(() => {}), 60 * 60_000);
    },
  });

  if (!needRefresh) return null;
  return (
    <div className={s.banner} role="status">
      <Icon name="refresh" />
      <span>Hi ha una versió nova de l’app.</span>
      <Button variant="primary" size="sm" onClick={() => updateServiceWorker(true)}>
        Actualitza ara
      </Button>
    </div>
  );
}

function shouldShowInstallHint(): boolean {
  let dismissed = false;
  try {
    dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY) === '1';
  } catch {
    // Storage unavailable: show the hint.
  }
  return isIosSafariNotInstalled() && !dismissed;
}

/** Explains how to install the app when it is opened in Safari instead of from the home screen. */
export function InstallHint() {
  const [show, setShow] = useState(shouldShowInstallHint);

  if (!show) return null;
  return (
    <div className={s.banner} role="note">
      <Icon name="download" />
      <span>
        Per instal·lar l’app: toca <strong>Comparteix</strong> (el quadre amb la fletxa) i després{' '}
        <strong>Afegeix a la pantalla d’inici</strong>. Obre-la sempre des de la icona.
      </span>
      <Button
        size="sm"
        onClick={() => {
          localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
          setShow(false);
        }}
      >
        Entesos
      </Button>
    </div>
  );
}
