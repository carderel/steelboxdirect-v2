import type { BuildSchemaArgs, BuiltSchema, QuickFacts, QuickFaq } from './types';
import { globalNodes, ORG_ID, LOCALBUSINESS_ID, WEBSITE_ID, SITE_URL } from './entities';
import { priceValidUntil } from '../../data/pricing';

const nodeId = (url: string, frag: string) => `${url}#${frag}`;

function breadcrumbNode(url: string, crumbs?: { name: string; path?: string }[]) {
  const items = crumbs && crumbs.length ? crumbs : [{ name: 'Home', path: '/' }];
  return {
    '@type': 'BreadcrumbList',
    '@id': nodeId(url, 'breadcrumb'),
    itemListElement: items.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      ...(b.path ? { item: `${SITE_URL}${b.path}` } : {}),
    })),
  };
}

function faqNode(url: string, faqs: QuickFaq[]) {
  return {
    '@type': 'FAQPage',
    '@id': nodeId(url, 'faq'),
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

function webPageNode(args: BuildSchemaArgs, aboutId?: string, mainEntityId?: string) {
  return {
    '@type': 'WebPage',
    '@id': nodeId(args.url, 'webpage'),
    url: args.url,
    name: args.title,
    description: args.description,
    isPartOf: { '@id': WEBSITE_ID },
    breadcrumb: { '@id': nodeId(args.url, 'breadcrumb') },
    ...(aboutId ? { about: { '@id': aboutId } } : {}),
    ...(mainEntityId ? { mainEntity: { '@id': mainEntityId } } : {}),
  };
}

export function buildPageSchema(args: BuildSchemaArgs): BuiltSchema {
  const graph: Record<string, unknown>[] = [...globalNodes()];
  const bc = breadcrumbNode(args.url, args.breadcrumbs);
  let quickFacts: QuickFacts | null = null;

  // page-kind branches are appended in Tasks 3-5; default handles 'excluded'
  const p = args.page;
  switch (p.kind) {
    case 'product': {
      const productId = nodeId(args.url, 'product');
      graph.push({
        '@type': 'Product',
        '@id': productId,
        name: p.container.name,
        description: p.container.seo.description,
        image: args.image ?? `${SITE_URL}/logo.png`,
        brand: { '@id': ORG_ID },
        category: 'Shipping Containers',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          ...(p.price ? { price: p.price.price } : {}),
          priceValidUntil,
          itemCondition: 'https://schema.org/UsedCondition',
          availability: 'https://schema.org/InStock',
          seller: { '@id': ORG_ID },
          url: args.url,
        },
      });
      graph.push(webPageNode(args, productId, productId));
      quickFacts = {
        entityTitle: p.container.name,
        entitySubtitle: 'Wind & Water Tight (used) · sold as-is',
        specs: p.specs,
        faqs: [],
        showPriceDisclaimer: Boolean(p.price),
      };
      break;
    }
    case 'productHub': {
      const collId = nodeId(args.url, 'collection');
      graph.push({ '@type': 'CollectionPage', '@id': collId, url: args.url, name: args.title, description: args.description, isPartOf: { '@id': WEBSITE_ID } });
      graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, collId, nodeId(args.url, 'faq')));
      quickFacts = { entityTitle: 'Containers for Sale', specs: [], faqs: p.faqs.slice(0, 3), showPriceDisclaimer: true };
      break;
    }
    // BRANCHES INSERTED IN TASKS 4-5 ABOVE THIS DEFAULT
    default: {
      graph.push(webPageNode(args, ORG_ID));
      break;
    }
  }

  graph.push(bc);
  return { graph, quickFacts };
}

// exported for tests / reuse
export { nodeId, breadcrumbNode, faqNode, webPageNode };
