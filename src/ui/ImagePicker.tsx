import { useRef, useState } from 'react';
import { compressImage, type CompressedImage } from '../domain/images';
import { Button } from './Button';
import { Spinner } from './EmptyState';
import { Icon } from './Icon';
import s from './ui.module.css';

interface Props {
  /** Current photo to preview (thumbnail data URL), if any. */
  preview: string | null;
  onSelect: (image: CompressedImage) => void;
  onRemove: () => void;
}

export function ImagePicker({ preview, onSelect, onRemove }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onSelect(await compressImage(file));
    } catch {
      setError("No s'ha pogut llegir la imatge. Prova amb una altra foto.");
    } finally {
      setBusy(false);
      if (cameraRef.current) cameraRef.current.value = '';
      if (libraryRef.current) libraryRef.current.value = '';
    }
  };

  return (
    <div className={s.field}>
      <span className={s.label}>Fotografia</span>
      <div className={s.picker}>
        <div className={s.pickerPreview}>
          {busy ? (
            <div className={s.imagePlaceholder}>
              <Spinner />
            </div>
          ) : preview ? (
            <div className={s.imageBox} style={{ width: '100%', height: '100%' }}>
              <img src={preview} alt="Previsualització" />
            </div>
          ) : (
            <div className={s.imagePlaceholder}>
              <Icon name="image" size={48} strokeWidth={1.4} />
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div className={s.pickerActions}>
            <Button icon="camera" onClick={() => cameraRef.current?.click()} disabled={busy}>
              Fes una foto
            </Button>
            <Button icon="image" onClick={() => libraryRef.current?.click()} disabled={busy}>
              Tria una imatge
            </Button>
            {preview && (
              <Button icon="trash" variant="dangerOutline" onClick={onRemove} disabled={busy}>
                Treu la foto
              </Button>
            )}
          </div>
          {error ? (
            <span className={s.error}>{error}</span>
          ) : (
            <span className={s.hint}>La foto es redueix automàticament perquè ocupi poc.</span>
          )}
        </div>
      </div>
      <input
        ref={cameraRef}
        className={s.fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={libraryRef}
        className={s.fileInput}
        type="file"
        accept="image/*"
        data-testid="image-input"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
