/**
 * MARKDOWN TWIN ENDPOINT FOR THE 15 CITY PAGES.
 *
 * Emits `/locations/{state}/{citySlug}.md` beside every `/locations/{state}/{citySlug}/` page,
 * built from the SAME `cities` array the `.astro` template renders, so the two cannot drift.
 * Prerendered like its HTML sibling: these are static files on Cloudflare's edge, not a function.
 *
 * The rendering rules, including why no dollar figure ever appears in a twin, live in the header of
 * `src/lib/aeo/markdownTwin.ts`. Read that before changing anything here.
 */

export const prerender = true;

import type { APIRoute } from 'astro';
import { cities } from '../../../data/cities';
import { MARKDOWN_HEADERS, renderCityMarkdown } from '../../../lib/aeo/markdownTwin';

export function getStaticPaths() {
  return cities.map((c) => ({
    params: { state: c.stateSlug, citySlug: c.slug },
    props: { city: c },
  }));
}

export const GET: APIRoute = ({ props }) =>
  new Response(renderCityMarkdown(props.city), { headers: MARKDOWN_HEADERS });
