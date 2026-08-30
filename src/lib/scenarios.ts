// Rainfall-intensity scenario model. The pipeline exports a fixed set of
// pre-computed scenario rasters; the dashboard interpolates between the two
// nearest for arbitrary slider values.

export const COMPUTED_INTENSITIES = [1.5, 2.13, 3.0, 3.66, 4.0];

export const INTENSITY_MIN = 1.5;
export const INTENSITY_MAX = 4.0;
export const INTENSITY_STEP = 0.1;

export interface ScenarioPreset {
  value: number;
  label: string;
  detail: string;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  { value: 2.13, label: 'Current climate', detail: '2.13 in/hr · moderate rain' },
  { value: 3.66, label: '2080 sea-level rise', detail: '3.66 in/hr · extreme rain' },
];

export interface Bracket {
  low: number;
  high: number;
  /** weight toward `low` (0..1). When exact, low === high and weight === 1. */
  weight: number;
  exact: boolean;
}

export function bracketIntensity(value: number): Bracket {
  const sorted = [...COMPUTED_INTENSITIES].sort((a, b) => a - b);
  const exact = sorted.find((c) => Math.abs(c - value) < 1e-6);
  if (exact !== undefined) {
    return { low: exact, high: exact, weight: 1, exact: true };
  }
  let low = sorted[0];
  let high = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] <= value) low = sorted[i];
    if (sorted[i] >= value) {
      high = sorted[i];
      break;
    }
  }
  const span = high - low;
  const weight = span === 0 ? 1 : (high - value) / span;
  return { low, high, weight, exact: false };
}

export function formatIntensity(value: number): string {
  return `${value.toFixed(2)} in/hr`;
}
