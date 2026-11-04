import type { ImageRef } from '../domain/types';
import { Icon, type IconName } from './Icon';
import { useFullImage } from './useFullImage';
import s from './ui.module.css';

interface Props {
  itemId: string;
  image: ImageRef | null;
  alt: string;
  icon: IconName;
  className?: string;
  /** Load the full-size photo instead of the thumbnail. */
  full?: boolean;
  /** Show the whole photo (letterboxed) instead of cropping it. */
  contain?: boolean;
}

export function ItemImage({ itemId, image, alt, icon, className, full = false, contain = false }: Props) {
  const classes = [s.imageBox, contain && s.imageContain, className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {image ? (
        full ? (
          <FullImg itemId={itemId} image={image} alt={alt} />
        ) : (
          <img src={image.thumb} alt={alt} loading="lazy" decoding="async" />
        )
      ) : (
        <div className={s.imagePlaceholder}>
          <Icon name={icon} size={64} strokeWidth={1.3} />
        </div>
      )}
    </div>
  );
}

function FullImg({ itemId, image, alt }: { itemId: string; image: ImageRef; alt: string }) {
  const src = useFullImage(itemId, image);
  return src ? <img src={src} alt={alt} decoding="async" /> : null;
}
