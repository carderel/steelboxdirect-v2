import type { BuildSchemaArgs, BuiltSchema, QuickFacts, QuickFaq } from './types';
import { globalNodes, ORG_ID, LOCALBUSINESS_ID, WEBSITE_ID, SITE_URL, SERVICE_AREA_LINE } from './entities';
import { pricing, priceValidUntil, formatPrice, effectiveSinceLabel } from '../../data/pricing';
import { howtoByTopic } from './howto';
import { lastmodIn } from '../seo/lastmodResolve.mjs';
import lastmodIndex from 'virtual:route-lastmod-index';

const nodeId = (url: string, frag: string) => `${url}#${frag}`;

function breadcrumbNode(url: string, crumbs?: { name: string; path?: string }[]) {
  const items = crumbs && crumbs.length ? crumbs : [{ name: 'Home', path: '/' }];
  // Google requires `item` on every ListItem except the last, so a pathless crumb anywhere but the
  // end of the trail is not optional metadata, it is a GSC "Missing field item" error (which is how
  // the seven city pages got flagged in August 2026). A call site that passes one has already made
  // a mistake; the question is only what the mistake degrades to. Dropping the crumb and renumbering
  // loses one level of an otherwise valid trail, which beats publishing an invalid node site-wide.
  const emittable = items.filter((b, i) => b.path || i === items.length - 1);
  return {
    '@type': 'BreadcrumbList',
    '@id': nodeId(url, 'breadcrumb'),
    itemListElement: emittable.map((b, i) => ({
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

/**
 * The dateModified for ANY dated node on a page, or undefined when nothing truthful can be stated.
 * WebPage, the guide Article and the blog Article all call this, so a page states one date.
 *
 * ONE SOURCE, SHARED WITH THE SITEMAP. lastmodIn() is the one resolver behind the sitemap's
 * <lastmod>: the serialize hook in astro.config.mjs calls it on an index built from disk at config
 * load, and this module calls it on that identical index, handed into the page bundle as the
 * virtual module virtual:route-lastmod-index because the Cloudflare adapter will not bundle the
 * node:fs half. Same function, same data, so no node in this graph and no sitemap entry for the
 * same URL can disagree. See the 2026-09-08 section of the header in src/lib/seo/sitemapLastmod.mjs.
 *
 * WHY THE TABLE WINS ON EVERY NODE, AND THE CALLER'S PROP ONLY FILLS A GAP. The page level fact
 * this field states is "when did the source of this route last change", and the committed table
 * (src/data/routeLastmod.mjs, the last commit to touch the page module) is the only committed
 * source of that fact. Some twenty templates pass a dateModified prop. Most were literals derived
 * by hand on 2026-08-24 that never moved again and had drifted from their own page's last commit
 * by weeks; the city template passes a price effective date; and /cost/ computes its prop as the
 * latest price effective date, which on the day this was written (2026-09-03) was NEWER than the
 * page's last commit (2026-08-31). A price effective date is a pricing fact, not a page
 * modification fact, which is exactly why src/data/geoPricing.ts is deliberately excluded from the
 * table: the daily harvest would otherwise push every priced page to "changed today" every day.
 * The first cut of this change applied the table to WebPage only and left Article on the prop, and
 * the verifier found 23 of 69 pages stating two different dateModified strings, 7 of them on
 * different calendar days. So since 2026-09-08 every dated node routes through this function. The
 * caller's prop is honoured only where the table has no entry, so a route the table does not know
 * yet can still state an author's date, rendered the same way. datePublished is untouched and
 * stays exactly as the caller passed it; nothing in the repository records a truer one.
 *
 * NEVER THE CLOCK. A route missing from the table with no caller prop ships the node with no date,
 * exactly as the sitemap ships that URL with no <lastmod>. There is no fallback to build time and
 * none to today, and src/lib/compliance/webpage-datemodified-guard.test.ts scans this file to keep
 * it that way.
 *
 * WRITTEN THE WAY THE SITEMAP WRITES IT. The table stores commit instants with their local offset
 * (15:56:43-04:00), blog frontmatter stores a bare day, and the sitemap integration renders both
 * through toISOString (19:56:43.000Z). Same instant, different bytes. Every node here renders
 * through the same call so a byte comparison between any node and the sitemap is zero, which is
 * what the built output half of the guard checks, and a blog post's WebPage and Article carry one
 * identical string rather than a bare day beside a full instant. The Date below is constructed FROM
 * the stated value; it never asks the machine what time it is. A value the parser rejects is
 * passed through untouched rather than dropped, so a malformed entry stays visible instead of
 * vanishing.
 *
 * NO datePublished ON WebPage, ON PURPOSE. Nothing in this repository records when a non blog page
 * was first published. The table holds last commit dates only; a file's first commit is not a
 * publish date on a site where several pages were rewritten into different pages under the same
 * path; and the hand typed publish dates some guides pass are exactly the class of literal the
 * 2026-08-24 integrity fix exists to police. The Article nodes keep the datePublished their caller
 * states. This module adds no date it cannot prove.
 */
function pageDateModified(args: BuildSchemaArgs, callerValue: string | undefined): string | undefined {
  const stated: string | undefined = lastmodIn(lastmodIndex, args.url) ?? callerValue;
  if (!stated) return undefined;
  const instant = new Date(stated);
  return Number.isNaN(instant.getTime()) ? stated : instant.toISOString();
}

function webPageNode(args: BuildSchemaArgs, aboutId?: string, mainEntityId?: string) {
  const dateModified = pageDateModified(args, args.dateModified);
  return {
    '@type': 'WebPage',
    '@id': nodeId(args.url, 'webpage'),
    url: args.url,
    name: args.title,
    description: args.description,
    isPartOf: { '@id': WEBSITE_ID },
    breadcrumb: { '@id': nodeId(args.url, 'breadcrumb') },
    ...(dateModified ? { dateModified } : {}),
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
          // The same figure again, with the date it came into effect attached. The duplication is the
          // cost of stating validFrom in the place the locked decision names, and the two prices must
          // stay equal, which buildPageSchema.test.ts asserts. validFrom is a change date, never a
          // check date: see the asOf docstring in src/data/pricing.ts.
          ...(p.price
            ? {
                priceSpecification: {
                  '@type': 'UnitPriceSpecification',
                  price: p.price.price,
                  priceCurrency: 'USD',
                  validFrom: pricing.asOf,
                },
              }
            : {}),
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
        name: `Shipping Container Delivery in ${p.city.city}, ${p.city.state}`,
        serviceType: 'Shipping container sales and delivery',
        provider: { '@id': LOCALBUSINESS_ID },
        areaServed: { '@type': 'City', name: `${p.city.city}, ${p.city.state}` },
      });
      graph.push(faqNode(args.url, p.faqs));
      graph.push(webPageNode(args, svcId, nodeId(args.url, 'faq')));
      const isDepot = p.city.region === 'depot';
      // The resolved price, or nothing at all. It reaches the visible cells and never the graph. A
      // city page states a figure scoped to one ZIP in prose; a machine readable price node would
      // restate the same number as a general claim about the whole city, which is the thing the
      // locked decision keeps off this branch. Absence means this metro prints no figure.
      const cityPrice = p.price;
      quickFacts = {
        entityTitle: `Containers in ${p.city.city}, ${p.city.state}`,
        entitySubtitle: 'Wind & Water Tight (used) · delivered on-site',
        specs: [
          // One cell per size, then the date, each cell readable alone by a scraper. The size sits
          // in the key AND in the value on purpose: the key tells the rows apart in the grid, and
          // the value restates size and ZIP so a scraper that lifts only values still gets a fully
          // scoped figure, the same property the old single cell had. The date stays its own cell,
          // stated once, because the page already collapses the lines to their latest change date.
          ...(cityPrice
            ? [
                ...cityPrice.lines.map((line) => ({
                  k: `Delivered price, ${line.sizeLabel}`,
                  v: `${formatPrice(line.delivered)} for a ${line.sizeLabel} to ${cityPrice.zip}`,
                })),
                { k: 'Price in effect since', v: effectiveSinceLabel(cityPrice.effectiveSince) },
              ]
            : []),
          {
            k: 'Service area',
            v: isDepot
              ? `Delivered from a depot in the ${p.city.city} area through our supplier network`
              : `${p.city.city} + surrounding counties`,
          },
          { k: 'Condition', v: 'Wind & Water Tight (used)' },
          { k: 'Warranty', v: 'Lifetime Leak' },
          { k: 'Delivery', v: 'All-in quote, about two weeks' },
        ],
        faqs: p.faqs.slice(0, 3),
        // Gated on the page having handed over a figure, which it does only for a metro whose
        // publish flag is on and which the feed has priced. Safe to flip per page here in a way it
        // was not on the shared guide branch, because this branch serves city pages and nothing else.
        showPriceDisclaimer: Boolean(cityPrice),
        // Both city tiers set `serves` explicitly so no city page falls through to the
        // site-wide default. A city page is a local surface: it should state its own area,
        // not the network's ceiling.
        serves: isDepot
          ? `Depot in the ${p.city.city} area · our supplier network`
          : `${p.city.city} + surrounding counties · 250 mi home region`,
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
      quickFacts = { entityTitle: 'Steel Box Direct', entitySubtitle: 'Wind & Water Tight containers', specs: [], faqs: p.faqs.slice(0, 3), showPriceDisclaimer: false };
      break;
    }
    case 'guide': {
      const artId = nodeId(args.url, 'article');
      const guideDateModified = pageDateModified(args, args.dateModified ?? args.datePublished);
      graph.push({
        '@type': 'Article',
        '@id': artId,
        headline: p.title,
        description: args.description,
        image: args.image ?? `${SITE_URL}/og-image.png`,
        // datePublished is emitted only when the caller actually knows it. There is no invented
        // fallback date: omission is honest, invention is not (integrity fix, 2026-08-24).
        // dateModified comes from the same table as the sitemap and the WebPage node
        // (pageDateModified above), so this page states one date. Where the table is silent the
        // caller's prop stands in, and failing that datePublished, because a page modified never
        // is a page last modified when it was published.
        ...(args.datePublished ? { datePublished: args.datePublished } : {}),
        ...(guideDateModified ? { dateModified: guideDateModified } : {}),
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
        // The table (which for a post is its own frontmatter, read by the sitemap) rendered the
        // same way as every other node; the post's prop stands in only if the table is silent.
        dateModified: pageDateModified(args, p.dateModified),
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
  // Any branch that did not set its own area gets the network line, so the visible "Serves"
  // cell always matches the two-node areaServed in the graph rather than only its first node.
  if (quickFacts && !quickFacts.serves) quickFacts.serves = SERVICE_AREA_LINE;
  return { graph, quickFacts };
}

// exported for tests / reuse
export { nodeId, breadcrumbNode, faqNode, webPageNode };
