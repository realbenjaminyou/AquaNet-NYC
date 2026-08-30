// NYC Urban Flood Risk Mapping — demo fixture generator.
// Generates self-hosted demo layers under public/fixtures so the dashboard is
// fully functional before the real Python pipeline outputs exist:
//   - flood-tiles/{z}/{x}/{y}.png   Web-Mercator flood-susceptibility raster tiles
//   - flood-zones.geojson           extrudable flood polygons (per scenario intensity)
//   - buildings.geojson             extrudable building footprints
//   - 311.geojson                   sample 311 street-flooding complaint points
// Run: node scripts/gen-fixtures.mjs
// Deterministic (seeded RNG) — rerunning produces identical output.
import fs from 'node:fs';
import path from 'node:path';
import pkg from 'pngjs';
const { PNG } = pkg;

const OUT = path.resolve('public/fixtures');

// ---------------------------------------------------------------------------
// Deterministic RNG
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const randn = (rng) => {
  // Box-Muller
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

// ---------------------------------------------------------------------------
// Target neighborhoods (approximate centers; demo fixtures only)
// ---------------------------------------------------------------------------
const COMMUNITIES = [
  { slug: 'south-ozone-park', name: 'South Ozone Park', borough: 'Queens', lat: 40.6766, lon: -73.8121, seed: 101 },
  { slug: 'gowanus-canal', name: 'Gowanus Canal', borough: 'Brooklyn', lat: 40.6746, lon: -73.9903, seed: 202 },
  { slug: 'staten-island-east-shore', name: 'Staten Island East Shore', borough: 'Staten Island', lat: 40.5944, lon: -74.0822, seed: 303 },
];

const SCENARIOS = [1.5, 2.13, 3.0, 3.66, 4.0]; // in/hr

// ---------------------------------------------------------------------------
// Geo helpers
// ---------------------------------------------------------------------------
function lonLatToTile(lon, lat, z) {
  const n = 2 ** z;
  const x = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}
function tileToBBox(x, y, z) {
  const n = 2 ** z;
  const west = (x / n) * 360 - 180;
  const east = ((x + 1) / n) * 360 - 180;
  const north = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * (180 / Math.PI);
  const south = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * (180 / Math.PI);
  return { west, south, east, north };
}
const degToM = (lon, lat) => {
  const mLat = 111320;
  const mLon = 111320 * Math.cos((lat * Math.PI) / 180);
  return { mLat, mLon };
};
function toGeo(cxLon, cyLat, dx, dy, lat) {
  const { mLat, mLon } = degToM(0, lat);
  return [cxLon + dx / mLon, cyLat + dy / mLat];
}

// Simple value noise
function hash2(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 9746347) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
const smooth = (t) => t * t * (3 - 2 * t);
function valueNoise(x, y, seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  const sx = smooth(fx);
  const sy = smooth(fy);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

// ---------------------------------------------------------------------------
// 1) Flood raster tiles (flood susceptibility)
// ---------------------------------------------------------------------------
function renderFloodTiles() {
  const zooms = [13, 14];
  let count = 0;
  for (const c of COMMUNITIES) {
    // deterministic "low point" offset within the neighborhood
    const { mLat, mLon } = degToM(c.lon, c.lat);
    const rng = mulberry32(c.seed);
    const lowLon = c.lon + (randn(rng) * 0.0015) / (mLon / 111320);
    const lowLat = c.lat + (randn(rng) * 0.0012) / (mLat / 111320);
    const radius = 300; // meters — susceptibility halo

    for (const z of zooms) {
      const center = lonLatToTile(c.lon, c.lat, z);
      const tx = Math.round(center.x);
      const ty = Math.round(center.y);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const x = tx + dx;
          const y = ty + dy;
          const bbox = tileToBBox(x, y, z);
          const png = new PNG({ width: 256, height: 256 });
          const noiseScale = 2600; // tuned so features vary within a tile
          for (let py = 0; py < 256; py++) {
            for (let px = 0; px < 256; px++) {
              const lon = bbox.west + ((px + 0.5) / 256) * (bbox.east - bbox.west);
              const lat = bbox.north - ((py + 0.5) / 256) * (bbox.north - bbox.south);
              const dLat = (lat - lowLat) * 111320;
              const dLon = (lon - lowLon) * 111320 * Math.cos((lowLat * Math.PI) / 180);
              const dist = Math.hypot(dLat, dLon);
              const gauss = Math.exp(-((dist / radius) ** 2));
              const n = valueNoise((lon + 180) * noiseScale, (lat + 20) * noiseScale, c.seed);
              const f = Math.max(0, Math.min(1, gauss * 0.72 + n * 0.38 - 0.12));
              const idx = (py * 256 + px) * 4;
              if (f < 0.03) {
                png.data[idx + 3] = 0;
                continue;
              }
              png.data[idx + 0] = Math.round(125 - 95 * f); // R (cyan -> deep blue)
              png.data[idx + 1] = Math.round(211 - 153 * f); // G
              png.data[idx + 2] = Math.round(252 - 114 * f); // B
              png.data[idx + 3] = Math.round(30 + f * 200); // A
            }
          }
          const dir = path.join(OUT, 'flood-tiles', String(z), String(x));
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, `${y}.png`), PNG.sync.write(png));
          count++;
        }
      }
    }
  }
  console.log(`flood tiles: ${count}`);
}

// ---------------------------------------------------------------------------
// 2) Flood zones (scenario-scaled polygons)
// ---------------------------------------------------------------------------
function ellipseRing(cx, cy, rx, ry, rot, rng, points = 22) {
  const ring = [];
  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2;
    const ex = Math.cos(t) * rx;
    const ey = Math.sin(t) * ry;
    const n = 1 + (rng() - 0.5) * 0.28;
    const x = (ex * Math.cos(rot) - ey * Math.sin(rot)) * n;
    const y = (ex * Math.sin(rot) + ey * Math.cos(rot)) * n;
    ring.push([x, y]);
  }
  ring.push(ring[0]);
  return ring;
}
function renderFloodZones() {
  const features = [];
  for (const c of COMMUNITIES) {
    const rng = mulberry32(c.seed * 7 + 13);
    for (const scenario of SCENARIOS) {
      const scale = 0.55 + 0.14 * (scenario - 1.5); // larger/extreme storms grow
      const nPolys = 4 + Math.round((scenario - 1.5) * 2.2);
      for (let i = 0; i < nPolys; i++) {
        const ang = rng() * Math.PI * 2;
        const dist = (0.15 + rng() * 0.55) * 420;
        const cx = c.lon + (Math.cos(ang) * dist) / (111320 * Math.cos((c.lat * Math.PI) / 180));
        const cy = c.lat + (Math.sin(ang) * dist) / 111320;
        const rx = (95 + rng() * 120) * scale;
        const ry = (70 + rng() * 85) * scale;
        const rot = rng() * Math.PI;
        const ring = ellipseRing(cx, cy, rx, ry, rot, rng).map(([x, y]) => toGeo(cx, cy, x, y, c.lat));
        const depth = Math.max(0.4, 0.55 + 0.85 * scale + rng() * 0.9);
        const probability = Math.min(0.96, 0.55 + 0.33 * scale + rng() * 0.18);
        const category = depth < 0.75 ? 'Minor' : depth < 1.5 ? 'Moderate' : depth < 2.5 ? 'Major' : 'Extreme';
        features.push({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [ring] },
          properties: {
            scenario: Number(scenario.toFixed(2)),
            depth_ft: Number(depth.toFixed(2)),
            probability: Number(probability.toFixed(2)),
            category,
            neighborhood: c.name,
            borough: c.borough,
          },
        });
      }
    }
  }
  fs.writeFileSync(path.join(OUT, 'flood-zones.geojson'), JSON.stringify({ type: 'FeatureCollection', features }));
  console.log(`flood zones: ${features.length} features`);
}

// ---------------------------------------------------------------------------
// 3) Buildings (extrudable footprints)
// ---------------------------------------------------------------------------
function renderBuildings() {
  const features = [];
  for (const c of COMMUNITIES) {
    const rng = mulberry32(c.seed * 31 + 7);
    const rot = (rng() - 0.5) * 0.6; // neighborhood street grid rotation (rad)
    const rows = 6;
    const cols = 8;
    const spacing = 62; // meters
    const baseLat = c.lat - ((rows * spacing) / 2) / 111320;
    const baseLon = c.lon - ((cols * spacing) / 2) / (111320 * Math.cos((c.lat * Math.PI) / 180));
    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        const jx = q * spacing + (rng() - 0.5) * 18;
        const jy = r * spacing + (rng() - 0.5) * 18;
        const w = 13 + rng() * 12;
        const d = 16 + rng() * 14;
        const height = Math.round((14 + rng() * rng() * 82) * 10) / 10;
        const cx = baseLon + (jx * Math.cos(rot) - jy * Math.sin(rot)) / (111320 * Math.cos((c.lat * Math.PI) / 180));
        const cy = baseLat + (jx * Math.sin(rot) + jy * Math.cos(rot)) / 111320;
        // corner offsets in meters, rotated to street grid
        const corners = [
          [-w / 2, -d / 2],
          [w / 2, -d / 2],
          [w / 2, d / 2],
          [-w / 2, d / 2],
        ];
        const ring = corners.map(([x, y]) => {
          const rx = x * Math.cos(rot) - y * Math.sin(rot);
          const ry = x * Math.sin(rot) + y * Math.cos(rot);
          return toGeo(cx, cy, rx, ry, c.lat);
        });
        ring.push(ring[0]);
        const type = height > 55 ? 'commercial' : height > 32 ? 'mid-rise' : rng() > 0.55 ? 'residential' : 'industrial';
        features.push({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [ring] },
          properties: { height_ft: height, floors: Math.max(1, Math.round(height / 11)), type },
        });
      }
    }
  }
  fs.writeFileSync(path.join(OUT, 'buildings.geojson'), JSON.stringify({ type: 'FeatureCollection', features }));
  console.log(`buildings: ${features.length} features`);
}

// ---------------------------------------------------------------------------
// 4) 311 street-flooding complaints
// ---------------------------------------------------------------------------
function renderComplaints() {
  const features = [];
  const TYPES = [
    { type: 'Street Flooding', descriptor: 'Street Flooding (SJ)' },
    { type: 'Street Flooding', descriptor: 'Street Flooding (WH)' },
    { type: 'Water System', descriptor: 'Catch Basin Clogged/Flooding' },
    { type: 'Sewer', descriptor: 'Blocked Sewer' },
  ];
  let key = 100000;
  for (const c of COMMUNITIES) {
    const rng = mulberry32(c.seed * 97 + 5);
    const n = 55 + Math.round(rng() * 40);
    for (let i = 0; i < n; i++) {
      // cluster along pseudo-streets near the neighborhood
      const onStreet = rng() > 0.35;
      const spread = onStreet ? 0.0018 : 0.0045;
      const lat = c.lat + randn(rng) * spread;
      const lon = c.lon + randn(rng) * spread * 0.85;
      const t = TYPES[Math.floor(rng() * TYPES.length)];
      const yr = 2023 + (rng() > 0.45 ? 1 : 0);
      const mo = String(1 + Math.floor(rng() * 12)).padStart(2, '0');
      const day = String(1 + Math.floor(rng() * 28)).padStart(2, '0');
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [Number(lon.toFixed(6)), Number(lat.toFixed(6))] },
        properties: {
          unique_key: String(key++),
          created_date: `${yr}-${mo}-${day}T12:00:00.000`,
          complaint_type: t.type,
          descriptor: t.descriptor,
          borough: c.borough,
        },
      });
    }
  }
  fs.writeFileSync(path.join(OUT, '311.geojson'), JSON.stringify({ type: 'FeatureCollection', features }));
  console.log(`311 complaints: ${features.length} features`);
}

fs.mkdirSync(OUT, { recursive: true });
renderFloodTiles();
renderFloodZones();
renderBuildings();
renderComplaints();
console.log('done →', OUT);
