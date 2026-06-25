// src/data/cities.ts
import { CONDITION } from './condition';

export interface CityMap {
  bbox: string;
  marker: string;
  title: string;
}

export interface City {
  slug: string;
  city: string;
  state: string;
  region: string;
  eyebrow: string;
  lede: string;
  delivery: {
    headline: string;
    body: string;
    counties: string[];
  };
  map: CityMap;
  content: {
    h2: string;
    intro: string;
    features: Array<{ title: string; body: string }>;
  };
  stats: Array<{ value: string; label: string }>;
  cta: {
    headline: string;
    body: string;
  };
  seo: {
    title: string;
    description: string;
  };
}

export const cities: City[] = [
  {
    slug: 'cincinnati-shipping-containers',
    city: 'Cincinnati',
    state: 'OH',
    region: 'Tri-State',
    eyebrow: 'Cincinnati · Tri-State',
    lede: 'From the suburbs of Mason to the farms of Brown County, we deliver steel-clad protection to the Queen City. No middleman, no call centers — just local expertise.',
    delivery: {
      headline: 'Hamilton, Clermont, & Warren',
      body: 'We know the Tri-State. Whether it\'s a tight suburban driveway in Indian Hill or a sprawling field in Bethel, our drivers have placed hundreds of units in your backyard.',
      counties: ['Hamilton County', 'Clermont County', 'Warren County', 'Butler County', 'Boone/Kenton/Campbell (KY)'],
    },
    map: {
      bbox: '-84.712,38.903,-84.312,39.303',
      marker: '39.1031,-84.5120',
      title: 'Cincinnati, OH delivery area map',
    },
    content: {
      h2: 'Why Cincinnati buyers choose Steel Box Direct',
      intro: 'The Cincinnati market is flooded with brokers and call centers that have never seen the containers they sell. We\'re different. We\'re a family-owned operation that understands the local landscape.',
      features: [
        { title: 'No 275-Loop Upcharge',  body: 'Unlike national sellers who charge extra for "metro" delivery, our local presence means we treat every neighborhood with the same fair pricing.' },
        { title: 'Site Visits Available', body: 'Not sure if that 40-footer will fit in your Hyde Park driveway? We can often perform a digital or physical site assessment using local knowledge of the area.' },
        { title: 'Local Delivery Knowledge',  body: 'From Brown to Warren to Butler county, we know the back roads and delivery conditions. Permit and zoning requirements are set by your local authority and are the buyer\'s responsibility to confirm before purchasing.' },
      ],
    },
    stats: [
      { value: '150+', label: 'Units placed in Tri-State' },
      { value: '4.9/5', label: 'Local review average' },
    ],
    cta: {
      headline: 'Ready for a Cincinnati quote?',
      body: 'Most requests in the Tri-State are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping Containers for Sale in Cincinnati, OH | Steel Box Direct',
      description: `Buying a shipping container in Cincinnati? We provide ${CONDITION.label} containers with flat-fee delivery to Hamilton, Clermont, and Warren counties.`,
    },
  },
  {
    slug: 'dayton-shipping-containers',
    city: 'Dayton',
    state: 'OH',
    region: 'Miami Valley',
    eyebrow: 'Dayton · Miami Valley',
    lede: 'From the tech hubs near Wright-Patterson to the manufacturing floors of the Miami Valley, we provide the steel-clad storage that keeps Dayton moving.',
    delivery: {
      headline: 'Montgomery, Greene, & Miami',
      body: 'We\'re regulars on I-75 and I-675. Whether you\'re near the Air Force Base or have a farm out in Miami County, our local knowledge ensures a smooth delivery.',
      counties: ['Montgomery County', 'Greene County', 'Miami County', 'Clark County', 'Preble County'],
    },
    map: {
      bbox: '-84.392,39.559,-83.992,39.959',
      marker: '39.7589,-84.1916',
      title: 'Dayton, OH delivery area map',
    },
    content: {
      h2: 'Why Dayton buyers choose Steel Box Direct',
      intro: 'The "Birthplace of Aviation" knows the value of good engineering. Our containers are built to the highest ISO standards, providing the same durability Dayton\'s manufacturing sector expects.',
      features: [
        { title: 'Manufacturing Storage', body: 'Dayton\'s industrial heritage means businesses often need quick, secure overflow storage. Our units are perfect for parts, tools, and inventory protection.' },
        { title: 'Wright-Patt Proximity', body: 'We understand the specific needs of contractors and personnel near the AFB. Secure, weather-tight storage is non-negotiable, and we deliver exactly that.' },
        { title: 'Miami Valley Expertise', body: 'From Beavercreek to Tipp City, we know the local delivery conditions and can help you plan a workable placement and approach for your container.' },
      ],
    },
    stats: [
      { value: '85+', label: 'Units placed in Miami Valley' },
      { value: '4.8/5', label: 'Local review average' },
    ],
    cta: {
      headline: 'Ready for a Dayton quote?',
      body: 'Most requests in the Miami Valley are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping Containers for Sale in Dayton, OH | Steel Box Direct',
      description: `Looking for a shipping container in Dayton? We offer ${CONDITION.label} containers with flat-fee delivery to Montgomery, Greene, and Miami counties.`,
    },
  },
  {
    slug: 'indianapolis-shipping-containers',
    city: 'Indianapolis',
    state: 'IN',
    region: 'Crossroads',
    eyebrow: 'Indianapolis · Crossroads',
    lede: 'From the tech corridors of Fishers to the industrial hubs of Marion County, we deliver steel-clad protection to the Crossroads of America.',
    delivery: {
      headline: 'Marion, Hamilton, & Hendricks',
      body: 'We know the Indy metro. Whether it\'s a tight site in Carmel or a sprawling logistics facility near the airport, our drivers have the experience to place your unit precisely.',
      counties: ['Marion County', 'Hamilton County', 'Hendricks County', 'Johnson County', 'Hancock County'],
    },
    map: {
      bbox: '-86.358,39.568,-85.958,39.968',
      marker: '39.7684,-86.1581',
      title: 'Indianapolis, IN delivery area map',
    },
    content: {
      h2: 'Why Indy buyers choose Steel Box Direct',
      intro: 'Indianapolis is a world-class logistics hub. We match that standard by providing high-quality, ISO-certified containers that meet the rigorous demands of Indiana\'s business and agricultural sectors.',
      features: [
        { title: 'Crossroads Logistics',  body: 'We understand that Indy is where America\'s freight moves. Our containers provide the secure, mobile storage needed to keep your operations flexible and protected.' },
        { title: 'Hamilton County Growth', body: 'With rapid development in Fishers, Carmel, and Noblesville, we provide quick-deployment storage solutions for construction, retail, and homeowners.' },
        { title: 'Hoosier Reliability',   body: 'We\'re a family-owned operation that values the same hard work and transparency that defines Indiana. No brokers, no hidden fees — just local service.' },
      ],
    },
    stats: [
      { value: '120+', label: 'Units placed in Central Indiana' },
      { value: '4.9/5', label: 'Local review average' },
    ],
    cta: {
      headline: 'Ready for an Indy quote?',
      body: 'Most requests in Central Indiana are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping Containers for Sale in Indianapolis, IN | Steel Box Direct',
      description: `Buying a shipping container in Indy? We provide ${CONDITION.label} containers with flat-fee delivery to Marion, Hamilton, and Hendricks counties.`,
    },
  },
  {
    slug: 'louisville-shipping-containers',
    city: 'Louisville',
    state: 'KY',
    region: 'Derby City',
    eyebrow: 'Louisville · Derby City',
    lede: 'From the historic riverfront to the sprawling horse farms of Oldham County, we deliver steel-clad protection to the gateway of the South.',
    delivery: {
      headline: 'Jefferson, Oldham, & Bullitt',
      body: 'We\'re well-versed in the Louisville metro. Whether you\'re navigating the tight streets of the Highlands or have a wide-open farm in Bullitt County, we\'ve got you covered.',
      counties: ['Jefferson County', 'Oldham County', 'Bullitt County', 'Shelby County', 'Spencer County'],
    },
    map: {
      bbox: '-85.959,38.053,-85.559,38.453',
      marker: '38.2527,-85.7585',
      title: 'Louisville, KY delivery area map',
    },
    content: {
      h2: 'Why Louisville buyers choose Steel Box Direct',
      intro: 'Louisville blends industrial power with agricultural tradition. Our containers serve both worlds, providing the durable, weather-tight storage needed for bourbon barrels, farm equipment, and more.',
      features: [
        { title: 'River City Durability',   body: 'With our proximity to the Ohio River, we know the importance of moisture-resistant storage. Our containers are wind and water tight, ensuring your inventory stays dry year-round.' },
        { title: 'Horse Farm Solutions',    body: 'From Oldham to Shelby County, we provide secure tack rooms, hay storage, and equipment protection that fits seamlessly into the rural landscape.' },
        { title: 'Bourbon Country Storage', body: 'We work with local distilleries and businesses to provide scalable, secure storage solutions for inventory, barrels, and specialized equipment.' },
      ],
    },
    stats: [
      { value: '95+', label: 'Units placed in Kentuckiana' },
      { value: '4.8/5', label: 'Local review average' },
    ],
    cta: {
      headline: 'Ready for a Louisville quote?',
      body: 'Most requests in Kentuckiana are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping Containers for Sale in Louisville, KY | Steel Box Direct',
      description: `Looking for a shipping container in Louisville? We offer ${CONDITION.label} containers with flat-fee delivery to Jefferson, Oldham, and Bullitt counties.`,
    },
  },
];
