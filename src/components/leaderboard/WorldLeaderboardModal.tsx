import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  Globe,
  Trophy,
  Target,
  Coins,
  Sparkles,
  RefreshCw,
  Search,
  UserCheck,
  Sprout,
} from 'lucide-react';
import { WorldLeaderboardEntry, WorldLeaderboardSort } from '../../types/leaderboard';
import { fetchWorldLeaderboard } from '../../services/worldLeaderboardService';
import { useAuthStore } from '../../store/useAuthStore';

interface WorldLeaderboardModalProps {
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const WorldLeaderboardModal: React.FC<WorldLeaderboardModalProps> = ({
  onClose,
  onOpenAuth,
}) => {
  const [sortBy, setSortBy] = useState<WorldLeaderboardSort>('missions');
  const [entries, setEntries] = useState<WorldLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAuthStore((s) => s.user);

  const loadData = useCallback((sort: WorldLeaderboardSort) => {
    setIsLoading(true);
    fetchWorldLeaderboard(sort)
      .then((data) => {
        setEntries(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    fetchWorldLeaderboard(sortBy).then((data) => {
      if (active) {
        setEntries(data);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [sortBy]);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const filteredEntries = entries.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.displayName.toLowerCase().includes(q) ||
      (e.username && e.username.toLowerCase().includes(q)) ||
      e.farmerTitle.toLowerCase().includes(q)
    );
  });

  const currentUserEntry = entries.find((e) => e.isCurrentUser);
  const topThree = entries.slice(0, 3);

  const getRankBadge = (rank?: number) => {
    if (rank === 1) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 font-extrabold text-xs flex items-center justify-center shadow-md shadow-amber-400/40">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-6 h-6 rounded-full bg-slate-300 text-neutral-950 font-extrabold text-xs flex items-center justify-center shadow-md shadow-slate-300/40">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-extrabold text-xs flex items-center justify-center shadow-md shadow-amber-700/40">
          🥉
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-400 font-mono text-xs font-bold flex items-center justify-center">
        {rank ?? '-'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-lg shadow-sky-950/50">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">World Leaderboard</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono uppercase">
                  Global Missions Rank
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Worldwide rankings of registered agronomists solving autonomous farm missions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(sortBy)}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Rank Card Banner */}
        {currentUserEntry && (
          <div className="px-6 py-3 bg-gradient-to-r from-emerald-500/15 via-emerald-600/10 to-transparent border-b border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-neutral-950 font-black text-xs flex items-center justify-center font-mono shadow-md">
                #{currentUserEntry.rank ?? '-'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-300">
                    Your World Ranking: #{currentUserEntry.rank ?? '-'}
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-mono">
                    YOU
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                  <span>{currentUserEntry.farmerTitle}</span>
                  <span>•</span>
                  <span>Level {currentUserEntry.level}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-mono">${currentUserEntry.money}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950/80 border border-emerald-500/30 text-xs">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-neutral-200">
                  <b className="text-emerald-400">{currentUserEntry.missionsSolved}</b>/{currentUserEntry.totalMissions} Missions Solved
                </span>
              </div>

              {!user && onOpenAuth && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-neutral-950 text-xs font-bold transition flex items-center gap-1 shadow-md shadow-sky-950/60"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Claim Account</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sort & Search Toolbar */}
        <div className="p-4 px-6 border-b border-neutral-800/80 bg-neutral-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Sorting Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900/80 rounded-xl border border-neutral-800 flex-wrap">
            {(
              [
                { id: 'missions', label: 'Missions Solved', icon: Target },
                { id: 'level', label: 'Level & XP', icon: Sparkles },
                { id: 'money', label: 'Treasury ($)', icon: Coins },
                { id: 'harvested', label: 'Crops Harvested', icon: Sprout },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = sortBy === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSortBy(tab.id)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                    active
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agronomists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top 3 Podium Highlights (When no search active) */}
          {!searchQuery && topThree.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topThree.map((player) => {
                const isGold = player.rank === 1;
                const isSilver = player.rank === 2;

                return (
                  <div
                    key={player.id}
                    className={`p-4 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                      player.isCurrentUser
                        ? 'ring-2 ring-emerald-500 bg-emerald-950/20'
                        : isGold
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-950/30'
                        : isSilver
                        ? 'bg-slate-500/10 border-slate-400/40 shadow-lg shadow-slate-950/30'
                        : 'bg-amber-800/10 border-amber-700/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getRankBadge(player.rank)}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-neutral-100 truncate">
                              {player.displayName}
                            </span>
                            {player.isCurrentUser && (
                              <span className="text-[9px] bg-emerald-900 text-emerald-300 font-bold px-1 rounded font-mono">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 block truncate">
                            {player.farmerTitle}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 font-bold">
                        {player.countryCode}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Target className="w-3 h-3" />
                        <span>{player.missionsSolved}/6 Solved</span>
                      </div>
                      <span className="text-amber-400 font-bold">${player.money.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-950 shadow-md">
            <div className="grid grid-cols-12 px-4 py-2.5 bg-neutral-900 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800 font-mono">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5 sm:col-span-4">Agronomist</div>
              <div className="col-span-3 sm:col-span-3 text-center flex items-center justify-center gap-1">
                <Target className="w-3 h-3 text-emerald-400" />
                <span>Missions</span>
              </div>
              <div className="col-span-3 sm:col-span-2 text-center hidden sm:block">Level & XP</div>
              <div className="col-span-3 sm:col-span-2 text-right">Treasury</div>
            </div>

            <div className="divide-y divide-neutral-900 max-h-96 overflow-y-auto">
              {filteredEntries.map((player) => (
                <div
                  key={player.id}
                  className={`grid grid-cols-12 px-4 py-3 items-center text-xs transition ${
                    player.isCurrentUser
                      ? 'bg-emerald-500/10 font-semibold border-l-4 border-l-emerald-500'
                      : 'hover:bg-neutral-900/60 text-neutral-300'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center justify-center">
                    {getRankBadge(player.rank)}
                  </div>

                  {/* Player Name & Title */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-bold truncate ${
                            player.isCurrentUser ? 'text-emerald-300' : 'text-neutral-100'
                          }`}
                        >
                          {player.displayName}
                        </span>
                        {player.isCurrentUser && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold px-1 rounded font-mono">
                            YOU
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-500 font-mono hidden md:inline">
                          [{player.countryCode}]
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block truncate">
                        {player.farmerTitle}
                      </span>
                    </div>
                  </div>

                  {/* Missions Solved */}
                  <div className="col-span-3 sm:col-span-3 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs font-mono text-emerald-400">
                        {player.missionsSolved}/{player.totalMissions}
                      </span>
                      <span className="text-[10px] text-neutral-500 hidden sm:inline">Missions</span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-16 h-1 bg-neutral-800 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-emerald-400"
                        style={{
                          width: `${(player.missionsSolved / (player.totalMissions || 6)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Level & XP */}
                  <div className="col-span-3 sm:col-span-2 text-center hidden sm:block font-mono">
                    <div className="text-xs font-bold text-neutral-200">Lv {player.level}</div>
                    <div className="text-[10px] text-neutral-500">{player.xp} XP</div>
                  </div>

                  {/* Treasury */}
                  <div className="col-span-3 sm:col-span-2 text-right font-mono">
                    <div className="font-bold text-amber-400">
                      ${player.money.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      {player.cropsHarvested} harvested
                    </div>
                  </div>
                </div>
              ))}

              {filteredEntries.length === 0 && (
                <div className="p-8 text-center text-neutral-500 text-xs">
                  No agronomists matched "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Updated live • Solve career missions to climb higher</span>
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
