import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Target,
  CheckCircle2,
  Circle,
  Code2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useEditorStore } from '../../store/useEditorStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { Mission } from '../../types/game';

interface MissionsTrackerWidgetProps {
  onOpenEditor?: () => void;
  onOpenFullModal?: () => void;
}

export const MissionsTrackerWidget: React.FC<MissionsTrackerWidgetProps> = ({
  onOpenEditor,
  onOpenFullModal,
}) => {
  const currentRoom = useCompetitionStore((state) => state.currentRoom);
  const missions = useGameStore((state) => state.missions);
  const claimMissionReward = useGameStore((state) => state.claimMissionReward);
  const { addTab, updateCode, tabs } = useEditorStore();

  const [isMinimized, setIsMinimized] = useState(true);

  // Hidden in competition rooms (competition mode has its own dedicated tournament round challenges)
  if (currentRoom) return null;

  const activeMissions = missions.filter((m) => !m.completed || !m.rewardClaimed);
  const hasClaimableReward = activeMissions.some((m) =>
    m.objectives.every((obj) => obj.completed) && !m.rewardClaimed
  );

  const handleClaim = (missionId: string) => {
    claimMissionReward(missionId);
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleLoadStarterCode = (mission: Mission) => {
    if (!mission.starterCode) return;

    const tabName = `${mission.id}.py`;
    const existing = tabs.find((t) => t.name === tabName);
    if (existing) {
      updateCode(mission.starterCode);
    } else {
      addTab(tabName, mission.starterCode);
    }

    if (onOpenEditor) {
      onOpenEditor();
    }
  };

  // Minimized state docked to the left edge
  if (isMinimized) {
    return (
      <div className="pointer-events-auto animate-in slide-in-from-left duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-neutral-950/95 hover:bg-neutral-900 border-y border-r border-neutral-800 text-neutral-200 pl-3 pr-2.5 py-2 rounded-r-xl shadow-2xl backdrop-blur-md group transition"
          title="Click to expand Active Missions tracker"
        >
          <div className="w-5 h-5 rounded-md bg-neutral-800 border border-neutral-700 text-emerald-400 flex items-center justify-center">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition flex items-center gap-1.5">
              <span>Missions</span>
              {hasClaimableReward && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {hasClaimableReward
                ? '🎉 Claim Reward!'
                : activeMissions.length > 0
                ? `${activeMissions.length} in progress`
                : 'All complete!'}
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition ml-0.5" />
        </button>
      </div>
    );
  }

  // Expanded state
  return (
    <div className="pointer-events-auto w-72 bg-neutral-950/95 backdrop-blur-md rounded-2xl border border-neutral-800 shadow-2xl p-3.5 text-neutral-100 flex flex-col gap-2.5 animate-in fade-in duration-150 ml-4 max-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-neutral-800 border border-neutral-700 text-emerald-400 flex items-center justify-center">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Active Missions</span>
              <span className="text-[10px] bg-neutral-800 px-1.5 py-0.2 rounded font-mono text-neutral-300">
                {activeMissions.length}
              </span>
            </h3>
            <span className="text-[10px] text-neutral-400 leading-tight">
              Progression objectives
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenFullModal && (
            <button
              onClick={onOpenFullModal}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
              title="Open full Missions & Challenges dialog"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsMinimized(true)}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
            title="Minimize to left side"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Missions List */}
      <div className="flex flex-col gap-2.5 overflow-y-auto pr-0.5 max-h-[280px]">
        {activeMissions.length === 0 ? (
          <div className="text-center py-4 text-xs text-neutral-400 space-y-1">
            <Sparkles className="w-5 h-5 text-amber-400 mx-auto" />
            <p className="font-bold text-neutral-200">All Missions Completed!</p>
            <p className="text-[11px] text-neutral-500">
              You have mastered every farming automation challenge.
            </p>
          </div>
        ) : (
          activeMissions.slice(0, 2).map((mission) => {
            const isReadyToClaim = mission.objectives.every((obj) => obj.completed) && !mission.rewardClaimed;

            return (
              <div
                key={mission.id}
                className="bg-neutral-900/90 border border-neutral-800/90 rounded-xl p-2.5 space-y-2"
              >
                {/* Title & Rewards */}
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-100 leading-tight">
                      {mission.title}
                    </h4>
                    <span className="text-[10px] text-neutral-400">
                      Reward: +${mission.rewardMoney} • +{mission.rewardXp} XP
                    </span>
                  </div>
                  {isReadyToClaim && (
                    <span className="shrink-0 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.5 rounded-full">
                      Ready!
                    </span>
                  )}
                </div>

                {/* Objectives */}
                <div className="space-y-1.5">
                  {mission.objectives.map((obj) => {
                    const progress = Math.min(100, (obj.current / obj.target) * 100);

                    return (
                      <div key={obj.id} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-neutral-300">
                            {obj.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                            )}
                            <span className="line-clamp-1">{obj.description}</span>
                          </span>
                          <span className="font-mono text-[10px] text-neutral-400 shrink-0 ml-1">
                            {obj.current}/{obj.target}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/60">
                          <div
                            className={`h-full transition-all duration-300 ${
                              obj.completed ? 'bg-emerald-400' : 'bg-neutral-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action button */}
                <div className="pt-0.5">
                  {isReadyToClaim ? (
                    <button
                      onClick={() => handleClaim(mission.id)}
                      className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center justify-center gap-1.5 animate-pulse"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Claim (+${mission.rewardMoney}, +{mission.rewardXp} XP)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLoadStarterCode(mission)}
                      className="w-full py-1 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-medium text-[11px] rounded-lg border border-neutral-700 transition flex items-center justify-center gap-1.5"
                    >
                      <Code2 className="w-3 h-3 text-emerald-400" />
                      <span>Code Solution in Editor</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

