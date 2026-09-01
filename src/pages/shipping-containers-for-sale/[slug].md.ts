/**
 * MARKDOWN TWIN ENDPOINT FOR THE 3 PRODUCT PAGES.
 *
 * Emits `/shipping-containers-for-sale/{slug}.md` beside every product page, built from the SAME
 * `containers` array the `.astro` template renders.
 *
 * The condition wording is imported from `src/data/condition.ts` and passed in rather than typed
 * here, so the canonical grade description stays owned by one module. The rendering rules,
 * including why no dollar figure ever appears in a twin, live in the header of
 * `src/lib/aeo/markdownTwin.ts`.
 */

export const prerender = true;

import type { APIRoute } from 'astro';
import { containers } from '../../data/containers';
import { CONDITION } from '../../data/condition';
import { MARKDOWN_HEADERS, renderContainerMarkdown } from '../../lib/aeo/markdownTwin';

export function getStaticPaths() {
  return containers.map((k) => ({ params: { slug: k.slug }, props: { container: k } }));
}

export const GET: APIRoute = ({ props }) =>
  new Response(renderContainerMarkdown(props.container, CONDITION.blurb), {
    headers: MARKDOWN_HEADERS,
  });
