import React, { useState } from 'react';
import {
  X,
  Power,
  AlertTriangle,
  Clock,
  Radio,
  Trash2,
  Trophy,
  Activity,
  LogOut,
  Send,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { useMaintenanceStore, MaintenanceType } from '../../store/useMaintenanceStore';
import { useAuthStore } from '../../store/useAuthStore';
import { isSupabaseConfigured } from '../../services/supabase';

interface SystemMaintenanceModalProps {
  onClose: () => void;
  onOpenOrganizer: () => void;
}

export const SystemMaintenanceModal: React.FC<SystemMaintenanceModalProps> = ({
  onClose,
  onOpenOrganizer,
}) => {
  const {
    isMaintenanceActive,
    maintenanceType,
    headline,
    message,
    estimatedDuration,
    broadcastMessage,
    setMaintenanceActive,
    setMaintenanceType,
    updateConfig,
    sendBroadcast,
    clearBroadcast,
  } = useMaintenanceStore();

  const signOut = useAuthStore((s) => s.signOut);

  const [inputHeadline, setInputHeadline] = useState(headline);
  const [inputMessage, setInputMessage] = useState(message);
  const [inputDuration, setInputDuration] = useState(estimatedDuration);
  const [inputBroadcast, setInputBroadcast] = useState(broadcastMessage || '');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleToggleMaintenance = () => {
    const nextState = !isMaintenanceActive;
    setMaintenanceActive(nextState);
    setActionNotice(
      nextState
        ? '⚠️ Maintenance Mode ACTIVATED: Visitors are now gated or notified according to your policy.'
        : '🟢 Maintenance Mode DEACTIVATED: Live website is now fully operational for all visitors.'
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleSaveConfig = () => {
    updateConfig({
      headline: inputHeadline.trim() || 'System Maintenance in Progress',
      message: inputMessage.trim() || 'Services will resume shortly.',
      estimatedDuration: inputDuration.trim() || '30 minutes',
    });
    setActionNotice('✅ Maintenance settings updated successfully.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSendBroadcast = () => {
    if (!inputBroadcast.trim()) return;
    sendBroadcast(inputBroadcast.trim());
    setActionNotice('📡 Live broadcast alert sent to all connected players.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleClearBroadcast = () => {
    clearBroadcast();
    setInputBroadcast('');
    setActionNotice('Broadcast alert cleared.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handlePurgeStaleRooms = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem('programmer66_rooms');
        if (raw) {
          const rooms = JSON.parse(raw);
          const activeOnly: Record<string, unknown> = {};
          Object.values(rooms).forEach((r: unknown) => {
            const room = r as { id: string; status: string };
            if (room.status !== 'completed') {
              activeOnly[room.id] = room;
            }
          });
          localStorage.setItem('programmer66_rooms', JSON.stringify(activeOnly));
        }
      } catch {
        // ignore
      }
    }
    setActionNotice('🧹 Completed and stale competition rooms purged from local registry.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleClearClientCaches = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem('programmer66_dev_accounts');
      } catch {
        // ignore
      }
    }
    setActionNotice('✨ Demo accounts cache cleared.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const PRESET_HEADLINES = [
    'Database Schema Migration & Cloud Upgrade',
    'Quantum Simulation Engine Optimization',
    'Scheduled Server Infrastructure Maintenance',
    'Emergency Security & Performance Patch',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-neutral-950 border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/50">
              <Power className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">
                  Super Admin Maintenance Console
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono uppercase">
                  MASTER DEVELOPER
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Site-wide maintenance mode controls, live announcements, and system operations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Sign Out of Super Admin elevation"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Exit Admin</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="px-6 py-2.5 bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-xs font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: MASTER ONE-CLICK MAINTENANCE TOGGLE */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              isMaintenanceActive
                ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/40'
                : 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isMaintenanceActive
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-md'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-md'
                  }`}
                >
                  <Power className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">
                      Live Website Status:
                    </span>
                    <span
                      className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-full font-mono ${
                        isMaintenanceActive
                          ? 'bg-amber-500 text-neutral-950 shadow-sm'
                          : 'bg-emerald-500 text-neutral-950 shadow-sm'
                      }`}
                    >
                      {isMaintenanceActive ? 'MAINTENANCE MODE ACTIVE' : 'ONLINE / OPERATIONAL'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    {isMaintenanceActive
                      ? 'Visitors are currently gated or notified according to your maintenance policy. You bypass this restriction automatically as Super Admin.'
                      : 'All public visitors can freely play sandbox farming, join events, and sync saves.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleMaintenance}
                className={`py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider transition-all transform active:scale-95 flex items-center justify-center gap-2 shrink-0 shadow-lg cursor-pointer ${
                  isMaintenanceActive
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-950/50'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-950/50'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>
                  {isMaintenanceActive
                    ? 'Deactivate & Restore Site'
                    : 'Activate Maintenance Mode'}
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 2: MULTIPLE MAINTENANCE OPTIONS */}
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Maintenance Mode Policy & Options</span>
            </div>

            {/* Policy Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  {
                    id: 'lockdown',
                    title: 'Full Lockdown',
                    desc: 'Blocks public visitors with a high-tech maintenance screen. Super Admin bypasses.',
                  },
                  {
                    id: 'read_only',
                    title: 'Read-Only Sandbox',
                    desc: 'Visitors can test local farming, but cloud sync and new room creations are locked.',
                  },
                  {
                    id: 'banner',
                    title: 'Warning Banner Only',
                    desc: 'Site stays accessible; displays an urgent maintenance alert banner across the top.',
                  },
                ] as const
              ).map((opt) => {
                const active = maintenanceType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setMaintenanceType(opt.id as MaintenanceType)}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      active
                        ? 'bg-amber-500/20 border-amber-500/60 shadow-md shadow-amber-950/30'
                        : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-bold ${
                          active ? 'text-amber-300' : 'text-neutral-200'
                        }`}
                      >
                        {opt.title}
                      </span>
                      {active && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-neutral-400">{opt.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Headline Presets */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-neutral-300">
                Preset Maintenance Reasons:
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_HEADLINES.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setInputHeadline(preset)}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1 text-xs">
                <label className="text-neutral-300 font-semibold">Custom Headline:</label>
                <input
                  type="text"
                  value={inputHeadline}
                  onChange={(e) => setInputHeadline(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-neutral-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Estimated Downtime:</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={inputDuration}
                    onChange={(e) => setInputDuration(e.target.value)}
                    placeholder="e.g. 30 minutes"
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 text-xs font-mono"
                  />
                  {['15m', '30m', '1h'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setInputDuration(d === '15m' ? '15 minutes' : d === '30m' ? '30 minutes' : '1 hour')}
                      className="px-2 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs pt-1">
              <label className="text-neutral-300 font-semibold">
                Maintenance Explanation for Visitors:
              </label>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                rows={2}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 text-xs leading-relaxed font-mono resize-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition"
              >
                Save Maintenance Settings
              </button>
            </div>
          </div>

          {/* SECTION 3: LIVE BROADCAST TOOL */}
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
                <Radio className="w-4 h-4 text-sky-400" />
                <span>Live System Broadcast Notice</span>
              </div>
              {broadcastMessage && (
                <button
                  onClick={handleClearBroadcast}
                  className="text-[11px] font-mono text-rose-400 hover:text-rose-300 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Active Broadcast</span>
                </button>
              )}
            </div>

            <p className="text-xs text-neutral-400">
              Instantly broadcast an urgent notification banner to all connected players on the live website.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. ⚠️ Maintenance will begin in 10 minutes. Please save your work."
                value={inputBroadcast}
                onChange={(e) => setInputBroadcast(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 text-xs font-mono"
              />
              <button
                onClick={handleSendBroadcast}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-sky-950/40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast</span>
              </button>
            </div>
          </div>

          {/* SECTION 4: SYSTEM TELEMETRY & OPERATIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* System Health Status */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <div className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Cloud & Telemetry Status</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950/80 border border-white/5">
                  <span className="text-neutral-400">Supabase Cloud:</span>
                  <span
                    className={`font-bold ${
                      isSupabaseConfigured ? 'text-emerald-400' : 'text-neutral-500'
                    }`}
                  >
                    {isSupabaseConfigured ? 'CONNECTED' : 'LOCAL FALLBACK'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950/80 border border-white/5">
                  <span className="text-neutral-400">Realtime Channel:</span>
                  <span className="font-bold text-emerald-400">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950/80 border border-white/5">
                  <span className="text-neutral-400">AST Interpreter:</span>
                  <span className="font-bold text-sky-400">ONLINE (v2.0)</span>
                </div>
              </div>
            </div>

            {/* Quick Maintenance Actions */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <div className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-amber-400" />
                <span>Clean & Operations Tools</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handlePurgeStaleRooms}
                  className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center justify-between transition"
                >
                  <span>Purge Finished Rooms</span>
                  <Trash2 className="w-3.5 h-3.5 text-neutral-500" />
                </button>
                <button
                  onClick={handleClearClientCaches}
                  className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center justify-between transition"
                >
                  <span>Flush Local Demo Accounts</span>
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 5: ORGANIZER CONSOLE SEPARATION */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">
                  Competition Organizer Console
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Switch to the Event Host Portal to create rooms, design fields, and manage hackathon contests.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenOrganizer();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 shrink-0"
            >
              <span>Open Organizer Console</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Power className="w-3.5 h-3.5 text-amber-400" />
            <span>Operational Controls Active • Super Admin Privilege</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

