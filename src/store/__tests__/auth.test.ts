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

  const adminEmail = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@programmer66.com';
  const adminUser = import.meta.env.VITE_SUPER_ADMIN_USERNAME || 'admin';
  const adminPass = import.meta.env.VITE_SUPER_ADMIN_PASSWORD || 'admin123';

  it('validates super admin credentials using email or username', () => {
    // Expected default .env values
    expect(isSuperAdminCredential(adminEmail, adminPass)).toBe(true);
    expect(isSuperAdminCredential(adminUser, adminPass)).toBe(true);
    expect(isSuperAdminCredential(adminUser.toUpperCase(), adminPass)).toBe(true);
    expect(isSuperAdminCredential(` ${adminEmail} `, adminPass)).toBe(true);

    // Invalid credentials
    expect(isSuperAdminCredential('wrong@email.com', adminPass)).toBe(false);
    expect(isSuperAdminCredential(adminUser, 'wrongpassword')).toBe(false);
  });

  it('logs in as super admin, sets state and opens competition admin modal', () => {
    const success = useAuthStore.getState().loginAsSuperAdmin(adminUser, adminPass);
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
    const success = useAuthStore.getState().loginAsSuperAdmin(adminUser, 'invalid_pass');
    expect(success).toBe(false);

    const authState = useAuthStore.getState();
    expect(authState.isSuperAdmin).toBe(false);
    expect(authState.error).toContain('Invalid Super Admin credentials');
  });

  it('signs out super admin and cleans up admin privileges', async () => {
    useAuthStore.getState().loginAsSuperAdmin(adminUser, adminPass);
    expect(useAuthStore.getState().isSuperAdmin).toBe(true);

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().isSuperAdmin).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useCompetitionStore.getState().isAdmin).toBe(false);
  });

  it('allows players to register with username, email, and password', async () => {
    const success = await useAuthStore.getState().signUp('test1@gmail.com', '123456', 'test1');
    expect(success).toBe(true);

    const authState = useAuthStore.getState();
    expect(authState.user).not.toBeNull();
    expect(authState.profile?.displayName).toBe('test1');
  });

  it('allows players to sign in using either username or email', async () => {
    // Register test account
    await useAuthStore.getState().signUp('test1@gmail.com', '123456', 'test1');
    await useAuthStore.getState().signOut();

    // 1. Sign in with username
    const successUser = await useAuthStore.getState().signIn('test1', '123456');
    expect(successUser).toBe(true);
    expect(useAuthStore.getState().profile?.displayName).toBe('test1');
    await useAuthStore.getState().signOut();

    // 2. Sign in with email
    const successEmail = await useAuthStore.getState().signIn('test1@gmail.com', '123456');
    expect(successEmail).toBe(true);
    expect(useAuthStore.getState().profile?.displayName).toBe('test1');
  });

  it('supports one-click Google dev sign in without blocking', async () => {
    await useAuthStore.getState().signInWithGoogle();

    const authState = useAuthStore.getState();
    expect(authState.user).not.toBeNull();
    expect(authState.profile?.email).toBe('farmer.demo@gmail.com');
  });
});
