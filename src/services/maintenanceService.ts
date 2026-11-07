import { supabase, isSupabaseConfigured } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { MaintenanceConfig, DEFAULT_MAINTENANCE_CONFIG } from '../types/maintenance';

const STORAGE_KEY = 'programmer66_maintenance_config';
const FALLBACK_ROOM_ID = '__system_maintenance__';

const memoryStore: Record<string, string> = {};

const safeGetStorage = (key: string): string | null => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // fallback
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
    // fallback
  }
  memoryStore[key] = value;
};

const broadcastChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('programmer66_maintenance_channel')
    : null;

export class MaintenanceService {
  /**
   * Fetch latest system maintenance status from cloud Supabase with local fallback
   */
  static async fetchMaintenanceConfig(): Promise<MaintenanceConfig> {
    if (isSupabaseConfigured && supabase) {
      try {
        // Primary: Query dedicated system_settings table
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'maintenance')
          .maybeSingle();

        if (!error && data?.value) {
          const cloudConfig = { ...DEFAULT_MAINTENANCE_CONFIG, ...(data.value as Partial<MaintenanceConfig>) };
          this.saveLocalConfig(cloudConfig);
          return cloudConfig;
        }

        // Fallback: Check fallback rooms table if system_settings had an error or no row found
        const { data: fallbackData } = await supabase
          .from('rooms')
          .select('settings')
          .eq('id', FALLBACK_ROOM_ID)
          .maybeSingle();

        const settings = fallbackData?.settings as { maintenanceConfig?: Partial<MaintenanceConfig> } | undefined;
        if (settings?.maintenanceConfig) {
          const fallbackConfig = { ...DEFAULT_MAINTENANCE_CONFIG, ...settings.maintenanceConfig };
          this.saveLocalConfig(fallbackConfig);
          return fallbackConfig;
        }
      } catch (err) {
        console.warn('MaintenanceService fetchMaintenanceConfig error:', err);
      }
    }

    // Local fallback
    return this.getLocalConfig();
  }

  /**
   * Persist maintenance configuration to Supabase and broadcast to all live clients
   */
  static async saveMaintenanceConfig(config: MaintenanceConfig): Promise<void> {
    // 1. Save locally and post to browser tab channel
    this.saveLocalConfig(config);
    try {
      broadcastChannel?.postMessage({ type: 'MAINTENANCE_SYNC', payload: config });
    } catch {
      // ignore
    }

    // 2. Sync to Supabase cloud if active
    if (isSupabaseConfigured && supabase) {
      try {
        // Attempt upsert to system_settings
        const { error } = await supabase.from('system_settings').upsert({
          key: 'maintenance',
          value: config,
          updated_at: new Date().toISOString(),
        });

        // Fallback to rooms table if system_settings had an error (e.g. table not migrated yet)
        if (error) {
          await supabase.from('rooms').upsert({
            id: FALLBACK_ROOM_ID,
            code: 'SYS_MAINT',
            title: 'System Maintenance State',
            status: config.isMaintenanceActive ? 'maintenance' : 'waiting',
            duration_minutes: 0,
            remaining_seconds: 0,
            settings: {
              maintenanceConfig: config,
            },
          });
        }

        // Broadcast realtime notification to all live connected users across the world
        try {
          const realtimeChannel = supabase.channel('system_maintenance_channel');
          await realtimeChannel.send({
            type: 'broadcast',
            event: 'MAINTENANCE_UPDATE',
            payload: config,
          });
        } catch {
          // ignore realtime broadcast warning in headless test environments
        }
      } catch (err) {
        console.warn('MaintenanceService saveMaintenanceConfig error:', err);
      }
    }
  }

  /**
   * Subscribe to real-time maintenance updates from Supabase and cross-tab BroadcastChannel
   */
  static subscribeToMaintenance(onUpdate: (config: MaintenanceConfig) => void): () => void {
    let cloudChannel: RealtimeChannel | null = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const subId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        cloudChannel = supabase
          .channel(`maint_sub_${subId}`)
          .on('broadcast', { event: 'MAINTENANCE_UPDATE' }, (payload) => {
            if (payload.payload) {
              onUpdate(payload.payload as MaintenanceConfig);
            }
          })
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'system_settings', filter: 'key=eq.maintenance' },
            (payload) => {
              const row = payload.new as { value?: MaintenanceConfig } | null;
              if (row?.value) {
                onUpdate({ ...DEFAULT_MAINTENANCE_CONFIG, ...row.value });
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${FALLBACK_ROOM_ID}` },
            (payload) => {
              const row = payload.new as { settings?: { maintenanceConfig?: MaintenanceConfig } } | null;
              if (row?.settings?.maintenanceConfig) {
                onUpdate({ ...DEFAULT_MAINTENANCE_CONFIG, ...row.settings.maintenanceConfig });
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('MaintenanceService subscribe error:', err);
      }
    }

    // Local BroadcastChannel listener
    const localHandler = (ev: MessageEvent) => {
      if (ev.data?.type === 'MAINTENANCE_SYNC' && ev.data?.payload) {
        onUpdate(ev.data.payload);
      }
    };
    broadcastChannel?.addEventListener('message', localHandler);

    return () => {
      if (cloudChannel && supabase) {
        try {
          supabase.removeChannel(cloudChannel);
        } catch {
          // ignore
        }
      }
      broadcastChannel?.removeEventListener('message', localHandler);
    };
  }

  // --- LOCAL HELPERS ---
  private static getLocalConfig(): MaintenanceConfig {
    const raw = safeGetStorage(STORAGE_KEY);
    if (raw) {
      try {
        return { ...DEFAULT_MAINTENANCE_CONFIG, ...JSON.parse(raw) };
      } catch {
        // ignore
      }
    }
    return DEFAULT_MAINTENANCE_CONFIG;
  }

  private static saveLocalConfig(config: MaintenanceConfig): void {
    safeSetStorage(STORAGE_KEY, JSON.stringify(config));
  }
}
