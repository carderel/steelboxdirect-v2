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
  /** Full state name, e.g. 'Ohio'. */
  state: string;
  /** Kebab-case state segment for /locations/{stateSlug}/ URLs. */
  stateSlug: string;
  /** 'home' = OH-IN-KY home region · 'depot' = fulfilled via supplier-network depot (bridge copy renders at template level). */
  region: 'home' | 'depot';
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
    state: 'Ohio',
    stateSlug: 'ohio',
    region: 'home',
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
    state: 'Ohio',
    stateSlug: 'ohio',
    region: 'home',
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
    state: 'Indiana',
    stateSlug: 'indiana',
    region: 'home',
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
    state: 'Kentucky',
    stateSlug: 'kentucky',
    region: 'home',
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

  // ── Depot cities (fulfilled via supplier-network depots; bridge copy renders at template level) ──
  // Ground truth: .outputs/research/locations/2026-07-31-{city}.md (verified 2026-07-31).

  {
    slug: 'cleveland-shipping-containers',
    city: 'Cleveland',
    state: 'Ohio',
    stateSlug: 'ohio',
    region: 'depot',
    eyebrow: 'Cleveland · Northeast Ohio',
    lede: 'From the container docks on the lakefront to the farm townships of Medina and Geauga counties, we deliver steel-clad protection across Northeast Ohio.',
    delivery: {
      headline: 'Cuyahoga, Lorain, & Lake',
      body: 'Delivered from a depot serving Northeast Ohio via I-90, I-71, and I-77. Whether it\'s an industrial lot in the Flats or acreage out in Geauga County, we plan placement and can scout tight or soft sites before scheduling — and east-side lake-effect winters get factored into the schedule, not discovered on delivery day.',
      counties: ['Cuyahoga County', 'Lorain County', 'Lake County', 'Medina County', 'Geauga County'],
    },
    map: {
      bbox: '-81.894,41.299,-81.494,41.699',
      marker: '41.4993,-81.6944',
      title: 'Cleveland, OH delivery area map',
    },
    content: {
      h2: 'Why Cleveland buyers choose Steel Box Direct',
      intro: 'Cleveland is a working port town — containers move through the lakefront docks, and steel still rolls along the Cuyahoga. We speak that language: honest, Wind & Water Tight steel, graded one way and delivered where you need it.',
      features: [
        { title: 'Port-Corridor Storage', body: 'The Port of Cleveland is the Great Lakes\' container gateway, and warehousing demand around it is real. A container gives lakefront and Flats-corridor businesses secure cargo and equipment overflow on their own lot.' },
        { title: 'Snow-Belt Ready', body: 'Lake and Geauga counties sit in Northeast Ohio\'s lake-effect snow belt. Wind & Water Tight steel keeps equipment and inventory dry through the winters this region actually gets.' },
        { title: 'Local Delivery Knowledge', body: 'From Cuyahoga to Geauga County, we plan delivery routes for tight or rural access before scheduling. Permit and zoning requirements are set by your local authority and are the buyer\'s responsibility to confirm before purchasing.' },
      ],
    },
    stats: [
      { value: '5', label: 'Counties served' },
      { value: 'WWT', label: 'One honest grade' },
      { value: 'Est. 2009', label: 'Family-owned dealer' },
    ],
    primaryZips: ['44113', '44060', '44035', '44256', '44024'],
    zoning: [
      { county: 'Cuyahoga County', office: 'Cuyahoga County Planning Commission', url: 'https://www.countyplanning.us/services/community-planning/zoning-codes/' },
      { county: 'Lorain County', office: 'Lorain County Community Development Department', url: 'https://www.loraincountyohio.gov/575/Planning-and-Zoning' },
      { county: 'Lake County', office: 'Lake County Planning & Community Development', url: 'https://www.lakecountyohio.gov/planning-community-development/' },
      { county: 'Medina County', office: 'Medina County Department of Planning Services', url: 'https://www.medinaco.org/planning/' },
      { county: 'Geauga County', office: 'Geauga County Planning Commission', url: 'https://bocc.geauga.oh.gov/departments/planning-commission/' },
    ],
    geography: {
      interstates: ['I-90', 'I-71', 'I-77', 'I-480', 'I-271'],
      features: ['Lake Erie', 'Cuyahoga River'],
    },
    areaProfile: 'The Cleveland metro runs from dense lakefront neighborhoods and the industrial Flats along the Cuyahoga River — home to the Port of Cleveland and one of North America\'s major flat-rolled steel operations — out to rural townships in Medina, Geauga, and outer Lorain counties. The port is the Great Lakes\' container gateway, with a scheduled Cleveland–Europe container service, so warehousing and cargo-overflow demand is real here, and lake-effect winters keep seasonal storage in steady demand on the east side.',
    commonUses: [
      { label: 'Port & Great Lakes cargo overflow storage near the lakefront and the Flats (Port of Cleveland container gateway)', persona: 'businesses' },
      { label: 'Manufacturing parts & tooling overflow storage along the Cuyahoga River industrial corridor', persona: 'businesses' },
      { label: 'Renovation & new-build jobsite storage across the western and southern suburbs (Lorain & Medina counties)', persona: 'contractors' },
      { label: 'Farm equipment & seasonal storage in rural Medina, Geauga, and outer Lorain townships', persona: 'farmers' },
    ],
    usesIntro: 'From the container docks at the Port of Cleveland to the farm townships of Medina and Geauga counties, here\'s how Northeast Ohio puts a container to work.',
    cta: {
      headline: 'Ready for a Cleveland quote?',
      body: 'Most requests in Northeast Ohio are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping & Storage Containers for Sale in Cleveland, OH | Steel Box Direct',
      description: `Buying a shipping container in Cleveland? We provide ${CONDITION.label} containers with depot-based delivery to Cuyahoga, Lorain, and Lake counties.`,
    },
  },
  {
    slug: 'savannah-shipping-containers',
    city: 'Savannah',
    state: 'Georgia',
    stateSlug: 'georgia',
    region: 'depot',
    eyebrow: 'Savannah · Coastal Empire',
    lede: 'From the container yards of Garden City to the timber and row-crop country of Effingham and Bulloch counties, we deliver steel-clad protection to the Savannah lowcountry.',
    delivery: {
      headline: 'Chatham, Effingham, & Bryan',
      body: 'Delivered from a depot in the Savannah area via I-95 and I-16. Whether it\'s a warehouse lot in Garden City or acreage outside Rincon, we plan placement and can scout tight or soft coastal sites before scheduling.',
      counties: ['Chatham County', 'Effingham County', 'Bryan County', 'Bulloch County', 'Liberty County'],
    },
    map: {
      bbox: '-81.291,31.881,-80.891,32.281',
      marker: '32.0809,-81.0912',
      title: 'Savannah, GA delivery area map',
    },
    content: {
      h2: 'Why Savannah buyers choose Steel Box Direct',
      intro: 'Savannah is a port town first — the Georgia Ports Authority describes Garden City Terminal as the largest single container terminal in North America, and a warehousing belt has grown up around it. We put the same steel those docks run on to work on your site.',
      features: [
        { title: 'Port-Belt Capacity', body: 'Garden City, Port Wentworth, and Pooler run on warehousing and distribution. A container on your own lot adds secure overflow capacity without signing another lease.' },
        { title: 'Lowcountry Ground Checks', body: 'Sandy soils, tidal marsh edges, and a high water table mean coastal sites can go soft after rain. We check ground conditions and placement before the truck rolls, not after.' },
        { title: 'Local Delivery Knowledge', body: 'From Chatham to Bulloch County, we plan delivery routes for tight or rural access before scheduling. Permit and zoning requirements are set by your local authority and are the buyer\'s responsibility to confirm before purchasing.' },
      ],
    },
    stats: [
      { value: '5', label: 'Counties served' },
      { value: 'WWT', label: 'One honest grade' },
      { value: 'Est. 2009', label: 'Family-owned dealer' },
    ],
    primaryZips: ['31401', '31405', '31408', '31419', '31322', '31324'],
    zoning: [
      { county: 'Chatham County', office: 'Chatham County–Savannah Metropolitan Planning Commission', url: 'https://www.thempc.org/Ordinance/Chatham' },
      { county: 'Effingham County', office: 'Effingham County Planning & Zoning (Development Services)', url: 'https://www.effinghamcounty.org/241/Planning-Zoning' },
      { county: 'Bryan County', office: 'Bryan County Community Development — Planning & Zoning', url: 'https://www.bryancountyga.gov/government/departments-h-z/planning-zoning' },
      { county: 'Bulloch County', office: 'Bulloch County Planning and Development', url: 'https://bullochcounty.net/planning-and-zoning/' },
      { county: 'Liberty County', office: 'Liberty Consolidated Planning Commission', url: 'https://thelcpc.org/zoning/' },
    ],
    geography: {
      interstates: ['I-95', 'I-16', 'I-516'],
      features: ['Savannah River', 'Coastal marshes & lowcountry terrain'],
    },
    areaProfile: 'The Savannah metro is anchored by the Port of Savannah, whose Garden City Terminal the Georgia Ports Authority describes as the largest single container terminal in North America — and the warehousing and distribution belt that has grown up around it in Garden City, Port Wentworth, and Pooler. Beyond the port, the economy runs on aerospace manufacturing (Gulfstream), the military presence at Fort Stewart–Hunter Army Airfield, historic-district tourism, and a fast-industrializing Bryan County corridor around the Hyundai Metaplant, while Effingham and Bulloch counties stay largely agricultural.',
    commonUses: [
      { label: 'Warehouse & distribution overflow storage in the port corridor (Garden City, Port Wentworth, Pooler)', persona: 'businesses' },
      { label: 'Jobsite storage for the building boom in Pooler and the Bryan County industrial corridor', persona: 'contractors' },
      { label: 'Row-crop and timber equipment storage in Effingham and Bulloch counties', persona: 'farmers' },
      { label: 'Storm-season prep and renovation storage for lowcountry homeowners', persona: 'homeowners' },
    ],
    usesIntro: 'From the container yards of Garden City to the farmland of Effingham County, here\'s how the Savannah lowcountry puts a container to work.',
    cta: {
      headline: 'Ready for a Savannah quote?',
      body: 'Most requests in the Coastal Empire are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping & Storage Containers for Sale in Savannah, GA | Steel Box Direct',
      description: `Buying a shipping container in Savannah? We provide ${CONDITION.label} containers with depot-based delivery to Chatham, Effingham, and Bryan counties.`,
    },
  },
  {
    slug: 'charleston-shipping-containers',
    city: 'Charleston',
    state: 'South Carolina',
    stateSlug: 'south-carolina',
    region: 'depot',
    eyebrow: 'Charleston · Lowcountry',
    lede: 'From the container terminals on the Cooper River to the growth corridor around Summerville, we deliver steel-clad protection across the South Carolina Lowcountry.',
    delivery: {
      headline: 'Charleston, Berkeley, & Dorchester',
      body: 'Delivered from a depot serving the tri-county metro via the I-26 corridor and the I-526 loop, with island and beach communities reached by bridge causeways. Low-lying Lowcountry ground is a real placement consideration — soft or flood-zone sites often want a gravel pad or blocking first — so we plan placement and can scout tight or soft sites before scheduling.',
      counties: ['Charleston County', 'Berkeley County', 'Dorchester County'],
    },
    map: {
      bbox: '-80.131,32.576,-79.731,32.976',
      marker: '32.7765,-79.9311',
      title: 'Charleston, SC delivery area map',
    },
    content: {
      h2: 'Why Charleston buyers choose Steel Box Direct',
      intro: 'The Charleston metro is built around its port — SC Ports ranks the Port of Charleston the 8th-largest U.S. container port — with Boeing and Volvo anchoring the industrial side. Weather-tight storage is a way of life on this coast, and that\'s the only grade we sell.',
      features: [
        { title: 'Port & Plant Corridor', body: 'From the Cooper River terminals to Boeing North Charleston and the Volvo plant in Ridgeville, the I-26 corridor runs on freight. A container puts secure overflow storage on your own site, right on the corridor.' },
        { title: 'Hurricane-Season Sense', body: 'The state\'s emergency management division publishes evacuation zones and an annual hurricane guide for this coastline. Locals here think about secure, weather-tight storage differently — Wind & Water Tight steel is built for exactly that.' },
        { title: 'Flood-Zone Placement', body: 'Much of the metro sits in mapped flood zones with a high water table, so we plan pads, blocking, and access before scheduling. Permit and zoning requirements are set by your local authority and are the buyer\'s responsibility to confirm before purchasing.' },
      ],
    },
    stats: [
      { value: '3', label: 'Counties served' },
      { value: 'WWT', label: 'One honest grade' },
      { value: 'Est. 2009', label: 'Family-owned dealer' },
    ],
    primaryZips: ['29401', '29405', '29464', '29483', '29445'],
    zoning: [
      { county: 'Charleston County', office: 'Charleston County Zoning & Planning Department', url: 'https://www.charlestoncounty.gov/departments/zoning-planning/' },
      { county: 'Berkeley County', office: 'Berkeley County Planning and Zoning Department', url: 'https://berkeleycountysc.gov/dept/planning/' },
      { county: 'Dorchester County', office: 'Dorchester County Planning & Zoning Department', url: 'https://www.dorchestercountysc.gov/business/planning-zoning' },
    ],
    geography: {
      interstates: ['I-26', 'I-526'],
      features: ['Ashley River', 'Cooper River', 'Wando River', 'Atlantic tidal marsh'],
    },
    areaProfile: 'The Charleston metro is built around the Port of Charleston — which SC Ports ranks as the 8th-largest U.S. container port — with major industrial anchors in Boeing\'s 787 Dreamliner final-assembly campus in North Charleston and the Volvo Car plant in Ridgeville, Berkeley County. Beyond the port and plants, hurricane-season preparedness is a recurring fact of life on this stretch of coast — the state\'s emergency management division publishes evacuation zones and an annual hurricane guide for the Charleston coastline — so locals here think about secure, weather-tight storage in a way inland metros don\'t have to.',
    commonUses: [
      { label: 'Port-linked freight & logistics overflow storage along the I-26 corridor', persona: 'businesses' },
      { label: 'Aerospace & automotive supplier storage near Boeing North Charleston and Volvo Ridgeville', persona: 'businesses' },
      { label: 'New-construction jobsite storage in the Summerville–Goose Creek–Moncks Corner growth corridor', persona: 'contractors' },
      { label: 'Home-renovation and hurricane-season storage for coastal and flood-zone properties', persona: 'homeowners' },
    ],
    usesIntro: 'From the container terminals on the Cooper River to the growth corridor around Summerville, here\'s how the Lowcountry puts a container to work.',
    cta: {
      headline: 'Ready for a Charleston quote?',
      body: 'Most requests in the Lowcountry are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping & Storage Containers for Sale in Charleston, SC | Steel Box Direct',
      description: `Buying a shipping container in Charleston? We provide ${CONDITION.label} containers with depot-based delivery to Charleston, Berkeley, and Dorchester counties.`,
    },
  },
  {
    slug: 'norfolk-shipping-containers',
    city: 'Norfolk',
    state: 'Virginia',
    stateSlug: 'virginia',
    region: 'depot',
    eyebrow: 'Norfolk · Hampton Roads',
    lede: 'From the container cranes at Norfolk International Terminals to the peanut fields of rural Suffolk, we deliver steel-clad protection across the seven cities of Hampton Roads.',
    delivery: {
      headline: 'Norfolk, Virginia Beach, & Chesapeake',
      body: 'Delivered from a depot serving Hampton Roads. The harbor splits the metro — reaching the Peninsula means the I-64 or I-664 bridge-tunnels, and the Elizabeth River tunnels between Norfolk and Portsmouth are tolled — so we plan routing before delivery day, and can scout soft, sandy Tidewater sites before scheduling.',
      counties: ['City of Norfolk', 'City of Virginia Beach', 'City of Chesapeake', 'City of Portsmouth', 'City of Suffolk', 'City of Newport News', 'City of Hampton'],
    },
    map: {
      bbox: '-76.486,36.651,-76.086,37.051',
      marker: '36.8508,-76.2859',
      title: 'Norfolk, VA delivery area map',
    },
    content: {
      h2: 'Why Norfolk buyers choose Steel Box Direct',
      intro: 'Hampton Roads is organized around its harbor — the Port of Virginia\'s container terminals, the world\'s largest naval station, and Virginia\'s largest industrial employer at Newport News Shipbuilding across the water. Storage here has to handle salt air and storm season; Wind & Water Tight steel does.',
      features: [
        { title: 'Harbor-Smart Routing', body: 'Seven cities with a harbor in the middle. Peninsula deliveries run the I-64 or I-664 bridge-tunnels, and the Elizabeth River tunnels are tolled — we plan the route before delivery day, not during it.' },
        { title: 'Tidewater Ground Prep', body: 'Flat, low-lying coastal plain means soft, sandy, high-water-table ground is a real placement consideration. A gravel pad or railroad-tie footing earns its keep here, and we\'ll talk it through before scheduling.' },
        { title: 'City-by-City Zoning', body: 'Hampton Roads runs on Virginia\'s independent-city system — each city\'s own planning department administers zoning. Permit and zoning requirements are set by your local authority and are the buyer\'s responsibility to confirm before purchasing.' },
      ],
    },
    stats: [
      { value: '7', label: 'Cities served' },
      { value: 'WWT', label: 'One honest grade' },
      { value: 'Est. 2009', label: 'Family-owned dealer' },
    ],
    primaryZips: ['23510', '23502', '23518', '23320', '23454', '23435'],
    zoning: [
      { county: 'City of Norfolk', office: 'City of Norfolk Zoning (Department of City Planning)', url: 'https://www.norfolk.gov/1088/Zoning' },
      { county: 'City of Virginia Beach', office: 'Virginia Beach Planning & Community Development — Zoning', url: 'https://planning.virginiabeach.gov/zoning' },
      { county: 'City of Chesapeake', office: 'City of Chesapeake Zoning Administration', url: 'https://www.cityofchesapeake.net/645/Zoning-Administration' },
      { county: 'City of Portsmouth', office: 'City of Portsmouth Planning Department — Zoning', url: 'https://www.portsmouthva.gov/482/Zoning' },
      { county: 'City of Suffolk', office: 'City of Suffolk Zoning Administration (Planning & Community Development)', url: 'https://www.suffolkva.us/497/Zoning-Administration' },
      { county: 'City of Newport News', office: 'City of Newport News Zoning Division (Planning Department)', url: 'https://www.nnva.gov/2932/Zoning-Division' },
      { county: 'City of Hampton', office: 'City of Hampton Planning & Zoning Administration (Community Development)', url: 'https://www.hampton.gov/258/Planning-Zoning-Administration' },
    ],
    geography: {
      interstates: ['I-64', 'I-264', 'I-464', 'I-564', 'I-664'],
      features: ['Chesapeake Bay', 'Elizabeth River', 'James River', 'Hampton Roads harbor'],
    },
    areaProfile: 'Hampton Roads is a seven-city coastal metro organized around its harbor: the Port of Virginia moves containers through Norfolk International Terminals — the port\'s largest terminal — and Virginia International Gateway, Naval Station Norfolk is the world\'s largest naval station, and Newport News Shipbuilding across the water is Virginia\'s largest industrial employer. Away from the waterfront the metro turns genuinely rural — Suffolk and western Chesapeake are peanut-and-row-crop country, a legacy dating to Planters setting up in Suffolk in 1912.',
    commonUses: [
      { label: 'Port drayage & import/export overflow storage near Norfolk International Terminals & Virginia International Gateway', persona: 'businesses' },
      { label: 'Jobsite storage for base- and shipyard-corridor construction work across the seven cities', persona: 'contractors' },
      { label: 'Farm equipment & peanut-country storage in rural Suffolk & western Chesapeake', persona: 'farmers' },
      { label: 'Household storage through PCS military moves & home renovations', persona: 'homeowners' },
    ],
    usesIntro: 'From the container cranes at Norfolk International Terminals to the peanut fields of rural Suffolk, here\'s how Hampton Roads puts a container to work.',
    cta: {
      headline: 'Ready for a Norfolk quote?',
      body: 'Most requests in Hampton Roads are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping & Storage Containers for Sale in Norfolk, VA | Steel Box Direct',
      description: `Buying a shipping container in Norfolk? We provide ${CONDITION.label} containers with depot-based delivery to Norfolk, Virginia Beach, Chesapeake, and across Hampton Roads.`,
    },
  },
  {
    slug: 'houston-shipping-containers',
    city: 'Houston',
    state: 'Texas',
    stateSlug: 'texas',
    region: 'depot',
    eyebrow: 'Houston · Gulf Coast',
    lede: 'From the Ship Channel docks to the master-planned suburbs of Katy and The Woodlands, we deliver steel-clad protection across Greater Houston.',
    delivery: {
      headline: 'Harris, Fort Bend, & Montgomery',
      body: 'Delivered from a depot serving Greater Houston via I-10, I-45, I-69, and the I-610 loop. Clay-heavy Gulf Coast soils drain slowly and much of the metro sits in or near mapped floodplains, so we plan placement on firm, elevated ground and can scout tight or soft sites before scheduling.',
      counties: ['Harris County', 'Fort Bend County', 'Montgomery County', 'Brazoria County', 'Galveston County'],
    },
    map: {
      bbox: '-95.570,29.560,-95.170,29.960',
      marker: '29.7604,-95.3698',
      title: 'Houston, TX delivery area map',
    },
    content: {
      h2: 'Why Houston buyers choose Steel Box Direct',
      intro: 'Houston is the center of the U.S. energy industry, and the Ship Channel complex is the nation\'s largest port by waterborne tonnage. Big freight and big weather — our Wind & Water Tight containers are built for both.',
      features: [
        { title: 'Ship Channel Capacity', body: 'The port and petrochemical corridor east of downtown runs around the clock. A container on your own yard adds secure equipment and materials storage without waiting on warehouse space.' },
        { title: 'Floodplain-Aware Placement', body: 'The Harris County Flood Control District notes a major flood occurs somewhere in the county about every two years. We plan container placement on firm, elevated ground that stays solid after heavy rain.' },
        { title: 'Houston\'s Own Rulebook', body: 'The City of Houston famously has no conventional zoning — development runs on ordinance codes, and the counties handle development and floodplain permitting. Requirements are set by your local authority and are the buyer\'s responsibility to confirm before purchasing.' },
      ],
    },
    stats: [
      { value: '5', label: 'Counties served' },
      { value: 'WWT', label: 'One honest grade' },
      { value: 'Est. 2009', label: 'Family-owned dealer' },
    ],
    primaryZips: ['77002', '77008', '77029', '77494', '77380', '77584'],
    zoning: [
      { county: 'City of Houston (no zoning — ordinance-based development rules)', office: 'Houston Planning & Development Department — Development Regulations', url: 'https://www.houstontx.gov/planning/DevelopRegs/' },
      { county: 'Harris County (unincorporated)', office: 'Harris County Office of the County Engineer — Permits Division', url: 'https://oce.harriscountytx.gov/Services/Permits' },
      { county: 'Fort Bend County', office: 'Fort Bend County Engineering Department — Development Permits', url: 'https://www.fortbendcountytx.gov/government/departments/county-services/engineering/permits/development-permit' },
      { county: 'Montgomery County', office: 'Montgomery County Environmental Health — Permitting', url: 'https://www.mctx.org/departments/departments_d_-_f/environmental_health/permitting/index.php' },
      { county: 'Brazoria County', office: 'Brazoria County Floodplain Department — Floodplain/Building Permits', url: 'https://www.brazoriacountytx.gov/departments/floodplain' },
      { county: 'Galveston County', office: 'Galveston County Engineering — Floodplain Permitting & Right-of-Way', url: 'https://www.galvestoncountytx.gov/county-offices/engineering-floodplain-right-of-way/floodplain' },
    ],
    geography: {
      interstates: ['I-10', 'I-45', 'I-69', 'I-610'],
      features: ['Houston Ship Channel', 'Buffalo Bayou', 'Galveston Bay'],
    },
    areaProfile: 'Houston sprawls across the flat Gulf Coastal Plain, from the port and petrochemical corridor along the Houston Ship Channel east of downtown to fast-growing master-planned suburbs like Katy, Pearland, and The Woodlands. The Ship Channel complex is the nation\'s largest port by waterborne tonnage, and the surrounding metro is the center of the U.S. energy industry.',
    commonUses: [
      { label: 'Port & distribution overflow storage along the Houston Ship Channel corridor', persona: 'businesses' },
      { label: 'Energy & petrochemical contractor equipment and materials storage', persona: 'businesses' },
      { label: 'New-construction jobsite storage in growth corridors like Katy and The Woodlands', persona: 'contractors' },
      { label: 'Hurricane-season prep & recovery storage for Gulf Coast homeowners', persona: 'homeowners' },
    ],
    usesIntro: 'From the Ship Channel docks to the master-planned suburbs of Katy and The Woodlands, here\'s how Greater Houston puts a container to work.',
    cta: {
      headline: 'Ready for a Houston quote?',
      body: 'Most requests in Greater Houston are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping & Storage Containers for Sale in Houston, TX | Steel Box Direct',
      description: `Buying a shipping container in Houston? We provide ${CONDITION.label} containers with depot-based delivery to Harris, Fort Bend, and Montgomery counties.`,
    },
  },
  {
    slug: 'new-york-shipping-containers',
    city: 'New York',
    state: 'New York',
    stateSlug: 'new-york',
    region: 'depot',
    eyebrow: 'New York · Five Boroughs',
    lede: 'From contractor yards in the outer boroughs to driveways in Nassau and Westchester, we deliver steel-clad protection to the New York metro — with straight talk about where a container can actually go.',
    delivery: {
      headline: 'The Five Boroughs, Nassau, & Westchester',
      body: 'Delivered from a depot serving the New York metro. This is the tightest delivery market we serve: parkways are closed to trucks, and much of the urban core has nowhere to set a box — so we plan placement and can scout tight sites before scheduling. Realistic placements are outer-borough lots and yards, Staten Island and eastern Queens driveways, and suburban Nassau and Westchester properties.',
      counties: ['Manhattan (New York County)', 'Brooklyn (Kings County)', 'Queens (Queens County)', 'The Bronx (Bronx County)', 'Staten Island (Richmond County)', 'Nassau County', 'Westchester County'],
    },
    map: {
      bbox: '-74.206,40.513,-73.806,40.913',
      marker: '40.7128,-74.0060',
      title: 'New York, NY delivery area map',
    },
    content: {
      h2: 'Why New York buyers choose Steel Box Direct',
      intro: 'Selling a container into New York honestly means starting with placement, not price. We\'ll tell you upfront whether your site works — and if a Brooklyn curb won\'t, a yard in Queens, Staten Island, or the suburbs usually will.',
      features: [
        { title: 'Placement Realism', body: 'Much of the city has nowhere to set a 40-footer, and we say so. We plan around what your site can actually take — outer-borough lots, driveways, and suburban yards — before anything gets scheduled.' },
        { title: 'Truck-Route Planning', body: 'New York\'s parkways are off-limits to trucks, so delivery runs the interstates and designated truck routes. We route the tilt-bed before scheduling, not on delivery day.' },
        { title: 'Permits Are Local', body: 'In the five boroughs that means the NYC Department of Buildings and the citywide Zoning Resolution; in Nassau and Westchester, your town or village. Permit and zoning requirements are set by your local authority and are the buyer\'s responsibility to confirm before purchasing.' },
      ],
    },
    stats: [
      { value: '7', label: 'Counties served' },
      { value: 'WWT', label: 'One honest grade' },
      { value: 'Est. 2009', label: 'Family-owned dealer' },
    ],
    primaryZips: ['10001', '11201', '11101', '10451', '10301'],
    zoning: [
      { county: 'New York City (all five boroughs)', office: 'NYC Department of City Planning — Zoning', url: 'https://www.nyc.gov/content/planning/pages/zoning' },
      { county: 'New York City (all five boroughs)', office: 'NYC Department of Buildings', url: 'https://www.nyc.gov/site/buildings/index.page' },
      { county: 'Nassau County', office: 'Nassau County Planning Division (zoning is administered by Nassau\'s towns, cities & villages)', url: 'https://www.nassaucountyny.gov/2856/Planning-Department' },
      { county: 'Westchester County', office: 'Westchester County Planning Department (zoning is administered by Westchester\'s municipalities)', url: 'https://planning.westchestercountyny.gov/' },
    ],
    geography: {
      interstates: ['I-95', 'I-278', 'I-495', 'I-87', 'I-678'],
      features: ['Hudson River', 'East River', 'New York Harbor'],
    },
    areaProfile: 'The New York metro pairs the East Coast\'s busiest container port — the Port of New York & New Jersey — with construction activity that leads the nation. Density falls off fast from the Manhattan core: Staten Island, eastern Queens, and the Nassau and Westchester suburbs are where the yards, driveways, and industrial lots that make container placement realistic actually are.',
    commonUses: [
      { label: 'Port-adjacent logistics & freight overflow storage (Port of New York & New Jersey)', persona: 'businesses' },
      { label: 'Construction jobsite tool & material storage across the five boroughs', persona: 'contractors' },
      { label: 'Renovation & moving storage on driveways in Staten Island, eastern Queens & the suburbs', persona: 'homeowners' },
      { label: 'Retail & restaurant inventory overflow where commercial square footage is at a premium', persona: 'businesses' },
    ],
    usesIntro: 'From the container terminals of New York Harbor to renovation projects in the outer boroughs, here\'s how the New York metro puts a container to work.',
    cta: {
      headline: 'Ready for a New York quote?',
      body: 'Most requests in the New York metro are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping & Storage Containers for Sale in New York, NY | Steel Box Direct',
      description: `Buying a shipping container in New York? We provide ${CONDITION.label} containers delivered from a regional depot to the five boroughs, Nassau, and Westchester.`,
    },
  },
  {
    slug: 'detroit-shipping-containers',
    city: 'Detroit',
    state: 'Michigan',
    stateSlug: 'michigan',
    region: 'depot',
    eyebrow: 'Detroit · Motor City',
    lede: 'From the assembly corridors of the Big Three to the farmland edges of Livingston and St. Clair counties, we deliver steel-clad protection across Metro Detroit.',
    delivery: {
      headline: 'Wayne, Oakland, & Macomb',
      body: 'Delivered from a depot serving Metro Detroit via I-75, I-94, I-96, and the I-696 corridor. Flat lake-plain ground makes for easy grades, but spring freeze-thaw can leave unpaved sites soft and Michigan\'s seasonal road weight restrictions can affect truck routing — so we plan placement and timing before scheduling.',
      counties: ['Wayne County', 'Oakland County', 'Macomb County', 'Livingston County', 'St. Clair County'],
    },
    map: {
      bbox: '-83.246,42.131,-82.846,42.531',
      marker: '42.3314,-83.0458',
      title: 'Detroit, MI delivery area map',
    },
    content: {
      h2: 'Why Detroit buyers choose Steel Box Direct',
      intro: 'Metro Detroit is the center of the American auto industry — GM downtown, Ford in Dearborn, Stellantis in Auburn Hills — with a deep supplier and skilled-trades economy behind it. That economy runs on parts, tooling, and equipment that need to stay dry.',
      features: [
        { title: 'Supplier-Corridor Storage', body: 'Parts, tooling, and line-side overflow don\'t stop when the warehouse fills. A Wind & Water Tight container puts secure capacity in your own yard, along the same corridors the plants run.' },
        { title: 'Freeze-Thaw Planning', body: 'Great Lakes winters mean spring thaw can soften unpaved ground, and seasonal weight restrictions hit many county and local roads. We schedule around the thaw window instead of fighting it.' },
        { title: 'Township-Level Zoning', body: 'In Michigan, zoning is adopted at the city, township, or village level — the county offices we list are your starting points. Permit and zoning requirements are set by your local authority and are the buyer\'s responsibility to confirm before purchasing.' },
      ],
    },
    stats: [
      { value: '5', label: 'Counties served' },
      { value: 'WWT', label: 'One honest grade' },
      { value: 'Est. 2009', label: 'Family-owned dealer' },
    ],
    primaryZips: ['48226', '48201', '48126', '48089', '48083'],
    zoning: [
      { county: 'Wayne County', office: 'City of Detroit Buildings, Safety Engineering & Environmental Department (BSEED) — Zoning Division (Detroit proper; suburbs zone locally)', url: 'https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department' },
      { county: 'Oakland County', office: 'Oakland County Planning — Planning Services: Land Use, Zoning & Policy (zoning itself is by each city/township; county maintains community zoning-ordinance links)', url: 'https://www.oakgov.com/community/community-development/planning-services' },
      { county: 'Macomb County', office: 'Macomb County Planning & Economic Development — Community Planning Division (land use & zoning assistance for local communities)', url: 'https://www.macombgov.org/departments/planning-and-economic-development/planning-services-land-use-zoning-and-policy' },
      { county: 'Livingston County', office: 'Livingston County Department of Planning', url: 'https://milivcounty.gov/plan' },
      { county: 'St. Clair County', office: 'St. Clair County Metropolitan Planning Commission', url: 'https://www.stclaircounty.org/offices/metro/' },
    ],
    geography: {
      interstates: ['I-75', 'I-94', 'I-96', 'I-696', 'I-275'],
      features: ['Detroit River', 'Lake St. Clair'],
    },
    areaProfile: 'Metro Detroit is the center of the American auto industry — GM headquartered downtown, Ford in Dearborn, and Stellantis\' North American base in Auburn Hills — with a deep supplier and skilled-trades economy spread across Wayne, Oakland, and Macomb counties. The tri-county core is densely built urban and suburban ground, while Livingston and St. Clair counties at the metro\'s edges stay largely rural, with working farmland a short drive from the plants.',
    commonUses: [
      { label: 'Automotive supplier parts & tooling overflow storage along the Big Three plant corridors', persona: 'businesses' },
      { label: 'Cross-border freight & logistics overflow storage on the Detroit–Windsor trade corridor', persona: 'businesses' },
      { label: 'Renovation & building-trades jobsite storage across Detroit neighborhoods and the suburban build-out', persona: 'contractors' },
      { label: 'Farm equipment & seasonal storage in Livingston & St. Clair county farmland', persona: 'farmers' },
    ],
    usesIntro: 'From the assembly corridors of the Big Three to the farmland edges of Livingston and St. Clair counties, here\'s how Metro Detroit puts a container to work.',
    cta: {
      headline: 'Ready for a Detroit quote?',
      body: 'Most requests in Metro Detroit are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping & Storage Containers for Sale in Detroit, MI | Steel Box Direct',
      description: `Buying a shipping container in Detroit? We provide ${CONDITION.label} containers with depot-based delivery to Wayne, Oakland, and Macomb counties.`,
    },
  },
  {
    slug: 'kansas-city-shipping-containers',
    city: 'Kansas City',
    state: 'Missouri',
    stateSlug: 'missouri',
    region: 'depot',
    eyebrow: 'Kansas City · KC Metro',
    lede: 'From the rail yards in the river bottoms to the row crops of Cass County, we deliver steel-clad protection across the Kansas City metro — both sides of the state line.',
    delivery: {
      headline: 'Jackson, Clay, & Platte',
      body: 'Delivered from a depot serving the Kansas City metro off the I-435 loop and the I-70 and I-35 corridors. Whether it\'s a distribution lot in the river bottoms or acreage south of Harrisonville, we plan placement and can scout tight or soft sites before scheduling — on either side of the state line.',
      counties: ['Jackson County', 'Clay County', 'Platte County', 'Cass County', 'Johnson/Wyandotte (KS)'],
    },
    map: {
      bbox: '-94.779,38.900,-94.379,39.300',
      marker: '39.0997,-94.5786',
      title: 'Kansas City, MO delivery area map',
    },
    content: {
      h2: 'Why Kansas City buyers choose Steel Box Direct',
      intro: 'Kansas City is one of the nation\'s busiest rail-freight hubs, with intermodal terminals converging near the river confluence and warehousing anchoring the metro economy. When spring storm season rolls through, locals put equipment under steel — we sell exactly that.',
      features: [
        { title: 'Rail-Hub Overflow', body: 'Multiple Class I railroads and intermodal terminals converge here, and distribution space runs tight. A container on your own lot adds secure freight and equipment overflow without another lease.' },
        { title: 'Storm-Season Steel', body: 'The region\'s most active severe-weather stretch runs roughly April into June, with large hail and tornado risk a spring fact of life. Wind & Water Tight steel beats a tarp every time.' },
        { title: 'Two States, One Metro', body: 'We cover the metro on both sides of the state line, Missouri and Kansas alike. Permit and zoning requirements are set by your local authority and are the buyer\'s responsibility to confirm before purchasing.' },
      ],
    },
    stats: [
      { value: '5', label: 'Counties served' },
      { value: 'WWT', label: 'One honest grade' },
      { value: 'Est. 2009', label: 'Family-owned dealer' },
    ],
    primaryZips: ['64106', '64114', '64118', '64151', '64701'],
    zoning: [
      { county: 'Jackson County', office: 'Jackson County Public Works — Development & Construction', url: 'https://www.jacksongov.org/Business/Development-and-Construction/Zoning-Subdivision-Applications' },
      { county: 'Clay County', office: 'Clay County Planning & Zoning Department', url: 'https://www.claycountymo.gov/217/Planning-Zoning-Department' },
      { county: 'Platte County', office: 'Platte County Planning and Zoning Department', url: 'https://www.co.platte.mo.us/planning-and-zoning' },
      { county: 'Cass County', office: 'Cass County Building Codes, Zoning & Environmental Health Department', url: 'https://www.casscounty.com/2144/Building-Codes-Zoning-Environmental-Heal' },
    ],
    geography: {
      interstates: ['I-70', 'I-35', 'I-29', 'I-49', 'I-435', 'I-470'],
      features: ['Missouri River', 'Kansas River'],
    },
    areaProfile: 'Kansas City is one of the nation\'s busiest rail-freight hubs — multiple Class I railroads and intermodal terminals converge near the confluence of the Kansas and Missouri rivers, and warehousing and distribution anchor the metro economy. The city itself spreads across four Missouri counties, from the Jackson County urban core to the fast-growing Northland suburbs of Clay and Platte counties, with working row-crop and cattle farms across Cass County to the south.',
    commonUses: [
      { label: 'Rail & intermodal freight overflow storage around KC\'s Class I railroad hub', persona: 'businesses' },
      { label: 'New-construction jobsite storage in the fast-growing Northland (Clay & Platte counties)', persona: 'contractors' },
      { label: 'Farm equipment, hay & grain-season storage in Cass County and the outer Clay–Platte farmland', persona: 'farmers' },
      { label: 'Manufacturing & supplier overflow storage in the Claycomo auto-assembly corridor', persona: 'businesses' },
    ],
    usesIntro: 'From the rail yards in the river bottoms to the row crops of Cass County, here\'s how Kansas City puts a container to work.',
    cta: {
      headline: 'Ready for a Kansas City quote?',
      body: 'Most requests in the KC metro are answered within 4 business hours.',
    },
    seo: {
      title: 'Shipping & Storage Containers for Sale in Kansas City, MO | Steel Box Direct',
      description: `Buying a shipping container in Kansas City? We provide ${CONDITION.label} containers with depot-based delivery to Jackson, Clay, and Platte counties.`,
    },
  },
];
