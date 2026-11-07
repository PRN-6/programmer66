import { create } from 'zustand';
import { MaintenanceConfig, MaintenanceType, DEFAULT_MAINTENANCE_CONFIG } from '../types/maintenance';
import { MaintenanceService } from '../services/maintenanceService';

export type { MaintenanceConfig, MaintenanceType };
export { DEFAULT_MAINTENANCE_CONFIG };

interface MaintenanceState extends MaintenanceConfig {
  setMaintenanceActive: (active: boolean) => Promise<void>;
  setMaintenanceType: (type: MaintenanceType) => Promise<void>;
  updateConfig: (patch: Partial<MaintenanceConfig>) => Promise<void>;
  sendBroadcast: (msg: string) => Promise<void>;
  clearBroadcast: () => Promise<void>;
  applyRemoteConfig: (config: MaintenanceConfig) => void;
  syncFromCloud: () => Promise<void>;
}

const STORAGE_KEY = 'programmer66_maintenance_config';

function loadInitialConfig(): MaintenanceConfig {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_MAINTENANCE_CONFIG, ...JSON.parse(raw) };
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_MAINTENANCE_CONFIG;
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => {
  const initial = loadInitialConfig();

  return {
    ...initial,

    setMaintenanceActive: async (active: boolean) => {
      const updated: MaintenanceConfig = {
        ...get(),
        isMaintenanceActive: active,
        startedAt: active ? new Date().toISOString() : null,
      };
      set(updated);
      await MaintenanceService.saveMaintenanceConfig(updated);
    },

    setMaintenanceType: async (type: MaintenanceType) => {
      const updated: MaintenanceConfig = {
        ...get(),
        maintenanceType: type,
      };
      set(updated);
      await MaintenanceService.saveMaintenanceConfig(updated);
    },

    updateConfig: async (patch: Partial<MaintenanceConfig>) => {
      const current = get();
      const updated: MaintenanceConfig = {
        ...current,
        ...patch,
      };
      set(updated);
      await MaintenanceService.saveMaintenanceConfig(updated);
    },

    sendBroadcast: async (msg: string) => {
      const updated: MaintenanceConfig = {
        ...get(),
        broadcastMessage: msg.trim() || null,
      };
      set(updated);
      await MaintenanceService.saveMaintenanceConfig(updated);
    },

    clearBroadcast: async () => {
      const updated: MaintenanceConfig = {
        ...get(),
        broadcastMessage: null,
      };
      set(updated);
      await MaintenanceService.saveMaintenanceConfig(updated);
    },

    applyRemoteConfig: (config: MaintenanceConfig) => {
      set(config);
    },

    syncFromCloud: async () => {
      const cloud = await MaintenanceService.fetchMaintenanceConfig();
      set(cloud);
    },
  };
});
