import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useGameStore } from './useGameStore';
import { useCompetitionStore } from './useCompetitionStore';
import { soundManager } from '../audio/soundEffects';

const SUPER_ADMIN_EMAIL = (import.meta.env.VITE_SUPER_ADMIN_EMAIL || (import.meta.env.DEV ? 'admin@programmer66.com' : '')).toLowerCase().trim();
const SUPER_ADMIN_USERNAME = (import.meta.env.VITE_SUPER_ADMIN_USERNAME || (import.meta.env.DEV ? 'admin' : '')).toLowerCase().trim();
const SUPER_ADMIN_PASSWORD = (import.meta.env.VITE_SUPER_ADMIN_PASSWORD || (import.meta.env.DEV ? 'admin123' : '')).trim();

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

  // If no password is configured or input is empty, reject immediately
  if (!SUPER_ADMIN_PASSWORD || !cleanPass) {
    return false;
  }

  const isMatchId =
    (Boolean(SUPER_ADMIN_EMAIL) && cleanId === SUPER_ADMIN_EMAIL) ||
    (Boolean(SUPER_ADMIN_USERNAME) && cleanId === SUPER_ADMIN_USERNAME);

  const isMatchPass = cleanPass === SUPER_ADMIN_PASSWORD;

  return Boolean(isMatchId && isMatchPass);
}

export interface DevAccount {
  id: string;
  email: string;
  username: string;
  displayName: string;
  password: string;
  createdAt: string;
}

let memoryDevAccounts: DevAccount[] = [];

function getDevAccounts(): DevAccount[] {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('programmer66_dev_accounts');
      if (raw) return JSON.parse(raw);
    } catch {
      // Fall through to memory
    }
  }
  return memoryDevAccounts;
}

function saveDevAccount(acc: DevAccount): void {
  const list = getDevAccounts().filter(
    (a) =>
      a.email.toLowerCase() !== acc.email.toLowerCase() &&
      a.username.toLowerCase() !== acc.username.toLowerCase()
  );
  list.push(acc);
  memoryDevAccounts = list;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('programmer66_dev_accounts', JSON.stringify(list));
    } catch {
      // Ignore
    }
  }
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
  directDevLogin: () => boolean;
  loginAsDevGoogle: (displayName?: string) => void;
  signUp: (emailOrUsername: string, pass: string, displayName: string) => Promise<boolean>;
  signIn: (emailOrUsername: string, pass: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncToCloud: () => Promise<boolean>;
  loadFromCloud: () => Promise<boolean>;
}

function applyLocalUserSession(acc: DevAccount, set: (state: Partial<AuthState>) => void) {
  const devUser = {
    id: acc.id,
    email: acc.email,
    user_metadata: { display_name: acc.displayName, username: acc.username },
    app_metadata: { provider: 'local_dev' },
    aud: 'authenticated',
    created_at: acc.createdAt,
  } as unknown as User;

  set({
    user: devUser,
    session: null,
    profile: {
      id: acc.id,
      email: acc.email,
      displayName: acc.displayName,
    },
    isLoading: false,
    showAuthModal: false,
    error: null,
  });

  setSessionItem('programmer66_dev_session', JSON.stringify(acc));
  soundManager.playSuccess();
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
    // 1. Check Super Admin session
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
      return;
    }

    // 2. Check local dev player session
    const devSessionRaw = getSessionItem('programmer66_dev_session');
    if (devSessionRaw) {
      try {
        const acc: DevAccount = JSON.parse(devSessionRaw);
        const devUser = {
          id: acc.id,
          email: acc.email,
          user_metadata: { display_name: acc.displayName, username: acc.username },
          app_metadata: { provider: 'local_dev' },
          aud: 'authenticated',
          created_at: acc.createdAt,
        } as unknown as User;

        set({
          user: devUser,
          profile: {
            id: acc.id,
            email: acc.email,
            displayName: acc.displayName,
          },
        });
        return;
      } catch {
        // Fall through
      }
    }

    // 3. Supabase Auth session
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
        } else if (!get().isSuperAdmin && !getSessionItem('programmer66_dev_session')) {
          set({ session: null, user: null, profile: null });
        }
      });
    } catch (e) {
      console.warn('initAuth error:', e);
    }
  },

  signUp: async (emailOrUsername: string, pass: string, displayName: string) => {
    set({ isLoading: true, error: null });

    const cleanInput = emailOrUsername.trim();
    const cleanPass = pass.trim();
    const cleanName = displayName.trim() || cleanInput.split('@')[0];

    const email = cleanInput.includes('@') ? cleanInput : `${cleanInput}@programmer66.dev`;
    const username = cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput;

    const devAcc: DevAccount = {
      id: `player-${Date.now()}`,
      email,
      username,
      displayName: cleanName,
      password: cleanPass,
      createdAt: new Date().toISOString(),
    };

    // Save account locally so user can always log in immediately in development
    saveDevAccount(devAcc);

    // Attempt cloud signup with Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: cleanPass,
          options: {
            data: {
              display_name: cleanName,
            },
          },
        });

        if (!error && data.user) {
          try {
            await supabase.from('player_profiles').upsert({
              id: data.user.id,
              email: data.user.email,
              display_name: cleanName,
            });
          } catch {}

          set({
            user: data.user,
            session: data.session,
            profile: {
              id: data.user.id,
              email: data.user.email || email,
              displayName: cleanName,
            },
            isLoading: false,
            showAuthModal: false,
          });

          soundManager.playSuccess();
          await get().syncToCloud();
          return true;
        }
      } catch (err) {
        console.warn('Supabase signUp fallback to dev mode:', err);
      }
    }

    // Immediate Local Registration Success (guaranteed zero rate-limit or email blockage in dev!)
    applyLocalUserSession(devAcc, set);
    return true;
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

  directDevLogin: () => {
    const adminUser = {
      id: 'super-admin-001',
      email: SUPER_ADMIN_EMAIL,
      app_metadata: { role: 'super_admin' },
      user_metadata: { display_name: 'Developer Admin' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    set({
      user: adminUser,
      profile: {
        id: 'super-admin-001',
        email: SUPER_ADMIN_EMAIL,
        displayName: 'Developer Admin 👑',
      },
      isSuperAdmin: true,
      isLoading: false,
      showAuthModal: false,
      error: null,
    });

    setSessionItem('programmer66_super_admin', 'true');
    useCompetitionStore.setState({
      isAdmin: true,
      showAdminModal: true,
    });

    soundManager.playSuccess();
    return true;
  },

  loginAsDevGoogle: (displayName = 'Google Farmer') => {
    const googleAcc: DevAccount = {
      id: `google-user-${Date.now()}`,
      email: 'farmer.demo@gmail.com',
      username: 'google_farmer',
      displayName,
      password: '',
      createdAt: new Date().toISOString(),
    };
    saveDevAccount(googleAcc);
    applyLocalUserSession(googleAcc, set);
  },

  signIn: async (emailOrUsername: string, pass: string) => {
    set({ isLoading: true, error: null });

    const cleanInput = emailOrUsername.trim();
    const cleanPass = pass.trim();

    // 1. Verify Super Admin credentials
    if (isSuperAdminCredential(cleanInput, cleanPass)) {
      return get().loginAsSuperAdmin(cleanInput, cleanPass);
    }

    // 2. Check Local Registered Accounts (matching email OR username)
    const localAccounts = getDevAccounts();
    const matched = localAccounts.find(
      (a) =>
        (a.email.toLowerCase() === cleanInput.toLowerCase() ||
         a.username.toLowerCase() === cleanInput.toLowerCase()) &&
        a.password === cleanPass
    );

    if (matched) {
      applyLocalUserSession(matched, set);
      return true;
    }

    // 3. Check Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const emailToTry = cleanInput.includes('@') ? cleanInput : `${cleanInput}@programmer66.dev`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToTry,
          password: cleanPass,
        });

        if (!error && data.user) {
          set({
            user: data.user,
            session: data.session,
            isLoading: false,
            showAuthModal: false,
          });

          await fetchProfile(data.user);
          soundManager.playSuccess();
          await get().loadFromCloud();
          return true;
        }
      } catch (err: unknown) {
        console.warn('Supabase signIn error:', err);
      }
    }

    set({
      error: 'Invalid credentials. Enter your registered username/email and password.',
      isLoading: false,
    });
    return false;
  },

  signInWithGoogle: async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: origin,
          },
        });

        if (error) {
          throw error;
        }

        if (data?.url) {
          try {
            // Verify if Google Provider is configured in Supabase (unconfigured returns 400 Bad Request)
            const probe = await fetch(data.url, { redirect: 'manual' });
            if (probe.status >= 400) {
              console.warn('Google Provider is not enabled in Supabase. Falling back to Google Dev Login.');
              get().loginAsDevGoogle();
              return;
            }
          } catch {
            // Ignore probe errors
          }

          if (typeof window !== 'undefined') {
            window.location.href = data.url;
            return;
          }
        }
      } catch (err) {
        console.warn('Supabase Google OAuth exception:', err);
      }
    }

    // Instant Google Dev login fallback so users can always test Google mode
    get().loginAsDevGoogle();
  },

  signOut: async () => {
    removeSessionItem('programmer66_super_admin');
    removeSessionItem('programmer66_dev_session');
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
    if (!user || user.app_metadata?.provider === 'local_dev' || !isSupabaseConfigured || !supabase) {
      return true;
    }

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
    if (!user || user.app_metadata?.provider === 'local_dev' || !isSupabaseConfigured || !supabase) {
      return true;
    }

    set({ isSyncing: true });
    try {
      const { data, error } = await supabase
        .from('player_saves')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
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
