import { describe, it, expect, beforeEach } from 'vitest';
import { fetchWorldLeaderboard, getFarmerTitle } from '../worldLeaderboardService';
import { useGameStore } from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';

describe('World Leaderboard Service', () => {
  beforeEach(() => {
    // Reset stores to predictable baseline
    useGameStore.setState({
      money: 1000,
      level: 3,
      xp: 200,
      stats: {
        totalHarvested: 50,
        totalPlanted: 60,
        totalWatered: 30,
        moneyEarned: 1000,
        scriptsRun: 5,
        tilesUnlocked: 10,
      },
    });

    useAuthStore.setState({
      user: null,
      profile: null,
    });
  });

  describe('getFarmerTitle', () => {
    it('returns appropriate title based on missions completed', () => {
      expect(getFarmerTitle(0)).toBe('🌱 Novice Farmer');
      expect(getFarmerTitle(1)).toBe('🌱 Novice Farmer');
      expect(getFarmerTitle(2)).toBe('🌱 Apprentice Agronomist');
      expect(getFarmerTitle(3)).toBe('🚜 Drone Fleet Operator');
      expect(getFarmerTitle(4)).toBe('🌾 Senior Crop Architect');
      expect(getFarmerTitle(5)).toBe('⚡ Principal Automation Engineer');
      expect(getFarmerTitle(6)).toBe('🏆 Grandmaster Agronomist');
      expect(getFarmerTitle(10)).toBe('🏆 Grandmaster Agronomist');
    });
  });

  describe('fetchWorldLeaderboard', () => {
    it('returns entries sorted by missions solved by default with dynamic ranks', async () => {
      const entries = await fetchWorldLeaderboard('missions');

      expect(entries.length).toBeGreaterThanOrEqual(8);
      // Ranks should be 1-indexed sequential
      for (let i = 0; i < entries.length; i++) {
        expect(entries[i].rank).toBe(i + 1);
      }

      // Check mission sort order
      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i].missionsSolved).toBeGreaterThanOrEqual(entries[i + 1].missionsSolved);
      }

      // Must include current user
      const currentUser = entries.find((e) => e.isCurrentUser);
      expect(currentUser).toBeDefined();
      expect(currentUser?.money).toBe(1000);
      expect(currentUser?.level).toBe(3);
    });

    it('correctly sorts by level & xp when requested', async () => {
      const entries = await fetchWorldLeaderboard('level');

      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i].level).toBeGreaterThanOrEqual(entries[i + 1].level);
      }
    });

    it('correctly sorts by treasury money when requested', async () => {
      const entries = await fetchWorldLeaderboard('money');

      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i].money).toBeGreaterThanOrEqual(entries[i + 1].money);
      }
    });

    it('correctly sorts by crops harvested when requested', async () => {
      const entries = await fetchWorldLeaderboard('harvested');

      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i].cropsHarvested).toBeGreaterThanOrEqual(entries[i + 1].cropsHarvested);
      }
    });

    it('dynamically adapts rank when player completes all missions and earns wealth', async () => {
      // Elevate current player to top stats
      const missions = useGameStore.getState().missions.map((m) => ({
        ...m,
        completed: true,
        rewardClaimed: true,
      }));

      useGameStore.setState({
        money: 999999,
        level: 50,
        xp: 100000,
        missions,
      });

      const entries = await fetchWorldLeaderboard('missions');
      const currentUser = entries.find((e) => e.isCurrentUser);

      expect(currentUser).toBeDefined();
      expect(currentUser?.missionsSolved).toBe(6);
      expect(currentUser?.rank).toBe(1); // Should now be #1 worldwide
      expect(currentUser?.farmerTitle).toBe('🏆 Grandmaster Agronomist');
    });
  });
});
