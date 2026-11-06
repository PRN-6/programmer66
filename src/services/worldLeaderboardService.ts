import { WorldLeaderboardEntry, WorldLeaderboardSort } from '../types/leaderboard';
import { useAuthStore, DevAccount } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { INITIAL_MISSIONS } from '../game/simulation/missionConfig';
import { supabase, isSupabaseConfigured } from './supabase';

export function getFarmerTitle(missionsSolved: number): string {
  if (missionsSolved >= 12) return '🌟 Singularity Grandmaster';
  if (missionsSolved >= 10) return '🏆 Grandmaster Agronomist';
  if (missionsSolved >= 8) return '🏆 Grandmaster Agronomist';
  if (missionsSolved >= 6) return '🏆 Grandmaster Agronomist';
  if (missionsSolved >= 5) return '⚡ Principal Automation Engineer';
  if (missionsSolved >= 4) return '🌾 Senior Crop Architect';
  if (missionsSolved >= 3) return '🚜 Drone Fleet Operator';
  if (missionsSolved >= 2) return '🌱 Apprentice Agronomist';
  return '🌱 Novice Farmer';
}

export async function fetchWorldLeaderboard(
  sortBy: WorldLeaderboardSort = 'missions'
): Promise<WorldLeaderboardEntry[]> {
  const gameState = useGameStore.getState();
  const authState = useAuthStore.getState();
  const user = authState.user;
  const profile = authState.profile;

  const totalMissionsCount = gameState.missions.length || INITIAL_MISSIONS.length;

  // 1. Calculate live current user stats
  const solvedCount = gameState.missions.filter(
    (m) => m.completed || Boolean(m.rewardClaimed) || m.objectives.every((o) => o.completed)
  ).length;

  const currentUserId = user?.id || 'local-guest-player';
  const currentDisplayName =
    profile?.displayName ||
    user?.user_metadata?.display_name ||
    (user?.email ? user.email.split('@')[0] : 'You (Current Player)');

  const currentUserEntry: WorldLeaderboardEntry = {
    id: currentUserId,
    displayName: currentDisplayName,
    username: user?.user_metadata?.username || currentDisplayName.toLowerCase().replace(/\s+/g, '_'),
    isCurrentUser: true,
    level: gameState.level,
    xp: gameState.xp,
    money: gameState.money,
    missionsSolved: solvedCount,
    totalMissions: totalMissionsCount,
    cropsHarvested: gameState.stats.totalHarvested,
    cropsPlanted: gameState.stats.totalPlanted,
    farmerTitle: getFarmerTitle(solvedCount),
    countryCode: 'PLAYER',
    lastActive: 'Active Now',
  };

  const entriesMap = new Map<string, WorldLeaderboardEntry>();

  // 2. Fetch other real local accounts created on this client
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('programmer66_dev_accounts');
      if (raw) {
        const localAccounts: DevAccount[] = JSON.parse(raw);
        localAccounts.forEach((acc) => {
          if (acc.id !== currentUserId) {
            // Check if account has an actual save file
            let accLevel = 1;
            let accXp = 0;
            let accMoney = 120;
            let accSolved = 0;
            let accHarvested = 0;
            let accPlanted = 0;
            let lastActive = 'Registered';

            const savedRaw = localStorage.getItem(`programmer66_save_${acc.id}`);
            if (savedRaw) {
              try {
                const parsedSave = JSON.parse(savedRaw);
                accLevel = parsedSave.level || 1;
                accXp = parsedSave.xp || 0;
                accMoney = parsedSave.money || 120;
                if (Array.isArray(parsedSave.missions)) {
                  accSolved = parsedSave.missions.filter(
                    (m: { completed?: boolean; rewardClaimed?: boolean }) =>
                      m.completed || m.rewardClaimed
                  ).length;
                }
                if (parsedSave.stats) {
                  accHarvested = parsedSave.stats.totalHarvested || 0;
                  accPlanted = parsedSave.stats.totalPlanted || 0;
                }
                lastActive = 'Saved locally';
              } catch {
                // ignore
              }
            }

            entriesMap.set(acc.id, {
              id: acc.id,
              displayName: acc.displayName || acc.username,
              username: acc.username,
              isCurrentUser: false,
              level: accLevel,
              xp: accXp,
              money: accMoney,
              missionsSolved: accSolved,
              totalMissions: totalMissionsCount,
              cropsHarvested: accHarvested,
              cropsPlanted: accPlanted,
              farmerTitle: getFarmerTitle(accSolved),
              countryCode: 'DEV',
              lastActive,
            });
          }
        });
      }
    } catch {
      // Ignore
    }
  }

  // 3. Fetch from Supabase cloud if active
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: saves, error } = await supabase
        .from('player_saves')
        .select('user_id, level, xp, money, missions, stats, updated_at')
        .order('level', { ascending: false })
        .limit(50);

      if (!error && saves && saves.length > 0) {
        // Also fetch profile names
        const userIds = saves.map((s) => s.user_id);
        const { data: profiles } = await supabase
          .from('player_profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        const profileMap = new Map((profiles || []).map((p) => [p.id, p.display_name || p.email]));

        saves.forEach((s) => {
          if (s.user_id === currentUserId) return; // Keep live current stats for active user

          const sMissions = Array.isArray(s.missions) ? s.missions : [];
          const mSolved = sMissions.filter(
            (m: { completed?: boolean; rewardClaimed?: boolean }) => m.completed || m.rewardClaimed
          ).length;

          const sStats = s.stats || {};
          const dName = profileMap.get(s.user_id) || `Player_${s.user_id.slice(0, 5)}`;

          entriesMap.set(s.user_id, {
            id: s.user_id,
            displayName: dName,
            username: dName.toLowerCase().replace(/\s+/g, '_'),
            isCurrentUser: false,
            level: s.level || 1,
            xp: s.xp || 0,
            money: s.money || 120,
            missionsSolved: mSolved,
            totalMissions: totalMissionsCount,
            cropsHarvested: sStats.totalHarvested || 0,
            cropsPlanted: sStats.totalPlanted || 0,
            farmerTitle: getFarmerTitle(mSolved),
            countryCode: 'ONLINE',
            lastActive: s.updated_at ? new Date(s.updated_at).toLocaleDateString() : 'Active',
          });
        });
      }
    } catch (err) {
      console.warn('Could not query cloud player_saves for leaderboard:', err);
    }
  }

  // Always insert current player
  entriesMap.set(currentUserId, currentUserEntry);

  const allEntries = Array.from(entriesMap.values());

  // 4. Sort according to selected criterion
  allEntries.sort((a, b) => {
    if (sortBy === 'missions') {
      if (b.missionsSolved !== a.missionsSolved) return b.missionsSolved - a.missionsSolved;
      if (b.level !== a.level) return b.level - a.level;
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.money - a.money;
    }
    if (sortBy === 'level') {
      if (b.level !== a.level) return b.level - a.level;
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.missionsSolved - a.missionsSolved;
    }
    if (sortBy === 'money') {
      if (b.money !== a.money) return b.money - a.money;
      return b.missionsSolved - a.missionsSolved;
    }
    if (sortBy === 'harvested') {
      if (b.cropsHarvested !== a.cropsHarvested) return b.cropsHarvested - a.cropsHarvested;
      return b.missionsSolved - a.missionsSolved;
    }
    return 0;
  });

  // Assign ranks
  return allEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
