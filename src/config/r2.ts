export const R2_CONFIG = {
  publicUrl: 'https://pub-e303ec878512482fa87c065266e6bedd.r2.dev',
  bucketName: 'imageroom',
} as const;

/**
 * Converts various image path formats to R2 public URLs
 * @param imagePath - Can be:
 *   - R2 key: "hero/DSC02132.JPG"
 *   - Old relative path: "/images/hero/DSC02132.JPG"
 *   - Full URL: "https://..."
 * @returns Full R2 public URL or placeholder
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '/placeholder.svg';

  // Already a full URL (http:// or https://)
  if (imagePath.startsWith('http')) return imagePath;

  // Clean up path: remove leading slash and /images/ prefix
  const cleanPath = imagePath.replace(/^\/?(images\/)?/, '');

  return `${R2_CONFIG.publicUrl}/${cleanPath}`;
}
