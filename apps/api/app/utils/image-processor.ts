import sharp from 'sharp';

export const IMAGE_SIZES = [320, 640, 960, 1080] as const;
export type ImageSize = (typeof IMAGE_SIZES)[number];

export interface ProcessedImage {
  size: ImageSize;
  buffer: Buffer;
  width: number;
  height: number;
}

/**
 * Process an image buffer into 4 WebP variants.
 * Maintains aspect ratio, resizes to fit within the target width.
 * Uses sharp for high-performance processing.
 */
export async function processImage(buffer: Buffer): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = [];

  for (const size of IMAGE_SIZES) {
    const resized = await sharp(buffer)
      .resize(size, undefined, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    const metadata = await sharp(resized).metadata();

    results.push({
      size,
      buffer: resized,
      width: metadata.width || size,
      height: metadata.height || size,
    });
  }

  return results;
}

/**
 * Validate that a buffer is a supported image format.
 */
export async function validateImage(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata();
    return ['jpeg', 'png', 'webp', 'gif', 'tiff'].includes(metadata.format || '');
  } catch {
    return false;
  }
}

/**
 * Get image dimensions without processing.
 */
export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
