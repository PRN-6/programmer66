export interface WorldLeaderboardEntry {
  id: string;
  rank?: number;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  isCurrentUser?: boolean;
  level: number;
  xp: number;
  money: number;
  missionsSolved: number;
  totalMissions: number;
  cropsHarvested: number;
  cropsPlanted: number;
  farmerTitle: string;
  countryCode: string;
  lastActive: string;
}

export type WorldLeaderboardSort = 'missions' | 'level' | 'money' | 'harvested';
