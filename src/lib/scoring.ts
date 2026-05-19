/**
 * Lead Scoring System
 *
 * Computes a lead score based on form responses.
 * Higher scores indicate more qualified/ready leads.
 */

interface LeadData {
  size_preference: string;
  condition_preference: string;
  primary_use: string;
  timeline: string;
  site_access: string;
  buyer_notes?: string;
}

interface ScoreBreakdown {
  total: number;
  factors: Record<string, number>;
}

/**
 * Calculate lead score
 */
export function calculateLeadScore(data: LeadData): ScoreBreakdown {
  const factors: Record<string, number> = {};

  // Size preference (made a decision = more qualified)
  if (data.size_preference !== 'not_sure') {
    factors.size_specific = 10;
  } else {
    factors.size_unsure = 5;
  }

  // Condition preference (made a decision = more qualified)
  if (data.condition_preference !== 'not_sure') {
    factors.condition_specific = 10;
  } else {
    factors.condition_unsure = 5;
  }

  // Timeline (urgency)
  switch (data.timeline) {
    case 'asap':
      factors.timeline_asap = 20;
      break;
    case '1_3_months':
      factors.timeline_near = 15;
      break;
    case '3_6_months':
      factors.timeline_planning = 10;
      break;
    case 'researching':
      factors.timeline_researching = 3;
      break;
  }

  // Use case (agricultural/rural = target segment)
  const use = data.primary_use.toLowerCase();
  if (
    use.includes('farm') ||
    use.includes('equipment') ||
    use.includes('agricultural') ||
    use.includes('ranch') ||
    use.includes('rural') ||
    use.includes('storage')
  ) {
    factors.use_target_segment = 15;
  } else if (
    use.includes('workshop') ||
    use.includes('barn') ||
    use.includes('hay') ||
    use.includes('feed') ||
    use.includes('tractor')
  ) {
    factors.use_agricultural = 10;
  } else {
    factors.use_other = 5;
  }

  // Site access (easier = less friction)
  if (data.site_access === 'easy') {
    factors.access_easy = 5;
  } else if (data.site_access === 'challenging') {
    factors.access_challenging = 3;
  } else {
    factors.access_unsure = 2;
  }

  // Buyer notes (engagement signal)
  if (data.buyer_notes && data.buyer_notes.trim().length > 10) {
    factors.notes_provided = 5;
  }

  const total = Object.values(factors).reduce((sum, val) => sum + val, 0);

  return { total, factors };
}

/**
 * Get priority tier based on score
 */
export function getPriorityTier(score: number): 'priority' | 'standard' | 'lower' {
  if (score >= 50) return 'priority';
  if (score >= 30) return 'standard';
  return 'lower';
}

/**
 * Service area calculation
 * Cincinnati coordinates: 39.1031, -84.5120
 */
const CINCINNATI_LAT = 39.1031;
const CINCINNATI_LNG = -84.5120;
const SERVICE_RADIUS_MILES = 250;

/**
 * Calculate distance between two points using Haversine formula
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * ZIP code to coordinates lookup
 * In production, use a proper geocoding service or ZIP database
 * This is a simplified version with some Ohio/Kentucky/Indiana ZIPs
 */
const ZIP_COORDS: Record<string, [number, number]> = {
  // Cincinnati area
  '45202': [39.1031, -84.5120],
  '45203': [39.1088, -84.5275],
  '45204': [39.0964, -84.5631],
  '45205': [39.1092, -84.5858],
  '45206': [39.1288, -84.4808],
  '45207': [39.1436, -84.4678],
  '45208': [39.1364, -84.4339],
  '45209': [39.1564, -84.4264],
  '45211': [39.1564, -84.5964],
  '45212': [39.1678, -84.4608],
  // Columbus
  '43085': [40.0992, -83.0158],
  '43201': [39.9881, -83.0058],
  // Indianapolis
  '46201': [39.7756, -86.1089],
  '46202': [39.7889, -86.1656],
  // Louisville
  '40202': [38.2531, -85.7489],
  '40203': [38.2481, -85.7656],
  // Lexington
  '40502': [38.0308, -84.4972],
  '40503': [38.0158, -84.5264],
};

/**
 * Check if ZIP is in service area
 * Returns distance in miles, or null if ZIP not found
 */
export function checkServiceArea(zip: string): {
  inServiceArea: boolean;
  distanceMiles: number | null;
} {
  const cleanZip = zip.replace(/\D/g, '').substring(0, 5);
  const coords = ZIP_COORDS[cleanZip];

  if (!coords) {
    // ZIP not in our lookup - flag for manual review
    // In production, use a geocoding API
    return { inServiceArea: true, distanceMiles: null };
  }

  const distance = Math.round(
    haversineDistance(CINCINNATI_LAT, CINCINNATI_LNG, coords[0], coords[1])
  );

  return {
    inServiceArea: distance <= SERVICE_RADIUS_MILES,
    distanceMiles: distance,
  };
}
