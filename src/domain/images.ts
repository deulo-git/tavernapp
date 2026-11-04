// Photos are compressed on the device before upload: a small thumbnail stored inside the
// item document (for lists) and a larger version stored in images/{itemId} (for detail and
// "show to customer"). Both stay well under Firestore's 1 MiB document limit.

export const FULL_MAX_SIDE = 1600;
export const THUMB_MAX_SIDE = 480;
const FULL_MAX_CHARS = 700_000;
const THUMB_MAX_CHARS = 70_000;

/** Scales (width, height) down to fit inside a maxSide × maxSide box. Never upscales. */
export function fitWithin(width: number, height: number, maxSide: number): { width: number; height: number } {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function encode(bitmap: ImageBitmap, maxSide: number, startQuality: number, maxChars: number): string {
  let { width, height } = fitWithin(bitmap.width, bitmap.height, maxSide);
  let quality = startQuality;
  for (let attempt = 0; attempt < 8; attempt++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas_unavailable');
    ctx.fillStyle = '#ffffff'; // JPEG has no transparency: transparent PNGs get a white background
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    // Free the canvas memory right away; iPad Safari has a tight total canvas budget.
    canvas.width = canvas.height = 0;
    if (dataUrl.length <= maxChars) return dataUrl;
    if (quality > 0.6) quality -= 0.08;
    else {
      width = Math.round(width * 0.85);
      height = Math.round(height * 0.85);
    }
  }
  throw new Error('image_too_large');
}

export interface CompressedImage {
  thumb: string;
  full: string;
}

export async function compressImage(file: Blob): Promise<CompressedImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    return {
      full: encode(bitmap, FULL_MAX_SIDE, 0.84, FULL_MAX_CHARS),
      thumb: encode(bitmap, THUMB_MAX_SIDE, 0.74, THUMB_MAX_CHARS),
    };
  } finally {
    bitmap.close();
  }
}
