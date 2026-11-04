import React from 'react';
import { Trophy, Shield, Award } from 'lucide-react';
import { useCompetitionStore } from '../../store/useCompetitionStore';

export const CompetitionHUDWidget: React.FC = () => {
  const { currentRoom, currentTeam, isAdmin, activeChallenge, setShowAdminModal, setShowScoreboardModal, setShowJoinModal } =
    useCompetitionStore();

  if (!currentRoom) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 rounded-xl text-amber-300 text-xs font-semibold transition"
          title="Join a live competition event with a room code"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Join Event</span>
        </button>

        <button
          onClick={() => setShowAdminModal(true)}
          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-xl text-neutral-400 hover:text-neutral-200 text-xs transition"
          title="Open Admin Competition Console"
        >
          <Shield className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs">
        <Trophy className="w-3.5 h-3.5 text-amber-400" />
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-amber-300">{currentRoom.code}</span>
          <span className="text-neutral-500">|</span>
          {currentTeam ? (
            <span className="font-semibold text-neutral-200">
              {currentTeam.name} <span className="text-amber-400">({currentTeam.score} pts)</span>
            </span>
          ) : (
            <span className="text-neutral-400 font-medium">Host / Spectator</span>
          )}
        </div>

        {activeChallenge && (
          <span className="hidden lg:inline-block px-1.5 py-0.5 bg-neutral-900/80 rounded text-[11px] text-neutral-300 border border-neutral-800">
            {activeChallenge.title}
          </span>
        )}
      </div>

      {/* Admin quick toggle */}
      {isAdmin ? (
        <button
          onClick={() => setShowAdminModal(true)}
          className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs transition shadow-sm"
        >
          <Shield className="w-3 h-3" />
          <span>Admin</span>
        </button>
      ) : (
        <button
          onClick={() => setShowScoreboardModal(true)}
          className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-medium rounded-xl text-xs transition"
        >
          <Award className="w-3 h-3 text-amber-400" />
          <span>Leaderboard</span>
        </button>
      )}
    </div>
  );
};
