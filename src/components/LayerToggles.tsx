import { useId } from 'react';
import type { LayerToggles } from '../lib/types';

interface LayerTogglesProps {
  toggles: LayerToggles;
  onChange: (t: LayerToggles) => void;
}

const OPTIONS: { key: keyof LayerToggles; label: string }[] = [
  { key: 'terrain', label: '3D terrain' },
  { key: 'flood', label: 'Flood zones' },
  { key: 'buildings', label: 'Buildings' },
  { key: 'complaints', label: '311 reports' },
];

export function LayerToggles({ toggles, onChange }: LayerTogglesProps) {
  const baseId = useId();

  const toggle = (key: keyof LayerToggles) =>
    onChange({ ...toggles, [key]: !toggles[key] });

  return (
    <fieldset className="space-y-2.5">
      <legend className="mb-1 text-xs font-semibold tracking-wide text-slate-300">
        Map layers
      </legend>
      {OPTIONS.map((opt, i) => {
        const id = `${baseId}-${opt.key}`;
        return (
          <label key={opt.key} htmlFor={id} className="group flex cursor-pointer items-center gap-2.5">
            <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
              <input
                id={id}
                type="checkbox"
                checked={toggles[opt.key]}
                onChange={() => toggle(opt.key)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-slate-700 transition peer-checked:bg-cyan-500/80 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-400/60"
              />
              <span
                aria-hidden="true"
                className="absolute left-0.5 h-4 w-4 translate-x-0 rounded-full bg-white shadow transition peer-checked:translate-x-4"
              />
            </span>
            <span className="text-sm text-slate-200 transition group-hover:text-white">
              {opt.label}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
