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
  Play,
  Code2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
} from 'lucide-react';
import { WorldLeaderboardEntry, WorldLeaderboardSort } from '../../types/leaderboard';
import { fetchWorldLeaderboard } from '../../services/worldLeaderboardService';
import { useAuthStore } from '../../store/useAuthStore';
import { useGameStore } from '../../store/useGameStore';
import { useEditorStore } from '../../store/useEditorStore';

interface WorldLeaderboardModalProps {
  onClose: () => void;
  onOpenAuth?: () => void;
  onOpenEditor?: () => void;
}

export const WorldLeaderboardModal: React.FC<WorldLeaderboardModalProps> = ({
  onClose,
  onOpenAuth,
  onOpenEditor,
}) => {
  const [activeSection, setActiveSection] = useState<'rankings' | 'missions'>('rankings');
  const [sortBy, setSortBy] = useState<WorldLeaderboardSort>('missions');
  const [entries, setEntries] = useState<WorldLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'all' | 'easy' | 'medium' | 'hard' | 'leetcode'
  >('all');
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const missions = useGameStore((s) => s.missions);
  const updateCode = useEditorStore((s) => s.updateCode);

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
  const topPlayers = entries.slice(0, 3);
  const totalMissionsCount = missions.length || 12;

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

  const getMissionDifficulty = (stage: number) => {
    if (stage <= 3) return { label: 'Easy', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (stage <= 6) return { label: 'Medium', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (stage <= 9) return { label: 'Hard', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    return { label: 'LeetCode / Master', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
  };

  const filteredMissions = missions.filter((m) => {
    if (selectedDifficulty === 'all') return true;
    if (selectedDifficulty === 'easy') return m.stage <= 3;
    if (selectedDifficulty === 'medium') return m.stage >= 4 && m.stage <= 6;
    if (selectedDifficulty === 'hard') return m.stage >= 7 && m.stage <= 9;
    if (selectedDifficulty === 'leetcode') return m.stage >= 10;
    return true;
  });

  const handleSolveMissionInEditor = (starterCode?: string) => {
    if (starterCode) {
      updateCode(starterCode);
    }
    onOpenEditor?.();
    onClose();
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
                  {totalMissionsCount} Career Missions
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Real player rankings & official career missions. (All mock/dummy accounts removed)
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

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 bg-neutral-900/30 border-b border-neutral-800">
          <button
            onClick={() => setActiveSection('rankings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSection === 'rankings'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 border border-transparent'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Agronomists Ranking ({entries.length} Real)</span>
          </button>

          <button
            onClick={() => setActiveSection('missions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSection === 'missions'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 border border-transparent'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Missions Catalog ({missions.length} Available)</span>
          </button>
        </div>

        {/* User Rank Card Banner */}
        {currentUserEntry && (
          <div className="px-6 py-3 bg-gradient-to-r from-emerald-500/15 via-emerald-600/10 to-transparent border-b border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-neutral-950 font-black text-xs flex items-center justify-center font-mono shadow-md">
                #{currentUserEntry.rank ?? '1'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-300">
                    Your World Ranking: #{currentUserEntry.rank ?? '1'}
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
                  <b className="text-emerald-400">{currentUserEntry.missionsSolved}</b>/
                  {totalMissionsCount} Missions Solved
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

        {/* View 1: AGRONOMISTS RANKING */}
        {activeSection === 'rankings' && (
          <>
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
              {/* Podium Highlights */}
              {!searchQuery && topPlayers.length > 0 && (
                <div
                  className={`grid gap-3 ${
                    topPlayers.length === 1
                      ? 'grid-cols-1'
                      : topPlayers.length === 2
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1 sm:grid-cols-3'
                  }`}
                >
                  {topPlayers.map((player) => {
                    const isGold = player.rank === 1;
                    const isSilver = player.rank === 2;

                    return (
                      <div
                        key={player.id}
                        className={`p-4 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                          player.isCurrentUser
                            ? 'ring-2 ring-emerald-500 bg-emerald-950/20 border-emerald-500/40'
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
                            <span>
                              {player.missionsSolved}/{player.totalMissions || totalMissionsCount} Solved
                            </span>
                          </div>
                          <span className="text-amber-400 font-bold">
                            ${player.money.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Leaderboard Table */}
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
                            {player.missionsSolved}/{player.totalMissions || totalMissionsCount}
                          </span>
                          <span className="text-[10px] text-neutral-500 hidden sm:inline">Missions</span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-16 h-1 bg-neutral-800 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-emerald-400"
                            style={{
                              width: `${(player.missionsSolved / (player.totalMissions || totalMissionsCount || 1)) * 100}%`,
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

              {/* Informative Notice for Genuine Users */}
              {entries.length <= 1 && (
                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3 text-xs text-neutral-400">
                  <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-200">
                      Genuine Player Rankings Active
                    </p>
                    <p className="mt-0.5 text-neutral-400 leading-relaxed">
                      All placeholder dummy bots have been completely removed. As you create local accounts or sync with Supabase cloud saves, every real player's mission progress and treasury will dynamically appear on this board.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* View 2: MISSIONS CATALOG */}
        {activeSection === 'missions' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Difficulty Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-neutral-800">
              {(
                [
                  { id: 'all', label: `All Missions (${missions.length})` },
                  { id: 'easy', label: 'Easy (Stages 1-3)' },
                  { id: 'medium', label: 'Medium (Stages 4-6)' },
                  { id: 'hard', label: 'Hard (Stages 7-9)' },
                  { id: 'leetcode', label: 'LeetCode Algorithmic (Stages 10-12)' },
                ] as const
              ).map((chip) => {
                const active = selectedDifficulty === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedDifficulty(chip.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      active
                        ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-950/50'
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Mission Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMissions.map((mission) => {
                const isExpanded = expandedMissionId === mission.id;
                const isCompleted =
                  mission.completed ||
                  Boolean(mission.rewardClaimed) ||
                  mission.objectives.every((o) => o.completed);
                const diff = getMissionDifficulty(mission.stage);

                return (
                  <div
                    key={mission.id}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      {/* Badge Row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diff.color} font-mono uppercase`}
                        >
                          {diff.label}
                        </span>

                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Solved</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-neutral-500 font-mono uppercase">
                            In Progress
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-bold text-sm text-neutral-100 font-mono">
                        {mission.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        {mission.description}
                      </p>

                      {/* Objectives */}
                      <div className="mt-3 space-y-1.5">
                        {mission.objectives.map((obj) => (
                          <div key={obj.id} className="text-xs">
                            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                              <span className="truncate pr-2">{obj.description}</span>
                              <span
                                className={`font-bold ${
                                  obj.completed ? 'text-emerald-400' : 'text-neutral-300'
                                }`}
                              >
                                {obj.current} / {obj.target}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-0.5">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  obj.completed ? 'bg-emerald-400' : 'bg-sky-500'
                                }`}
                                style={{
                                  width: `${Math.min(100, (obj.current / (obj.target || 1)) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Rewards */}
                      <div className="mt-3 flex items-center gap-2 text-xs font-mono">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          +${mission.rewardMoney}
                        </span>
                        <span className="text-sky-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          +{mission.rewardXp} XP
                        </span>
                      </div>

                      {/* Code Preview Drawer */}
                      {isExpanded && mission.starterCode && (
                        <div className="mt-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-48">
                          <pre>{mission.starterCode}</pre>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                      {mission.starterCode && (
                        <button
                          onClick={() =>
                            setExpandedMissionId((prev) => (prev === mission.id ? null : mission.id))
                          }
                          className="text-[11px] font-mono text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition"
                        >
                          <Code2 className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{isExpanded ? 'Hide Code' : 'View Code'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleSolveMissionInEditor(mission.starterCode)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition ml-auto shadow-md shadow-emerald-950/40"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Solve in Editor</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
