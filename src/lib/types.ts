// Shared types for the flood-risk dashboard.

export interface FloodZoneFeature {
  type: 'Feature';
  geometry: { type: 'Polygon'; coordinates: number[][][] };
  properties: {
    scenario: number;
    depth_ft: number;
    probability: number;
    category: string;
    neighborhood: string;
    borough: string;
  };
}

export interface BuildingFeature {
  type: 'Feature';
  geometry: { type: 'Polygon'; coordinates: number[][][] };
  properties: {
    height_ft: number;
    floors: number;
    type: string;
  };
}

export interface ComplaintFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    unique_key: string;
    created_date: string;
    complaint_type: string;
    descriptor: string;
    borough: string;
  };
}

export interface FeatureCollection<T> {
  type: 'FeatureCollection';
  features: T[];
}

export interface Place {
  slug: string;
  name: string;
  borough: string;
  lon: number;
  lat: number;
  zoom: number;
}

export type Neighborhood = Place;

export interface LayerToggles {
  flood: boolean;
  buildings: boolean;
  complaints: boolean;
  terrain: boolean;
}

export interface FloodInfo {
  depth_ft: number;
  probability: number;
  category: string;
  neighborhood: string;
  borough: string;
  scenario: number;
}

export interface PickedFeature {
  kind: 'flood' | 'building' | 'complaint';
  lon: number;
  lat: number;
  text: string;
  details: FloodInfo | null;
}
