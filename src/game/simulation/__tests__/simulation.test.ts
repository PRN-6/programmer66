import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../../store/useGameStore';
import { CROPS } from '../cropConfig';
import { createGameAPI } from '../../../scripting/api';
import { Lexer } from '../../../scripting/lexer';
import { Parser } from '../../../scripting/parser';
import { Interpreter } from '../../../scripting/interpreter';

describe('FARMING 68 Simulation & Game Mechanics', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('plants crop and updates soil state and inventory', () => {
    const store = useGameStore.getState();
    const initialWheatSeeds = store.inventory['wheat_seed'];
    expect(initialWheatSeeds).toBeGreaterThan(0);

    const planted = store.plantCrop(0, 0, 'wheat');
    expect(planted).toBe(true);

    const afterState = useGameStore.getState();
    expect(afterState.inventory['wheat_seed']).toBe(initialWheatSeeds - 1);
    expect(afterState.tiles['0_0'].crop).toBe('wheat');
    expect(afterState.tiles['0_0'].stage).toBe('seedling');
  });

  it('prevents planting on already occupied soil', () => {
    const store = useGameStore.getState();
    expect(store.plantCrop(0, 0, 'wheat')).toBe(true);
    expect(store.plantCrop(0, 0, 'corn')).toBe(false);
  });

  it('waters soil and increases moisture level up to 100', () => {
    const store = useGameStore.getState();
    const tile = store.tiles['1_1'];
    expect(tile).toBeDefined();

    store.waterTile(1, 1, 60);
    const updatedTile = useGameStore.getState().tiles['1_1'];
    expect(updatedTile.moisture).toBeGreaterThanOrEqual(tile.moisture);
    expect(updatedTile.moisture).toBeLessThanOrEqual(100);
  });

  it('advances crop growth during simulation tick when soil is hydrated', () => {
    const store = useGameStore.getState();
    store.plantCrop(2, 2, 'wheat');
    store.waterTile(2, 2, 100);

    // Run tick with 20 seconds of delta
    store.tick(20);

    const afterTile = useGameStore.getState().tiles['2_2'];
    expect(afterTile.growthProgress).toBeGreaterThan(0.5);
  });

  it('allows harvesting only when crop is mature and awards produce and xp', () => {
    const store = useGameStore.getState();
    store.plantCrop(3, 3, 'wheat');

    // Not mature yet
    expect(store.harvestTile(3, 3)).toBe(false);

    // Fast-forward growth to mature
    useGameStore.setState((prev) => ({
      tiles: {
        ...prev.tiles,
        '3_3': {
          ...prev.tiles['3_3'],
          stage: 'mature',
          growthProgress: 1.0,
        },
      },
    }));

    const initialWheatProduce = useGameStore.getState().inventory['wheat'] || 0;
    const initialMoney = useGameStore.getState().money;

    const harvested = useGameStore.getState().harvestTile(3, 3);
    expect(harvested).toBe(true);

    const stateAfterHarvest = useGameStore.getState();
    expect(stateAfterHarvest.inventory['wheat']).toBe(initialWheatProduce + 1);
    expect(stateAfterHarvest.tiles['3_3'].crop).toBeNull();
    expect(stateAfterHarvest.tiles['3_3'].stage).toBe('empty');

    // Selling harvested crop
    const sold = stateAfterHarvest.sellItem('wheat', 1, CROPS.wheat.sellPrice);
    expect(sold).toBe(true);
    expect(useGameStore.getState().money).toBe(initialMoney + CROPS.wheat.sellPrice);
  });

  it('executes end-to-end Python script that plants, waters, and inspects tiles', async () => {
    const logs: string[] = [];
    const api = createGameAPI({
      getStepDelay: () => 0,
      isCancelled: () => false,
      onLog: (msg) => logs.push(msg),
    });

    const script = `
# Automate planting and watering on plot 0, 0
tile = farm.get_tile(0, 0)
if tile.is_empty():
    tile.plant("corn")

if tile.needs_water():
    tile.water()

print("Tile crop is:", tile.get_crop())
`;

    const lexer = new Lexer(script);
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parse();

    const interpreter = new Interpreter({
      stepDelayMs: 0,
      onPrint: (msg) => logs.push(msg),
    });

    const env = interpreter.getGlobalEnv();
    env.define('farm', api.farm);
    env.define('robot', api.robot);
    env.define('inventory', api.inventory);

    await interpreter.run(ast);

    const tile = useGameStore.getState().tiles['0_0'];
    expect(tile.crop).toBe('corn');
    expect(logs.some((l) => l.includes('Tile crop is: corn'))).toBe(true);
  });

  it('robot navigates across coordinates correctly', async () => {
    const api = createGameAPI({
      getStepDelay: () => 0,
      isCancelled: () => false,
      onLog: () => {},
    });

    await api.robot.move_to(3, 2);

    const bot = useGameStore.getState().robots[0];
    expect(bot.x).toBe(3);
    expect(bot.y).toBe(2);
  });
});

