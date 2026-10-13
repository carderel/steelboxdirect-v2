import type { GuideTopic } from './types';

// Size Guide Schema
const sizeGuideSchema = {
  '@type': 'HowTo',
  'name': 'How to Choose the Right Shipping Container Size',
  'description': 'Step-by-step guide to determining the correct container size for your equipment and storage needs',
  'step': [
    {
      '@type': 'HowToStep',
      'position': 1,
      'name': 'Measure Your Equipment',
      'text': 'Determine the dimensions of the equipment or items you need to store'
    },
    {
      '@type': 'HowToStep',
      'position': 2,
      'name': 'Compare Container Sizes',
      'text': '20-foot containers fit single equipment pieces; 40-foot containers hold equipment and additional inventory'
    },
    {
      '@type': 'HowToStep',
      'position': 3,
      'name': 'Use the Calculator',
      'text': 'Input your equipment dimensions to find the optimal container size'
    }
  ]
};

// Condition Guide Schema
const conditionGuideSchema = {
  '@type': 'HowTo',
  'name': 'Understanding Wind & Water Tight (Used) Shipping Containers',
  'description': 'What Wind & Water Tight (used) condition means: weather-tight, storage-ready steel with no holes and doors that seal, at the best value.',
  'step': [
    {
      '@type': 'HowToStep',
      'position': 1,
      'name': 'Wind & Water Tight (Used)',
      'text': 'A used container that is wind- and water-tight: it keeps out rain, wind, snow, and pests, with no holes and doors that seal, for storage and on-site use.'
    },
    {
      '@type': 'HowToStep',
      'position': 2,
      'name': 'What to Expect',
      'text': 'Honest cosmetic wear (surface rust and dents from its working life) over weathering (Cor-Ten) steel that holds up for decades.'
    },
    {
      '@type': 'HowToStep',
      'position': 3,
      'name': 'Sold As-Is for Storage',
      'text': 'Sold as-is for storage and on-site use; weather-tight and built to last, but not certified for ocean shipping.'
    }
  ]
};

// Delivery Guide Schema
//
// ALIGNED TO THE VISIBLE /delivery/ PAGE, 2026-10-13. Every step text below is copied from text
// rendered on src/pages/delivery/index.astro (the "Clearance At A Glance" sidebar and the "week
// before delivery" and "delivery day" sections), so the machine layer says nothing the reader cannot
// see. The earlier steps described a "boom extension" and a "boom swing radius"; the visible page
// describes tilt-bed and crane-set delivery and never mentions a boom, so those steps were replaced
// rather than reworded. If the page copy changes, change these strings with it.
//
// The "delivery takes thirty to forty five minutes" clause was removed on 2026-08-28. No source for
// the figure existed anywhere in this repository, and an unsourced duration reads as a flat factual
// claim by the business. Omission is honest; invention is not
// (src/lib/compliance/fabricated-dates-guard.test.ts).
const deliveryGuideSchema = {
  '@type': 'HowTo',
  'name': 'How to Prepare Your Property for Container Delivery',
  'description': 'Guide to delivery requirements, property access, and placement considerations for shipping container delivery',
  'step': [
    {
      '@type': 'HowToStep',
      'position': 1,
      'name': 'Verify Site Access',
      'text': '12 feet of width, measured at the narrowest pinch on the route. 14 feet overhead, over the lane and over the drop spot. 100+ feet of straight approach for a tilt-bed.'
    },
    {
      '@type': 'HowToStep',
      'position': 2,
      'name': 'Check Ground Conditions',
      'text': '30,000 lb is what the ground has to hold. Look at the ground honestly. If the last rain left standing water where the box is going, that is your answer about the surface.'
    },
    {
      '@type': 'HowToStep',
      'position': 3,
      'name': 'Walk the Route',
      'text': 'Walk the route with the pinch points in mind. Trim the branches, move the trailer, ask the neighbor about the truck that parks on the corner.'
    },
    {
      '@type': 'HowToStep',
      'position': 4,
      'name': 'Mark the Spot and Door Direction',
      'text': 'Mark the exact spot. Stakes, spray paint, or cones at the four corners. Decide which way the doors face and mark that too. Changing it later means moving the container again.'
    },
    {
      '@type': 'HowToStep',
      'position': 5,
      'name': 'Be There on Delivery Day',
      'text': 'Somebody should be on site who can point at the spot and make a decision.'
    }
  ]
};

// Permits Guide Schema
const permitsGuideSchema = {
  '@type': 'HowTo',
  'name': 'How to Determine if You Need a Shipping Container Permit',
  'description': 'Guide to understanding permit requirements for shipping container placement and storage',
  'step': [
    {
      '@type': 'HowToStep',
      'position': 1,
      'name': 'Identify Your Location Type',
      'text': 'Requirements differ by property type and jurisdiction. It is the buyer\'s responsibility to confirm what applies to their specific property and intended use.'
    },
    {
      '@type': 'HowToStep',
      'position': 2,
      'name': 'Check Local Zoning',
      'text': 'Contact your county zoning office or check online. Zoning determines if containers are permitted on your property.'
    },
    {
      '@type': 'HowToStep',
      'position': 3,
      'name': 'Apply for Permits if Required',
      'text': 'If a permit is required, apply through your local authority and allow time for approval before scheduling delivery.'
    },
    {
      '@type': 'HowToStep',
      'position': 4,
      'name': 'Verify Before Delivery',
      'text': 'Confirm permit status before scheduling delivery to avoid delays or removal orders.'
    }
  ]
};

// NO HowTo FOR /cost/, removed 2026-10-13. Its steps (condition, size, delivery distance with a
// service-area radius, site conditions) did not match the visible page, whose "Four Price Drivers"
// are size, condition, logistics and market cycles, and two of those visible cards render
// build-time computed figures and conditional sentences that a static schema string cannot mirror
// faithfully. The page is a list of price factors, not a procedure, and Google no longer shows HowTo
// rich results, so the node was dropped rather than forced. The page keeps its Article and FAQPage
// nodes. A topic absent from this map emits no HowTo (see buildPageSchema.ts).
export const howtoByTopic: Partial<Record<GuideTopic, Record<string, unknown>>> = {
  size: sizeGuideSchema,
  condition: conditionGuideSchema,
  delivery: deliveryGuideSchema,
  permits: permitsGuideSchema,
};
