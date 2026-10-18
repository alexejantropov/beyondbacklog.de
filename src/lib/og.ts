// Social preview images (og:image): pages pass a source image to Layout, which renders it with
// astro:assets as a 1200×630 JPEG cropped to its most interesting area.
export const OG_IMAGE = {
  width: 1200,
  height: 630,
  fit: 'cover',
  position: 'attention',
  format: 'jpeg',
  quality: 82,
  layout: 'none',
  background: '#FAFAF7',
} as const;
