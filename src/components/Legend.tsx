import { FLOOD_RAMP } from '../lib/colors';

export function Legend() {
  return (
    <div className="pointer-events-none absolute bottom-5 right-5 z-10 w-44 rounded-lg border border-slate-700/80 bg-slate-900/85 p-3 shadow-xl backdrop-blur">
      <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-slate-300">
        Projected flood depth
      </div>
      <div
        className="h-2.5 w-full rounded-full"
        style={{
          background: `linear-gradient(to right, ${FLOOD_RAMP.map((s) => s.css).join(', ')})`,
        }}
        role="img"
        aria-label="Color scale from minor to severe flooding"
      />
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{FLOOD_RAMP[0].label}</span>
        <span>{FLOOD_RAMP[FLOOD_RAMP.length - 1].label}</span>
      </div>
    </div>
  );
}
