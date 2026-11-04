import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Target,
  CheckCircle2,
  Circle,
  Coins,
  Award,
  Code2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useEditorStore } from '../../store/useEditorStore';

interface MissionsModalProps {
  onClose: () => void;
  onOpenEditor: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ onClose, onOpenEditor }) => {
  const { missions, claimMissionReward } = useGameStore();
  const { addTab, updateCode, tabs } = useEditorStore();
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});

  const toggleHint = (id: string) => {
    setExpandedHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLoadStarterCode = (mission: (typeof missions)[0]) => {
    if (!mission.starterCode) return;

    const tabName = `${mission.id}.py`;
    const existing = tabs.find((t) => t.name === tabName);
    if (existing) {
      updateCode(mission.starterCode);
    } else {
      addTab(tabName, mission.starterCode);
    }

    onOpenEditor();
    onClose();
  };

  const handleClaim = (missionId: string) => {
    claimMissionReward(missionId);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between bg-neutral-900 px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Missions & Automation Challenges</h2>
              <p className="text-xs text-neutral-400">Learn farming programming step-by-step</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missions List */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {missions.map((mission) => {
            const isCompleted = mission.completed;

            return (
              <div
                key={mission.id}
                className={`border rounded-2xl p-4 transition ${
                  isCompleted
                    ? 'bg-neutral-900/90 border-neutral-700'
                    : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Title & Stage */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-700">
                        {mission.stageName}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-neutral-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-300" /> Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-neutral-100 mt-1">{mission.title}</h3>
                  </div>

                  {/* Rewards Badge */}
                  <div className="flex items-center gap-2 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 text-xs font-semibold">
                    <span className="flex items-center gap-1 text-neutral-300">
                      <Coins className="w-3.5 h-3.5 text-neutral-400" /> +${mission.rewardMoney}
                    </span>
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Award className="w-3.5 h-3.5 text-neutral-500" /> +{mission.rewardXp} XP
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  {mission.description}
                </p>

                {/* Objectives */}
                <div className="mt-3 space-y-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800/80">
                  {mission.objectives.map((obj) => (
                    <div key={obj.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-neutral-200">
                          {obj.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-300" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-neutral-600" />
                          )}
                          <span className={obj.completed ? 'line-through text-neutral-500' : ''}>
                            {obj.description}
                          </span>
                        </span>
                        <span className="font-mono text-neutral-400 text-[11px]">
                          {obj.current} / {obj.target}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                        <div
                          className="h-full bg-neutral-400 transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (obj.current / obj.target) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions & Hints */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    {mission.starterCode && (
                      <button
                        onClick={() => handleLoadStarterCode(mission)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-semibold transition"
                      >
                        <Code2 className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Load Starter Code</span>
                      </button>
                    )}

                    {mission.hints.length > 0 && (
                      <button
                        onClick={() => toggleHint(mission.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Hints</span>
                        {expandedHints[mission.id] ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {isCompleted && (
                    <button
                      onClick={() => handleClaim(mission.id)}
                      className="px-4 py-1.5 bg-neutral-200 hover:bg-white text-neutral-950 font-bold rounded-lg text-xs shadow-md transition"
                    >
                      Claim Rewards
                    </button>
                  )}
                </div>

                {/* Expandable Hints */}
                {expandedHints[mission.id] && (
                  <div className="mt-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300 space-y-1.5">
                    {mission.hints.map((hint, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-neutral-400">•</span>
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
