import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ImageRef } from '../domain/types';
import { Icon } from './Icon';
import { useFullImage } from './useFullImage';
import s from './overlay.module.css';

/** Full-screen photo; tap anywhere to close. */
export function Lightbox({
  itemId,
  image,
  alt,
  onClose,
}: {
  itemId: string;
  image: ImageRef;
  alt: string;
  onClose: () => void;
}) {
  const src = useFullImage(itemId, image);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return createPortal(
    <div className={s.lightbox} role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
      {src && <img src={src} alt={alt} />}
      <button type="button" className={s.lightboxClose} aria-label="Tanca" onClick={onClose}>
        <Icon name="close" size={28} />
      </button>
    </div>,
    document.body,
  );
}
