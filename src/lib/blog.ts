// src/lib/blog.ts
// Shared helpers for the blog: category <-> slug mapping and date formatting.
// Keep this the single source of truth so index/category/post pages never drift.

import { BLOG_CATEGORIES } from '../content/config';

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/** "Buyer's Guides & How-To" -> "buyers-guides-and-how-to" */
export function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const SLUG_TO_CATEGORY: Record<string, BlogCategory> = Object.fromEntries(
  BLOG_CATEGORIES.map((c) => [categoryToSlug(c), c])
) as Record<string, BlogCategory>;

export function slugToCategory(slug: string): BlogCategory | undefined {
  return SLUG_TO_CATEGORY[slug];
}

export function formatBlogDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Map each of the 6 fixed categories to one of the site's Sim-Sim decision-block colors
// so category chips stay visually consistent wherever they appear.
const CATEGORY_COLOR: Record<BlogCategory, string> = {
  "Buyer's Guides & How-To": 'var(--c1-size)',
  'Comparisons & Alternatives': 'var(--c2-cond)',
  'Use-Case Spotlights': 'var(--c3-deliver)',
  'Field Stories': 'var(--c4-cost)',
  'Local & Seasonal': 'var(--c5-permits)',
  'Container Specs & Reference': 'var(--ink)',
};

export function categoryColor(category: string): string {
  return CATEGORY_COLOR[category as BlogCategory] ?? 'var(--ink)';
}

// Category chips/backgrounds use saturated colors from the Sim-Sim palette; the
// yellow one (Buyer's Guides & How-To) is too light for white/cream text, so it
// needs ink text while every other category color is dark enough for light text.
export function categoryTextColor(category: string): string {
  return category === "Buyer's Guides & How-To" ? 'var(--ink)' : 'var(--cream)';
}
