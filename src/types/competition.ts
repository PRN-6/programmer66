import { FieldConfig } from './field';

export type RoomStatus = 'waiting' | 'active' | 'paused' | 'completed';

export interface RoomSettings {
  maxTeams: number;
  maxTeamSize: number;
  allowDroneAssistance: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  fieldConfig?: FieldConfig;
}

export type ChallengeCriterion =
  | 'harvest_count'
  | 'planted_count'
  | 'water_efficiency'
  | 'speed_run'
  | 'leetcode_test'
  | 'pattern_match';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeTopic = 'farming' | 'leetcode' | 'optimization';

export interface LeetCodeTestCase {
  input: unknown[];
  expected: unknown;
  description?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  level: number;
  difficulty?: ChallengeDifficulty;
  topic?: ChallengeTopic;
  points: number;
  targetCrop?: string;
  targetCount: number;
  timeLimitSeconds: number;
  testCriterion: ChallengeCriterion;
  functionName?: string;
  testCases?: LeetCodeTestCase[];
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
  status: 'active' | 'idle' | 'disqualified' | 'kicked';
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
  fieldConfig?: FieldConfig;
}

