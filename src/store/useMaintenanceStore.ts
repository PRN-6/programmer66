import { create } from 'zustand';

export type MaintenanceType = 'lockdown' | 'read_only' | 'banner';

export interface MaintenanceConfig {
  isMaintenanceActive: boolean;
  maintenanceType: MaintenanceType;
  headline: string;
  message: string;
  estimatedDuration: string;
  startedAt: string | null;
  broadcastMessage: string | null;
}

interface MaintenanceState extends MaintenanceConfig {
  setMaintenanceActive: (active: boolean) => void;
  setMaintenanceType: (type: MaintenanceType) => void;
  updateConfig: (config: Partial<MaintenanceConfig>) => void;
  sendBroadcast: (msg: string) => void;
  clearBroadcast: () => void;
}

const STORAGE_KEY = 'programmer66_maintenance_config';

const DEFAULT_CONFIG: MaintenanceConfig = {
  isMaintenanceActive: false,
  maintenanceType: 'lockdown',
  headline: 'System Maintenance & Grid Upgrades',
  message:
    'Our engineering team is deploying quantum farm enhancements and database optimization. Services will resume shortly.',
  estimatedDuration: '30 minutes',
  startedAt: null,
  broadcastMessage: null,
};

const broadcastChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('programmer66_maintenance_channel')
    : null;

function loadInitialConfig(): MaintenanceConfig {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_CONFIG;
}

function persistConfig(config: MaintenanceConfig) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }
  broadcastChannel?.postMessage({ type: 'MAINTENANCE_SYNC', payload: config });
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => {
  // Listen for cross-tab sync
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', (event) => {
      if (event.data?.type === 'MAINTENANCE_SYNC' && event.data?.payload) {
        set(event.data.payload);
      }
    });
  }

  const initial = loadInitialConfig();

  return {
    ...initial,

    setMaintenanceActive: (active: boolean) => {
      const updated: MaintenanceConfig = {
        ...get(),
        isMaintenanceActive: active,
        startedAt: active ? new Date().toISOString() : null,
      };
      set(updated);
      persistConfig(updated);
    },

    setMaintenanceType: (type: MaintenanceType) => {
      const updated: MaintenanceConfig = {
        ...get(),
        maintenanceType: type,
      };
      set(updated);
      persistConfig(updated);
    },

    updateConfig: (patch: Partial<MaintenanceConfig>) => {
      const current = get();
      const updated: MaintenanceConfig = {
        ...current,
        ...patch,
      };
      set(updated);
      persistConfig(updated);
    },

    sendBroadcast: (msg: string) => {
      const updated: MaintenanceConfig = {
        ...get(),
        broadcastMessage: msg.trim() || null,
      };
      set(updated);
      persistConfig(updated);
    },

    clearBroadcast: () => {
      const updated: MaintenanceConfig = {
        ...get(),
        broadcastMessage: null,
      };
      set(updated);
      persistConfig(updated);
    },
  };
});
