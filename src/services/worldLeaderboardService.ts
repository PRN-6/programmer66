import { WorldLeaderboardEntry, WorldLeaderboardSort } from '../types/leaderboard';
import { useAuthStore, DevAccount } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { supabase, isSupabaseConfigured } from './supabase';

const BASELINE_CHAMPIONS: Omit<WorldLeaderboardEntry, 'id'>[] = [
  {
    displayName: 'AeroMaster_99',
    username: 'aeromaster',
    countryCode: 'US',
    level: 9,
    xp: 4120,
    money: 8450,
    missionsSolved: 6,
    totalMissions: 6,
    cropsHarvested: 520,
    cropsPlanted: 640,
    farmerTitle: '🏆 Grandmaster Agronomist',
    lastActive: '5m ago',
  },
  {
    displayName: 'CyberPlanter',
    username: 'cyber_planter',
    countryCode: 'DE',
    level: 8,
    xp: 3680,
    money: 6920,
    missionsSolved: 6,
    totalMissions: 6,
    cropsHarvested: 480,
    cropsPlanted: 530,
    farmerTitle: '🏆 Grandmaster Agronomist',
    lastActive: '12m ago',
  },
  {
    displayName: 'NeuralFarmer_X',
    username: 'neural_farmer',
    countryCode: 'IN',
    level: 7,
    xp: 2950,
    money: 5340,
    missionsSolved: 5,
    totalMissions: 6,
    cropsHarvested: 390,
    cropsPlanted: 450,
    farmerTitle: '⚡ Principal Automation Engineer',
    lastActive: '1h ago',
  },
  {
    displayName: 'TokyoHarvester',
    username: 'tokyo_harvester',
    countryCode: 'JP',
    level: 6,
    xp: 2400,
    money: 4150,
    missionsSolved: 5,
    totalMissions: 6,
    cropsHarvested: 310,
    cropsPlanted: 380,
    farmerTitle: '⚡ Principal Automation Engineer',
    lastActive: '3h ago',
  },
  {
    displayName: 'KernelPanic42',
    username: 'kernel_panic',
    countryCode: 'GB',
    level: 5,
    xp: 1850,
    money: 3200,
    missionsSolved: 4,
    totalMissions: 6,
    cropsHarvested: 240,
    cropsPlanted: 290,
    farmerTitle: '🌾 Senior Crop Architect',
    lastActive: '6h ago',
  },
  {
    displayName: 'HexGrower',
    username: 'hexgrower',
    countryCode: 'CA',
    level: 4,
    xp: 1320,
    money: 2100,
    missionsSolved: 3,
    totalMissions: 6,
    cropsHarvested: 180,
    cropsPlanted: 210,
    farmerTitle: '🚜 Drone Fleet Operator',
    lastActive: '14h ago',
  },
  {
    displayName: 'ByteSprout',
    username: 'bytesprout',
    countryCode: 'FR',
    level: 3,
    xp: 850,
    money: 1450,
    missionsSolved: 2,
    totalMissions: 6,
    cropsHarvested: 110,
    cropsPlanted: 140,
    farmerTitle: '🌱 Apprentice Agronomist',
    lastActive: '1d ago',
  },
  {
    displayName: 'FarmBot_Alpha',
    username: 'farmbot_alpha',
    countryCode: 'KR',
    level: 2,
    xp: 450,
    money: 820,
    missionsSolved: 1,
    totalMissions: 6,
    cropsHarvested: 65,
    cropsPlanted: 90,
    farmerTitle: '🌱 Novice Farmer',
    lastActive: '2d ago',
  },
];

export function getFarmerTitle(missionsSolved: number): string {
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
    totalMissions: gameState.missions.length || 6,
    cropsHarvested: gameState.stats.totalHarvested,
    cropsPlanted: gameState.stats.totalPlanted,
    farmerTitle: getFarmerTitle(solvedCount),
    countryCode: 'GLOBAL',
    lastActive: 'Active Now',
  };

  const entriesMap = new Map<string, WorldLeaderboardEntry>();

  // Add baseline international champions
  BASELINE_CHAMPIONS.forEach((champ, index) => {
    const id = `champ-${index + 1}`;
    entriesMap.set(id, { ...champ, id });
  });

  // 2. Fetch other local development accounts if in localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('programmer66_dev_accounts');
      if (raw) {
        const localAccounts: DevAccount[] = JSON.parse(raw);
        localAccounts.forEach((acc) => {
          if (acc.id !== currentUserId) {
            entriesMap.set(acc.id, {
              id: acc.id,
              displayName: acc.displayName || acc.username,
              username: acc.username,
              isCurrentUser: false,
              level: Math.floor(Math.random() * 3) + 2,
              xp: 650,
              money: 980,
              missionsSolved: Math.floor(Math.random() * 3) + 1,
              totalMissions: 6,
              cropsHarvested: 80,
              cropsPlanted: 100,
              farmerTitle: getFarmerTitle(2),
              countryCode: 'DEV',
              lastActive: 'Recent',
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
        .limit(30);

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
            totalMissions: 6,
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
