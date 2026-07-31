import type { BuildSchemaArgs, BuiltSchema, QuickFacts, QuickFaq } from './types';
import { globalNodes, ORG_ID, LOCALBUSINESS_ID, WEBSITE_ID, SITE_URL } from './entities';
import { priceValidUntil } from '../../data/pricing';
import { howtoByTopic } from './howto';

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
    case 'city': {
      const svcId = nodeId(args.url, 'service');
      graph.push({
        '@type': 'Service',
        '@id': svcId,
        name: `Shipping Container Delivery — ${p.city.city}, ${p.city.state}`,
        serviceType: 'Shipping container sales and delivery',
        provider: { '@id': LOCALBUSINESS_ID },
        areaServed: { '@type': 'City', name: `${p.city.city}, ${p.city.state}` },
      });
      graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, svcId, nodeId(args.url, 'faq')));
      quickFacts = {
        entityTitle: `Containers in ${p.city.city}, ${p.city.state}`,
        entitySubtitle: 'Wind & Water Tight (used) · delivered on-site',
        specs: [
          { k: 'Service area', v: `${p.city.city} + surrounding counties` },
          { k: 'Condition', v: 'Wind & Water Tight (used)' },
          { k: 'Warranty', v: 'Lifetime Leak' },
          { k: 'Delivery', v: 'All-in quote, about two weeks' },
        ],
        faqs: p.faqs.slice(0, 3),
        showPriceDisclaimer: false,
      };
      break;
    }
    case 'useCase': {
      const svcId = nodeId(args.url, 'service');
      graph.push({
        '@type': 'Service',
        '@id': svcId,
        name: p.title,
        serviceType: p.serviceType ?? 'Shipping container sales and delivery',
        provider: { '@id': LOCALBUSINESS_ID },
        audience: { '@type': 'Audience', audienceType: p.audience },
        ...(p.areaServed?.length
          ? { areaServed: p.areaServed.map((name) => ({ '@type': 'State', name })) }
          : {}),
      });
      graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, svcId, nodeId(args.url, 'faq')));
      quickFacts = { entityTitle: p.title, specs: p.specs, faqs: p.faqs.slice(0, 3), showPriceDisclaimer: false };
      break;
    }
    case 'home': {
      graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, ORG_ID, nodeId(args.url, 'faq')));
      quickFacts = { entityTitle: 'Steel Box Direct', entitySubtitle: 'Wind & Water Tight containers · Est. 2009', specs: [], faqs: p.faqs.slice(0, 3), showPriceDisclaimer: false };
      break;
    }
    case 'guide': {
      const artId = nodeId(args.url, 'article');
      graph.push({
        '@type': 'Article',
        '@id': artId,
        headline: p.title,
        description: args.description,
        image: args.image ?? `${SITE_URL}/og-image.png`,
        datePublished: args.datePublished ?? '2026-03-10',
        dateModified: args.dateModified ?? args.datePublished ?? '2026-03-10',
        author: { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        mainEntityOfPage: { '@id': nodeId(args.url, 'webpage') },
      });
      if (p.topic) graph.push({ ...howtoByTopic[p.topic], '@id': nodeId(args.url, 'howto') });
      if (p.faqs.length) graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, artId, p.faqs.length ? nodeId(args.url, 'faq') : artId));
      quickFacts = { entityTitle: p.title, specs: p.specs, faqs: p.faqs.slice(0, 3), showPriceDisclaimer: false };
      break;
    }
    case 'collection': {
      const collId = nodeId(args.url, 'collection');
      graph.push({
        '@type': 'CollectionPage',
        '@id': collId,
        url: args.url,
        name: args.title,
        description: args.description,
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: p.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
        },
      });
      if (p.faqs.length) graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, collId, p.faqs.length ? nodeId(args.url, 'faq') : collId));
      quickFacts = { entityTitle: args.title, specs: [], faqs: p.faqs.slice(0, 3), showPriceDisclaimer: false };
      break;
    }
    case 'blogPost': {
      const artId = nodeId(args.url, 'article');
      graph.push({
        '@type': 'Article',
        '@id': artId,
        headline: p.title,
        description: p.description,
        image: p.image ?? `${SITE_URL}/og-image.png`,
        datePublished: p.datePublished,
        dateModified: p.dateModified,
        author: { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        mainEntityOfPage: { '@id': nodeId(args.url, 'webpage') },
      });
      if (p.faqs.length) graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, artId, p.faqs.length ? nodeId(args.url, 'faq') : artId));
      quickFacts = {
        entityTitle: p.title,
        specs: p.takeaways.slice(0, 6).map((t) => ({ k: 'Takeaway', v: t })),
        faqs: p.faqs.slice(0, 3),
        showPriceDisclaimer: false,
      };
      break;
    }
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
