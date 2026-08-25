// src/data/guides.ts
// The guides listed on /shipping-container-guides/, in router order.
//
// One source for three things that must never disagree: the router cards, the count in the hub's
// prose ("Eight guides", twice), and the ItemList entries in the CollectionPage JSON-LD. The hub
// interpolates guideCountWord rather than spelling a number, so adding a ninth guide updates the
// copy automatically.
//
// RULE: do not add an entry before its page exists. guides.test.ts asserts every url resolves to a
// real file under src/pages, because an ItemList entry pointing at a 404 is worse than a shorter
// list.

import { countWord, titleCountWord } from './numberWords';

export type GuideGroup = 'box' | 'getting' | 'commit';

export interface Guide {
  id: string;
  /** Three-letter code shown on the card and in the nav dropdown. */
  code: string;
  /** What the guide is called. Also the ItemList entry name. */
  kind: string;
  url: string;
  group: GuideGroup;
  /** The card headline: the question a reader actually arrives with. */
  question: string;
  body: string;
  /** The dotted "what is inside" line. */
  covers: string;
  /** Card call to action. */
  cta: string;
  /** Card accent class, styled on the hub. */
  accent: string;
}

export const guides: Guide[] = [
  {
    id: 'size',
    code: 'SZ',
    kind: 'Size Guide',
    url: '/size/',
    group: 'box',
    question: 'How big does it actually need to be?',
    body:
      'Container sizes are standardised worldwide, so a 20ft box is a 20ft box wherever you buy '
      + 'it. This one walks through interior dimensions for the three common sizes and what '
      + 'genuinely fits inside each, so you order the footprint you need instead of the one that '
      + 'sounded right.',
    covers: '20ft · 40ft · 40ft high cube · Interior dimensions · Size calculator',
    cta: 'Read the size guide',
    accent: 'c-size',
  },
  {
    id: 'condition',
    code: 'CND',
    kind: 'Condition Guide',
    url: '/condition/',
    group: 'box',
    question: 'What does "used" really mean, and will it leak?',
    body:
      'Containers are graded by how much working life they have left, and the grade names are not '
      + 'obvious. This explains what Wind and Water Tight means in practice, what wear to expect '
      + 'on steel that spent a decade at sea, and what that grade does not cover.',
    covers: 'Wind and Water Tight · Expected wear · Cor-Ten steel · What we sell',
    cta: 'Read the condition guide',
    accent: 'c-cond',
  },
  {
    id: 'reference',
    code: 'REF',
    kind: 'Container Reference',
    url: '/container-reference/',
    group: 'box',
    question: 'What do the codes stamped on the box mean?',
    body:
      'The technical lookup, for when you want the exact figure rather than the summary. Full ISO '
      + 'dimensions for every size, how to read the eleven-character ID and the size and type '
      + 'code, and what the CSC plate records.',
    covers: 'ISO 668 dimensions · ISO 6346 markings · CSC plate · Full size chart',
    cta: 'Open the reference',
    accent: 'c-ref',
  },
  {
    id: 'certification',
    code: 'CSC',
    kind: 'Certification Guide',
    url: '/container-certification-guide/',
    group: 'box',
    question: 'Does my container need to be certified?',
    body:
      'Every container carries a CSC plate that once cleared it for the open ocean. This one '
      + 'explains what that plate certifies, why the rules apply to international shipping rather '
      + 'than storage, and what a recertification survey involves if a box ever needs to sail '
      + 'again.',
    covers: 'CSC plates · PES vs ACEP · Survey basics · Storage vs shipping',
    cta: 'Read the certification guide',
    accent: 'c-ref',
  },
  {
    id: 'inspector-finder',
    code: 'FND',
    kind: 'Container Inspector Finder',
    url: '/find-a-container-inspector/',
    group: 'box',
    question: 'Who can inspect a container for shipping?',
    body:
      'Every IICL-certified container inspector in the US directory, grouped by state, with each '
      + 'one\'s credentials and the year they run through. For anyone whose box needs a '
      + 'recertification survey before it can ship: who exists, where they are, and how a survey '
      + 'actually gets booked.',
    covers: 'Every US inspector · State by state · Credential badges · How to book a survey',
    cta: 'Open the inspector finder',
    accent: 'c-ref',
  },
  {
    id: 'delivery',
    code: 'DLV',
    kind: 'Delivery Guide',
    url: '/delivery/',
    group: 'getting',
    question: 'Can a truck actually get to the spot I want?',
    body:
      'A loaded tilt-bed rig is roughly sixty-five feet of truck and needs a straight run to slide '
      + 'a container off. This covers how tilt-bed and crane-set delivery differ and the width, '
      + 'height, and ground clearances to measure before you order, not on delivery day.',
    covers: 'Tilt-bed vs crane-set · Access clearances · Ground conditions · What to send us',
    cta: 'Read the delivery guide',
    accent: 'c-dlv',
  },
  {
    id: 'cost',
    code: 'CST',
    kind: 'Cost Guide',
    url: '/cost/',
    group: 'getting',
    question: 'Why are the quotes I am getting so different?',
    body:
      'Container pricing moves with size, condition, how far the box has to travel from a depot, '
      + 'and the shipping market that month. This explains those four drivers and the one question '
      + 'that catches most hidden costs when you compare sellers.',
    covers: 'The four price drivers · Freight · Delivered total vs sticker price',
    cta: 'Read the cost guide',
    accent: 'c-cst',
  },
  {
    id: 'rental',
    code: 'RTL',
    kind: 'Container Rental Guide',
    url: '/container-rental-guide/',
    group: 'getting',
    question: 'Do I have to buy it outright?',
    body:
      'Renting, rent-to-own, and buying are three different arrangements that get talked about as '
      + 'if they were one. This separates them: what an open-ended monthly rental leaves you with, '
      + 'how a fixed term ends in ownership, the nine questions to ask any rental company, and '
      + 'which companies in this region we could verify actually rent. We do not rent, and the '
      + 'guide says so in its first line.',
    covers: 'Rent vs rent-to-own vs buy · What to ask · Who rents near you',
    cta: 'Read the rental guide',
    accent: 'c-rtl',
  },
  {
    id: 'portable',
    code: 'POD',
    kind: 'Portable Storage Guide',
    url: '/portable-storage-vs-buying-a-container/',
    group: 'getting',
    question: 'Do I rent a PODS-style unit or buy the box?',
    body:
      'Portable storage and shipping containers get sold under the same words and answer two '
      + 'different needs. This one separates them honestly: a rented pod fits a move or an '
      + 'end-dated project, an owned container fits storage that stays on your property, and the '
      + 'fork between the two is whether your stuff is going somewhere or staying put.',
    covers: 'Rented pod vs owned box · Who should rent · Who should buy · Break-even',
    cta: 'Read the portable storage guide',
    accent: 'c-rtl',
  },
  {
    id: 'permits',
    code: 'PRM',
    kind: 'Permits & Zoning',
    url: '/permits/',
    group: 'commit',
    question: 'Do I need a permit or zoning approval?',
    body:
      'Requirements vary by county, municipality, and how you intend to use the container, and '
      + 'your local zoning or building department is the authority that decides. This guide '
      + 'describes what the question turns on and who to ask. Confirming it before you buy is the '
      + "buyer's responsibility; we do not determine, advise on, or guarantee permit outcomes.",
    covers: 'What the question turns on · Who decides · Ask before you buy',
    cta: 'Read the permits guide',
    accent: 'c-prm',
  },
  {
    id: 'buying',
    code: 'BUY',
    kind: 'Buying Guide',
    url: '/container-buying-guide/',
    group: 'commit',
    question: 'How do I know this seller is real?',
    body:
      'The used container market has genuine scams: deposits taken by sellers who vanish, grades '
      + 'quoted and then downgraded at delivery, photos scraped from somebody else\'s yard. A '
      + 'seven-point checklist for vetting whoever you are about to pay.',
    covers: 'Verify the business · Warranty in writing · Confirm the grade · Payment red flags',
    cta: 'Read the buying guide',
    accent: 'c-buy',
  },
];

export const guideCount = guides.length;
export const guideCountWord = countWord(guideCount);
export const guideTitleCountWord = titleCountWord(guideCount);

export const guidesByGroup = (group: GuideGroup): Guide[] =>
  guides.filter((g) => g.group === group);

/** ItemList entries for the hub's CollectionPage schema. Absolute URLs, as /locations/ does. */
export const guideListItems = guides.map((g) => ({
  name: g.kind,
  url: `https://steelboxdirect.com${g.url}`,
}));
