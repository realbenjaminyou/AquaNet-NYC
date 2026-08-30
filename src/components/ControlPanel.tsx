import { Waves } from 'lucide-react';
import { NeighborhoodSearch } from './NeighborhoodSearch';
import { IntensitySlider } from './IntensitySlider';
import { LayerToggles } from './LayerToggles';
import type { Neighborhood, LayerToggles as Toggles } from '../lib/types';

interface ControlPanelProps {
  neighborhood: Neighborhood | null;
  onNeighborhood: (n: Neighborhood | null) => void;
  intensity: number;
  onIntensity: (v: number) => void;
  toggles: Toggles;
  onToggles: (t: Toggles) => void;
}

export function ControlPanel({
  neighborhood,
  onNeighborhood,
  intensity,
  onIntensity,
  toggles,
  onToggles,
}: ControlPanelProps) {
  return (
    <aside className="pointer-events-auto flex h-full w-80 shrink-0 flex-col overflow-y-auto border-r border-slate-800 bg-slate-900/80 p-5 backdrop-blur">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
          <Waves className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-tight text-white">
            NYC Flood Risk Explorer
          </h1>
          <p className="text-[11px] text-slate-400">Urban flood susceptibility</p>
        </div>
      </div>

      <div className="space-y-5">
        <NeighborhoodSearch value={neighborhood} onSelect={onNeighborhood} />
        <IntensitySlider value={intensity} onChange={onIntensity} />
        <LayerToggles toggles={toggles} onChange={onToggles} />
      </div>

      <div className="mt-auto pt-6">
        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-[11px] leading-relaxed text-slate-400">
          Drag to rotate · scroll to zoom · click a zone, building, or report for details.
          Flood layers interpolate between the two nearest storm scenarios as you move the
          intensity slider.
        </div>
      </div>
    </aside>
  );
}
