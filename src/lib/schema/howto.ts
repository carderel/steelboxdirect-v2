import { CONDITION } from '../../data/condition';
import { STATS } from '../../data/stats';
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
      'text': `Every container we sell is ${CONDITION.label} — structurally sound, weather-tight steel at ${STATS.usedSavingsVsNew.value} less than new.`
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
      'text': 'Distance from our location affects delivery cost. We serve 250 miles from Cincinnati.'
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
