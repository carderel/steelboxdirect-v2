import { CONDITION } from '../../data/condition';
import { STATS } from '../../data/stats';
import type { GuideTopic } from './types';

/**
 * ASCII normalizer for typographic dashes, both code points written as escapes so this file cannot
 * contain the characters it removes.
 *
 * WHY. Structured data gets quoted verbatim by assistants, which makes a stray U+2014 or U+2013 a
 * worse instance of T-112 than the same character in body prose: it travels into an answer that the
 * reader never sees this page for. The savings figure is authored with an en dash in
 * src/data/stats.ts, where it is correct for the visible pages that render it, so it is normalized
 * here at the schema boundary rather than changed at the source.
 */
const ascii = (s: string): string => s.replace(/[\u2014\u2013]/g, '-');

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
  'description': 'What Wind & Water Tight (used) condition means: structurally sound, weather-tight, storage-ready steel at the best value.',
  'step': [
    {
      '@type': 'HowToStep',
      'position': 1,
      'name': 'Wind & Water Tight (Used)',
      'text': 'A used container that is wind- and water-tight: it seals out rain, wind, snow, and pests and stays structurally sound for storage and on-site use.'
    },
    {
      '@type': 'HowToStep',
      'position': 2,
      'name': 'What to Expect',
      'text': 'Honest cosmetic wear — surface rust and dents from its working life — over weathering (Cor-Ten) steel that holds up for decades.'
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
const deliveryGuideSchema = {
  '@type': 'HowTo',
  'name': 'How to Prepare Your Property for Container Delivery',
  'description': 'Guide to delivery requirements, property access, and placement considerations for shipping container delivery',
  'step': [
    {
      '@type': 'HowToStep',
      'position': 1,
      'name': 'Verify Site Access',
      'text': 'Ensure driveway is 12+ feet wide with clearance for delivery truck and boom extension'
    },
    {
      '@type': 'HowToStep',
      'position': 2,
      'name': 'Check Ground Conditions',
      'text': 'Level ground required. Soft ground may need reinforcement. Notify us of challenging terrain.'
    },
    {
      '@type': 'HowToStep',
      'position': 3,
      'name': 'Clear Obstacles',
      'text': 'Remove trees, power lines, and structures within boom swing radius'
    },
    {
      '@type': 'HowToStep',
      'position': 4,
      'name': 'Schedule Delivery',
      'text': 'Coordinate timing. Delivery takes 30-45 minutes. Be present to direct placement.'
    }
  ]
};

// Pricing Guide Schema
const pricingGuideSchema = {
  '@type': 'HowTo',
  'name': 'Understanding Shipping Container Pricing',
  'description': 'Guide to container pricing factors, cost drivers, and how to evaluate container quotes',
  'step': [
    {
      '@type': 'HowToStep',
      'position': 1,
      'name': 'Container Condition',
      'text': `Every container we sell is ${CONDITION.label}: structurally sound, weather-tight steel at ${ascii(STATS.usedSavingsVsNew.value)} less than new.`
    },
    {
      '@type': 'HowToStep',
      'position': 2,
      'name': 'Size',
      'text': '20-foot containers cost less than 40-foot. Choose based on actual storage needs to avoid overpaying.'
    },
    {
      '@type': 'HowToStep',
      'position': 3,
      'name': 'Delivery Distance',
      // Two clause service area, same shape and same order as SERVICE_AREA_LINE in entities.ts:
      // the 250 mi home region first, then the nationwide capability qualified as coming from depot
      // hubs. It replaces a 250 miles from Cincinnati only sentence that the visible page now
      // contradicts, since /cost/ publishes delivered pricing for fifteen metros, most of them
      // outside that radius. No state list, for the reason entities.ts gives: naming states implies
      // the unnamed ones are excluded, which is the contradiction commit e429343 had to undo.
      'text':
        'Delivery cost depends on the distance from the depot your container ships from. Our home region reaches 250 miles from Cincinnati, OH, and we deliver nationwide from depot hubs.'
    },
    {
      '@type': 'HowToStep',
      'position': 4,
      'name': 'Site Conditions',
      'text': 'Difficult access, soft ground, or crane delivery increases cost. Factor these into your budget.'
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

export const howtoByTopic: Record<GuideTopic, Record<string, unknown>> = {
  size: sizeGuideSchema,
  condition: conditionGuideSchema,
  delivery: deliveryGuideSchema,
  cost: pricingGuideSchema,
  permits: permitsGuideSchema,
};
