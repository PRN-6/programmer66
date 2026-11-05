export type CropId = 'wheat' | 'corn' | 'carrot' | 'tomato' | 'potato';

export type GrowthStage = 'empty' | 'seedling' | 'sprout' | 'growing' | 'mature';

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'drought';

export interface CropConfig {
  id: CropId;
  name: string;
  description: string;
  seedCost: number;
  sellPrice: number;
  growthDuration: number; // in simulation seconds
  waterRequirement: number; // 0-100 needed for healthy growth
  nutrientRequirement: number; // 0-100
  preferredWeather: WeatherType[];
  color: string;
  secondaryColor: string;
  fruitColor: string;
  minStageDuration: number;
  xpReward: number;
}

export interface TileState {
  x: number;
  y: number;
  unlocked: boolean;
  moisture: number; // 0 - 100
  nutrients: number; // 0 - 100 (fertilizer increases this)
  weedLevel: number; // 0 - 100 (competes with crop)
  crop: CropId | null;
  stage: GrowthStage;
  growthProgress: number; // 0.0 - 1.0
  health: number; // 0 - 100
  lastWateredTime: number;
}

export type RobotTool = 'idle' | 'moving' | 'planting' | 'watering' | 'harvesting' | 'fertilizing' | 'clearing';

export type RobotType = 'basic' | 'sprinkler' | 'harvester' | 'planter' | 'drone';

export interface RobotState {
  id: string;
  name: string;
  type: RobotType;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  speed: number; // tiles per second
  energy: number; // 0 - 100
  maxEnergy: number;
  currentTool: RobotTool;
  currentTask: string;
  inventoryCapacity: number;
  inventory: Record<string, number>;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'seed' | 'produce' | 'fertilizer' | 'tool' | 'tech';
  count: number;
  unitPrice: number;
  icon?: string;
}

export interface Mission {
  id: string;
  title: string;
  stage: number;
  stageName: string;
  description: string;
  objectives: {
    id: string;
    description: string;
    target: number;
    current: number;
    completed: boolean;
  }[];
  starterCode?: string;
  hints: string[];
  rewardMoney: number;
  rewardXp: number;
  completed: boolean;
  rewardClaimed?: boolean;
}

export interface ResearchTech {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  reqTech?: string;
  effect: string;
}

export interface GameStats {
  totalHarvested: number;
  totalPlanted: number;
  totalWatered: number;
  moneyEarned: number;
  scriptsRun: number;
  tilesUnlocked: number;
}

