// Single source for the home page FAQ. `a` (plain text) feeds BOTH the
// FAQPage JSON-LD schema (built in src/pages/index.astro) and the visible
// list rendered by src/components/home/FaqSection.astro. `html` is an
// optional richer visible variant (e.g. with links) — same text, plus markup.
export interface HomeFaqItem {
  q: string;
  a: string;
  html?: string;
}

export const homeFaqs: HomeFaqItem[] = [
  {
    q: "Won't it rust out on me?",
    a: "Corten steel, painted inside and out. On crushed-stone pads with airflow underneath, 25 years is realistic. We'll show you how to prep the site.",
  },
  {
    q: 'Can you get it back my driveway?',
    a: "Usually yes. Tilt-bed needs ~100 ft of approach and firm ground. For tight or soft sites, crane-set works — no lane damage. We'll scout before we schedule.",
  },
  {
    q: 'Do I need a permit?',
    a: "It depends on your county and how you'll use the container, and rules vary widely. Confirming permit and zoning requirements with your local authority before you buy is the buyer's responsibility — we don't determine or guarantee them.",
  },
  {
    q: 'Is used actually safe for my equipment?',
    a: "Every container we sell is Wind & Water Tight (used) — structurally sound and weather-tight, with surface rust that's purely cosmetic. It keeps rain, wind, and snow off your equipment and holds up for decades on a prepped pad.",
  },
  {
    q: 'How quickly can you get it here?',
    a: "Almost all deliveries take about two weeks. Depot inventory is stacked and sequenced — units aren't staged for quick pull — and drivers book out several weeks in advance, so exact timing depends on current availability. We'll give you an honest window before you commit, and you'll hear from us at every step until it's on your property.",
  },
  {
    q: 'How do I pay? Do you offer financing?',
    a: "Two ways. Buy outright — paid in full up front, with Afterpay available for buyers who qualify so you can pay in installments while we schedule your unit right away. Or rent to own over 12, 24, 36, or 48 months through the Freedom Conex program: no traditional credit check, subject to third-party approval, and the container is yours at the end of the term.",
    html: 'Two ways. Buy outright — paid in full up front, with Afterpay available for buyers who qualify so you can pay in installments while we schedule your unit right away. Or <a href="/rent-to-own/">rent to own</a> over 12, 24, 36, or 48 months through the Freedom Conex program: no traditional credit check, subject to third-party approval, and the container is yours at the end of the term.',
  },
];
