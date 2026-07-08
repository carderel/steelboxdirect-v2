// src/lib/blogImages.ts
// Resolves a blog post's `heroImage` frontmatter string (a path relative to
// src/assets/photos/, e.g. "farmers/farm-storage-container-crop-field-hero.jpg")
// to an optimizable ImageMetadata via Vite's import.meta.glob.
//
// Keeps [...slug].astro, blog/index.astro, and blog/category/[category].astro
// sharing one lookup so hero images and index/category thumbnails stay in sync
// and get the same <Image>/webp optimization as the rest of the site.
const heroImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/photos/**/*.{jpeg,jpg,png,webp}'
);

export async function resolveHeroImage(heroImage?: string): Promise<ImageMetadata | undefined> {
  if (!heroImage) return undefined;
  const key = `/src/assets/photos/${heroImage}`;
  const loader = heroImages[key];
  if (!loader) return undefined;
  const mod = await loader();
  return mod.default;
}
