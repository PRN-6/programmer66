import React, { useEffect } from 'react';
import { X, Trophy, Users, RotateCcw } from 'lucide-react';
import { useCompetitionStore } from '../../store/useCompetitionStore';

export const ScoreboardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentRoom, teams, currentTeam, refreshRoomData } = useCompetitionStore();

  useEffect(() => {
    const timer = setInterval(() => {
      refreshRoomData();
    }, 3000);
    return () => clearInterval(timer);
  }, [refreshRoomData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-100">Live Event Leaderboard</h3>
                {currentRoom && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {currentRoom.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">Real-time team standings and scores</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshRoomData()}
              className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition"
              title="Refresh Standings"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {teams.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Users className="w-8 h-8 mx-auto text-neutral-600" />
              <p className="text-xs text-neutral-400">No teams registered yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {teams.map((team, idx) => {
                const isCurrent = currentTeam?.id === team.id;
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;

                return (
                  <div
                    key={team.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-100'
                        : 'bg-neutral-950 border-neutral-800/80 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 font-mono font-bold text-center text-sm">
                        {isFirst && '🥇'}
                        {isSecond && '🥈'}
                        {isThird && '🥉'}
                        {!isFirst && !isSecond && !isThird && `#${idx + 1}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-neutral-100">{team.name}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded font-semibold uppercase">
                              Your Team
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {team.members.join(', ')} • {team.completedChallenges.length} challenges solved
                        </p>
                      </div>
                    </div>

                    <div className="font-mono font-bold text-sm text-amber-400">
                      {team.score} pts
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
