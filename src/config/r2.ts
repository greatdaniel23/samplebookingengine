export const R2_CONFIG = {
  publicUrl: 'https://alphadigitalagency.id',
  bucketName: 'imageroom',
  s3Endpoint: 'https://b2a5cc3520b42302ad302f7a4790fbee.r2.cloudflarestorage.com/imageroom',
  // Old R2 dev URL that needs to be replaced for mobile compatibility
  legacyUrl: 'https://pub-e303ec878512482fa87c065266e6bedd.r2.dev',
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

  // Convert old R2 dev URLs to new custom domain (fixes mobile loading issue)
  if (imagePath.startsWith(R2_CONFIG.legacyUrl)) {
    const path = imagePath.replace(R2_CONFIG.legacyUrl, '');
    return `${R2_CONFIG.publicUrl}${path}`;
  }

  // Already a full URL with new domain, return as-is
  if (imagePath.startsWith(R2_CONFIG.publicUrl)) return imagePath;

  // Other full URLs (external images), return as-is
  if (imagePath.startsWith('http')) return imagePath;

  // Clean up path: remove leading slash and /images/ prefix
  const cleanPath = imagePath.replace(/^\/?(images\/)?/, '');

  return `${R2_CONFIG.publicUrl}/${cleanPath}`;
}

