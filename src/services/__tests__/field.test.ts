import { describe, it, expect } from 'vitest';
import { DEFAULT_FIELD_PRESETS, createBlankField } from '../defaultFields';
import { useGameStore } from '../../store/useGameStore';

describe('Field and Terrain Presets & Simulation Integration', () => {
  it('loads all 9 default field presets with valid dimensions and tiles', () => {
    expect(DEFAULT_FIELD_PRESETS.length).toBe(9);

    for (const preset of DEFAULT_FIELD_PRESETS) {
      expect(preset.width).toBeGreaterThanOrEqual(4);
      expect(preset.height).toBeGreaterThanOrEqual(4);
      expect(preset.name.length).toBeGreaterThan(0);

      const tileKeys = Object.keys(preset.tiles);
      expect(tileKeys.length).toBe(preset.width * preset.height);

      const arableCount = Object.values(preset.tiles).filter((t) => t.unlocked).length;
      expect(arableCount).toBeGreaterThan(0);
    }
  });

  it('generates a blank custom field correctly', () => {
    const blank = createBlankField(5, 5, 'Custom Arena');
    expect(blank.width).toBe(5);
    expect(blank.height).toBe(5);
    expect(blank.name).toBe('Custom Arena');
    expect(Object.keys(blank.tiles).length).toBe(25);
    expect(Object.values(blank.tiles).every((t) => t.unlocked)).toBe(true);
  });

  it('applies field configuration to game store and updates grid dimensions and tiles', () => {
    const dualTerraces = DEFAULT_FIELD_PRESETS.find((p) => p.presetId === 'terraces_dual')!;
    expect(dualTerraces).toBeDefined();

    useGameStore.getState().applyFieldConfig(dualTerraces);

    const state = useGameStore.getState();
    expect(state.gridWidth).toBe(dualTerraces.width);
    expect(state.gridHeight).toBe(dualTerraces.height);
    expect(state.activeFieldConfig?.id).toBe(dualTerraces.id);

    // Verify waterway tiles are locked
    expect(state.tiles['0_2'].unlocked).toBe(false);
    expect(state.tiles['0_3'].unlocked).toBe(false);

    // Verify arable tiles are unlocked
    expect(state.tiles['0_0'].unlocked).toBe(true);
    expect(state.tiles['0_1'].unlocked).toBe(true);

    // Verify resetFarmPlots resets to activeFieldConfig
    useGameStore.getState().resetFarmPlots();
    const stateAfterReset = useGameStore.getState();
    expect(stateAfterReset.tiles['0_2'].unlocked).toBe(false);
    expect(stateAfterReset.tiles['0_0'].unlocked).toBe(true);
  });

  it('resets to default 6x6 when activeFieldConfig is cleared', () => {
    useGameStore.setState({ activeFieldConfig: null });
    useGameStore.getState().resetFarmPlots();

    const state = useGameStore.getState();
    expect(state.gridWidth).toBe(6);
    expect(state.gridHeight).toBe(6);
    expect(Object.keys(state.tiles).length).toBe(36);
    expect(Object.values(state.tiles).every((t) => t.unlocked)).toBe(true);
  });
});
