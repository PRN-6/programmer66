import React, { useState } from 'react';
import {
  X,
  Cloud,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Shield,
  KeyRound,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AuthModalProps {
  onClose: () => void;
  defaultMode?: 'signin' | 'signup' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, defaultMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'admin'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { signIn, signUp, signInWithGoogle, loginAsSuperAdmin, isLoading, error, setError } =
    useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setError(null);

    const cleanInput = email.trim();

    // 1. Super Admin Mode
    if (mode === 'admin') {
      if (!cleanInput) {
        setFormError('Please enter the Super Admin email or username.');
        return;
      }
      if (!password) {
        setFormError('Please enter the Super Admin password.');
        return;
      }

      const success = loginAsSuperAdmin(cleanInput, password);
      if (success) {
        onClose();
      } else {
        setFormError('Invalid Super Admin credentials. Please check your .env settings.');
      }
      return;
    }

    // 2. Regular Sign In: Check if user entered Super Admin credentials in standard tab
    if (mode === 'signin') {
      const isSuper = loginAsSuperAdmin(cleanInput, password);
      if (isSuper) {
        onClose();
        return;
      }

      if (!cleanInput || !cleanInput.includes('@')) {
        setFormError('Please enter a valid email address.');
        return;
      }

      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }

      const success = await signIn(cleanInput, password);
      if (success) {
        onClose();
      }
      return;
    }

    // 3. Create Account (Sign Up)
    if (mode === 'signup') {
      if (!cleanInput || !cleanInput.includes('@')) {
        setFormError('Please enter a valid email address.');
        return;
      }

      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }

      const cleanName = displayName.trim() || cleanInput.split('@')[0];
      const success = await signUp(cleanInput, password, cleanName);
      if (success) {
        onClose();
      }
    }
  };

  const displayError = formError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-neutral-900 px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                mode === 'admin'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-neutral-800 border-neutral-700 text-sky-400'
              }`}
            >
              {mode === 'admin' ? <Shield className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {mode === 'signin' && 'Sign In to programmer66'}
                {mode === 'signup' && 'Create Player Account'}
                {mode === 'admin' && (
                  <>
                    <span>Super Admin Portal</span>
                    <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      Master
                    </span>
                  </>
                )}
              </h2>
              <p className="text-xs text-neutral-400">
                {mode === 'admin'
                  ? 'Access Room & Competition Control Panel'
                  : 'Cloud Sync & Cross-Device Progression'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/50 p-1 m-4 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setFormError(null);
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              mode === 'signin'
                ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setFormError(null);
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              mode === 'signup'
                ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setFormError(null);
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              mode === 'admin'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40'
                : 'text-neutral-400 hover:text-amber-400'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {displayError && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1 text-xs">
              <label className="text-neutral-300 font-medium">Player / Farmer Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. NeoPilot"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 transition text-xs font-mono"
                />
              </div>
            </div>
          )}

          <div className="space-y-1 text-xs">
            <label className="text-neutral-300 font-medium">
              {mode === 'admin' ? 'Admin Username or Email' : 'Email Address'}
            </label>
            <div className="relative">
              {mode === 'admin' ? (
                <Shield className="w-4 h-4 text-amber-500/70 absolute left-3 top-1/2 -translate-y-1/2" />
              ) : (
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              )}
              <input
                type={mode === 'admin' ? 'text' : 'email'}
                placeholder={mode === 'admin' ? 'admin or admin@programmer66.com' : 'pilot@programmer66.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full bg-neutral-900 border rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none transition text-xs font-mono ${
                  mode === 'admin'
                    ? 'border-neutral-800 focus:border-amber-500'
                    : 'border-neutral-800 focus:border-sky-500'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-neutral-300 font-medium">
              {mode === 'admin' ? 'Master Password' : 'Password'}
            </label>
            <div className="relative">
              {mode === 'admin' ? (
                <KeyRound className="w-4 h-4 text-amber-500/70 absolute left-3 top-1/2 -translate-y-1/2" />
              ) : (
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              )}
              <input
                type="password"
                placeholder={mode === 'admin' ? 'Enter master password from .env' : 'At least 6 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full bg-neutral-900 border rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none transition text-xs font-mono ${
                  mode === 'admin'
                    ? 'border-neutral-800 focus:border-amber-500'
                    : 'border-neutral-800 focus:border-sky-500'
                }`}
              />
            </div>
          </div>

          {/* Perks or Admin info banner */}
          {mode === 'admin' ? (
            <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 space-y-1.5 text-[11px] text-amber-200/90">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Super Admin Privileges</span>
              </div>
              <p className="text-[10px] text-amber-300/80 leading-relaxed">
                Credentials configured in <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-200 font-mono">.env</code> (<code className="font-mono">VITE_SUPER_ADMIN_...</code>). Logging in launches the Organizer Dashboard to create rooms, launch coding competitions, manage custom challenges, and control live scoreboards.
              </p>
            </div>
          ) : (
            <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80 space-y-1.5 text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Saves your level, coins, and farm plots in the cloud</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Seamlessly resume from any computer or browser</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 px-4 font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 ${
              mode === 'admin'
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-950/50'
                : 'bg-sky-600 hover:bg-sky-500 disabled:bg-neutral-800 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : mode === 'admin' ? (
              <>
                <span>Authorize & Open Admin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In & Load Cloud Save' : 'Create Account & Sync Farm'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {/* Google OAuth Option (Only for regular player signin/signup) */}
          {mode !== 'admin' && (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full py-2 px-4 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white font-medium rounded-xl text-xs border border-neutral-800 transition flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}

          {/* Dismiss as Guest */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-neutral-500 hover:text-neutral-400 transition"
            >
              Continue playing as Guest (local storage only)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
