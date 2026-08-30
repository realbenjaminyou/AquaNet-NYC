// Flood-depth color ramp — cyan (minor) through deep blue (extreme),
// tuned to pop against the dark basemap.

export interface RampStep {
  upTo: number; // depth_ft upper bound (exclusive upper bound for matching)
  label: string;
  css: string;
  rgb: [number, number, number];
}

export const FLOOD_RAMP: RampStep[] = [
  { upTo: 0.75, label: 'Minor', css: 'var(--color-flood-1)', rgb: [165, 243, 252] },
  { upTo: 1.5, label: 'Moderate', css: 'var(--color-flood-2)', rgb: [34, 211, 238] },
  { upTo: 2.5, label: 'Major', css: 'var(--color-flood-3)', rgb: [14, 165, 233] },
  { upTo: 4, label: 'Extreme', css: 'var(--color-flood-4)', rgb: [37, 99, 235] },
  { upTo: Infinity, label: 'Severe', css: 'var(--color-flood-5)', rgb: [30, 58, 138] },
];

export function categoryForDepth(depthFt: number): string {
  for (const step of FLOOD_RAMP) {
    if (depthFt < step.upTo) return step.label;
  }
  return FLOOD_RAMP[FLOOD_RAMP.length - 1].label;
}

export function depthToRgba(depthFt: number, alpha: number): [number, number, number, number] {
  let rgb: [number, number, number] = FLOOD_RAMP[0].rgb;
  for (const step of FLOOD_RAMP) {
    if (depthFt < step.upTo) {
      rgb = step.rgb;
      break;
    }
  }
  return [rgb[0], rgb[1], rgb[2], Math.max(0, Math.min(255, Math.round(alpha)))];
}

export const COMPLAINT_COLOR: [number, number, number, number] = [251, 146, 60, 220];

export const BUILDING_COLORS: Record<string, [number, number, number, number]> = {
  residential: [120, 132, 156, 230],
  'mid-rise': [100, 116, 139, 235],
  commercial: [148, 163, 184, 240],
  industrial: [71, 85, 105, 230],
};
