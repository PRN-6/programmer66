import React from 'react';
import {
  ShieldAlert,
  Clock,
  RefreshCw,
  Terminal,
  Activity,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useMaintenanceStore } from '../../store/useMaintenanceStore';

interface MaintenanceScreenProps {
  onOpenAdminAuth: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onOpenAdminAuth }) => {
  const { headline, message, estimatedDuration, startedAt } = useMaintenanceStore();

  const handleRefresh = () => {
    window.location.reload();
  };

  const formattedStartTime = startedAt
    ? new Date(startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950 font-sans select-none overflow-hidden p-4">
      {/* Background Cybernetic Grid & Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Futuristic Grid Lines Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245, 158, 11, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-xl bg-neutral-950/90 border border-amber-500/30 rounded-3xl p-8 shadow-[0_0_60px_rgba(245,158,11,0.15)] backdrop-blur-2xl text-center flex flex-col items-center">
        {/* Animated Shield Reactor Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/60">
            <ShieldAlert className="w-10 h-10 animate-pulse text-amber-400" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
          </span>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider mb-3">
          <Activity className="w-3.5 h-3.5 animate-spin" />
          <span>System Maintenance Active</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
          {headline || 'System Maintenance in Progress'}
        </h1>

        {/* Explanatory Message */}
        <p className="mt-3 text-sm text-neutral-300 leading-relaxed max-w-md">
          {message ||
            'We are currently performing essential infrastructure upgrades, database maintenance, and live system deployment.'}
        </p>

        {/* Telemetry Info Cards */}
        <div className="mt-6 w-full grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Est. Duration</span>
            </div>
            <span className="font-bold text-amber-300 text-sm">
              ~{estimatedDuration || '30 minutes'}
            </span>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Started At</span>
            </div>
            <span className="font-bold text-sky-300 text-sm">
              {formattedStartTime || 'Just now'}
            </span>
          </div>
        </div>

        {/* Technical Notice Banner */}
        <div className="mt-5 w-full bg-neutral-900/50 border border-white/5 rounded-xl p-3 text-[11px] text-neutral-400 flex items-center justify-center gap-2">
          <Terminal className="w-4 h-4 text-neutral-500 shrink-0" />
          <span>Player accounts, saved progress, and competition records are fully preserved.</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={handleRefresh}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs border border-neutral-700 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Status / Reload</span>
          </button>

          <button
            onClick={onOpenAdminAuth}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Developer Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

