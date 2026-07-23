/**
 * Geolocation and scoring utilities for UFGuessr
 */

// Haversine formula to calculate distance between two coordinates in meters
export function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

/**
 * Calculates score based on distance in meters.
 * Designed for a campus game:
 * - 5000 points max.
 * - Under 5 meters gives a perfect 5000.
 * - Exponential decay with decay constant k = 500 meters.
 * - Under 500 meters gives a solid score (around 1800+ points).
 * - Beyond 2500 meters gives nearly 0 points.
 */
export function calculateScore(distanceInMeters: number): number {
  if (distanceInMeters <= 15) {
    return 5000;
  }

  // Decay constant (k) = 450 meters (a bit tighter than 545 for university campus accuracy)
  const k = 450;
  const score = Math.round(5000 * Math.exp(-(distanceInMeters - 15) / k));

  // Ensure score is within valid 0-5000 range
  return Math.max(0, Math.min(5000, score));
}

// UF Campus Center and Bounds
export const UF_CAMPUS_CENTER: [number, number] = [29.6436, -82.3549];

// Bounding box for leaflet to prevent players from dragging too far from campus
export const UF_CAMPUS_BOUNDS: [[number, number], [number, number]] = [
  [29.615, -82.395], // Southwest corner
  [29.670, -82.315], // Northeast corner
];
