// Lightweight planar geospatial metrics for the analytics HUD and picking.
// City-scale approximations are accurate enough for live risk aggregation.

import type { FloodZoneFeature, BuildingFeature, ComplaintFeature } from './types';

export type Bounds = [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]

/** Planar shoelace area of a polygon's outer ring, converted to km². */
export function polygonAreaKm2(coords: number[][][]): number {
  const ring = coords[0];
  if (!ring || ring.length < 4) return 0;
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [lon1, lat1] = ring[i];
    const [lon2, lat2] = ring[i + 1];
    area += (lon2 - lon1) * (lat2 + lat1);
  }
  area = Math.abs(area) / 2;

  let lat = 0;
  for (let i = 0; i < ring.length - 1; i++) lat += ring[i][1];
  lat /= Math.max(1, ring.length - 1);

  const latKm = 111.32;
  const lonKm = 111.32 * Math.cos((lat * Math.PI) / 180);
  return area * latKm * lonKm;
}

/** Ray-casting point-in-polygon for an outer ring (lon/lat order). */
export function pointInRing(lon: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function pointInFloodZone(lon: number, lat: number, f: FloodZoneFeature): boolean {
  if (f.geometry.type !== 'Polygon') return false;
  return pointInRing(lon, lat, f.geometry.coordinates[0]);
}

export function inBounds(lon: number, lat: number, b: Bounds): boolean {
  return lon >= b[0] && lon <= b[2] && lat >= b[1] && lat <= b[3];
}

/** Representative centroid for polygons (outer-ring mean) or points. */
export function featureCentroid(f: FloodZoneFeature | BuildingFeature | ComplaintFeature): [number, number] {
  if (f.geometry.type === 'Point') return f.geometry.coordinates as [number, number];
  const ring = f.geometry.coordinates[0];
  let lon = 0;
  let lat = 0;
  const n = Math.max(1, ring.length - 1);
  for (let i = 0; i < ring.length - 1; i++) {
    lon += ring[i][0];
    lat += ring[i][1];
  }
  return [lon / n, lat / n];
}
