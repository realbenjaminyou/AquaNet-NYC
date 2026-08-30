import { useMemo, useState } from 'react';
import type { PickingInfo, ViewState } from '@deck.gl/core';
import { FlyToInterpolator } from '@deck.gl/core';
import { FloodMap } from './components/FloodMap';
import { ControlPanel } from './components/ControlPanel';
import { Legend } from './components/Legend';
import { PickCard } from './components/PickCard';
import { useFetchJson } from './hooks/useFetchJson';
import { INITIAL_VIEW, BUILDINGS_URL, COMPLAINTS_URL, FLOOD_ZONES_URL } from './lib/config';
import type {
  FeatureCollection,
  FloodZoneFeature,
  BuildingFeature,
  ComplaintFeature,
  LayerToggles,
  Neighborhood,
} from './lib/types';

type FloodZonesFC = FeatureCollection<FloodZoneFeature>;
type BuildingsFC = FeatureCollection<BuildingFeature>;
type ComplaintsFC = FeatureCollection<ComplaintFeature>;

const DEFAULT_TOGGLES: LayerToggles = {
  terrain: true,
  flood: true,
  buildings: true,
  complaints: true,
};

export default function App() {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW);
  const [intensity, setIntensity] = useState(6);
  const [toggles, setToggles] = useState<LayerToggles>(DEFAULT_TOGGLES);
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [picked, setPicked] = useState<PickingInfo | null>(null);

  const zones = useFetchJson<FloodZonesFC>(FLOOD_ZONES_URL);
  const buildings = useFetchJson<BuildingsFC>(BUILDINGS_URL);
  const complaints = useFetchJson<ComplaintsFC>(COMPLAINTS_URL);

  const loading =
    (zones.loading || buildings.loading || complaints.loading) &&
    !(zones.error || buildings.error || complaints.error);

  const handleNeighborhood = (n: Neighborhood | null) => {
    setNeighborhood(n);
    if (n) {
      setViewState((vs) => ({
        ...vs,
        longitude: n.center.longitude,
        latitude: n.center.latitude,
        zoom: Math.max(vs.zoom, 13.5),
        transitionDuration: 2000,
        transitionInterpolator: new FlyToInterpolator({ speed: 1.6 }),
        transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3),
      }));
    }
  };

  const handlePick = (info: PickingInfo | null) => {
    setPicked(info?.object ? info : null);
  };

  const dataReady = useMemo(
    () => Boolean(zones.data && buildings.data && complaints.data),
    [zones.data, buildings.data, complaints.data],
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0">
        <FloodMap
          viewState={viewState}
          onViewStateChange={(next) => setViewState(next)}
          zones={zones.data}
          buildings={buildings.data}
          complaints={complaints.data}
          intensity={intensity}
          toggles={toggles}
          onPick={handlePick}
        />
      </div>

      <div className="absolute inset-y-0 left-0 z-20 w-80 border-r border-slate-800 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-transparent">
        <ControlPanel
          neighborhood={neighborhood}
          onNeighborhood={handleNeighborhood}
          intensity={intensity}
          onIntensity={setIntensity}
          toggles={toggles}
          onToggles={setToggles}
        />
      </div>

      {dataReady && <Legend />}
      <PickCard info={picked} onClose={() => setPicked(null)} />

      {loading && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm text-slate-200 shadow-xl">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            Loading flood data…
          </div>
        </div>
      )}
    </div>
  );
}
