import { create } from 'zustand';
import { Room, Team, Submission, Challenge, RoomSettings } from '../types/competition';
import { CompetitionService } from '../services/competitionService';

const SESSION_KEY = 'programmer66_competition_session';

interface SavedSession {
  roomCode: string;
  teamId?: string;
  isAdmin: boolean;
}

const saveSession = (session: SavedSession | null) => {
  try {
    if (typeof localStorage !== 'undefined') {
      if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  } catch {
    // ignore
  }
};

const getSavedSession = (): SavedSession | null => {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    }
  } catch {
    // ignore
  }
  return null;
};

interface CompetitionState {
  currentRoom: Room | null;
  currentTeam: Team | null;
  teams: Team[];
  submissions: Submission[];
  activeChallenge: Challenge | null;
  recentRooms: Room[];
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

  initSession: () => Promise<void>;
  createRoom: (
    title: string,
    durationMinutes?: number,
    settings?: Partial<RoomSettings>,
    customChallenges?: Challenge[]
  ) => Promise<Room>;
  loadRoomAsAdmin: (code: string) => Promise<Room | null>;
  joinRoom: (code: string, teamName: string, members: string[]) => Promise<void>;
  leaveRoom: () => void;
  fetchRecentRooms: () => Promise<void>;
  refreshRoomData: () => Promise<void>;
  startCompetition: () => Promise<void>;
  pauseCompetition: () => Promise<void>;
  endCompetition: () => Promise<void>;
  closeRoom: () => Promise<void>;
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
  recentRooms: [],
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

  initSession: async () => {
    // 1. Check URL query param ?room=CODE
    let targetCode: string | null = null;
    let isExplicitAdmin = false;
    let savedTeamId: string | undefined;

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('room');
      if (urlCode) {
        targetCode = urlCode.toUpperCase();
      }
    }

    // 2. Check localStorage session
    if (!targetCode) {
      const saved = getSavedSession();
      if (saved?.roomCode) {
        targetCode = saved.roomCode;
        isExplicitAdmin = saved.isAdmin;
        savedTeamId = saved.teamId;
      }
    }

    if (!targetCode) return;

    try {
      const room = await CompetitionService.getRoomByCode(targetCode);
      if (room) {
        const teams = await CompetitionService.getTeams(room.id);
        const submissions = await CompetitionService.getSubmissions(room.id);
        const activeChallenge =
          room.challenges.find((c) => c.id === room.activeChallengeId) ||
          room.challenges[0] ||
          null;

        const currentTeam = savedTeamId ? teams.find((t) => t.id === savedTeamId) || null : null;

        set({
          currentRoom: room,
          isAdmin: isExplicitAdmin,
          currentTeam,
          teams,
          submissions,
          activeChallenge,
        });

        saveSession({
          roomCode: room.code,
          isAdmin: isExplicitAdmin,
          teamId: currentTeam?.id,
        });
      }
    } catch (err) {
      console.warn('initSession error:', err);
    }
  },

  fetchRecentRooms: async () => {
    try {
      const list = await CompetitionService.getRecentRooms();
      set({ recentRooms: list });
    } catch (err) {
      console.warn('fetchRecentRooms error:', err);
    }
  },

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

      saveSession({
        roomCode: room.code,
        isAdmin: true,
      });

      return room;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create room';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  loadRoomAsAdmin: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const room = await CompetitionService.getRoomByCode(code);
      if (!room) {
        throw new Error(`Room with code "${code}" not found.`);
      }

      const teams = await CompetitionService.getTeams(room.id);
      const submissions = await CompetitionService.getSubmissions(room.id);
      const activeChallenge =
        room.challenges.find((c) => c.id === room.activeChallengeId) ||
        room.challenges[0] ||
        null;

      set({
        currentRoom: room,
        isAdmin: true,
        currentTeam: null,
        teams,
        submissions,
        activeChallenge,
        isLoading: false,
      });

      saveSession({
        roomCode: room.code,
        isAdmin: true,
      });

      return room;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load room';
      set({ error: msg, isLoading: false });
      return null;
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

      saveSession({
        roomCode: room.code,
        teamId: team.id,
        isAdmin: false,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join room';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  leaveRoom: () => {
    saveSession(null);
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
    const { currentRoom, currentTeam } = get();
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

        const updatedTeam = currentTeam ? teams.find((t) => t.id === currentTeam.id) || null : null;

        // If room was closed by admin, notify participant and return to main game
        if (updatedRoom.status === 'completed' && !get().isAdmin) {
          saveSession(null);
          set({
            currentRoom: null,
            currentTeam: null,
            teams: [],
            submissions: [],
            activeChallenge: null,
            isAdmin: false,
          });
          alert('Notice: The competition event was closed by the host.');
          return;
        }

        // If participant was kicked by the admin, remove local session & notify
        if (currentTeam && !updatedTeam && !get().isAdmin) {
          saveSession(null);
          set({
            currentRoom: null,
            currentTeam: null,
            teams: [],
            submissions: [],
            activeChallenge: null,
            isAdmin: false,
          });
          alert('Notice: Your team was removed from the event by the host.');
          return;
        }

        set({
          currentRoom: updatedRoom,
          currentTeam: updatedTeam,
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

  closeRoom: async () => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    await CompetitionService.updateRoom(currentRoom.id, {
      status: 'completed',
    });
    saveSession(null);
    set({
      currentRoom: null,
      currentTeam: null,
      teams: [],
      submissions: [],
      activeChallenge: null,
      isAdmin: false,
    });
    await get().fetchRecentRooms();
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
    const { currentRoom } = get();
    if (!currentRoom) return;

    await CompetitionService.kickTeam(currentRoom.id, teamId);
    await get().refreshRoomData();
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
