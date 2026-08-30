import type { PickingInfo } from '@deck.gl/core';
import { Droplets, Home, X, MessageSquareWarning } from 'lucide-react';
import { formatDepth, formatProbability } from '../lib/geo';
import type {
  FloodZoneFeature,
  BuildingFeature,
  ComplaintFeature,
} from '../lib/types';

interface PickCardProps {
  info: PickingInfo | null;
  onClose: () => void;
}

function renderBody(info: PickingInfo) {
  const feat = info.object as
    | FloodZoneFeature
    | BuildingFeature
    | ComplaintFeature
    | undefined;
  if (!feat?.properties) {
    return <p className="text-sm text-slate-400">No feature data available.</p>;
  }
  const p = feat.properties as Record<string, unknown>;

  if ('scenario' in p) {
    const z = feat as FloodZoneFeature;
    return (
      <div className="space-y-2.5 text-sm">
        <Row label="Flood depth" value={formatDepth(z.properties.depth_ft)} icon={<Droplets className="h-4 w-4 text-cyan-300" />} />
        <Row label="Likelihood" value={formatProbability(z.properties.probability)} />
        <Row label="Risk" value={z.properties.probability >= 0.5 ? 'High' : z.properties.probability >= 0.25 ? 'Moderate' : 'Low'} />
      </div>
    );
  }
  if ('height_ft' in p) {
    const b = feat as BuildingFeature;
    return (
      <div className="space-y-2.5 text-sm">
        <Row label="Use" value={b.properties.use} icon={<Home className="h-4 w-4 text-amber-300" />} />
        <Row label="Height" value={`${b.properties.height_ft.toFixed(0)} ft`} />
        <Row label="Type" value={b.properties.type} />
      </div>
    );
  }
  const c = feat as ComplaintFeature;
  return (
    <div className="space-y-2.5 text-sm">
      <Row label="Complaint" value={c.properties.complaint_type} icon={<MessageSquareWarning className="h-4 w-4 text-rose-300" />} />
      <Row label="Created" value={c.properties.created_date ?? 'n/a'} />
      <Row label="Agency" value={c.properties.agency ?? 'n/a'} />
    </div>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-slate-400">
        {icon}
        {label}
      </span>
      <span className="text-right font-medium capitalize text-slate-100">{value}</span>
    </div>
  );
}

export function PickCard({ info, onClose }: PickCardProps) {
  if (!info) return null;
  return (
    <div className="absolute bottom-5 left-5 z-20 w-72 rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Feature details</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close feature details"
          className="rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {renderBody(info)}
    </div>
  );
}
