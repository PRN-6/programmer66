import { useGameStore } from '../store/useGameStore';
import { CropId } from '../types/game';
import { CROPS } from '../game/simulation/cropConfig';

export interface TileWrapper {
  x: number;
  y: number;
  plant: (crop: string) => Promise<boolean>;
  water: (amount?: number) => Promise<boolean>;
  harvest: () => Promise<boolean>;
  fertilize: () => Promise<boolean>;
  clear_weeds: () => Promise<boolean>;
  is_empty: () => boolean;
  is_ready: () => boolean;
  needs_water: () => boolean;
  get_moisture: () => number;
  get_nutrients: () => number;
  get_crop: () => string | null;
  get_stage: () => string;
}

export function createGameAPI(options: {
  getStepDelay: () => number;
  isCancelled: () => boolean;
  onLog: (msg: string) => void;
}) {
  const store = useGameStore.getState;

  const sleep = (ms: number) => {
    return new Promise<void>((resolve) => {
      const start = Date.now();
      const check = () => {
        if (options.isCancelled() || Date.now() - start >= ms) {
          resolve();
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  };

  // Helper to create safe tile wrapper
  const wrapTile = (x: number, y: number): TileWrapper => {
    return {
      x,
      y,
      plant: async (crop: string) => {
        const cropLower = crop.toLowerCase() as CropId;
        if (!CROPS[cropLower]) {
          options.onLog(`Error: Unknown crop "${crop}". Available: wheat, corn, carrot, tomato, potato`);
          return false;
        }
        const delay = options.getStepDelay();
        if (delay > 0) await sleep(delay);
        const res = useGameStore.getState().plantCrop(x, y, cropLower);
        if (!res) {
          options.onLog(`Warning: Failed to plant "${crop}" at (${x}, ${y}). Check seed inventory or tile occupancy.`);
        }
        return res;
      },
      water: async (amount?: number) => {
        const delay = options.getStepDelay();
        if (delay > 0) await sleep(delay);
        const res = useGameStore.getState().waterTile(x, y, amount);
        return res;
      },
      harvest: async () => {
        const delay = options.getStepDelay();
        if (delay > 0) await sleep(delay);
        const res = useGameStore.getState().harvestTile(x, y);
        if (!res) {
          options.onLog(`Warning: Cannot harvest tile at (${x}, ${y}). Crop is not mature.`);
        }
        return res;
      },
      fertilize: async () => {
        const delay = options.getStepDelay();
        if (delay > 0) await sleep(delay);
        const res = useGameStore.getState().fertilizeTile(x, y);
        return res;
      },
      clear_weeds: async () => {
        const delay = options.getStepDelay();
        if (delay > 0) await sleep(delay);
        return useGameStore.getState().clearWeeds(x, y);
      },
      is_empty: () => {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return !tile || tile.crop === null;
      },
      is_ready: () => {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return !!tile && tile.stage === 'mature';
      },
      needs_water: () => {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return !tile || tile.moisture < 35;
      },
      get_moisture: () => {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return tile ? tile.moisture : 0;
      },
      get_nutrients: () => {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return tile ? tile.nutrients : 0;
      },
      get_crop: () => {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return tile ? tile.crop : null;
      },
      get_stage: () => {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return tile ? tile.stage : 'empty';
      },
    };
  };

  const farm = {
    get_tiles: () => {
      const state = useGameStore.getState();
      const list: TileWrapper[] = [];
      for (let y = 0; y < state.gridHeight; y++) {
        for (let x = 0; x < state.gridWidth; x++) {
          const tile = state.tiles[`${x}_${y}`];
          if (tile && tile.unlocked) {
            list.push(wrapTile(x, y));
          }
        }
      }
      return list;
    },
    get_tile: (x: number, y: number) => {
      const state = useGameStore.getState();
      const tile = state.tiles[`${x}_${y}`];
      if (!tile || !tile.unlocked) {
        return null;
      }
      return wrapTile(x, y);
    },
    get_width: () => useGameStore.getState().gridWidth,
    get_height: () => useGameStore.getState().gridHeight,
    get_weather: () => useGameStore.getState().weather,
    get_money: () => useGameStore.getState().money,
    get_day: () => useGameStore.getState().day,
    get_time: () => Math.round(useGameStore.getState().timeOfDay * 10) / 10,
    unlock_tile: (x: number, y: number) => {
      return useGameStore.getState().unlockTile(x, y);
    },
  };

  const robot = {
    get_position: () => {
      const state = useGameStore.getState();
      const bot = state.robots.find((r) => r.id === state.activeRobotId) || state.robots[0];
      return bot ? [bot.x, bot.y] : [0, 0];
    },
    get_energy: () => {
      const state = useGameStore.getState();
      const bot = state.robots.find((r) => r.id === state.activeRobotId) || state.robots[0];
      return bot ? Math.round(bot.energy) : 0;
    },
    move_to: async (targetX: number, targetY: number) => {
      const state = useGameStore.getState();
      const botId = state.activeRobotId;
      const bot = state.robots.find((r) => r.id === botId) || state.robots[0];
      if (!bot) return false;

      let curX = bot.x;
      let curY = bot.y;

      useGameStore.getState().setRobotTool(botId, 'moving', `Moving to (${targetX}, ${targetY})`);

      // Step-by-step pathfinding along grid
      while (curX !== targetX || curY !== targetY) {
        if (options.isCancelled()) return false;

        if (curX < targetX) curX++;
        else if (curX > targetX) curX--;
        else if (curY < targetY) curY++;
        else if (curY > targetY) curY--;

        useGameStore.getState().moveRobot(botId, curX, curY);
        useGameStore.getState().incrementRobotAction();

        const delay = Math.max(30, options.getStepDelay());
        await sleep(delay);
      }

      useGameStore.getState().setRobotTool(botId, 'idle', `Idle at (${targetX}, ${targetY})`);
      return true;
    },
    move: async (direction: string) => {
      const state = useGameStore.getState();
      const botId = state.activeRobotId;
      const bot = state.robots.find((r) => r.id === botId) || state.robots[0];
      if (!bot) return false;

      let nextX = bot.x;
      let nextY = bot.y;

      const d = direction.toLowerCase();
      if (d === 'up' || d === 'north') nextY--;
      else if (d === 'down' || d === 'south') nextY++;
      else if (d === 'left' || d === 'west') nextX--;
      else if (d === 'right' || d === 'east') nextX++;

      if (nextX < 0 || nextX >= state.gridWidth || nextY < 0 || nextY >= state.gridHeight) {
        options.onLog(`Warning: Robot cannot move out of farm bounds to (${nextX}, ${nextY})`);
        return false;
      }

      useGameStore.getState().moveRobot(botId, nextX, nextY);
      useGameStore.getState().incrementRobotAction();
      const delay = Math.max(30, options.getStepDelay());
      await sleep(delay);
      return true;
    },
    plant: async (crop: string) => {
      const state = useGameStore.getState();
      const botId = state.activeRobotId;
      const bot = state.robots.find((r) => r.id === botId) || state.robots[0];
      if (!bot) return false;

      useGameStore.getState().setRobotTool(botId, 'planting', `Planting ${crop}`);
      const delay = Math.max(50, options.getStepDelay());
      await sleep(delay);

      const res = useGameStore.getState().plantCrop(bot.x, bot.y, crop.toLowerCase() as CropId);
      useGameStore.getState().incrementRobotAction();
      useGameStore.getState().setRobotTool(botId, 'idle', 'Standby');
      return res;
    },
    water: async () => {
      const state = useGameStore.getState();
      const botId = state.activeRobotId;
      const bot = state.robots.find((r) => r.id === botId) || state.robots[0];
      if (!bot) return false;

      useGameStore.getState().setRobotTool(botId, 'watering', 'Watering soil');
      const delay = Math.max(50, options.getStepDelay());
      await sleep(delay);

      const res = useGameStore.getState().waterTile(bot.x, bot.y);
      useGameStore.getState().incrementRobotAction();
      useGameStore.getState().setRobotTool(botId, 'idle', 'Standby');
      return res;
    },
    harvest: async () => {
      const state = useGameStore.getState();
      const botId = state.activeRobotId;
      const bot = state.robots.find((r) => r.id === botId) || state.robots[0];
      if (!bot) return false;

      useGameStore.getState().setRobotTool(botId, 'harvesting', 'Harvesting crop');
      const delay = Math.max(50, options.getStepDelay());
      await sleep(delay);

      const res = useGameStore.getState().harvestTile(bot.x, bot.y);
      useGameStore.getState().incrementRobotAction();
      useGameStore.getState().setRobotTool(botId, 'idle', 'Standby');
      return res;
    },
    recharge: async () => {
      const state = useGameStore.getState();
      const botId = state.activeRobotId;
      useGameStore.getState().rechargeRobot(botId);
      options.onLog('Robot Rusty-01 recharged to 100% solar energy.');
      return true;
    },
  };

  const inventory = {
    count: (item: string) => {
      const inv = useGameStore.getState().inventory;
      return inv[item] || 0;
    },
    buy_seeds: (crop: string, count: number = 1) => {
      const cropKey = crop.toLowerCase() as CropId;
      const config = CROPS[cropKey];
      if (!config) {
        options.onLog(`Error: Unknown crop "${crop}"`);
        return false;
      }
      const cost = config.seedCost * count;
      return useGameStore.getState().buyItem(`${cropKey}_seed`, count, cost);
    },
    sell: (item: string, count: number = 1) => {
      const cropKey = item.toLowerCase() as CropId;
      const config = CROPS[cropKey];
      const price = config ? config.sellPrice * count : 10 * count;
      return useGameStore.getState().sellItem(item, count, price);
    },
    get_all: () => {
      return { ...useGameStore.getState().inventory };
    },
  };

  return {
    farm,
    robot,
    inventory,
    wrapTile,
  };
}

