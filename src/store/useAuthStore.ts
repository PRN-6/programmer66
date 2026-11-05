import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useGameStore } from './useGameStore';
import { useCompetitionStore } from './useCompetitionStore';
import { soundManager } from '../audio/soundEffects';

const SUPER_ADMIN_EMAIL = (import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@programmer66.com').toLowerCase().trim();
const SUPER_ADMIN_USERNAME = (import.meta.env.VITE_SUPER_ADMIN_USERNAME || 'admin').toLowerCase().trim();
const SUPER_ADMIN_PASSWORD = (import.meta.env.VITE_SUPER_ADMIN_PASSWORD || 'admin123').trim();

function getSessionItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
}

function setSessionItem(key: string, val: string): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(key, val);
    } catch {
      // Ignore
    }
  }
}

function removeSessionItem(key: string): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}

export function isSuperAdminCredential(identifier: string, pass: string): boolean {
  const cleanId = identifier.toLowerCase().trim();
  const cleanPass = pass.trim();
  const isMatchId = cleanId === SUPER_ADMIN_EMAIL || cleanId === SUPER_ADMIN_USERNAME;
  const isMatchPass = cleanPass === SUPER_ADMIN_PASSWORD;
  return Boolean(isMatchId && isMatchPass);
}

export interface PlayerProfile {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: PlayerProfile | null;
  isLoading: boolean;
  isSyncing: boolean;
  isSuperAdmin: boolean;
  lastSyncTime: number | null;
  showAuthModal: boolean;
  error: string | null;

  setShowAuthModal: (show: boolean) => void;
  setError: (err: string | null) => void;
  initAuth: () => Promise<void>;
  loginAsSuperAdmin: (identifier: string, pass: string) => boolean;
  signUp: (email: string, pass: string, displayName: string) => Promise<boolean>;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncToCloud: () => Promise<boolean>;
  loadFromCloud: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: false,
  isSyncing: false,
  isSuperAdmin: false,
  lastSyncTime: null,
  showAuthModal: false,
  error: null,

  setShowAuthModal: (show: boolean) => set({ showAuthModal: show, error: null }),
  setError: (err: string | null) => set({ error: err }),

  initAuth: async () => {
    // Check if session storage has an active super admin session
    if (getSessionItem('programmer66_super_admin') === 'true') {
      const adminUser = {
        id: 'super-admin-001',
        email: SUPER_ADMIN_EMAIL,
        app_metadata: { role: 'super_admin' },
        user_metadata: { display_name: 'Super Admin' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      set({
        user: adminUser,
        profile: {
          id: 'super-admin-001',
          email: SUPER_ADMIN_EMAIL,
          displayName: 'Super Admin 👑',
        },
        isSuperAdmin: true,
      });

      useCompetitionStore.setState({
        isAdmin: true,
      });
    }

    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        set({
          session: data.session,
          user: data.session.user,
        });
        await fetchProfile(data.session.user);
      }

      // Listen for real-time auth state transitions
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          set({ session, user: session.user });
          await fetchProfile(session.user);
          if (event === 'SIGNED_IN') {
            await get().loadFromCloud();
          }
        } else {
          set({ session: null, user: null, profile: null });
        }
      });
    } catch (e) {
      console.warn('initAuth error:', e);
    }
  },

  signUp: async (email: string, pass: string, displayName: string) => {
    if (!isSupabaseConfigured || !supabase) {
      set({ error: 'Supabase is not configured. Cloud auth is offline.' });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const cleanName = displayName.trim() || email.split('@')[0];
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            display_name: cleanName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Upsert player profile in public.player_profiles
        await supabase.from('player_profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          display_name: cleanName,
        });

        set({
          user: data.user,
          session: data.session,
          profile: {
            id: data.user.id,
            email: data.user.email || null,
            displayName: cleanName,
          },
          isLoading: false,
          showAuthModal: false,
        });

        soundManager.playSuccess();
        // Immediately sync local farm to cloud
        await get().syncToCloud();
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  loginAsSuperAdmin: (identifier: string, pass: string) => {
    if (isSuperAdminCredential(identifier, pass)) {
      const adminUser = {
        id: 'super-admin-001',
        email: SUPER_ADMIN_EMAIL,
        app_metadata: { role: 'super_admin' },
        user_metadata: { display_name: 'Super Admin' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      set({
        user: adminUser,
        profile: {
          id: 'super-admin-001',
          email: SUPER_ADMIN_EMAIL,
          displayName: 'Super Admin 👑',
        },
        isSuperAdmin: true,
        isLoading: false,
        showAuthModal: false,
        error: null,
      });

      setSessionItem('programmer66_super_admin', 'true');

      // Grant competition admin privileges and launch the Admin Dashboard
      useCompetitionStore.setState({
        isAdmin: true,
        showAdminModal: true,
      });

      soundManager.playSuccess();
      return true;
    }

    set({ error: 'Invalid Super Admin credentials. Check your .env configuration.' });
    return false;
  },

  signIn: async (email: string, pass: string) => {
    // First, verify if user entered super admin credentials
    if (isSuperAdminCredential(email, pass)) {
      return get().loginAsSuperAdmin(email, pass);
    }

    if (!isSupabaseConfigured || !supabase) {
      set({ error: 'Supabase is not configured.' });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw error;

      if (data.user) {
        set({
          user: data.user,
          session: data.session,
          isLoading: false,
          showAuthModal: false,
        });

        await fetchProfile(data.user);
        soundManager.playSuccess();
        // Auto-load player's saved cloud farm
        await get().loadFromCloud();
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  signInWithGoogle: async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed';
      set({ error: msg });
    }
  },

  signOut: async () => {
    removeSessionItem('programmer66_super_admin');
    set({ user: null, session: null, profile: null, lastSyncTime: null, isSuperAdmin: false });
    useCompetitionStore.setState({ isAdmin: false, showAdminModal: false });
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    soundManager.playCoin();
  },

  syncToCloud: async () => {
    if (get().isSuperAdmin) {
      return true;
    }

    const { user } = get();
    if (!user || !isSupabaseConfigured || !supabase) return false;

    set({ isSyncing: true });
    try {
      const gameState = useGameStore.getState();

      const saveData = {
        user_id: user.id,
        level: gameState.level,
        xp: gameState.xp,
        money: gameState.money,
        day: gameState.day,
        time_of_day: gameState.timeOfDay,
        weather: gameState.weather,
        inventory: gameState.inventory,
        tiles: gameState.tiles,
        robots: gameState.robots,
        missions: gameState.missions,
        stats: gameState.stats,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('player_saves').upsert(saveData);
      if (error) throw error;

      set({ isSyncing: false, lastSyncTime: Date.now() });
      return true;
    } catch (err) {
      console.warn('Cloud sync error:', err);
      set({ isSyncing: false });
      return false;
    }
  },

  loadFromCloud: async () => {
    if (get().isSuperAdmin) {
      return true;
    }

    const { user } = get();
    if (!user || !isSupabaseConfigured || !supabase) return false;

    set({ isSyncing: true });
    try {
      const { data, error } = await supabase
        .from('player_saves')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Restore cloud save to GameStore
        useGameStore.setState({
          tiles: data.tiles || useGameStore.getState().tiles,
          robots: data.robots || useGameStore.getState().robots,
          inventory: data.inventory || useGameStore.getState().inventory,
          money: typeof data.money === 'number' ? data.money : 120,
          day: data.day || 1,
          timeOfDay: data.time_of_day || 8.0,
          weather: data.weather || 'sunny',
          xp: data.xp || 0,
          level: data.level || 1,
          stats: data.stats || useGameStore.getState().stats,
          missions: data.missions || useGameStore.getState().missions,
        });

        // Also save to localStorage as backup
        useGameStore.getState().saveGame();
        set({ isSyncing: false, lastSyncTime: Date.now() });
        return true;
      }

      set({ isSyncing: false });
      return false;
    } catch (err) {
      console.warn('Cloud load error:', err);
      set({ isSyncing: false });
      return false;
    }
  },
}));

// Helper to fetch profile from public.player_profiles
async function fetchProfile(user: User) {
  if (!supabase) return;
  try {
    const { data } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      useAuthStore.setState({
        profile: {
          id: data.id,
          email: data.email,
          displayName: data.display_name || user.email?.split('@')[0] || 'Farmer',
          avatarUrl: data.avatar_url,
        },
      });
    } else {
      const fallbackName =
        user.user_metadata?.display_name || user.email?.split('@')[0] || 'Farmer';
      useAuthStore.setState({
        profile: {
          id: user.id,
          email: user.email || null,
          displayName: fallbackName,
        },
      });
    }
  } catch (e) {
    console.warn('fetchProfile error:', e);
  }
}

