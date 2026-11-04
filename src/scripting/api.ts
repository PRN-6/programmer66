import { useGameStore } from '../store/useGameStore';
import type { CropId } from '../types/game';
import { CROPS } from '../game/simulation/cropConfig';

export interface TileWrapper {
  x: number;
  y: number;
  crop: string | null;
  stage: string;
  moisture: number;
  nutrients: number;
  weed_level: number;
  plant: (crop: string) => Promise<boolean>;
  water: (amount?: number) => Promise<boolean>;
  harvest: () => Promise<boolean>;
  fertilize: () => Promise<boolean>;
  clear_weeds: () => Promise<boolean>;
  is_empty: () => boolean;
  is_ready: () => boolean;
  needs_water: () => boolean;
  needs_fertilizer: () => boolean;
  has_weeds: () => boolean;
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

  const robot = {
    get x() {
      const state = useGameStore.getState();
      const bot = state.robots.find((r) => r.id === state.activeRobotId) || state.robots[0];
      return bot ? bot.x : 0;
    },
    get y() {
      const state = useGameStore.getState();
      const bot = state.robots.find((r) => r.id === state.activeRobotId) || state.robots[0];
      return bot ? bot.y : 0;
    },
    get energy() {
      const state = useGameStore.getState();
      const bot = state.robots.find((r) => r.id === state.activeRobotId) || state.robots[0];
      return bot ? Math.round(bot.energy) : 0;
    },
    get_position: () => {
      const state = useGameStore.getState();
      const bot = state.robots.find((r) => r.id === state.activeRobotId) || state.robots[0];
      const pos = [bot ? bot.x : 0, bot ? bot.y : 0] as unknown as [number, number] & { x: number; y: number };
      pos.x = pos[0];
      pos.y = pos[1];
      return pos;
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

      const clampedX = Math.max(0, Math.min(state.gridWidth - 1, Math.round(targetX)));
      const clampedY = Math.max(0, Math.min(state.gridHeight - 1, Math.round(targetY)));

      let curX = bot.x;
      let curY = bot.y;

      if (curX === clampedX && curY === clampedY) {
        return true;
      }

      useGameStore.getState().setRobotTool(botId, 'moving', `Flying to (${clampedX}, ${clampedY})`);

      const stepDelay = Math.max(30, options.getStepDelay());

      // Step-by-step flight navigation along grid
      while (curX !== clampedX || curY !== clampedY) {
        if (options.isCancelled()) return false;

        if (curX < clampedX) curX++;
        else if (curX > clampedX) curX--;
        else if (curY < clampedY) curY++;
        else if (curY > clampedY) curY--;

        useGameStore.getState().moveRobot(botId, curX, curY);
        useGameStore.getState().incrementRobotAction();

        if (options.getStepDelay() > 0) {
          await sleep(stepDelay);
        }
      }

      useGameStore.getState().setRobotTool(botId, 'idle', `Hovering at (${clampedX}, ${clampedY})`);
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
        options.onLog(`Warning: Drone cannot move out of farm bounds to (${nextX}, ${nextY})`);
        return false;
      }

      useGameStore.getState().setRobotTool(botId, 'moving', `Flying to (${nextX}, ${nextY})`);
      useGameStore.getState().moveRobot(botId, nextX, nextY);
      useGameStore.getState().incrementRobotAction();

      const delay = Math.max(30, options.getStepDelay());
      if (delay > 0) await sleep(delay);

      useGameStore.getState().setRobotTool(botId, 'idle', `Hovering at (${nextX}, ${nextY})`);
      return true;
    },
    plant: async (crop: string) => {
      const state = useGameStore.getState();
      const botId = state.activeRobotId;
      const bot = state.robots.find((r) => r.id === botId) || state.robots[0];
      if (!bot) return false;

      const cropLower = crop.toLowerCase() as CropId;
      if (!CROPS[cropLower]) {
        options.onLog(`Error: Unknown crop "${crop}". Available: wheat, corn, carrot, tomato, potato`);
        return false;
      }

      useGameStore.getState().setRobotTool(botId, 'planting', `Planting ${crop} at (${bot.x}, ${bot.y})`);
      const delay = options.getStepDelay();
      if (delay > 0) await sleep(Math.max(140, delay * 1.5));

      const res = useGameStore.getState().plantCrop(bot.x, bot.y, cropLower);
      useGameStore.getState().incrementRobotAction();
      useGameStore.getState().setRobotTool(botId, 'idle', 'Hovering - Standby');

      if (!res) {
        options.onLog(`Warning: Failed to plant "${crop}" at (${bot.x}, ${bot.y}). Check seed inventory or tile status.`);
      }
      return res;
    },
    water: async (amount?: number) => {
      const state = useGameStore.getState();
      const botId = state.activeRobotId;
      const bot = state.robots.find((r) => r.id === botId) || state.robots[0];
      if (!bot) return false;

      useGameStore.getState().setRobotTool(botId, 'watering', `Watering plot (${bot.x}, ${bot.y})`);
      const delay = options.getStepDelay();
      if (delay > 0) await sleep(Math.max(140, delay * 1.5));

      const res = useGameStore.getState().waterTile(bot.x, bot.y, amount);
      useGameStore.getState().incrementRobotAction();
      useGameStore.getState().setRobotTool(botId, 'idle', 'Hovering - Standby');
      return res;
    },
    harvest: async () => {
      const state = useGameStore.getState();
      const botId = state.activeRobotId;
      const bot = state.robots.find((r) => r.id === botId) || state.robots[0];
      if (!bot) return false;

      useGameStore.getState().setRobotTool(botId, 'harvesting', `Harvesting crop at (${bot.x}, ${bot.y})`);
      const delay = options.getStepDelay();
      if (delay > 0) await sleep(Math.max(140, delay * 1.5));

      const res = useGameStore.getState().harvestTile(bot.x, bot.y);
      useGameStore.getState().incrementRobotAction();
      useGameStore.getState().setRobotTool(botId, 'idle', 'Hovering - Standby');

      if (!res) {
        options.onLog(`Warning: Cannot harvest plot at (${bot.x}, ${bot.y}). Crop is not mature.`);
      }
      return res;
    },
    fertilize: async () => {
      const state = useGameStore.getState();
      const botId = state.activeRobotId;
      const bot = state.robots.find((r) => r.id === botId) || state.robots[0];
      if (!bot) return false;

      useGameStore.getState().setRobotTool(botId, 'fertilizing', `Fertilizing plot (${bot.x}, ${bot.y})`);
      const delay = options.getStepDelay();
      if (delay > 0) await sleep(Math.max(140, delay * 1.5));

      const res = useGameStore.getState().fertilizeTile(bot.x, bot.y);
      useGameStore.getState().incrementRobotAction();
      useGameStore.getState().setRobotTool(botId, 'idle', 'Hovering - Standby');
      return res;
    },
    clear_weeds: async () => {
      const state = useGameStore.getState();
      const botId = state.activeRobotId;
      const bot = state.robots.find((r) => r.id === botId) || state.robots[0];
      if (!bot) return false;

      useGameStore.getState().setRobotTool(botId, 'clearing', `Clearing weeds at (${bot.x}, ${bot.y})`);
      const delay = options.getStepDelay();
      if (delay > 0) await sleep(Math.max(140, delay * 1.5));

      const res = useGameStore.getState().clearWeeds(bot.x, bot.y);
      useGameStore.getState().incrementRobotAction();
      useGameStore.getState().setRobotTool(botId, 'idle', 'Hovering - Standby');
      return res;
    },
    recharge: async () => {
      const state = useGameStore.getState();
      const botId = state.activeRobotId;
      useGameStore.getState().rechargeRobot(botId);
      options.onLog('Drone AeroDrone-01 recharged to 100% solar energy.');
      return true;
    },
  };

  // Helper to create safe tile wrapper that dispatches the autonomous drone
  const wrapTile = (x: number, y: number): TileWrapper => {
    return {
      x,
      y,
      get crop() {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return tile ? tile.crop : null;
      },
      get stage() {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return tile ? tile.stage : 'empty';
      },
      get moisture() {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return tile ? tile.moisture : 0;
      },
      get nutrients() {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return tile ? tile.nutrients : 0;
      },
      get weed_level() {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return tile ? tile.weedLevel : 0;
      },
      plant: async (crop: string) => {
        const cropLower = crop.toLowerCase() as CropId;
        if (!CROPS[cropLower]) {
          options.onLog(`Error: Unknown crop "${crop}". Available: wheat, corn, carrot, tomato, potato`);
          return false;
        }

        // 1. Drone flies to the target tile
        await robot.move_to(x, y);

        // 2. Play planting animation & injector laser
        const botId = useGameStore.getState().activeRobotId;
        useGameStore.getState().setRobotTool(botId, 'planting', `Planting ${crop} at (${x}, ${y})`);

        const delay = options.getStepDelay();
        if (delay > 0) await sleep(Math.max(140, delay * 1.5));

        const res = useGameStore.getState().plantCrop(x, y, cropLower);
        useGameStore.getState().incrementRobotAction();
        useGameStore.getState().setRobotTool(botId, 'idle', 'Hovering - Standby');

        if (!res) {
          options.onLog(`Warning: Failed to plant "${crop}" at (${x}, ${y}). Check seed inventory or tile occupancy.`);
        }
        return res;
      },
      water: async (amount?: number) => {
        // 1. Drone flies to the target tile
        await robot.move_to(x, y);

        // 2. Play watering spray mist animation
        const botId = useGameStore.getState().activeRobotId;
        useGameStore.getState().setRobotTool(botId, 'watering', `Watering plot (${x}, ${y})`);

        const delay = options.getStepDelay();
        if (delay > 0) await sleep(Math.max(140, delay * 1.5));

        const res = useGameStore.getState().waterTile(x, y, amount);
        useGameStore.getState().incrementRobotAction();
        useGameStore.getState().setRobotTool(botId, 'idle', 'Hovering - Standby');
        return res;
      },
      harvest: async () => {
        // 1. Drone flies to the target tile
        await robot.move_to(x, y);

        // 2. Play harvesting tractor beam animation
        const botId = useGameStore.getState().activeRobotId;
        useGameStore.getState().setRobotTool(botId, 'harvesting', `Harvesting crop at (${x}, ${y})`);

        const delay = options.getStepDelay();
        if (delay > 0) await sleep(Math.max(140, delay * 1.5));

        const res = useGameStore.getState().harvestTile(x, y);
        useGameStore.getState().incrementRobotAction();
        useGameStore.getState().setRobotTool(botId, 'idle', 'Hovering - Standby');

        if (!res) {
          options.onLog(`Warning: Cannot harvest tile at (${x}, ${y}). Crop is not mature.`);
        }
        return res;
      },
      fertilize: async () => {
        await robot.move_to(x, y);
        const botId = useGameStore.getState().activeRobotId;
        useGameStore.getState().setRobotTool(botId, 'fertilizing', `Fertilizing plot (${x}, ${y})`);

        const delay = options.getStepDelay();
        if (delay > 0) await sleep(Math.max(140, delay * 1.5));

        const res = useGameStore.getState().fertilizeTile(x, y);
        useGameStore.getState().incrementRobotAction();
        useGameStore.getState().setRobotTool(botId, 'idle', 'Hovering - Standby');
        return res;
      },
      clear_weeds: async () => {
        await robot.move_to(x, y);
        const botId = useGameStore.getState().activeRobotId;
        useGameStore.getState().setRobotTool(botId, 'clearing', `Clearing weeds at (${x}, ${y})`);

        const delay = options.getStepDelay();
        if (delay > 0) await sleep(Math.max(140, delay * 1.5));

        const res = useGameStore.getState().clearWeeds(x, y);
        useGameStore.getState().incrementRobotAction();
        useGameStore.getState().setRobotTool(botId, 'idle', 'Hovering - Standby');
        return res;
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
      needs_fertilizer: () => {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return !tile || tile.nutrients < 30;
      },
      has_weeds: () => {
        const tile = useGameStore.getState().tiles[`${x}_${y}`];
        return !!tile && tile.weedLevel > 20;
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
    get tiles() {
      return farm.get_tiles();
    },
    get money() {
      return useGameStore.getState().money;
    },
    get weather() {
      return useGameStore.getState().weather;
    },
    get day() {
      return useGameStore.getState().day;
    },
    get width() {
      return useGameStore.getState().gridWidth;
    },
    get height() {
      return useGameStore.getState().gridHeight;
    },
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

  const inventory = {
    get items() {
      return { ...useGameStore.getState().inventory };
    },
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
