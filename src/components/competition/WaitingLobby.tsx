import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  Copy,
  Check,
  LogOut,
  Trophy,
  Sparkles,
  Radio,
  Code2,
  Shield,
  BookOpen,
} from 'lucide-react';
import { useCompetitionStore } from '../../store/useCompetitionStore';

interface WaitingLobbyProps {
  onOpenScoreboard?: () => void;
  onOpenDocs?: () => void;
}

export const WaitingLobby: React.FC<WaitingLobbyProps> = ({
  onOpenScoreboard,
  onOpenDocs,
}) => {
  const currentRoom = useCompetitionStore((state) => state.currentRoom);
  const currentTeam = useCompetitionStore((state) => state.currentTeam);
  const teams = useCompetitionStore((state) => state.teams);
  const leaveRoom = useCompetitionStore((state) => state.leaveRoom);
  const refreshRoomData = useCompetitionStore((state) => state.refreshRoomData);

  const [copiedCode, setCopiedCode] = useState(false);

  // High-reliability polling fallback to keep lobby teams and room status fresh
  useEffect(() => {
    if (!currentRoom) return;

    const interval = setInterval(() => {
      refreshRoomData();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [currentRoom, refreshRoomData]);

  if (!currentRoom || !currentTeam) return null;

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentRoom.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Top Header Bar */}
        <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {currentRoom.title}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Waiting Lobby
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Multiplayer Agricultural Drone Programming Tournament
              </p>
            </div>
          </div>

          {/* Room Code Badge & Copy */}
          <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
            <div className="text-left">
              <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-500 block">
                Room Code
              </span>
              <span className="font-mono text-sm font-bold text-amber-400 tracking-wider">
                {currentRoom.code}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Copy Room Code"
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Waiting Pulse & Team Overview */}
          <div className="md:col-span-7 flex flex-col space-y-5">
            {/* Main Waiting Card */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-5 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

              {/* Pulsing Radar Ring Animation */}
              <div className="relative flex items-center justify-center w-20 h-20 my-2">
                <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping duration-1000" />
                <div className="absolute inset-2 rounded-full bg-amber-500/20 animate-pulse" />
                <div className="relative w-12 h-12 rounded-full bg-neutral-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner shadow-amber-500/20">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-white mt-1">
                Waiting for Host to Start the Event...
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-md">
                The competition will launch automatically on your screen the moment the organizer clicks <b>Start Competition</b>. Please keep this tab open!
              </p>

              <div className="mt-4 flex items-center gap-2 text-[11px] text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span>Realtime WebSocket connected. Auto-advancing on start signal.</span>
              </div>
            </div>

            {/* Your Registered Team Card */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 flex flex-col space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-neutral-300">Your Registered Team</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Ready on Standby
                </span>
              </div>

              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800/80 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{currentTeam.name}</h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {currentTeam.members.map((member, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-neutral-800/80 text-neutral-300 px-2 py-0.5 rounded"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Practice Tips while waiting */}
            <div className="bg-neutral-900/30 border border-neutral-800/60 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-neutral-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Commands Cheat Sheet (Prep while waiting):</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-neutral-400">
                <div className="bg-neutral-950/80 p-2 rounded border border-neutral-900">
                  <code className="text-emerald-400">fly_to(x, y)</code>
                  <p className="text-[10px] text-neutral-500">Navigate drone to coordinate</p>
                </div>
                <div className="bg-neutral-950/80 p-2 rounded border border-neutral-900">
                  <code className="text-sky-400">plant(x, y, "carrot")</code>
                  <p className="text-[10px] text-neutral-500">Plant seed on plot</p>
                </div>
                <div className="bg-neutral-950/80 p-2 rounded border border-neutral-900">
                  <code className="text-amber-400">water(x, y)</code>
                  <p className="text-[10px] text-neutral-500">Hydrate dry soil beds</p>
                </div>
                <div className="bg-neutral-950/80 p-2 rounded border border-neutral-900">
                  <code className="text-purple-400">harvest(x, y)</code>
                  <p className="text-[10px] text-neutral-500">Reap mature crops</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Connected Teams & Tournament Details */}
          <div className="md:col-span-5 flex flex-col space-y-4">
            {/* Connected Teams List */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">
                    Connected Teams ({teams.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">Live roster</span>
              </div>

              <div className="mt-3 flex-1 overflow-y-auto max-h-64 space-y-2 pr-1">
                {teams.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">
                    No other teams have connected yet.
                  </div>
                ) : (
                  teams.map((team, idx) => {
                    const isYou = team.id === currentTeam.id;
                    return (
                      <div
                        key={team.id || idx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                          isYou
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                            : 'bg-neutral-950 border-neutral-800/80 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center font-mono text-[10px] text-neutral-400 shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 truncate">
                            <span className="font-semibold block truncate">
                              {team.name}
                              {isYou && (
                                <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                  YOU
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-neutral-500 block truncate">
                              {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                        </div>

                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" title="Ready" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Event Format & Included Challenges */}
            <div className="bg-neutral-900/40 border border-neutral-800/70 rounded-xl p-3 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <span>Event Problem Set</span>
                <span className="text-amber-400 font-mono">
                  {currentRoom.challenges?.reduce((acc, c) => acc + c.points, 0) || 0} Total Pts
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-neutral-950 p-2 rounded border border-neutral-800/60">
                  <span className="text-neutral-500 block text-[10px]">Problems</span>
                  <span className="font-bold text-white">
                    {currentRoom.challenges?.length || 0} Questions
                  </span>
                </div>
                <div className="bg-neutral-950 p-2 rounded border border-neutral-800/60">
                  <span className="text-neutral-500 block text-[10px]">Format</span>
                  <span className="font-bold text-amber-400">Free Choice Order</span>
                </div>
              </div>
              {/* Question list pills */}
              <div className="space-y-1.5 pt-1 max-h-36 overflow-y-auto pr-1">
                {currentRoom.challenges?.map((chal) => (
                  <div
                    key={chal.id}
                    className="p-1.5 rounded bg-neutral-950/80 border border-neutral-800/70 flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-neutral-300 font-medium truncate">
                        Q{chal.level}: {chal.title.replace(/^Level\s*\d+:\s*/i, '')}
                      </span>
                      {chal.difficulty && (
                        <span
                          className={`text-[9px] font-semibold uppercase px-1 py-0.2 rounded shrink-0 bg-neutral-900 border border-neutral-800 ${
                            chal.difficulty === 'easy'
                              ? 'text-emerald-400'
                              : chal.difficulty === 'medium'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {chal.difficulty}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 shrink-0 ml-1">
                      +{chal.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-neutral-900/90 border-t border-neutral-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={leaveRoom}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-400 px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-red-500/40 hover:bg-red-500/10 transition"
            title="Leave this competition room"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Room</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenDocs && (
              <button
                onClick={onOpenDocs}
                className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                <span>API Docs</span>
              </button>
            )}

            {onOpenScoreboard && (
              <button
                onClick={onOpenScoreboard}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>View Scoreboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingLobby;

