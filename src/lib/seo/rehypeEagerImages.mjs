/**
 * Markdown images load eagerly (2026-10-06). Owner's standing rule: no lazy loading anywhere.
 * Astro renders a Markdown image through <Image>, which defaults to loading="lazy"; this sets
 * loading="eager" on every <img> before Astro's own rehypeImages step copies the node's properties
 * into the image props. Registered in astro.config.mjs under markdown.rehypePlugins.
 */
export function rehypeEagerImages() {
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'img') {
      node.properties = { ...node.properties, loading: 'eager' };
    }
    for (const child of node.children ?? []) walk(child);
  };
  return (tree) => walk(tree);
}
