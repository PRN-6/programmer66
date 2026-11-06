import React from 'react';
import { Trophy, Shield, Award } from 'lucide-react';
import { useCompetitionStore } from '../../store/useCompetitionStore';

export const CompetitionHUDWidget: React.FC = () => {
  const { currentRoom, currentTeam, isAdmin, setShowAdminModal, setShowScoreboardModal, setShowJoinModal } =
    useCompetitionStore();

  if (!currentRoom) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-500/60 rounded-xl text-amber-300 text-xs font-semibold transition shadow-lg backdrop-blur-md"
          title="Join a live competition event with a room code"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Join Event</span>
        </button>

        <button
          onClick={() => setShowAdminModal(true)}
          className="p-1.5 bg-neutral-950/40 hover:bg-neutral-900/60 border border-white/10 hover:border-amber-500/40 rounded-xl text-neutral-400 hover:text-amber-300 text-xs transition shadow-lg backdrop-blur-md"
          title="Open Admin Competition Console"
        >
          <Shield className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-xl text-xs font-mono backdrop-blur-md shadow-lg">
        <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-bold text-amber-300">{currentRoom.code}</span>
        <span className="text-neutral-600">|</span>
        {currentTeam ? (
          <span className="font-medium text-neutral-200 font-sans">
            {currentTeam.name} <span className="font-mono font-bold text-amber-400">({currentTeam.score} pts)</span>
          </span>
        ) : (
          <span className="text-neutral-400 font-medium font-sans">Host Console</span>
        )}
      </div>

      {isAdmin ? (
        <button
          onClick={() => setShowAdminModal(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs transition shadow-lg"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>
      ) : (
        <button
          onClick={() => setShowScoreboardModal(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-neutral-950/40 hover:bg-neutral-900/60 border border-white/10 hover:border-white/20 text-neutral-200 font-medium rounded-xl text-xs transition shadow-lg backdrop-blur-md"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Leaderboard</span>
        </button>
      )}
    </div>
  );
};
