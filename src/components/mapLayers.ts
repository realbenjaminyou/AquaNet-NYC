import { Layer } from '@deck.gl/core';
import { GeoJsonLayer, ScatterplotLayer, BitmapLayer } from '@deck.gl/layers';
import { TerrainLayer, TileLayer } from '@deck.gl/geo-layers';
import { _TerrainExtension as TerrainExtension } from '@deck.gl/extensions';
import {
  BASEMAP_URL,
  TERRAIN_URL,
  TERRAIN_DECODER,
  NYC_BOUNDS,
  FLOOD_TILES_URL,
} from '../lib/config';
import { FLOOD_RAMP, depthToRgba, COMPLAINT_COLOR, BUILDING_COLORS } from '../lib/colors';
import { bracketIntensity } from '../lib/scenarios';
import type {
  FeatureCollection,
  FloodZoneFeature,
  BuildingFeature,
  ComplaintFeature,
  LayerToggles,
} from '../lib/types';

export interface MapLayersInput {
  zones: FeatureCollection<FloodZoneFeature> | null;
  buildings: FeatureCollection<BuildingFeature> | null;
  complaints: FeatureCollection<ComplaintFeature> | null;
  intensity: number;
  toggles: LayerToggles;
}

/** How much to vertically exaggerate flood depth for 3D effect. */
const DEPTH_EXAGGERATION = 14;

export function buildMapLayers(input: MapLayersInput): Layer[] {
  const { zones, buildings, complaints, intensity, toggles } = input;
  const layers: Layer[] = [];

  // 1) 3D terrain + dark basemap (operation 'terrain+draw' allows draping).
  if (toggles.terrain) {
    layers.push(
      new TerrainLayer({
        id: 'terrain',
        elevationData: TERRAIN_URL,
        texture: BASEMAP_URL,
        elevationDecoder: TERRAIN_DECODER,
        bounds: NYC_BOUNDS,
        operation: 'terrain+draw',
        meshMaxError: 4,
        minZoom: 9,
        maxZoom: 15,
      }),
    );
  }

  // 2) Flood-susceptibility raster tiles (pre-computed Web-Mercator PNGs).
  if (toggles.flood) {
    layers.push(
      new TileLayer({
        id: 'flood-raster',
        data: FLOOD_TILES_URL,
        minZoom: 12,
        maxZoom: 15,
        tileSize: 256,
        opacity: 0.62,
        pickable: false,
        renderSubLayers: (props) => {
          const {
            bbox: { west, south, east, north },
          } = props.tile;
          return new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north],
          });
        },
      }),
    );
  }

  // 3) Scenario-scaled flood zones (extruded + draped on terrain).
  if (toggles.flood && zones) {
    const bracket = bracketIntensity(intensity);
    const lowFeatures = zones.features.filter((f) => f.properties.scenario === bracket.low);
    const highFeatures = bracket.exact
      ? []
      : zones.features.filter((f) => f.properties.scenario === bracket.high);

    const zoneLayer = (id: string, data: FloodZoneFeature[], opacity: number) =>
      new GeoJsonLayer<FloodZoneFeature>({
        id,
        data,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 90],
        stroked: true,
        filled: true,
        wireframe: true,
        extruded: true,
        lineWidthMinPixels: 1,
        getLineColor: [226, 232, 240, 160],
        getFillColor: (f) => depthToRgba(f.properties.depth_ft, 168),
        getElevation: (f) => f.properties.depth_ft * DEPTH_EXAGGERATION,
        opacity,
        extensions: [new TerrainExtension()],
        updateTriggers: { getFillColor: [intensity], getElevation: [intensity] },
      });

    if (lowFeatures.length) layers.push(zoneLayer('flood-zones-low', lowFeatures, bracket.weight));
    if (highFeatures.length)
      layers.push(zoneLayer('flood-zones-high', highFeatures, 1 - bracket.weight));
  }

  // 4) Building footprints (extruded + draped on terrain).
  if (toggles.buildings && buildings) {
    layers.push(
      new GeoJsonLayer<BuildingFeature>({
        id: 'buildings',
        data: buildings.features,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 60],
        stroked: false,
        filled: true,
        extruded: true,
        wireframe: true,
        getLineColor: [15, 23, 42, 60],
        getFillColor: (f) => BUILDING_COLORS[f.properties.type] ?? BUILDING_COLORS.residential,
        getElevation: (f) => f.properties.height_ft,
        extensions: [new TerrainExtension()],
      }),
    );
  }

  // 5) 311 street-flooding complaint points.
  if (toggles.complaints && complaints) {
    layers.push(
      new ScatterplotLayer<ComplaintFeature>({
        id: 'complaints',
        data: complaints.features,
        pickable: true,
        stroked: true,
        filled: true,
        getPosition: (f) => f.geometry.coordinates,
        getFillColor: COMPLAINT_COLOR,
        getLineColor: [255, 255, 255, 180],
        getLineWidth: 1,
        radiusMinPixels: 2,
        radiusMaxPixels: 8,
        getRadius: 22,
      }),
    );
  }

  return layers;
}

export { FLOOD_RAMP };
