import { describe, it, expect } from 'vitest';
import { evaluateChallenge } from '../challengeEvaluator';
import { DEFAULT_CHALLENGES } from '../defaultChallenges';
import { Challenge } from '../../types/competition';
import { GameState } from '../../store/useGameStore';

describe('Challenge Evaluator Verification Logic', () => {
  const chal1: Challenge = {
    id: 'chal-1',
    level: 1,
    difficulty: 'easy',
    title: 'Level 1: Automated Seed Sower',
    description: 'Use a loop to fly the drone across the farm and plant at least 12 Carrot seeds.',
    points: 100,
    targetCrop: 'carrot',
    targetCount: 12,
    timeLimitSeconds: 120,
    testCriterion: 'planted_count',
    starterCode: '# starter',
  };

  const mockGameState = (carrotCount: number): GameState => {
    const tiles: Record<string, any> = {};
    for (let i = 0; i < 36; i++) {
      const x = i % 6;
      const y = Math.floor(i / 6);
      tiles[`${x}_${y}`] = {
        x,
        y,
        crop: i < carrotCount ? 'carrot' : null,
        moisture: 50,
        nutrients: 50,
        weedLevel: 0,
      };
    }
    return {
      tiles,
      stats: { totalPlanted: carrotCount, totalHarvested: 0 },
      inventory: {},
    } as unknown as GameState;
  };

  it('rejects submission if target carrots are not planted (e.g. only 4 planted)', () => {
    const state = mockGameState(4);
    const code = 'for y in range(3):\n    pass';
    const result = evaluateChallenge(chal1, state, code);
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
    expect(result.message).toContain('Condition not met');
    expect(result.message).toContain('4/12');
  });

  it('approves submission and awards points when target carrots >= 12', () => {
    const state = mockGameState(12);
    const code = 'for y in range(3):\n    for x in range(4):\n        fly_to(x, y)\n        plant(x, y, "carrot")';
    const result = evaluateChallenge(chal1, state, code);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.message).toContain('Verified');
    expect(result.message).toContain('12/12');
  });

  it('rejects trivial or empty code submissions', () => {
    const state = mockGameState(12);
    const result = evaluateChallenge(chal1, state, '   ');
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
  });

  it('ensures DEFAULT_CHALLENGES contains 12 categorized challenges across Easy, Medium, and Hard tiers', () => {
    expect(DEFAULT_CHALLENGES.length).toBe(12);
    const easy = DEFAULT_CHALLENGES.filter((c) => c.difficulty === 'easy');
    const medium = DEFAULT_CHALLENGES.filter((c) => c.difficulty === 'medium');
    const hard = DEFAULT_CHALLENGES.filter((c) => c.difficulty === 'hard');

    expect(easy.length).toBe(4);
    expect(medium.length).toBe(4);
    expect(hard.length).toBe(4);

    for (const chal of DEFAULT_CHALLENGES) {
      expect(chal.points).toBeGreaterThan(0);
      expect(chal.targetCount).toBeGreaterThan(0);
      expect(chal.timeLimitSeconds).toBeGreaterThan(0);
      expect(chal.starterCode.length).toBeGreaterThan(10);
      expect(chal.starterCode).toContain('# TODO');
    }
  });

  it('evaluates Medium level harvest_count correctly', () => {
    const harvestChal = DEFAULT_CHALLENGES.find((c) => c.id === 'chal-6')!;
    expect(harvestChal).toBeDefined();

    const stateWithHarvest = {
      tiles: {},
      stats: { totalPlanted: 10, totalHarvested: 8 },
      inventory: { carrot: 8 },
    } as unknown as GameState;

    const validCode = 'for y in range(3):\n    for x in range(3):\n        harvest(x, y)';
    const result = evaluateChallenge(harvestChal, stateWithHarvest, validCode);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(harvestChal.points);
  });

  it('evaluates Hard level speed_run criteria correctly', () => {
    const speedChal = DEFAULT_CHALLENGES.find((c) => c.id === 'chal-11')!;
    expect(speedChal).toBeDefined();

    const tiles: Record<string, any> = {};
    for (let i = 0; i < 15; i++) {
      tiles[`${i % 6}_${Math.floor(i / 6)}`] = { crop: 'wheat' };
    }
    const state = {
      tiles,
      stats: { totalHarvested: 5 },
      inventory: {},
    } as unknown as GameState;

    const code = 'for i in range(20):\n    fly_to(i, 0)\n    plant(i, 0, "wheat")';
    const result = evaluateChallenge(speedChal, state, code);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(speedChal.points);
  });
});


