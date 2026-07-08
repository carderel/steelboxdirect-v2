export const prerender = true;

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true
  );
  const sorted = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Steel Box Direct Blog',
    description: "Guides, comparisons, and real-world use cases for shipping containers from Steel Box Direct.",
    site: context.site ?? 'https://steelboxdirect.com',
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.slug}/`,
      categories: [post.data.category],
    })),
    customData: `<language>en-us</language>`,
  });
}
