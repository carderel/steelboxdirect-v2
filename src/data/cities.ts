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
  primaryZips: string[];
  zoning: Array<{ county: string; office: string; url: string }>;
  geography: { interstates: string[]; features: string[] };
  areaProfile: string;
  commonUses: Array<{ label: string; persona: 'farmers' | 'contractors' | 'homeowners' | 'businesses' }>;
  usesIntro: string;
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
      body: 'Delivered from regional depots serving the Tri-State. Whether it\'s a tight suburban driveway in Indian Hill or a sprawling field in Bethel, we plan placement and can scout tight or soft sites before scheduling.',
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
        { title: 'Local Delivery Knowledge',  body: 'From Brown to Warren to Butler county, we plan delivery routes for tight or rural access before scheduling. Permit and zoning requirements are set by your local authority and are the buyer\'s responsibility to confirm before purchasing.' },
      ],
    },
    stats: [
      { value: '5', label: 'Counties served' },
      { value: 'WWT', label: 'One honest grade' },
      { value: 'Est. 2009', label: 'Family-owned dealer' },
    ],
    primaryZips: ['45040', '45208', '45243', '45106'],
    zoning: [
      { county: 'Hamilton County', office: 'Hamilton County Regional Planning Commission', url: 'https://www.hamiltoncountyohio.gov/business_detail_T22_R29.php' },
      { county: 'Butler County', office: 'Butler County Planning Commission', url: 'https://www.bcohio.gov/board_of_commissioners/commissioner_departments/development/planning.php' },
      { county: 'Warren County', office: 'Warren County Regional Planning Commission', url: 'https://www.warrencountyohio.gov/Planning/GenInfo/Staff/Index' },
      { county: 'Clermont County', office: 'Clermont County Planning', url: 'http://www.clermontcountyohio.gov/planning' },
    ],
    geography: {
      interstates: ['I-75', 'I-71', 'I-275'],
      features: ['Ohio River'],
    },
    areaProfile: 'The Cincinnati metro ranges from hillside city neighborhoods overlooking the Ohio River to farmland in the outer Clermont and Brown County countryside, with Northern Kentucky forming the metro\'s suburban core across the river.',
    commonUses: [
      { label: 'Logistics & air-cargo overflow storage (CVG air-cargo hub)', persona: 'businesses' },
      { label: 'New-construction jobsite storage in the Mason/West Chester growth corridor', persona: 'contractors' },
      { label: 'Farm equipment & seasonal storage in outer Clermont & Brown counties', persona: 'farmers' },
      { label: 'Manufacturing parts & tooling overflow storage', persona: 'businesses' },
    ],
    usesIntro: 'From the CVG air-cargo hub to the farmland of outer Clermont and Brown counties, here\'s how Greater Cincinnati puts a container to work.',
    cta: {
      headline: 'Ready for a Cincinnati quote?',
      body: 'Most requests in the Tri-State are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping & Storage Containers for Sale in Cincinnati, OH | Steel Box Direct',
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
      body: 'Delivered via I-75, I-70, and I-675 to the Miami Valley. Whether you\'re near Wright-Patterson AFB or have a farm out in Miami County, we plan placement and can scout tight or soft sites before scheduling.',
      counties: ['Montgomery County', 'Greene County', 'Miami County', 'Clark County', 'Preble County'],
    },
    map: {
      bbox: '-84.392,39.559,-83.992,39.959',
      marker: '39.7589,-84.1916',
      title: 'Dayton, OH delivery area map',
    },
    content: {
      h2: 'Why Dayton buyers choose Steel Box Direct',
      intro: 'The "Birthplace of Aviation" knows the value of good engineering. Our containers are Wind & Water Tight — sound, storage-ready steel with the durability Dayton\'s manufacturing sector expects.',
      features: [
        { title: 'Manufacturing Storage', body: 'Dayton\'s industrial heritage means businesses often need quick, secure overflow storage. Our units are perfect for parts, tools, and inventory protection.' },
        { title: 'Wright-Patt Proximity', body: 'We understand the specific needs of contractors and personnel near the AFB. Secure, weather-tight storage is non-negotiable, and we deliver exactly that.' },
        { title: 'Miami Valley Expertise', body: 'From Beavercreek to Tipp City, we plan placement and can scout tight or soft sites before scheduling your container delivery.' },
      ],
    },
    stats: [
      { value: '5', label: 'Counties served' },
      { value: 'WWT', label: 'One honest grade' },
      { value: 'Est. 2009', label: 'Family-owned dealer' },
    ],
    primaryZips: ['45402', '45324', '45373', '45371', '45320'],
    zoning: [
      { county: 'Montgomery County', office: 'Montgomery County Planning Commission', url: 'https://www.selectmcohio.com/planning' },
      { county: 'Greene County', office: 'Greene County Regional Planning & Coordinating Commission', url: 'https://www.greenecountyohio.gov/301/Regional-Planning' },
      { county: 'Miami County', office: 'Miami County Planning & Zoning Department', url: 'https://www.miamicountyohio.gov/planning-zoning/' },
      { county: 'Clark County', office: 'Clark County Planning Commission', url: 'https://www.clarkcountyohio.gov/297/Clark-County-Planning-Commission' },
      { county: 'Preble County', office: 'Preble County Office of Land Use Management', url: 'https://www.prebco.org/167/Planning-Zoning' },
    ],
    geography: {
      interstates: ['I-75', 'I-70', 'I-675'],
      features: ['Great Miami River', 'Mad River'],
    },
    areaProfile: 'The city of Dayton itself is almost entirely urban, while Preble County to the west remains overwhelmingly rural farmland, a sharp density gradient across the same Miami Valley region.',
    commonUses: [
      { label: 'Aerospace & defense contractor equipment storage (Wright-Patterson AFB corridor)', persona: 'businesses' },
      { label: 'Farm equipment & grain-adjacent storage in Preble & Miami counties', persona: 'farmers' },
      { label: 'New-construction jobsite storage in growing suburbs like Beavercreek', persona: 'contractors' },
      { label: 'Manufacturing parts & tooling overflow storage', persona: 'businesses' },
    ],
    usesIntro: 'From the Wright-Patterson AFB corridor to the farmland of Preble County, here\'s how the Miami Valley puts a container to work.',
    cta: {
      headline: 'Ready for a Dayton quote?',
      body: 'Most requests in the Miami Valley are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping & Storage Containers for Sale in Dayton, OH | Steel Box Direct',
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
      body: 'Delivered from regional depots serving the Indianapolis metro. Whether it\'s a tight site in Carmel or a logistics facility near the airport, we plan placement and can scout tight or soft sites before scheduling.',
      counties: ['Marion County', 'Hamilton County', 'Hendricks County', 'Johnson County', 'Hancock County'],
    },
    map: {
      bbox: '-86.358,39.568,-85.958,39.968',
      marker: '39.7684,-86.1581',
      title: 'Indianapolis, IN delivery area map',
    },
    content: {
      h2: 'Why Indy buyers choose Steel Box Direct',
      intro: 'Indianapolis is a major logistics hub. We match that standard with high-quality, Wind & Water Tight containers that meet the demands of Indiana\'s business and agricultural sectors.',
      features: [
        { title: 'Crossroads Logistics',  body: 'We understand that Indy is where America\'s freight moves. Our containers provide the secure, mobile storage needed to keep your operations flexible and protected.' },
        { title: 'Hamilton County Growth', body: 'With rapid development in Fishers, Carmel, and Noblesville, we provide quick-deployment storage solutions for construction, retail, and homeowners.' },
        { title: 'Hoosier Reliability',   body: 'We\'re a family-owned operation that values the same hard work and transparency that defines Indiana. No brokers, no hidden fees — just local service.' },
      ],
    },
    stats: [
      { value: '5', label: 'Counties served' },
      { value: 'WWT', label: 'One honest grade' },
      { value: 'Est. 2009', label: 'Family-owned dealer' },
    ],
    primaryZips: ['46201', '46220', '46038', '46032', '46060'],
    zoning: [
      { county: 'Marion County', office: 'Indianapolis Department of Metropolitan Development, Division of Planning', url: 'https://www.indy.gov/agency/department-of-metropolitan-development' },
      { county: 'Hamilton County', office: 'Hamilton County Plan Commission', url: 'https://www.hamiltoncounty.in.gov/818/Plan-Commission' },
      { county: 'Hendricks County', office: 'Hendricks County Planning & Building Department', url: 'https://www.co.hendricks.in.us/department/index.php?structureid=18' },
      { county: 'Johnson County', office: 'Johnson County Department of Planning and Zoning', url: 'https://johnsoncounty.in.gov/department/index.php?structureid=41' },
      { county: 'Hancock County', office: 'Hancock County Planning & Building Department', url: 'https://hancockcoingov.org/hancock-county-government-departments/hancock-county-indiana-planning-building-department' },
    ],
    geography: {
      interstates: ['I-65', 'I-69', 'I-70', 'I-74', 'I-465'],
      features: ['White River'],
    },
    areaProfile: 'Marion County\'s fully built-out urban core gives way within a short drive to Hendricks and Hancock counties, where low rolling farmland and fast-growing suburbs meet along the same interstate corridors.',
    commonUses: [
      { label: 'Freight & logistics overflow storage at the I-65/I-70/I-74 crossroads', persona: 'businesses' },
      { label: 'New-construction jobsite storage in fast-growing Hamilton County suburbs', persona: 'contractors' },
      { label: 'Farm equipment & seasonal storage in Hendricks & Hancock County farmland', persona: 'farmers' },
      { label: 'Event & vendor support storage around Indianapolis Motor Speedway race weekends', persona: 'businesses' },
    ],
    usesIntro: 'From the freight crossroads of I-65 and I-70 to the farmland of Hendricks and Hancock counties, here\'s how Indianapolis puts a container to work.',
    cta: {
      headline: 'Ready for an Indy quote?',
      body: 'Most requests in Central Indiana are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping & Storage Containers for Sale in Indianapolis, IN | Steel Box Direct',
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
      body: 'Delivered from regional depots serving the Louisville metro. Whether it\'s a tight street in the Highlands or a wide-open farm in Bullitt County, we plan placement and can scout tight or soft sites before scheduling.',
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
        { title: 'Bourbon Country Storage', body: 'Scalable, secure storage suited to inventory, barrels, and specialized equipment — common needs across Louisville\'s distillery and business corridor.' },
      ],
    },
    stats: [
      { value: '5', label: 'Counties served' },
      { value: 'WWT', label: 'One honest grade' },
      { value: 'Est. 2009', label: 'Family-owned dealer' },
    ],
    primaryZips: ['40202', '40204', '40205', '40206', '40031'],
    zoning: [
      { county: 'Jefferson County', office: 'Louisville Metro Office of Planning & Design', url: 'https://louisvilleky.gov/government/office-planning' },
      { county: 'Oldham County', office: 'Oldham County Planning & Development Services', url: 'https://www.oldhamcountyky.gov/planningdevelopment' },
      { county: 'Bullitt County', office: 'Bullitt County Planning and Zoning', url: 'https://bullittky.com/?page_id=692' },
      { county: 'Shelby County', office: 'Shelby County Planning & Zoning Department', url: 'https://shelbycounty.ky.gov/departments/Pages/planning-and-zoning.aspx' },
      { county: 'Spencer County', office: 'Spencer County–Taylorsville Joint Planning & Zoning Commission', url: 'https://www.spencercountyky.gov/services/planning_zoning/index.php' },
    ],
    geography: {
      interstates: ['I-64', 'I-65', 'I-71', 'I-264', 'I-265'],
      features: ['Ohio River'],
    },
    areaProfile: 'Louisville\'s urban core stretches along the Ohio River, while Oldham and Shelby counties to the east remain rural horse-farm country long favored for large suburban and rural estates.',
    commonUses: [
      { label: 'Bourbon-barrel & distillery overflow storage', persona: 'businesses' },
      { label: 'Horse-farm tack & hay storage', persona: 'farmers' },
      { label: 'Air-cargo & logistics overflow storage (UPS Worldport hub)', persona: 'businesses' },
      { label: 'New-home construction jobsite storage in Bullitt & Spencer counties', persona: 'contractors' },
    ],
    usesIntro: 'Between the distilleries downtown and the horse farms in Oldham County, here\'s how Louisville puts a container to work.',
    cta: {
      headline: 'Ready for a Louisville quote?',
      body: 'Most requests in Kentuckiana are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping & Storage Containers for Sale in Louisville, KY | Steel Box Direct',
      description: `Looking for a shipping container in Louisville? We offer ${CONDITION.label} containers with flat-fee delivery to Jefferson, Oldham, and Bullitt counties.`,
    },
  },
];
