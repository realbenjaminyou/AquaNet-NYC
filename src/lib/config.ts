// Public config — publishable URLs and fixture paths only (no secrets).
// Real pipeline outputs can drop in via VITE_* env vars without code changes.

const FIXTURE_BASE = '/fixtures';

// Raster flood tiles (Web-Mercator PNG) — local demo fixtures by default.
export const FLOOD_TILES_URL =
  import.meta.env.VITE_FLOOD_TILES_URL ?? `${FIXTURE_BASE}/flood-tiles/{z}/{x}/{y}.png`;

// Vector layers (GeoJSON) — local demo fixtures by default.
export const FLOOD_ZONES_URL =
  import.meta.env.VITE_FLOOD_ZONES_URL ?? `${FIXTURE_BASE}/flood-zones.geojson`;
export const BUILDINGS_URL =
  import.meta.env.VITE_BUILDINGS_URL ?? `${FIXTURE_BASE}/buildings.geojson`;
export const COMPLAINTS_URL =
  import.meta.env.VITE_COMPLAINTS_URL ?? `${FIXTURE_BASE}/311.geojson`;

// Free dark basemap + terrain tiles (no token required). Replaceable via env.
export const BASEMAP_URL =
  import.meta.env.VITE_BASEMAP_URL ??
  'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
export const TERRAIN_URL =
  import.meta.env.VITE_TERRAIN_URL ??
  'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';

// Decoder for Mapzen terrarium RGB-encoded elevation.
export const TERRAIN_DECODER = {
  rScaler: 256,
  gScaler: 1,
  bScaler: 1 / 256,
  offset: -32768,
};

// NYC extent (min lon, min lat, max lon, max lat).
export const NYC_BOUNDS: [number, number, number, number] = [-74.27, 40.49, -73.68, 40.92];

export const INITIAL_VIEW = {
  longitude: -73.98,
  latitude: 40.7,
  zoom: 10.4,
  pitch: 55,
  bearing: -20,
  minZoom: 9,
  maxZoom: 16,
};
