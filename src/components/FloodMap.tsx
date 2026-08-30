import { useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import type { Layer, PickingInfo, MapViewState } from '@deck.gl/core';
import { buildMapLayers } from './mapLayers';
import { formatDepth, formatProbability } from '../lib/geo';
import type {
  FeatureCollection,
  FloodZoneFeature,
  BuildingFeature,
  ComplaintFeature,
  LayerToggles,
} from '../lib/types';

export interface FlyToTarget {
  longitude: number;
  latitude: number;
  zoom: number;
}

interface FloodMapProps {
  viewState: MapViewState;
  onViewStateChange: (next: MapViewState) => void;
  zones: FeatureCollection<FloodZoneFeature> | null;
  buildings: FeatureCollection<BuildingFeature> | null;
  complaints: FeatureCollection<ComplaintFeature> | null;
  intensity: number;
  toggles: LayerToggles;
  onPick: (info: PickingInfo | null) => void;
}

type HoverState = {
  x: number;
  y: number;
  lines: string[];
  title: string;
} | null;

const NYC_INITIAL: MapViewState = {
  longitude: -73.9857,
  latitude: 40.7484,
  zoom: 11.1,
  pitch: 52,
  bearing: -28,
  maxZoom: 16.5,
  minZoom: 9,
};

function describeHover(info: PickingInfo): HoverState {
  const feat = info.object as
    | FloodZoneFeature
    | BuildingFeature
    | ComplaintFeature
    | undefined;
  if (!feat?.properties) return null;
  const p = feat.properties as Record<string, unknown>;
  if ('scenario' in p && typeof p.scenario === 'string') {
    const zone = feat as FloodZoneFeature;
    return {
      x: info.x,
      y: info.y,
      title: 'Flood zone',
      lines: [
        `Depth: ${formatDepth(zone.properties.depth_ft)}`,
        `Probability: ${formatProbability(zone.properties.probability)}`,
      ],
    };
  }
  if ('height_ft' in p && typeof p.height_ft === 'number') {
    const b = feat as BuildingFeature;
    return {
      x: info.x,
      y: info.y,
      title: 'Building',
      lines: [`Use: ${b.properties.type}`, `Height: ${b.properties.height_ft.toFixed(0)} ft`],
    };
  }
  if ('complaint_type' in p && typeof p.complaint_type === 'string') {
    const c = feat as ComplaintFeature;
    return {
      x: info.x,
      y: info.y,
      title: 'Street-flooding report',
      lines: [
        `Type: ${c.properties.complaint_type}`,
        `Date: ${c.properties.created_date ?? 'n/a'}`,
      ],
    };
  }
  return null;
}

export function FloodMap(props: FloodMapProps) {
  const { viewState, onViewStateChange, onPick } = props;
  const [hover, setHover] = useState<HoverState>(null);

  const layers = useMemo<Layer[]>(
    () =>
      buildMapLayers({
        zones: props.zones,
        buildings: props.buildings,
        complaints: props.complaints,
        intensity: props.intensity,
        toggles: props.toggles,
      }),
    [props.zones, props.buildings, props.complaints, props.intensity, props.toggles],
  );

  return (
    <div className="absolute inset-0" data-testid="flood-map">
      <DeckGL
        initialViewState={NYC_INITIAL}
        viewState={viewState}
        onViewStateChange={({ viewState: next }) => onViewStateChange(next as MapViewState)}
        controller={{ dragRotate: true, touchRotate: true, inertia: 250 }}
        layers={layers}
        getTooltip={null}
        onHover={(info) => setHover(describeHover(info))}
        onClick={(info) => onPick(info)}
        pickingRadius={6}
        useDevicePixels={true}
      />
      {hover && (
        <div
          className="pointer-events-none absolute z-20 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs text-slate-100 shadow-xl"
          style={{
            left: Math.min(hover.x + 14, window.innerWidth - 220),
            top: Math.min(hover.y + 14, window.innerHeight - 120),
          }}
          role="status"
          aria-live="polite"
        >
          <div className="mb-1 font-semibold text-cyan-300">{hover.title}</div>
          {hover.lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}
