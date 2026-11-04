import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { wifiQrPayload } from '../../domain/format';
import type { UiLang } from '../../domain/allergens';
import { Button } from '../../ui/Button';
import { LanguageTabs } from '../../ui/LanguageTabs';
import s from '../catalog/detail.module.css';

const TEXT: Record<UiLang, { scan: string; network: string; password: string; close: string }> = {
  ca: {
    scan: 'Escaneja el codi amb la càmera per connectar-te',
    network: 'Xarxa',
    password: 'Contrasenya',
    close: 'Tanca',
  },
  es: {
    scan: 'Escanea el código con la cámara para conectarte',
    network: 'Red',
    password: 'Contraseña',
    close: 'Cerrar',
  },
  en: { scan: 'Scan the code with your camera to connect', network: 'Network', password: 'Password', close: 'Close' },
  fr: {
    scan: 'Scannez le code avec l’appareil photo pour vous connecter',
    network: 'Réseau',
    password: 'Mot de passe',
    close: 'Fermer',
  },
};

/** Full-screen Wi-Fi QR code for customers. */
export function WifiQr({ ssid, password, onClose }: { ssid: string; password: string; onClose: () => void }) {
  const [svg, setSvg] = useState('');
  const [lang, setLang] = useState<UiLang>('ca');
  const t = TEXT[lang];

  useEffect(() => {
    QRCode.toString(wifiQrPayload(ssid, password), { type: 'svg', margin: 1, errorCorrectionLevel: 'M' }).then(setSvg);
  }, [ssid, password]);

  return createPortal(
    <div className={s.present} role="dialog" aria-modal="true" aria-label="Wi-Fi">
      <div className={s.presentBar}>
        <LanguageTabs value={lang} onChange={setLang} long />
        <Button size="lg" icon="close" onClick={onClose}>
          {t.close}
        </Button>
      </div>
      <div className={s.qr} lang={lang}>
        <h1 className={s.presentTitle}>Wi-Fi</h1>
        {/* The SVG comes from the local qrcode library, not from user HTML. */}
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        <p className={s.presentDescription}>{t.scan}</p>
        <div className={s.presentFacts}>
          <span>
            <strong>{t.network}</strong>
            {ssid}
          </span>
          {password && (
            <span>
              <strong>{t.password}</strong>
              {password}
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
