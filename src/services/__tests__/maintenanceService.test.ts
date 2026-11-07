import { describe, it, expect, beforeEach } from 'vitest';
import { MaintenanceService } from '../maintenanceService';
import { DEFAULT_MAINTENANCE_CONFIG, MaintenanceConfig } from '../../types/maintenance';

describe('MaintenanceService', () => {
  beforeEach(async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    await MaintenanceService.saveMaintenanceConfig(DEFAULT_MAINTENANCE_CONFIG);
  });

  it('fetches default maintenance config when local storage is empty', async () => {
    const config = await MaintenanceService.fetchMaintenanceConfig();
    expect(config.isMaintenanceActive).toBe(false);
    expect(config.maintenanceType).toBe('lockdown');
    expect(config.headline).toBe(DEFAULT_MAINTENANCE_CONFIG.headline);
  });

  it('persists and retrieves updated maintenance config', async () => {
    const customConfig: MaintenanceConfig = {
      isMaintenanceActive: true,
      maintenanceType: 'banner',
      headline: 'Scheduled Cloud Migration',
      message: 'Grid optimization in progress.',
      estimatedDuration: '15 minutes',
      startedAt: new Date().toISOString(),
      broadcastMessage: 'Attention: 10 minutes until database restart.',
    };

    await MaintenanceService.saveMaintenanceConfig(customConfig);
    const retrieved = await MaintenanceService.fetchMaintenanceConfig();

    expect(retrieved.isMaintenanceActive).toBe(true);
    expect(retrieved.maintenanceType).toBe('banner');
    expect(retrieved.headline).toBe('Scheduled Cloud Migration');
    expect(retrieved.broadcastMessage).toBe('Attention: 10 minutes until database restart.');
  });

  it('allows subscription cleanup without error', () => {
    const unsubscribe = MaintenanceService.subscribeToMaintenance(() => {});
    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe()).not.toThrow();
  });
});
