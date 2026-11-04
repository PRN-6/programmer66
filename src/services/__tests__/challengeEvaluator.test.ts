import { describe, it, expect } from 'vitest';
import { evaluateChallenge } from '../challengeEvaluator';
import { Challenge } from '../../types/competition';
import { GameState } from '../../store/useGameStore';

describe('Challenge Evaluator Verification Logic', () => {
  const chal1: Challenge = {
    id: 'chal-1',
    level: 1,
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
});

