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

export const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  isMaintenanceActive: false,
  maintenanceType: 'lockdown',
  headline: 'System Maintenance & Grid Upgrades',
  message:
    'Our engineering team is deploying quantum farm enhancements and database optimization. Services will resume shortly.',
  estimatedDuration: '30 minutes',
  startedAt: null,
  broadcastMessage: null,
};
