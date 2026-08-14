// src/lib/schema/types.ts
export type GuideTopic = 'size' | 'condition' | 'delivery' | 'cost' | 'permits';

export interface QuickFact { k: string; v: string }
export interface QuickFaq { q: string; a: string }

export interface QuickFacts {
  entityTitle: string;          // header — the page's main entity
  entitySubtitle?: string;      // e.g. "Wind & Water Tight · used, sold as-is"
  specs: QuickFact[];           // primary grid (≤ 8)
  faqs: QuickFaq[];             // ≤ 3
  showPriceDisclaimer: boolean; // render the avg-price disclaimer line
  serves?: string;              // "Serves" business-band cell; buildPageSchema fills SERVICE_AREA_LINE when a branch sets none
}

// Discriminated union describing a page's main entity.
export type PageSchemaInput =
  | { kind: 'home'; faqs: QuickFaq[] }
  | { kind: 'productHub'; faqs: QuickFaq[] }
  | { kind: 'product'; container: import('../../data/containers').Container;
      price?: import('../../data/pricing').ContainerPrice;
      specs: QuickFact[] }
  | { kind: 'city'; city: import('../../data/cities').City; faqs: QuickFaq[] }
  | { kind: 'useCase'; audience: string; title: string; specs: QuickFact[]; faqs: QuickFaq[];
      serviceType?: string;            // override the default sales-and-delivery serviceType
      areaServed?: string[] }          // optional State names (e.g. ['Ohio', 'Indiana'])
  | { kind: 'guide'; topic?: GuideTopic; title: string; specs: QuickFact[]; faqs: QuickFaq[] }
  | { kind: 'collection'; title: string; items: { name: string; url: string }[]; faqs: QuickFaq[] }
  | { kind: 'blogPost'; title: string; description: string; author: string;
      datePublished: string; dateModified: string; image?: string;
      takeaways: string[]; faqs: QuickFaq[] }
  | { kind: 'excluded' };       // quote/tool/legal → minimal WebPage graph, NO block

export interface BuildSchemaArgs {
  page: PageSchemaInput;
  url: string;                                  // Astro.url.href (canonical, trailing slash per route)
  title: string;
  description: string;
  breadcrumbs?: { name: string; path?: string }[];
  datePublished?: string;
  dateModified?: string;
  image?: string;                               // absolute og/article image URL
}

export interface BuiltSchema {
  graph: Record<string, unknown>[];
  quickFacts: QuickFacts | null;                // null ⇒ no visible block
}
