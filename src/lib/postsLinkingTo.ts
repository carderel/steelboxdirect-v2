// src/lib/postsLinkingTo.ts
// "Reading for ..." blocks on location pages. Published posts that already link to a page, found by
// their body containing a markdown link to it. Nothing is listed by hand: a post joins the block the
// build it stops being a draft, and a page no post links to gets an empty list (render nothing).
//
// The draft filter is the strict one (data.draft !== true) rather than the PROD-only pattern the blog
// pages use, so the dev server can never show a draft here that production would hide.
//
// Matching is a prefix match on `](path`, so a state path (/locations/texas/) also picks up posts that
// link to any city inside that state. That is deliberate: the state hub is the parent of those pages.

import { getCollection, type CollectionEntry } from 'astro:content';

export async function postsLinkingTo(path: string): Promise<CollectionEntry<'blog'>[]> {
  return (await getCollection('blog', ({ data }) => data.draft !== true))
    .filter((p) => p.body.includes(`](${path}`))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
