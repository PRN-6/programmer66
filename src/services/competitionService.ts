import { supabase, isSupabaseConfigured } from './supabase';
import { Room, Team, Submission, Challenge, RoomSettings } from '../types/competition';
import { DEFAULT_CHALLENGES } from './defaultChallenges';

const LOCAL_ROOMS_KEY = 'programmer66_rooms';
const LOCAL_TEAMS_KEY = 'programmer66_teams';
const LOCAL_SUBMISSIONS_KEY = 'programmer66_submissions';

// Cross-tab synchronization channel for local/demo multi-device simulation
const broadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('programmer66_competition_channel')
  : null;

// Generate 4-digit code e.g. "PROG-4819"
export const generateRoomCode = (): string => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `PROG-${digits}`;
};

const memoryStore: Record<string, string> = {};

const safeGetStorage = (key: string): string | null => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // Fallback to memoryStore
  }
  return memoryStore[key] || null;
};

const safeSetStorage = (key: string, value: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // Fallback to memoryStore
  }
  memoryStore[key] = value;
};

export class CompetitionService {
  // --- LOCAL REPOSITORY HELPERS ---
  private static getLocalRooms(): Record<string, Room> {
    try {
      const data = safeGetStorage(LOCAL_ROOMS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private static saveLocalRooms(rooms: Record<string, Room>) {
    safeSetStorage(LOCAL_ROOMS_KEY, JSON.stringify(rooms));
    broadcast?.postMessage({ type: 'ROOMS_UPDATED', payload: rooms });
  }

  private static getLocalTeams(): Record<string, Team[]> {
    try {
      const data = safeGetStorage(LOCAL_TEAMS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private static saveLocalTeams(teams: Record<string, Team[]>) {
    safeSetStorage(LOCAL_TEAMS_KEY, JSON.stringify(teams));
    broadcast?.postMessage({ type: 'TEAMS_UPDATED', payload: teams });
  }

  private static getLocalSubmissions(): Record<string, Submission[]> {
    try {
      const data = safeGetStorage(LOCAL_SUBMISSIONS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private static saveLocalSubmissions(submissions: Record<string, Submission[]>) {
    safeSetStorage(LOCAL_SUBMISSIONS_KEY, JSON.stringify(submissions));
    broadcast?.postMessage({ type: 'SUBMISSIONS_UPDATED', payload: submissions });
  }

  // --- ROOM MANAGEMENT ---
  static async createRoom(
    title: string,
    durationMinutes: number = 30,
    settings?: Partial<RoomSettings>,
    customChallenges?: Challenge[]
  ): Promise<Room> {
    const code = generateRoomCode();
    const id = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const challenges = customChallenges && customChallenges.length > 0 ? customChallenges : DEFAULT_CHALLENGES;

    const newRoom: Room = {
      id,
      code,
      title: title.trim() || `Hackathon Championship ${code}`,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      durationMinutes,
      remainingSeconds: durationMinutes * 60,
      activeChallengeId: challenges[0]?.id,
      settings: {
        maxTeams: settings?.maxTeams || 16,
        maxTeamSize: settings?.maxTeamSize || 4,
        allowDroneAssistance: settings?.allowDroneAssistance ?? true,
        difficulty: settings?.difficulty || 'beginner',
      },
      challenges,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .insert({
            id: newRoom.id,
            code: newRoom.code,
            title: newRoom.title,
            status: newRoom.status,
            duration_minutes: newRoom.durationMinutes,
            remaining_seconds: newRoom.remainingSeconds,
            active_challenge_id: newRoom.activeChallengeId,
            settings: newRoom.settings,
            challenges: newRoom.challenges,
          })
          .select()
          .single();

        if (!error && data) return newRoom;
      } catch (err) {
        console.warn('Supabase createRoom fallback to local:', err);
      }
    }

    // Local fallback
    const rooms = this.getLocalRooms();
    rooms[newRoom.id] = newRoom;
    this.saveLocalRooms(rooms);

    return newRoom;
  }

  static async getRoomByCode(code: string): Promise<Room | null> {
    const cleanCode = code.trim().toUpperCase();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', cleanCode)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            code: data.code,
            title: data.title,
            status: data.status,
            createdAt: data.created_at,
            startedAt: data.started_at,
            durationMinutes: data.duration_minutes,
            remainingSeconds: data.remaining_seconds,
            activeChallengeId: data.active_challenge_id,
            settings: data.settings,
            challenges: data.challenges,
          };
        }
      } catch (err) {
        console.warn('Supabase getRoomByCode fallback:', err);
      }
    }

    // Local lookup
    const rooms = this.getLocalRooms();
    const found = Object.values(rooms).find((r) => r.code.toUpperCase() === cleanCode);
    return found || null;
  }

  static async getRecentRooms(): Promise<Room[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            code: d.code,
            title: d.title,
            status: d.status,
            createdAt: d.created_at,
            startedAt: d.started_at,
            durationMinutes: d.duration_minutes,
            remainingSeconds: d.remaining_seconds,
            activeChallengeId: d.active_challenge_id,
            settings: d.settings,
            challenges: d.challenges,
          }));
        }
      } catch (err) {
        console.warn('Supabase getRecentRooms error:', err);
      }
    }

    const rooms = this.getLocalRooms();
    return Object.values(rooms).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async updateRoom(roomId: string, updates: Partial<Room>): Promise<Room | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, unknown> = {};
        if (updates.status) payload.status = updates.status;
        if (updates.startedAt) payload.started_at = updates.startedAt;
        if (updates.remainingSeconds !== undefined) payload.remaining_seconds = updates.remainingSeconds;
        if (updates.activeChallengeId) payload.active_challenge_id = updates.activeChallengeId;
        if (updates.settings) payload.settings = updates.settings;
        if (updates.challenges) payload.challenges = updates.challenges;

        await supabase.from('rooms').update(payload).eq('id', roomId);
      } catch (err) {
        console.warn('Supabase updateRoom error:', err);
      }
    }

    // Local update
    const rooms = this.getLocalRooms();
    if (rooms[roomId]) {
      rooms[roomId] = { ...rooms[roomId], ...updates };
      this.saveLocalRooms(rooms);
      return rooms[roomId];
    }
    return null;
  }

  // --- TEAM MANAGEMENT ---
  static async joinRoom(roomCode: string, teamName: string, members: string[]): Promise<{ room: Room; team: Team }> {
    const room = await this.getRoomByCode(roomCode);
    if (!room) {
      throw new Error(`Room with code "${roomCode}" not found.`);
    }

    const teamId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanMembers = members.filter((m) => m.trim().length > 0);

    const newTeam: Team = {
      id: teamId,
      roomId: room.id,
      name: teamName.trim() || `Team ${teamId.slice(-4).toUpperCase()}`,
      members: cleanMembers.length > 0 ? cleanMembers : ['Player 1'],
      score: 0,
      completedChallenges: [],
      status: 'active',
      joinedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('teams').insert({
          id: newTeam.id,
          room_id: newTeam.roomId,
          name: newTeam.name,
          members: newTeam.members,
          score: newTeam.score,
          completed_challenges: newTeam.completedChallenges,
          status: newTeam.status,
        });
      } catch (err) {
        console.warn('Supabase joinRoom fallback to local:', err);
      }
    }

    const allTeams = this.getLocalTeams();
    const roomTeams = allTeams[room.id] || [];
    roomTeams.push(newTeam);
    allTeams[room.id] = roomTeams;
    this.saveLocalTeams(allTeams);

    return { room, team: newTeam };
  }

  static async getTeams(roomId: string): Promise<Team[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('room_id', roomId)
          .order('score', { ascending: false });

        if (!error && data) {
          return data.map((t) => ({
            id: t.id,
            roomId: t.room_id,
            name: t.name,
            members: t.members,
            score: t.score,
            completedChallenges: t.completed_challenges || [],
            status: t.status,
            joinedAt: t.created_at || new Date().toISOString(),
            lastSubmissionTime: t.last_submission_time,
            submittedCode: t.submitted_code,
          }));
        }
      } catch (err) {
        console.warn('Supabase getTeams error:', err);
      }
    }

    const allTeams = this.getLocalTeams();
    const list = allTeams[roomId] || [];
    return list.sort((a, b) => b.score - a.score);
  }

  static async updateTeamScore(roomId: string, teamId: string, pointsEarned: number, challengeId: string, code?: string) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: currentTeam } = await supabase
          .from('teams')
          .select('score, completed_challenges')
          .eq('id', teamId)
          .single();

        if (currentTeam) {
          const completed = new Set(currentTeam.completed_challenges || []);
          completed.add(challengeId);

          await supabase
            .from('teams')
            .update({
              score: (currentTeam.score || 0) + pointsEarned,
              completed_challenges: Array.from(completed),
              last_submission_time: new Date().toISOString(),
              submitted_code: code,
            })
            .eq('id', teamId);
        }
      } catch (err) {
        console.warn('Supabase updateTeamScore error:', err);
      }
    }

    const allTeams = this.getLocalTeams();
    const list = allTeams[roomId] || [];
    const teamIndex = list.findIndex((t) => t.id === teamId);
    if (teamIndex !== -1) {
      const team = list[teamIndex];
      const completed = new Set(team.completedChallenges);
      completed.add(challengeId);
      list[teamIndex] = {
        ...team,
        score: team.score + pointsEarned,
        completedChallenges: Array.from(completed),
        lastSubmissionTime: new Date().toISOString(),
        submittedCode: code,
      };
      allTeams[roomId] = list;
      this.saveLocalTeams(allTeams);
    }
  }

  // --- SUBMISSIONS & LOGS ---
  static async submitSolution(
    roomId: string,
    teamId: string,
    teamName: string,
    challengeId: string,
    code: string,
    pointsAwarded: number,
    passed: boolean,
    feedback: string
  ): Promise<Submission> {
    const submission: Submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roomId,
      teamId,
      teamName,
      challengeId,
      code,
      pointsAwarded: passed ? pointsAwarded : 0,
      status: passed ? 'passed' : 'failed',
      submittedAt: new Date().toISOString(),
      feedback,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('submissions').insert({
          id: submission.id,
          room_id: submission.roomId,
          team_id: submission.teamId,
          team_name: submission.teamName,
          challenge_id: submission.challengeId,
          code: submission.code,
          points_awarded: submission.pointsAwarded,
          status: submission.status,
          feedback: submission.feedback,
        });
      } catch (err) {
        console.warn('Supabase submitSolution error:', err);
      }
    }

    const allSubs = this.getLocalSubmissions();
    const roomSubs = allSubs[roomId] || [];
    roomSubs.unshift(submission);
    allSubs[roomId] = roomSubs;
    this.saveLocalSubmissions(allSubs);

    if (passed) {
      await this.updateTeamScore(roomId, teamId, pointsAwarded, challengeId, code);
    }

    return submission;
  }

  static async getSubmissions(roomId: string): Promise<Submission[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          return data.map((s) => ({
            id: s.id,
            roomId: s.room_id,
            teamId: s.team_id,
            teamName: s.team_name,
            challengeId: s.challenge_id,
            code: s.code,
            pointsAwarded: s.points_awarded,
            status: s.status,
            submittedAt: s.created_at,
            feedback: s.feedback,
          }));
        }
      } catch (err) {
        console.warn('Supabase getSubmissions error:', err);
      }
    }

    const allSubs = this.getLocalSubmissions();
    return allSubs[roomId] || [];
  }

  // --- REALTIME SUBSCRIPTIONS ---
  static subscribeToRoomChanges(roomId: string, onChange: (event: string) => void): () => void {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(`room_${roomId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, () => {
          onChange('ROOM_UPDATED');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teams', filter: `room_id=eq.${roomId}` }, () => {
          onChange('TEAMS_UPDATED');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions', filter: `room_id=eq.${roomId}` }, () => {
          onChange('SUBMISSIONS_UPDATED');
        })
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }

    // Local broadcast listener
    const handler = (ev: MessageEvent) => {
      onChange(ev.data?.type || 'LOCAL_UPDATE');
    };
    broadcast?.addEventListener('message', handler);

    return () => {
      broadcast?.removeEventListener('message', handler);
    };
  }
}
