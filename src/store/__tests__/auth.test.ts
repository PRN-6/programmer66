import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, isSuperAdminCredential } from '../useAuthStore';
import { useCompetitionStore } from '../useCompetitionStore';

describe('Super Admin Authentication', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }
    useAuthStore.setState({
      user: null,
      session: null,
      profile: null,
      isSuperAdmin: false,
      error: null,
    });
    useCompetitionStore.setState({
      isAdmin: false,
      showAdminModal: false,
    });
  });

  it('validates super admin credentials using email or username', () => {
    // Expected default .env values
    expect(isSuperAdminCredential('admin@programmer66.com', 'admin123')).toBe(true);
    expect(isSuperAdminCredential('admin', 'admin123')).toBe(true);
    expect(isSuperAdminCredential('ADMIN', 'admin123')).toBe(true);
    expect(isSuperAdminCredential(' Admin@programmer66.com ', 'admin123')).toBe(true);

    // Invalid credentials
    expect(isSuperAdminCredential('wrong@email.com', 'admin123')).toBe(false);
    expect(isSuperAdminCredential('admin', 'wrongpassword')).toBe(false);
  });

  it('logs in as super admin, sets state and opens competition admin modal', () => {
    const success = useAuthStore.getState().loginAsSuperAdmin('admin', 'admin123');
    expect(success).toBe(true);

    const authState = useAuthStore.getState();
    expect(authState.isSuperAdmin).toBe(true);
    expect(authState.user).not.toBeNull();
    expect(authState.profile?.displayName).toContain('Super Admin');

    // Verifies competition store is granted admin rights and AdminModal is opened
    const compState = useCompetitionStore.getState();
    expect(compState.isAdmin).toBe(true);
    expect(compState.showAdminModal).toBe(true);
  });

  it('rejects invalid super admin login attempts', () => {
    const success = useAuthStore.getState().loginAsSuperAdmin('admin', 'invalid_pass');
    expect(success).toBe(false);

    const authState = useAuthStore.getState();
    expect(authState.isSuperAdmin).toBe(false);
    expect(authState.error).toContain('Invalid Super Admin credentials');
  });

  it('signs out super admin and cleans up admin privileges', async () => {
    useAuthStore.getState().loginAsSuperAdmin('admin', 'admin123');
    expect(useAuthStore.getState().isSuperAdmin).toBe(true);

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().isSuperAdmin).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useCompetitionStore.getState().isAdmin).toBe(false);
  });
});
