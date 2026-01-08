/**
 * Image utilities for the booking engine
 */

import { imagePaths, getRoomImages, getRoomImagesFromDatabase, getAmenityIcon } from '@/config/images';

/**
 * Check if an image exists (client-side check)
 */
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get image with fallback
 */
export const getImageWithFallback = async (
  primaryUrl: string, 
  fallbackUrl: string = imagePaths.ui.placeholder
): Promise<string> => {
  const exists = await checkImageExists(primaryUrl);
  return exists ? primaryUrl : fallbackUrl;
};

/**
 * Preload images for better UX
 */
export const preloadImages = (urls: string[]): Promise<void[]> => {
  return Promise.all(
    urls.map(url => 
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = url;
      })
    )
  );
};

/**
 * Generate srcSet for responsive images
 */
export const generateSrcSet = (basePath: string, sizes: string[] = ['small', 'medium', 'large']): string => {
  const ext = basePath.split('.').pop();
  const base = basePath.replace(`.${ext}`, '');
  
  return sizes
    .map(size => `${base}-${size}.${ext}`)
    .join(', ');
};

/**
 * Image component props helper
 */
export const getImageProps = (
  src: string,
  alt: string,
  responsive: boolean = true
) => {
  const props: any = {
    src,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const
  };
  
  if (responsive) {
    props.srcSet = generateSrcSet(src);
    props.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  }
  
  return props;
};

export { imagePaths, getRoomImages, getRoomImagesFromDatabase, getAmenityIcon };