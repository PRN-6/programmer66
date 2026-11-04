export type RoomStatus = 'waiting' | 'active' | 'paused' | 'completed';

export interface RoomSettings {
  maxTeams: number;
  maxTeamSize: number;
  allowDroneAssistance: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export type ChallengeCriterion =
  | 'harvest_count'
  | 'planted_count'
  | 'water_efficiency'
  | 'speed_run';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  level: number;
  points: number;
  targetCrop?: string;
  targetCount: number;
  timeLimitSeconds: number;
  testCriterion: ChallengeCriterion;
  starterCode: string;
  solutionHint?: string;
}

export interface Team {
  id: string;
  roomId: string;
  name: string;
  members: string[];
  score: number;
  completedChallenges: string[];
  status: 'active' | 'idle' | 'disqualified';
  joinedAt: string;
  lastSubmissionTime?: string;
  submittedCode?: string;
}

export interface Submission {
  id: string;
  roomId: string;
  teamId: string;
  teamName: string;
  challengeId: string;
  code: string;
  pointsAwarded: number;
  status: 'passed' | 'failed' | 'pending';
  submittedAt: string;
  feedback: string;
}

export interface Room {
  id: string;
  code: string; // e.g. "PROG-8492"
  title: string;
  status: RoomStatus;
  createdAt: string;
  startedAt?: string;
  durationMinutes: number;
  remainingSeconds: number;
  activeChallengeId?: string;
  settings: RoomSettings;
  challenges: Challenge[];
  adminPasscode?: string;
}
