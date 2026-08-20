import { defineCollection, z } from 'astro:content';

// Exactly these 6 categories: keep in sync with any UI that lists/filters categories
// (src/pages/blog/index.astro, src/pages/blog/category/[category].astro).
export const BLOG_CATEGORIES = [
  "Buyer's Guides & How-To",
  'Comparisons & Alternatives',
  'Use-Case Spotlights',
  'Field Stories',
  'Local & Seasonal',
  'Container Specs & Reference',
] as const;

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(BLOG_CATEGORIES),
    // SEO cluster tag (e.g. "container-sizing", "storage-vs-shed")
    pillar: z.string().optional(),
    // Target reader (e.g. "farmer", "contractor", "homeowner")
    persona: z.string().optional(),
    // Content format (e.g. "listicle", "comparison", "how-to")
    format: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    // Path relative to src/assets/photos/ (e.g. "farmers/farm-storage-container-crop-field-hero.jpg")
    heroImage: z.string().optional(),
    // Accessible alt text for heroImage; falls back to the post title when omitted.
    heroImageAlt: z.string().optional(),
    // Short "what you'll learn" bullets shown near the top of the post (visible,
    // scannable summary for readers and LLM/AEO extraction).
    takeaways: z.array(z.string()).optional(),
    // Optional FAQ block: rendered visibly on the post AND emitted as FAQPage
    // JSON-LD (see src/pages/blog/[...slug].astro). Keep answers self-contained
    // (no pronouns referring back to the article) since AI answer engines lift
    // these standalone.
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    author: z.string().default('Steel Box Direct'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
