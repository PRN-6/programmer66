import React, { useState } from 'react';
import { X, Trophy, CheckCircle, ArrowRight, AlertCircle, LogOut } from 'lucide-react';
import { useCompetitionStore } from '../../store/useCompetitionStore';

export const JoinCompetitionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentRoom, currentTeam, joinRoom, leaveRoom, isLoading, error, setError } = useCompetitionStore();

  const [code, setCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('room')?.toUpperCase() || '';
    }
    return '';
  });
  const [teamName, setTeamName] = useState('');
  const [membersInput, setMembersInput] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !teamName.trim()) return;

    setError(null);
    const members = membersInput
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    try {
      await joinRoom(code.trim().toUpperCase(), teamName.trim(), members.length > 0 ? members : [teamName]);
      onClose();
    } catch {
      // Handled in store error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">Join Competition Event</h3>
              <p className="text-xs text-neutral-400">Compete with other teams in real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {currentTeam && currentRoom ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Currently Competing!</span>
                </div>
                <div className="text-xs text-neutral-300">
                  <p><strong>Room:</strong> {currentRoom.title} ({currentRoom.code})</p>
                  <p><strong>Team:</strong> {currentTeam.name}</p>
                  <p><strong>Current Score:</strong> {currentTeam.score} pts</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => leaveRoom()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-rose-300 font-medium text-xs rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave Room</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl transition"
                >
                  Continue Competing
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Room Code (from Admin)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PROG-8492"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 font-mono text-sm tracking-wider text-amber-400 uppercase placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Code Harvesters"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Team Members (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex, Sam, Taylor"
                  value={membersInput}
                  onChange={(e) => setMembersInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !code.trim() || !teamName.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
              >
                <span>{isLoading ? 'Connecting to Room...' : 'Join Event & Enter Arena'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
