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
    topic: 'farming',
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

  it('rejects submission if target carrots are not planted (e.g. only 4 planted)', async () => {
    const state = mockGameState(4);
    const code = 'for y in range(3):\n    pass';
    const result = await evaluateChallenge(chal1, state, code);
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
    expect(result.message).toContain('Condition not met');
    expect(result.message).toContain('4/12');
  });

  it('approves submission and awards points when target carrots >= 12', async () => {
    const state = mockGameState(12);
    const code = 'for y in range(3):\n    for x in range(4):\n        fly_to(x, y)\n        plant(x, y, "carrot")';
    const result = await evaluateChallenge(chal1, state, code);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.message).toContain('Verified');
    expect(result.message).toContain('12/12');
  });

  it('rejects trivial or empty code submissions', async () => {
    const state = mockGameState(12);
    const result = await evaluateChallenge(chal1, state, '   ');
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
  });

  it('ensures DEFAULT_CHALLENGES contains 22 categorized challenges across Easy, Medium, and Hard tiers', () => {
    expect(DEFAULT_CHALLENGES.length).toBe(22);
    const easy = DEFAULT_CHALLENGES.filter((c) => c.difficulty === 'easy');
    const medium = DEFAULT_CHALLENGES.filter((c) => c.difficulty === 'medium');
    const hard = DEFAULT_CHALLENGES.filter((c) => c.difficulty === 'hard');
    const leetcode = DEFAULT_CHALLENGES.filter((c) => c.topic === 'leetcode');
    const farming = DEFAULT_CHALLENGES.filter((c) => c.topic !== 'leetcode');

    expect(easy.length).toBe(7);
    expect(medium.length).toBe(8);
    expect(hard.length).toBe(7);
    expect(leetcode.length).toBe(10);
    expect(farming.length).toBe(12);

    for (const chal of DEFAULT_CHALLENGES) {
      expect(chal.points).toBeGreaterThan(0);
      expect(chal.targetCount).toBeGreaterThan(0);
      expect(chal.timeLimitSeconds).toBeGreaterThan(0);
      expect(chal.starterCode.length).toBeGreaterThan(10);
      expect(chal.starterCode).toContain('# TODO');
    }
  });

  it('evaluates Medium level harvest_count correctly', async () => {
    const harvestChal = DEFAULT_CHALLENGES.find((c) => c.id === 'chal-9')!;
    expect(harvestChal).toBeDefined();

    const stateWithHarvest = {
      tiles: {},
      stats: { totalPlanted: 10, totalHarvested: 8 },
      inventory: { carrot: 8 },
    } as unknown as GameState;

    const validCode = 'for y in range(3):\n    for x in range(3):\n        harvest(x, y)';
    const result = await evaluateChallenge(harvestChal, stateWithHarvest, validCode);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(harvestChal.points);
  });

  it('evaluates Hard level speed_run criteria correctly', async () => {
    const speedChal = DEFAULT_CHALLENGES.find((c) => c.id === 'chal-18')!;
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
    const result = await evaluateChallenge(speedChal, state, code);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(speedChal.points);
  });

  it('evaluates LeetCode Two Sum (chal-5) with passing and failing solutions', async () => {
    const twoSumChal = DEFAULT_CHALLENGES.find((c) => c.id === 'chal-5')!;
    expect(twoSumChal).toBeDefined();
    expect(twoSumChal.testCriterion).toBe('leetcode_test');

    const emptyState = { tiles: {}, stats: {} } as unknown as GameState;

    // 1. Correct two_sum solution using dictionary
    const correctCode = `
def two_sum(nums, target):
    seen = {}
    for i in range(len(nums)):
        diff = target - nums[i]
        if diff in seen:
            return [seen[diff], i]
        seen[nums[i]] = i
    return []
`;
    const passResult = await evaluateChallenge(twoSumChal, emptyState, correctCode);
    expect(passResult.passed).toBe(true);
    expect(passResult.score).toBe(twoSumChal.points);
    expect(passResult.message).toContain('All 4 LeetCode test cases passed');

    // 2. Incorrect two_sum solution
    const wrongCode = `
def two_sum(nums, target):
    return [0, 0]
`;
    const failResult = await evaluateChallenge(twoSumChal, emptyState, wrongCode);
    expect(failResult.passed).toBe(false);
    expect(failResult.score).toBe(0);
    expect(failResult.message).toContain('Failed');

    // 3. Solution missing target function name
    const missingFuncCode = `
def helper(x):
    return x
`;
    const noFuncResult = await evaluateChallenge(twoSumChal, emptyState, missingFuncCode);
    expect(noFuncResult.passed).toBe(false);
    expect(noFuncResult.message).toContain("name 'two_sum' is not defined");
  });

  it('evaluates LeetCode Palindrome (chal-6) using string slicing', async () => {
    const palChal = DEFAULT_CHALLENGES.find((c) => c.id === 'chal-6')!;
    expect(palChal).toBeDefined();

    const emptyState = { tiles: {}, stats: {} } as unknown as GameState;
    const palCode = `
def is_palindrome(x):
    if x < 0:
        return False
    s = str(x)
    return s == s[::-1]
`;
    const result = await evaluateChallenge(palChal, emptyState, palCode);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(palChal.points);
  });
});
