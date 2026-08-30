import type { Place } from './types';

// Borough reference centers for the quick-selector.
export const BOROUGHS: Place[] = [
  { slug: 'manhattan', name: 'Manhattan', borough: 'Manhattan', lon: -73.9772, lat: 40.7831, zoom: 11.5 },
  { slug: 'brooklyn', name: 'Brooklyn', borough: 'Brooklyn', lon: -73.9496, lat: 40.6501, zoom: 11.5 },
  { slug: 'queens', name: 'Queens', borough: 'Queens', lon: -73.7949, lat: 40.7282, zoom: 11 },
  { slug: 'bronx', name: 'The Bronx', borough: 'Bronx', lon: -73.8665, lat: 40.8448, zoom: 11.5 },
  { slug: 'staten-island', name: 'Staten Island', borough: 'Staten Island', lon: -74.1502, lat: 40.5795, zoom: 11.5 },
];

// Searchable neighborhoods (target areas have demo fixtures; others show terrain/basemap).
export const NEIGHBORHOODS: Place[] = [
  { slug: 'south-ozone-park', name: 'South Ozone Park', borough: 'Queens', lon: -73.8121, lat: 40.6766, zoom: 13.5 },
  { slug: 'gowanus-canal', name: 'Gowanus Canal', borough: 'Brooklyn', lon: -73.9903, lat: 40.6746, zoom: 13.5 },
  { slug: 'staten-island-east-shore', name: 'Staten Island East Shore', borough: 'Staten Island', lon: -74.0822, lat: 40.5944, zoom: 13.5 },
  { slug: 'flushing', name: 'Flushing', borough: 'Queens', lon: -73.833, lat: 40.7674, zoom: 13 },
  { slug: 'astoria', name: 'Astoria', borough: 'Queens', lon: -73.9308, lat: 40.7644, zoom: 13 },
  { slug: 'williamsburg', name: 'Williamsburg', borough: 'Brooklyn', lon: -73.9626, lat: 40.7081, zoom: 13.5 },
  { slug: 'lower-manhattan', name: 'Lower Manhattan', borough: 'Manhattan', lon: -74.006, lat: 40.7128, zoom: 13.5 },
  { slug: 'red-hook', name: 'Red Hook', borough: 'Brooklyn', lon: -74.0093, lat: 40.6761, zoom: 13.5 },
  { slug: 'jamaica-bay', name: 'Jamaica Bay', borough: 'Queens', lon: -73.8175, lat: 40.6183, zoom: 12.5 },
  { slug: 'coney-island', name: 'Coney Island', borough: 'Brooklyn', lon: -73.9788, lat: 40.5774, zoom: 13 },
  { slug: 'hunts-point', name: 'Hunts Point', borough: 'Bronx', lon: -73.8832, lat: 40.8099, zoom: 13 },
  { slug: 'midland-beach', name: 'Midland Beach', borough: 'Staten Island', lon: -74.091, lat: 40.5732, zoom: 13.5 },
];

export function searchPlaces(query: string, limit = 6): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = NEIGHBORHOODS.map((p) => {
    const name = p.name.toLowerCase();
    const borough = p.borough.toLowerCase();
    let score = -1;
    if (name.startsWith(q)) score = 0;
    else if (name.includes(q)) score = 1;
    else if (borough.includes(q)) score = 2;
    return { p, score };
  })
    .filter((x) => x.score >= 0)
    .sort((a, b) => a.score - b.score || a.p.name.localeCompare(b.p.name));
  return scored.slice(0, limit).map((x) => x.p);
}
