import { create } from 'zustand';
import { Room, Team, Submission, Challenge, RoomSettings } from '../types/competition';
import { CompetitionService } from '../services/competitionService';

interface CompetitionState {
  currentRoom: Room | null;
  currentTeam: Team | null;
  teams: Team[];
  submissions: Submission[];
  activeChallenge: Challenge | null;
  isAdmin: boolean;
  showAdminModal: boolean;
  showJoinModal: boolean;
  showScoreboardModal: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setShowAdminModal: (show: boolean) => void;
  setShowJoinModal: (show: boolean) => void;
  setShowScoreboardModal: (show: boolean) => void;
  setError: (err: string | null) => void;

  createRoom: (
    title: string,
    durationMinutes?: number,
    settings?: Partial<RoomSettings>,
    customChallenges?: Challenge[]
  ) => Promise<Room>;
  joinRoom: (code: string, teamName: string, members: string[]) => Promise<void>;
  leaveRoom: () => void;
  refreshRoomData: () => Promise<void>;
  startCompetition: () => Promise<void>;
  pauseCompetition: () => Promise<void>;
  endCompetition: () => Promise<void>;
  setActiveChallenge: (challengeId: string) => Promise<void>;
  updateRoomSettings: (settings: Partial<RoomSettings>) => Promise<void>;
  addCustomChallenge: (challenge: Challenge) => Promise<void>;
  deleteChallenge: (challengeId: string) => Promise<void>;
  kickTeam: (teamId: string) => Promise<void>;
  submitChallengeSolution: (
    code: string,
    passed: boolean,
    feedback: string
  ) => Promise<void>;
}

export const useCompetitionStore = create<CompetitionState>((set, get) => ({
  currentRoom: null,
  currentTeam: null,
  teams: [],
  submissions: [],
  activeChallenge: null,
  isAdmin: false,
  showAdminModal: false,
  showJoinModal: false,
  showScoreboardModal: false,
  isLoading: false,
  error: null,

  setShowAdminModal: (show) => set({ showAdminModal: show }),
  setShowJoinModal: (show) => set({ showJoinModal: show }),
  setShowScoreboardModal: (show) => set({ showScoreboardModal: show }),
  setError: (err) => set({ error: err }),

  createRoom: async (title, durationMinutes = 30, settings, customChallenges) => {
    set({ isLoading: true, error: null });
    try {
      const room = await CompetitionService.createRoom(title, durationMinutes, settings, customChallenges);
      const teams = await CompetitionService.getTeams(room.id);
      const submissions = await CompetitionService.getSubmissions(room.id);
      const activeChallenge = room.challenges.find((c) => c.id === room.activeChallengeId) || room.challenges[0] || null;

      set({
        currentRoom: room,
        isAdmin: true,
        teams,
        submissions,
        activeChallenge,
        isLoading: false,
      });

      return room;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create room';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  joinRoom: async (code, teamName, members) => {
    set({ isLoading: true, error: null });
    try {
      const { room, team } = await CompetitionService.joinRoom(code, teamName, members);
      const teams = await CompetitionService.getTeams(room.id);
      const submissions = await CompetitionService.getSubmissions(room.id);
      const activeChallenge = room.challenges.find((c) => c.id === room.activeChallengeId) || room.challenges[0] || null;

      set({
        currentRoom: room,
        currentTeam: team,
        teams,
        submissions,
        activeChallenge,
        isAdmin: false,
        isLoading: false,
        showJoinModal: false,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join room';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  leaveRoom: () => {
    set({
      currentRoom: null,
      currentTeam: null,
      teams: [],
      submissions: [],
      activeChallenge: null,
      isAdmin: false,
    });
  },

  refreshRoomData: async () => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    try {
      const updatedRoom = await CompetitionService.getRoomByCode(currentRoom.code);
      if (updatedRoom) {
        const teams = await CompetitionService.getTeams(updatedRoom.id);
        const submissions = await CompetitionService.getSubmissions(updatedRoom.id);
        const activeChallenge =
          updatedRoom.challenges.find((c) => c.id === updatedRoom.activeChallengeId) ||
          updatedRoom.challenges[0] ||
          null;

        set({
          currentRoom: updatedRoom,
          teams,
          submissions,
          activeChallenge,
        });
      }
    } catch (err) {
      console.warn('refreshRoomData error:', err);
    }
  },

  startCompetition: async () => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    await CompetitionService.updateRoom(currentRoom.id, {
      status: 'active',
      startedAt: new Date().toISOString(),
    });
    await get().refreshRoomData();
  },

  pauseCompetition: async () => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    await CompetitionService.updateRoom(currentRoom.id, {
      status: 'paused',
    });
    await get().refreshRoomData();
  },

  endCompetition: async () => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    await CompetitionService.updateRoom(currentRoom.id, {
      status: 'completed',
    });
    await get().refreshRoomData();
  },

  setActiveChallenge: async (challengeId: string) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    await CompetitionService.updateRoom(currentRoom.id, {
      activeChallengeId: challengeId,
    });
    await get().refreshRoomData();
  },

  updateRoomSettings: async (settings: Partial<RoomSettings>) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    const mergedSettings = { ...currentRoom.settings, ...settings };
    await CompetitionService.updateRoom(currentRoom.id, {
      settings: mergedSettings,
    });
    await get().refreshRoomData();
  },

  addCustomChallenge: async (challenge: Challenge) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    const updatedChallenges = [...currentRoom.challenges, challenge];
    await CompetitionService.updateRoom(currentRoom.id, {
      challenges: updatedChallenges,
    });
    await get().refreshRoomData();
  },

  deleteChallenge: async (challengeId: string) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    const updatedChallenges = currentRoom.challenges.filter((c) => c.id !== challengeId);
    await CompetitionService.updateRoom(currentRoom.id, {
      challenges: updatedChallenges,
    });
    await get().refreshRoomData();
  },

  kickTeam: async (teamId: string) => {
    const { currentRoom, teams } = get();
    if (!currentRoom) return;

    // Set team status to disqualified
    const updated = teams.map((t) => (t.id === teamId ? { ...t, status: 'disqualified' as const } : t));
    set({ teams: updated });
    // In local or remote service, update the team status
  },

  submitChallengeSolution: async (code: string, passed: boolean, feedback: string) => {
    const { currentRoom, currentTeam, activeChallenge } = get();
    if (!currentRoom || !currentTeam || !activeChallenge) return;

    await CompetitionService.submitSolution(
      currentRoom.id,
      currentTeam.id,
      currentTeam.name,
      activeChallenge.id,
      code,
      activeChallenge.points,
      passed,
      feedback
    );

    await get().refreshRoomData();
  },
}));
