export interface PrepareImageOptions {
  askToCompress?: boolean;
  maxDimension?: number;
  targetMaxBytes?: number;
  initialQuality?: number;
  minQuality?: number;
  qualityStep?: number;
}

export interface PreparedImage {
  dataUrl: string;
  compressed: boolean;
  originalSize: number;
  finalSize: number;
}

const COMPRESSIBLE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

const readImageFromDataUrl = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to decode image'));
    image.src = dataUrl;
  });

const dataUrlSizeInBytes = (dataUrl: string): number => {
  const marker = ';base64,';
  const index = dataUrl.indexOf(marker);
  if (index === -1) {
    return dataUrl.length;
  }

  const base64 = dataUrl.slice(index + marker.length);
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const getOutputType = (inputType: string): string => {
  if (inputType === 'image/webp') return 'image/webp';
  if (inputType === 'image/png') return 'image/webp';
  return 'image/jpeg';
};

const compressDataUrl = async (
  sourceDataUrl: string,
  sourceType: string,
  options: PrepareImageOptions
): Promise<string> => {
  const image = await readImageFromDataUrl(sourceDataUrl);
  const maxDimension = options.maxDimension ?? 1920;
  const targetMaxBytes = options.targetMaxBytes ?? 1024 * 1024;
  const initialQuality = options.initialQuality ?? 0.86;
  const minQuality = options.minQuality ?? 0.5;
  const qualityStep = options.qualityStep ?? 0.06;

  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  let width = Math.max(1, Math.round(image.width * scale));
  let height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    return sourceDataUrl;
  }

  const outputType = getOutputType(sourceType);
  let bestDataUrl = sourceDataUrl;
  let bestBytes = dataUrlSizeInBytes(sourceDataUrl);

  for (let resizePass = 0; resizePass < 5; resizePass += 1) {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    for (let quality = initialQuality; quality >= minQuality; quality -= qualityStep) {
      const candidate = canvas.toDataURL(outputType, quality);
      const candidateBytes = dataUrlSizeInBytes(candidate);

      if (candidateBytes < bestBytes) {
        bestBytes = candidateBytes;
        bestDataUrl = candidate;
      }

      if (candidateBytes <= targetMaxBytes) {
        return candidate;
      }
    }

    width = Math.max(480, Math.round(width * 0.84));
    height = Math.max(320, Math.round(height * 0.84));
  }

  return bestDataUrl;
};

export const prepareImageForUpload = async (
  file: File,
  options: PrepareImageOptions = {}
): Promise<PreparedImage> => {
  const originalDataUrl = await readFileAsDataUrl(file);
  const originalSize = file.size;
  const shouldAskToCompress = options.askToCompress ?? true;
  const supportsCompression = COMPRESSIBLE_TYPES.has(file.type);

  if (!supportsCompression || !shouldAskToCompress) {
    return {
      dataUrl: originalDataUrl,
      compressed: false,
      originalSize,
      finalSize: originalSize
    };
  }

  const wantsCompression = window.confirm(
    `Use lightweight image mode for "${file.name}"?\n\n` +
      `Original size: ${formatBytes(originalSize)}\n` +
      'OK: compress image for faster loading\n' +
      'Cancel: keep original quality'
  );

  if (!wantsCompression) {
    return {
      dataUrl: originalDataUrl,
      compressed: false,
      originalSize,
      finalSize: originalSize
    };
  }

  const compressedDataUrl = await compressDataUrl(originalDataUrl, file.type, options);
  const compressedSize = dataUrlSizeInBytes(compressedDataUrl);

  if (compressedSize >= originalSize) {
    return {
      dataUrl: originalDataUrl,
      compressed: false,
      originalSize,
      finalSize: originalSize
    };
  }

  return {
    dataUrl: compressedDataUrl,
    compressed: true,
    originalSize,
    finalSize: compressedSize
  };
};
