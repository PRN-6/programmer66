import { create } from 'zustand';
import {
  CropId,
  WeatherType,
  TileState,
  RobotState,
  Mission,
  GameStats,
} from '../types/game';
import { CROPS } from '../game/simulation/cropConfig';
import { WEATHER_PROFILES } from '../game/simulation/weatherConfig';
import { INITIAL_MISSIONS } from '../game/simulation/missionConfig';
import { soundManager } from '../audio/soundEffects';

export interface GameState {
  // Grid
  gridWidth: number;
  gridHeight: number;
  tiles: Record<string, TileState>; // key: `${x}_${y}`

  // Robots
  robots: RobotState[];
  activeRobotId: string;

  // Economy & Inventory
  money: number;
  inventory: Record<string, number>;

  // Simulation
  day: number;
  timeOfDay: number; // 0.0 - 24.0 hours
  weather: WeatherType;
  weatherDurationLeft: number;
  nextWeather: WeatherType;
  isPaused: boolean;
  gameSpeed: number; // 1, 2, 5

  // Progression
  xp: number;
  level: number;
  missions: Mission[];
  stats: GameStats;

  // UI & Controls
  selectedTileCoord: { x: number; y: number } | null;
  activeTool: 'inspect' | 'plant' | 'water' | 'fertilize' | 'harvest' | 'clear';
  selectedSeed: CropId;
  soundMuted: boolean;
  sfxVolume: number;
  ambienceVolume: number;
  graphicsQuality: 'high' | 'balanced' | 'low';
  cameraFollowRobot: boolean;
  robotActionCount: number;

  // Actions
  tick: (deltaSeconds: number) => void;
  selectTile: (x: number, y: number) => void;
  clearSelection: () => void;
  setActiveTool: (tool: GameState['activeTool']) => void;
  setSelectedSeed: (crop: CropId) => void;
  setGameSpeed: (speed: number) => void;
  setPaused: (paused: boolean) => void;
  setTimeOfDay: (time: number) => void;
  toggleDayNight: () => void;
  setGraphicsQuality: (quality: 'high' | 'balanced' | 'low') => void;

  // Farming actions
  plantCrop: (x: number, y: number, crop: CropId) => boolean;
  waterTile: (x: number, y: number, amount?: number) => boolean;
  fertilizeTile: (x: number, y: number) => boolean;
  harvestTile: (x: number, y: number) => boolean;
  clearWeeds: (x: number, y: number) => boolean;
  unlockTile: (x: number, y: number) => boolean;

  // Robot actions
  moveRobot: (id: string, x: number, y: number) => void;
  setRobotTool: (id: string, tool: RobotState['currentTool'], task?: string) => void;
  rechargeRobot: (id: string) => void;
  incrementRobotAction: () => void;

  // Store & Trading
  buyItem: (itemId: string, count: number, cost: number) => boolean;
  sellItem: (itemId: string, count: number, price: number) => boolean;

  // Missions & Progression
  addXp: (amount: number) => void;
  checkMissions: () => void;
  claimMissionReward: (missionId: string) => void;

  // Audio settings
  toggleMute: () => void;
  setVolumes: (sfx: number, ambience: number) => void;
  setCameraFollowRobot: (follow: boolean) => void;

  // Save / Load / Reset
  saveGame: () => void;
  loadGame: () => boolean;
  resetGame: () => void;
  resetFarmPlots: () => void;
}

const GRID_DEFAULT_WIDTH = 6;
const GRID_DEFAULT_HEIGHT = 6;

function createInitialTiles(): Record<string, TileState> {
  const tiles: Record<string, TileState> = {};
  for (let x = 0; x < GRID_DEFAULT_WIDTH; x++) {
    for (let y = 0; y < GRID_DEFAULT_HEIGHT; y++) {
      tiles[`${x}_${y}`] = {
        x,
        y,
        unlocked: true,
        moisture: 45 + Math.floor(Math.random() * 20),
        nutrients: 50 + Math.floor(Math.random() * 25),
        weedLevel: 0,
        crop: null,
        stage: 'empty',
        growthProgress: 0,
        health: 100,
        lastWateredTime: 0,
      };
    }
  }
  return tiles;
}

const INITIAL_ROBOTS: RobotState[] = [
  {
    id: 'drone_01',
    name: 'AeroDrone-01',
    type: 'drone',
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    color: '#27272a',
    speed: 4.2,
    energy: 100,
    maxEnergy: 100,
    currentTool: 'idle',
    currentTask: 'Hovering - Standby',
    inventoryCapacity: 50,
    inventory: {},
  },
];

const INITIAL_INVENTORY: Record<string, number> = {
  wheat_seed: 50,
  corn_seed: 30,
  carrot_seed: 50,
  tomato_seed: 20,
  potato_seed: 20,
  fertilizer: 50,
  wheat: 0,
  corn: 0,
  carrot: 0,
  tomato: 0,
  potato: 0,
};

const INITIAL_STATS: GameStats = {
  totalHarvested: 0,
  totalPlanted: 0,
  totalWatered: 0,
  moneyEarned: 0,
  scriptsRun: 0,
  tilesUnlocked: GRID_DEFAULT_WIDTH * GRID_DEFAULT_HEIGHT,
};

const WEATHER_CYCLE: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'sunny', 'drought', 'stormy'];

export const useGameStore = create<GameState>((set, get) => ({
  gridWidth: GRID_DEFAULT_WIDTH,
  gridHeight: GRID_DEFAULT_HEIGHT,
  tiles: createInitialTiles(),
  robots: INITIAL_ROBOTS,
  activeRobotId: 'drone_01',

  money: 120, // Starting capital
  inventory: INITIAL_INVENTORY,

  day: 1,
  timeOfDay: 8.0, // 8:00 AM
  weather: 'sunny',
  weatherDurationLeft: 120,
  nextWeather: 'cloudy',
  isPaused: false,
  gameSpeed: 1,

  xp: 0,
  level: 1,
  missions: INITIAL_MISSIONS,
  stats: INITIAL_STATS,

  selectedTileCoord: { x: 0, y: 0 },
  activeTool: 'inspect',
  selectedSeed: 'wheat',
  soundMuted: false,
  sfxVolume: 0.5,
  ambienceVolume: 0.25,
  graphicsQuality:
    typeof window !== 'undefined' && typeof localStorage !== 'undefined'
      ? ((localStorage.getItem('programmer66_graphics') as 'high' | 'balanced' | 'low') || 'balanced')
      : 'balanced',
  cameraFollowRobot: false,
  robotActionCount: 0,

  tick: (deltaSeconds: number) => {
    const state = get();
    if (state.isPaused) return;

    const effectiveDelta = deltaSeconds * state.gameSpeed;
    const weatherProfile = WEATHER_PROFILES[state.weather];

    // 1. Advance Time of Day (1 real second = 0.05 game hours => 1 day takes ~480s / 8 mins)
    let newTime = state.timeOfDay + effectiveDelta * 0.06;
    let newDay = state.day;
    if (newTime >= 24) {
      newTime -= 24;
      newDay += 1;
    }

    // 2. Weather Countdown & Transition
    let newWeatherDuration = state.weatherDurationLeft - effectiveDelta;
    let newWeather = state.weather;
    let nextWeather = state.nextWeather;

    if (newWeatherDuration <= 0) {
      newWeather = nextWeather;
      const currentIdx = WEATHER_CYCLE.indexOf(newWeather);
      const nextIdx = (currentIdx + 1) % WEATHER_CYCLE.length;
      nextWeather = WEATHER_CYCLE[nextIdx];
      newWeatherDuration = WEATHER_PROFILES[newWeather].durationSeconds;
    }

    // 3. Tile Simulation
    const updatedTiles: Record<string, TileState> = {};
    let hasChanges = false;

    for (const key in state.tiles) {
      const tile = state.tiles[key];
      if (!tile.unlocked) continue;

      let moisture = tile.moisture;
      let nutrients = tile.nutrients;
      let growthProgress = tile.growthProgress;
      let stage = tile.stage;
      let health = tile.health;
      let weedLevel = tile.weedLevel;

      // Weather effects on soil moisture
      if (weatherProfile.rainMoistureRate > 0) {
        moisture = Math.min(100, moisture + weatherProfile.rainMoistureRate * effectiveDelta);
      } else {
        moisture = Math.max(0, moisture - weatherProfile.soilDryingRate * effectiveDelta * 0.15);
      }

      // Crop Growth
      if (tile.crop && stage !== 'mature') {
        const cropConfig = CROPS[tile.crop];
        const hasWater = moisture >= cropConfig.waterRequirement * 0.35;
        const hasNutrients = nutrients >= cropConfig.nutrientRequirement * 0.35;

        if (hasWater) {
          // Consume moisture & nutrients slightly
          moisture = Math.max(0, moisture - 0.25 * effectiveDelta);
          if (hasNutrients) {
            nutrients = Math.max(0, nutrients - 0.15 * effectiveDelta);
          }

          // Growth calculation
          const nutrientBonus = nutrients > 60 ? 1.3 : 1.0;
          const weatherBonus = cropConfig.preferredWeather.includes(newWeather) ? 1.25 : 1.0;
          const growthRate = (1.0 / cropConfig.growthDuration) * nutrientBonus * weatherBonus * weatherProfile.growthMultiplier;

          growthProgress = Math.min(1.0, growthProgress + growthRate * effectiveDelta);
          health = Math.min(100, health + 0.5 * effectiveDelta);

          // Update stage based on progress
          if (growthProgress >= 1.0) {
            stage = 'mature';
          } else if (growthProgress >= 0.6) {
            stage = 'growing';
          } else if (growthProgress >= 0.25) {
            stage = 'sprout';
          } else {
            stage = 'seedling';
          }
        } else {
          // Dry soil penalty
          health = Math.max(10, health - 0.8 * effectiveDelta);
        }
      }

      // Weed growth if neglected
      if (!tile.crop && moisture > 20 && Math.random() < 0.001 * effectiveDelta) {
        weedLevel = Math.min(100, weedLevel + 5);
      }

      if (
        moisture !== tile.moisture ||
        nutrients !== tile.nutrients ||
        growthProgress !== tile.growthProgress ||
        stage !== tile.stage ||
        health !== tile.health ||
        weedLevel !== tile.weedLevel
      ) {
        hasChanges = true;
        updatedTiles[key] = {
          ...tile,
          moisture: Math.round(moisture * 10) / 10,
          nutrients: Math.round(nutrients * 10) / 10,
          growthProgress,
          stage,
          health: Math.round(health),
          weedLevel,
        };
      } else {
        updatedTiles[key] = tile;
      }
    }

    set({
      day: newDay,
      timeOfDay: newTime,
      weather: newWeather,
      weatherDurationLeft: newWeatherDuration,
      nextWeather,
      tiles: hasChanges ? updatedTiles : state.tiles,
    });

    if (hasChanges) {
      state.checkMissions();
    }
  },

  selectTile: (x: number, y: number) => {
    set({ selectedTileCoord: { x, y } });
  },

  clearSelection: () => {
    set({ selectedTileCoord: null });
  },

  setActiveTool: (tool) => {
    set({ activeTool: tool });
  },

  setSelectedSeed: (crop) => {
    set({ selectedSeed: crop });
  },

  setGameSpeed: (speed) => {
    set({ gameSpeed: speed });
  },

  setPaused: (paused) => {
    set({ isPaused: paused });
  },

  setTimeOfDay: (time) => {
    set({ timeOfDay: Math.max(0, Math.min(24, time)) });
  },

  toggleDayNight: () => {
    const cur = get().timeOfDay;
    const newTime = cur >= 5.5 && cur <= 18.5 ? 21.5 : 11.0;
    set({ timeOfDay: newTime });
  },

  plantCrop: (x: number, y: number, crop: CropId) => {
    const state = get();
    const key = `${x}_${y}`;
    const tile = state.tiles[key];
    if (!tile || !tile.unlocked || tile.crop !== null) return false;

    const seedKey = `${crop}_seed`;
    let seedCount = state.inventory[seedKey] || 0;
    // Auto-replenish seeds so automation scripts and competition challenges never get blocked
    if (seedCount <= 0) {
      seedCount = 25;
    }

    soundManager.playPlant();

    set((prev) => ({
      inventory: {
        ...prev.inventory,
        [seedKey]: seedCount - 1,
      },
      tiles: {
        ...prev.tiles,
        [key]: {
          ...tile,
          crop,
          stage: 'seedling',
          growthProgress: 0.01,
          health: 100,
        },
      },
      stats: {
        ...prev.stats,
        totalPlanted: prev.stats.totalPlanted + 1,
      },
    }));

    get().checkMissions();
    return true;
  },

  waterTile: (x: number, y: number, amount: number = 55) => {
    const state = get();
    const key = `${x}_${y}`;
    const tile = state.tiles[key];
    if (!tile || !tile.unlocked) return false;

    soundManager.playWater();

    set((prev) => ({
      tiles: {
        ...prev.tiles,
        [key]: {
          ...tile,
          moisture: Math.min(100, tile.moisture + amount),
          lastWateredTime: prev.timeOfDay,
        },
      },
      stats: {
        ...prev.stats,
        totalWatered: prev.stats.totalWatered + 1,
      },
    }));

    get().checkMissions();
    return true;
  },

  fertilizeTile: (x: number, y: number) => {
    const state = get();
    const key = `${x}_${y}`;
    const tile = state.tiles[key];
    if (!tile || !tile.unlocked) return false;

    const fertCount = state.inventory['fertilizer'] || 0;
    if (fertCount <= 0) return false;

    soundManager.playPlant();

    set((prev) => ({
      inventory: {
        ...prev.inventory,
        fertilizer: fertCount - 1,
      },
      tiles: {
        ...prev.tiles,
        [key]: {
          ...tile,
          nutrients: Math.min(100, tile.nutrients + 50),
        },
      },
    }));

    return true;
  },

  harvestTile: (x: number, y: number) => {
    const state = get();
    const key = `${x}_${y}`;
    const tile = state.tiles[key];
    if (!tile || !tile.unlocked || tile.stage !== 'mature' || !tile.crop) return false;

    const cropId = tile.crop;
    const cropConfig = CROPS[cropId];

    soundManager.playHarvest();

    set((prev) => ({
      inventory: {
        ...prev.inventory,
        [cropId]: (prev.inventory[cropId] || 0) + 1,
      },
      tiles: {
        ...prev.tiles,
        [key]: {
          ...tile,
          crop: null,
          stage: 'empty',
          growthProgress: 0,
        },
      },
      stats: {
        ...prev.stats,
        totalHarvested: prev.stats.totalHarvested + 1,
      },
    }));

    get().addXp(cropConfig.xpReward);
    get().checkMissions();
    return true;
  },

  clearWeeds: (x: number, y: number) => {
    const state = get();
    const key = `${x}_${y}`;
    const tile = state.tiles[key];
    if (!tile || !tile.unlocked) return false;

    soundManager.playPlant();

    set((prev) => ({
      tiles: {
        ...prev.tiles,
        [key]: {
          ...tile,
          weedLevel: 0,
        },
      },
    }));
    return true;
  },

  unlockTile: (x: number, y: number) => {
    const state = get();
    const key = `${x}_${y}`;
    const tile = state.tiles[key];
    const cost = 100;

    if (state.money < cost) return false;
    soundManager.playCoin();

    set((prev) => ({
      money: prev.money - cost,
      tiles: {
        ...prev.tiles,
        [key]: {
          ...(tile || {
            x,
            y,
            moisture: 50,
            nutrients: 50,
            weedLevel: 0,
            crop: null,
            stage: 'empty',
            growthProgress: 0,
            health: 100,
            lastWateredTime: 0,
          }),
          unlocked: true,
        },
      },
      stats: {
        ...prev.stats,
        tilesUnlocked: prev.stats.tilesUnlocked + 1,
      },
    }));
    return true;
  },

  moveRobot: (id: string, x: number, y: number) => {
    soundManager.playRobotMove();
    set((prev) => ({
      robots: prev.robots.map((r) =>
        r.id === id
          ? {
              ...r,
              x,
              y,
              targetX: x,
              targetY: y,
              energy: Math.max(0, r.energy - 0.2),
            }
          : r
      ),
    }));
  },

  setRobotTool: (id: string, tool: RobotState['currentTool'], task?: string) => {
    set((prev) => ({
      robots: prev.robots.map((r) =>
        r.id === id
          ? {
              ...r,
              currentTool: tool,
              currentTask: task || r.currentTask,
            }
          : r
      ),
    }));
  },

  rechargeRobot: (id: string) => {
    set((prev) => ({
      robots: prev.robots.map((r) =>
        r.id === id
          ? {
              ...r,
              energy: r.maxEnergy,
              currentTask: 'Recharged and Ready',
            }
          : r
      ),
    }));
  },

  incrementRobotAction: () => {
    set((prev) => ({
      robotActionCount: prev.robotActionCount + 1,
    }));
    get().checkMissions();
  },

  buyItem: (itemId: string, count: number, cost: number) => {
    const state = get();
    if (state.money < cost) return false;

    soundManager.playCoin();

    set((prev) => ({
      money: prev.money - cost,
      inventory: {
        ...prev.inventory,
        [itemId]: (prev.inventory[itemId] || 0) + count,
      },
    }));

    return true;
  },

  sellItem: (itemId: string, count: number, price: number) => {
    const state = get();
    const currentCount = state.inventory[itemId] || 0;
    if (currentCount < count) return false;

    soundManager.playCoin();

    set((prev) => ({
      money: prev.money + price,
      inventory: {
        ...prev.inventory,
        [itemId]: currentCount - count,
      },
      stats: {
        ...prev.stats,
        moneyEarned: prev.stats.moneyEarned + price,
      },
    }));

    get().checkMissions();
    return true;
  },

  addXp: (amount: number) => {
    set((prev) => {
      const newXp = prev.xp + amount;
      let newLevel = 1;
      if (newXp >= 1500) newLevel = 6;
      else if (newXp >= 900) newLevel = 5;
      else if (newXp >= 500) newLevel = 4;
      else if (newXp >= 250) newLevel = 3;
      else if (newXp >= 100) newLevel = 2;

      if (newLevel > prev.level) {
        soundManager.playSuccess();
      }

      return {
        xp: newXp,
        level: newLevel,
      };
    });
  },

  checkMissions: () => {
    const state = get();
    let missionsChanged = false;

    const updatedMissions = state.missions.map((mission) => {
      if (mission.completed) return mission;

      let allCompleted = true;
      const updatedObjectives = mission.objectives.map((obj) => {
        let current = obj.current;

        if (obj.id.startsWith('plant_wheat')) {
          current = state.stats.totalPlanted;
        } else if (obj.id.startsWith('water_tiles')) {
          current = state.stats.totalWatered;
        } else if (obj.id.startsWith('harvest_crops')) {
          current = state.stats.totalHarvested;
        } else if (obj.id.startsWith('total_harvest')) {
          current = state.stats.totalHarvested;
        } else if (obj.id.startsWith('total_planted')) {
          current = state.stats.totalPlanted;
        } else if (obj.id.startsWith('robot_actions')) {
          current = state.robotActionCount;
        } else if (obj.id.startsWith('money_')) {
          current = state.money;
        }

        const isObjDone = current >= obj.target;
        if (!isObjDone) allCompleted = false;

        return {
          ...obj,
          current: Math.min(obj.target, current),
          completed: isObjDone,
        };
      });

      if (allCompleted && !mission.completed) {
        missionsChanged = true;
        soundManager.playSuccess();
        return {
          ...mission,
          objectives: updatedObjectives,
          completed: true,
        };
      }

      return {
        ...mission,
        objectives: updatedObjectives,
      };
    });

    if (missionsChanged) {
      set({ missions: updatedMissions });
    }
  },

  claimMissionReward: (missionId: string) => {
    const state = get();
    const mission = state.missions.find((m) => m.id === missionId);
    // Strictly enforce claiming reward only once
    if (!mission || !mission.completed || mission.rewardClaimed) return;

    soundManager.playSuccess();
    set((prev) => ({
      money: prev.money + mission.rewardMoney,
      missions: prev.missions.map((m) =>
        m.id === missionId ? { ...m, rewardClaimed: true } : m
      ),
    }));
    get().addXp(mission.rewardXp);
    get().saveGame();
  },

  toggleMute: () => {
    const nextMuted = !get().soundMuted;
    soundManager.setMuted(nextMuted);
    set({ soundMuted: nextMuted });
  },

  setVolumes: (sfx: number, ambience: number) => {
    soundManager.setVolume(sfx, ambience);
    set({ sfxVolume: sfx, ambienceVolume: ambience });
  },

  setCameraFollowRobot: (follow: boolean) => {
    set({ cameraFollowRobot: follow });
  },

  setGraphicsQuality: (quality: 'high' | 'balanced' | 'low') => {
    set({ graphicsQuality: quality });
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('programmer66_graphics', quality);
      } catch (e) {
        console.warn('Failed to save graphics setting:', e);
      }
    }
  },

  saveGame: () => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    const state = get();
    try {
      const saveData = {
        tiles: state.tiles,
        robots: state.robots,
        inventory: state.inventory,
        money: state.money,
        day: state.day,
        timeOfDay: state.timeOfDay,
        weather: state.weather,
        xp: state.xp,
        level: state.level,
        stats: state.stats,
        missions: state.missions,
        robotActionCount: state.robotActionCount,
        graphicsQuality: state.graphicsQuality,
      };
      localStorage.setItem('programmer66_save', JSON.stringify(saveData));

      // Asynchronously sync to Supabase cloud if player is signed in
      import('./useAuthStore')
        .then(({ useAuthStore }) => {
          const auth = useAuthStore.getState();
          if (auth.user && !auth.isSyncing) {
            auth.syncToCloud();
          }
        })
        .catch(() => {});
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  },

  loadGame: () => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
    try {
      const saved = localStorage.getItem('programmer66_save') || localStorage.getItem('farming68_save');
      if (!saved) return false;
      const data = JSON.parse(saved);
      const inventory = { ...data.inventory };
      if (!inventory.carrot_seed || inventory.carrot_seed < 12) {
        inventory.carrot_seed = 50;
      }
      if (!inventory.wheat_seed || inventory.wheat_seed < 12) {
        inventory.wheat_seed = 50;
      }
      set({
        tiles: data.tiles,
        robots: data.robots,
        inventory,
        money: data.money,
        day: data.day,
        timeOfDay: data.timeOfDay,
        weather: data.weather,
        xp: data.xp,
        level: data.level,
        stats: data.stats,
        missions: data.missions,
        robotActionCount: data.robotActionCount || 0,
        graphicsQuality: data.graphicsQuality || get().graphicsQuality,
      });
      return true;
    } catch (e) {
      console.warn('Failed to load save:', e);
      return false;
    }
  },

  resetFarmPlots: () => {
    set({
      tiles: createInitialTiles(),
    });
  },

  resetGame: () => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('programmer66_save');
        localStorage.removeItem('farming68_save');
      } catch (e) {
        console.warn('Failed to clear localStorage:', e);
      }
    }
    set({
      tiles: createInitialTiles(),
      robots: INITIAL_ROBOTS,
      inventory: INITIAL_INVENTORY,
      money: 120,
      day: 1,
      timeOfDay: 8.0,
      weather: 'sunny',
      weatherDurationLeft: 120,
      nextWeather: 'cloudy',
      xp: 0,
      level: 1,
      stats: INITIAL_STATS,
      missions: INITIAL_MISSIONS,
      selectedTileCoord: { x: 0, y: 0 },
      robotActionCount: 0,
    });
  },
}));
