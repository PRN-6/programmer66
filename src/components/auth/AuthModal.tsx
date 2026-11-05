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
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { signIn, signUp, signInWithGoogle, isLoading, error, setError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      const cleanName = displayName.trim() || cleanEmail.split('@')[0];
      const success = await signUp(cleanEmail, password, cleanName);
      if (success) {
        onClose();
      }
    } else {
      const success = await signIn(cleanEmail, password);
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
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 text-sky-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'signin' ? 'Sign In to programmer66' : 'Create Player Account'}
              </h2>
              <p className="text-xs text-neutral-400">Cloud Sync & Cross-Device Progression</p>
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
            <label className="text-neutral-300 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="pilot@programmer66.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 transition text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-neutral-300 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 transition text-xs font-mono"
              />
            </div>
          </div>

          {/* Perks list */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:bg-neutral-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In & Load Cloud Save' : 'Create Account & Sync Farm'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {/* Google OAuth Option */}
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
