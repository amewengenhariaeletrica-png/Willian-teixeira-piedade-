/**
 * Optimizes an image by resizing it and compressing it using the Canvas API.
 * @param source - The image source (File, Blob, or Base64 string/URL)
 * @param maxWidth - The maximum width for the optimized image (default: 1200)
 * @param quality - The compression quality (0.0 to 1.0, default: 0.7)
 * @returns A promise that resolves to the optimized Base64 string
 */
export const optimizeImage = async (
  source: File | Blob | string,
  maxWidth: number = 1200,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Handle cross-origin for URLs
    if (typeof source === 'string' && source.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to WebP if supported, otherwise JPEG
      const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(optimizedBase64);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for optimization'));
    };

    if (source instanceof File || source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(source);
    } else {
      img.src = source;
    }
  });
};
