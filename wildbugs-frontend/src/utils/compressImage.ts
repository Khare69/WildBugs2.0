export interface CompressionOptions {
  /**
   * Maximum allowed width or height in pixels.
   * Images larger than this will be proportionally downscaled.
   * Defaults to 2048px (ideal for high-resolution insect detail and Cloud Vision AI).
   */
  maxDimension?: number;

  /**
   * Compression quality between 0.1 and 1.0.
   * Defaults to 0.82 (producing ~300-500KB files from 8-12MB phone cameras).
   */
  quality?: number;

  /**
   * Target MIME format. Defaults to 'image/jpeg'.
   */
  mimeType?: 'image/jpeg' | 'image/webp';

  /**
   * Optional maximum target size in kilobytes (e.g., 500).
   * If provided and initial compression exceeds this, quality will be iteratively adjusted.
   */
  targetSizeKb?: number;
}

export interface CompressedImageResult {
  file: File;
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

/**
 * Validates that an uploaded file is an accepted image format and within the initial raw size boundary.
 */
export const validateImageFile = (
  file: File,
  maxRawSizeMb = 15
): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

  if (!file.type && (!file.name || !file.name.match(/\.(jpe?g|png|webp|heic|heif)$/i))) {
    return {
      valid: false,
      error: 'Unrecognized file type. Please upload a valid JPG, PNG, or WebP photo.',
    };
  }

  if (file.type && !validTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported format (${file.type}). Please select a JPEG, PNG, or WebP photo.`,
    };
  }

  const maxBytes = maxRawSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Photo exceeds the maximum allowed upload limit of ${maxRawSizeMb}MB.`,
    };
  }

  return { valid: true };
};

/**
 * Formats byte counts into human-readable strings (e.g., "4.2 MB", "340 KB").
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes <= 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Loads an image file or blob into an HTMLImageElement using an Object URL.
 */
const loadImage = (source: File | Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(source);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load and decode image data.'));
    };

    img.src = objectUrl;
  });
};

/**
 * Compresses and resizes a client-side image file before network transmission.
 *
 * Supports both options object:
 *   compressImage(file, { maxDimension: 2048, quality: 0.82 })
 * and positional parameters:
 *   compressImage(file, 2048, 0.8)
 *
 * Algorithm:
 * 1. Decodes photo into memory via HTMLImageElement.
 * 2. Calculates proportional downscaling if dimensions exceed `maxDimension` (default 2048px).
 * 3. Draws pixels onto an HTML5 canvas.
 * 4. Encodes to JPEG/WebP with high-efficiency chroma subsampling.
 * 5. Iteratively verifies target size if targetSizeKb is specified.
 */
export const compressImage = async (
  file: File | Blob,
  optionsOrMaxWidth?: CompressionOptions | number,
  optionalQuality?: number
): Promise<CompressedImageResult> => {
  const options: CompressionOptions =
    typeof optionsOrMaxWidth === 'number'
      ? { maxDimension: optionsOrMaxWidth, quality: optionalQuality ?? 0.82 }
      : (optionsOrMaxWidth || {});

  const {
    maxDimension = 2048,
    quality = 0.82,
    mimeType = 'image/jpeg',
    targetSizeKb,
  } = options;

  const originalSize = file.size;
  const originalFileName = file instanceof File ? file.name : `capture_${Date.now()}.jpg`;

  // 1. Decode image element
  const img = await loadImage(file);
  const srcWidth = img.naturalWidth || img.width;
  const srcHeight = img.naturalHeight || img.height;

  // 2. Calculate aspect-ratio preserved dimensions
  let targetWidth = srcWidth;
  let targetHeight = srcHeight;

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    if (targetWidth > targetHeight) {
      targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
      targetWidth = maxDimension;
    } else {
      targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
      targetHeight = maxDimension;
    }
  }

  // 3. Render onto canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Canvas 2D rendering context is not supported on this browser.');
  }

  // Draw background white in case of transparent PNG conversion to JPEG
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // 4. Encode to blob with target quality
  const encodeBlob = (q: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Canvas image encoding failed.'));
          }
          resolve(blob);
        },
        mimeType,
        q
      );
    });
  };

  let currentQuality = Math.min(1.0, Math.max(0.1, quality));
  let outputBlob = await encodeBlob(currentQuality);

  // 5. Adaptive iterative compression if targetSizeKb is provided and exceeded
  if (targetSizeKb && outputBlob.size > targetSizeKb * 1024) {
    const minQuality = 0.6;
    let attempts = 0;
    while (outputBlob.size > targetSizeKb * 1024 && currentQuality > minQuality && attempts < 3) {
      attempts++;
      currentQuality -= 0.08;
      outputBlob = await encodeBlob(currentQuality);
    }
  }

  // 6. Assemble resulting File and metadata
  const cleanExtension = mimeType === 'image/webp' ? '.webp' : '.jpg';
  const baseName = originalFileName.replace(/\.[^/.]+$/, '');
  const finalFileName = `${baseName}_compressed${cleanExtension}`;

  const compressedFile = new File([outputBlob], finalFileName, {
    type: mimeType,
    lastModified: Date.now(),
  });

  const dataUrl = canvas.toDataURL(mimeType, currentQuality);
  const compressedSize = outputBlob.size;
  const compressionRatio = originalSize > 0
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

  return {
    file: compressedFile,
    blob: outputBlob,
    dataUrl,
    originalSize,
    compressedSize,
    compressionRatio,
    width: targetWidth,
    height: targetHeight,
  };
};

export default compressImage;
