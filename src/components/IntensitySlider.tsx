import { useId } from 'react';
import { SCENARIOS } from '../lib/scenarios';
import { formatIntensity } from '../lib/geo';

interface IntensitySliderProps {
  value: number;
  onChange: (v: number) => void;
}

export function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const id = useId();

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-xs font-semibold tracking-wide text-slate-300">
          Storm intensity
        </label>
        <output
          htmlFor={id}
          className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-xs font-semibold text-cyan-300"
        >
          {formatIntensity(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={SCENARIOS[0].value}
        max={SCENARIOS[SCENARIOS.length - 1].value}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${formatIntensity(value)}, a ${
          value < 6 ? 'minor' : value < 9 ? 'moderate' : 'major'
        } storm`}
        className="w-full accent-cyan-400"
      />
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>Rain shower</span>
        <span>Nor'easter</span>
        <span>Hurricane</span>
      </div>
    </div>
  );
}
