import { FieldConfig, FieldTileConfig } from '../types/field';

function createTileMap(
  width: number,
  height: number,
  generator?: (x: number, y: number) => Partial<FieldTileConfig>
): Record<string, FieldTileConfig> {
  const map: Record<string, FieldTileConfig> = {};
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const overrides = generator ? generator(x, y) : {};
      map[`${x}_${y}`] = {
        x,
        y,
        unlocked: overrides.unlocked !== undefined ? overrides.unlocked : true,
        moisture: overrides.moisture ?? 50,
        nutrients: overrides.nutrients ?? 55,
        weedLevel: overrides.weedLevel ?? 0,
        crop: overrides.crop ?? null,
      };
    }
  }
  return map;
}

export const DEFAULT_FIELD_PRESETS: FieldConfig[] = [
  {
    id: 'field-std-6x6',
    presetId: 'standard_6x6',
    name: '🌱 Standard 6x6 Quad',
    description: 'Balanced 36-plot temperate terrain. Ideal for general hackathon levels and loops.',
    width: 6,
    height: 6,
    theme: 'temperate',
    tiles: createTileMap(6, 6, () => ({
      unlocked: true,
      moisture: 50,
      nutrients: 55,
    })),
  },
  {
    id: 'field-master-8x8',
    presetId: 'master_8x8',
    name: '🏆 Master Tournament 8x8',
    description: 'Massive 64-plot expansive landscape designed for advanced automation pipelines and high-speed multi-drone scripts.',
    width: 8,
    height: 8,
    theme: 'temperate',
    tiles: createTileMap(8, 8, () => ({
      unlocked: true,
      moisture: 52,
      nutrients: 60,
    })),
  },
  {
    id: 'field-compact-4x4',
    presetId: 'compact_4x4',
    name: '⚡ Compact Sprint 4x4',
    description: 'High-density 16-plot arena. Perfect for fast sprint rounds, rapid iteration, and 1v1 speed coding.',
    width: 4,
    height: 4,
    theme: 'temperate',
    tiles: createTileMap(4, 4, () => ({
      unlocked: true,
      moisture: 48,
      nutrients: 50,
    })),
  },
  {
    id: 'field-terraces-dual',
    presetId: 'terraces_dual',
    name: '🌊 Dual Terraces & Canal',
    description: 'Two fertile agricultural strips separated by a central irrigation canal. Tests navigation across waterways.',
    width: 6,
    height: 6,
    theme: 'wetlands',
    tiles: createTileMap(6, 6, (x, y) => {
      const isCanal = y === 2 || y === 3;
      return {
        unlocked: !isCanal,
        moisture: isCanal ? 100 : 75,
        nutrients: isCanal ? 0 : 70,
      };
    }),
  },
  {
    id: 'field-island-ring',
    presetId: 'island_ring',
    name: '🏝️ Island Atoll & Reservoir',
    description: 'Perimeter ring of 32 plots encircling a protected central water reservoir. Tests border loop algorithms.',
    width: 6,
    height: 6,
    theme: 'wetlands',
    tiles: createTileMap(6, 6, (x, y) => {
      const isCenter = (x === 2 || x === 3) && (y === 2 || y === 3);
      return {
        unlocked: !isCenter,
        moisture: isCenter ? 100 : 65,
        nutrients: isCenter ? 0 : 60,
      };
    }),
  },
  {
    id: 'field-checkered-mosaic',
    presetId: 'checkered_mosaic',
    name: '🏁 Checkered Mosaic Grid',
    description: 'Alternating dry and pre-hydrated soil beds. Demands conditional drone sensor inspection with get_tile(x, y).',
    width: 6,
    height: 6,
    theme: 'autumn',
    tiles: createTileMap(6, 6, (x, y) => {
      const isWet = (x + y) % 2 === 0;
      return {
        unlocked: true,
        moisture: isWet ? 85 : 20,
        nutrients: isWet ? 75 : 40,
      };
    }),
  },
  {
    id: 'field-cross-plus',
    presetId: 'cross_plus',
    name: '➕ Cardinal Cross Arena',
    description: 'Symmetrical plus-shaped agricultural corridors intersecting at the central drone launchpad.',
    width: 7,
    height: 7,
    theme: 'cyber',
    tiles: createTileMap(7, 7, (x, y) => {
      const isCross = x === 3 || y === 3 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
      return {
        unlocked: isCross,
        moisture: 55,
        nutrients: 65,
      };
    }),
  },
  {
    id: 'field-river-valley',
    presetId: 'river_valley',
    name: '🌾 River Valley Meander',
    description: 'Meandering river cutting through rich riparian floodplains flanked by drier upland slopes.',
    width: 7,
    height: 6,
    theme: 'wetlands',
    tiles: createTileMap(7, 6, (x, y) => {
      // S-curve river waterway
      const riverPath = [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 3 },
        { x: 5, y: 4 },
        { x: 6, y: 5 },
      ];
      const isRiver = riverPath.some((pt) => pt.x === x && pt.y === y);
      return {
        unlocked: !isRiver,
        moisture: isRiver ? 100 : 68,
        nutrients: isRiver ? 0 : 75,
      };
    }),
  },
  {
    id: 'field-desert-oasis',
    presetId: 'desert_oasis',
    name: '🏜️ Desert Oasis Basin',
    description: 'Arid sandy exterior beds surrounding a lush, high-nutrient central oasis. Challenges watering efficiency.',
    width: 6,
    height: 6,
    theme: 'desert',
    tiles: createTileMap(6, 6, (x, y) => {
      const isOasis = (x === 2 || x === 3) && (y === 2 || y === 3);
      return {
        unlocked: true,
        moisture: isOasis ? 90 : 18,
        nutrients: isOasis ? 90 : 30,
        crop: isOasis && x === 2 && y === 2 ? 'carrot' : isOasis && x === 3 && y === 2 ? 'wheat' : null,
      };
    }),
  },
];

export const DEFAULT_FIELD_CONFIG: FieldConfig = DEFAULT_FIELD_PRESETS[0];

export function createBlankField(width = 6, height = 6, name = 'New Custom Field'): FieldConfig {
  return {
    id: `field_custom_${Date.now()}`,
    presetId: 'custom_designed',
    name,
    description: 'Custom designed field layout created in Organizer Console.',
    width,
    height,
    theme: 'temperate',
    tiles: createTileMap(width, height, () => ({
      unlocked: true,
      moisture: 50,
      nutrients: 55,
      weedLevel: 0,
      crop: null,
    })),
  };
}
