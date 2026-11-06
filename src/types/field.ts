export type FieldPresetId =
  | 'standard_6x6'
  | 'master_8x8'
  | 'compact_4x4'
  | 'terraces_dual'
  | 'island_ring'
  | 'checkered_mosaic'
  | 'cross_plus'
  | 'river_valley'
  | 'desert_oasis'
  | 'custom_designed';

export type FieldTheme = 'temperate' | 'desert' | 'wetlands' | 'autumn' | 'cyber';

export interface FieldTileConfig {
  x: number;
  y: number;
  unlocked: boolean;
  moisture?: number; // 0 - 100
  nutrients?: number; // 0 - 100
  weedLevel?: number; // 0 - 100
  crop?: string | null;
}

export interface FieldConfig {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  presetId?: FieldPresetId;
  theme?: FieldTheme;
  tiles: Record<string, FieldTileConfig>;
}

