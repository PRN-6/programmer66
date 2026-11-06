import React, { useState } from 'react';
import {
  ShoppingBag,
  Target,
  Bot,
  Globe,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { soundManager } from '../../audio/soundEffects';

export interface LeftSidebarProps {
  onOpenMarket: () => void;
  onOpenMissions: () => void;
  onOpenRobots: () => void;
  onOpenWorldLeaderboard: () => void;
  onOpenDocs: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onOpenMarket,
  onOpenMissions,
  onOpenRobots,
  onOpenWorldLeaderboard,
  onOpenDocs,
}) => {
  const currentRoom = useCompetitionStore((state) => state.currentRoom);
  const uncompletedMissions = useGameStore(
    (s) => s.missions.filter((m) => !m.rewardClaimed).length
  );
  const hasClaimableReward = useGameStore((s) =>
    s.missions.some((m) => m.objectives.every((o) => o.completed) && !m.rewardClaimed)
  );
  const robotCount = useGameStore((s) => s.robots.length);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('programmer66_left_sidebar_collapsed') === 'true';
    }
    return false;
  });

  // Hidden during active competition to keep tournament UI focused
  if (currentRoom) return null;

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('programmer66_left_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  const navItems = [
    {
      id: 'missions',
      label: 'Missions',
      subtitle: hasClaimableReward
        ? '🎉 Claim Reward!'
        : `${uncompletedMissions} Remaining`,
      icon: Target,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      hasAlert: hasClaimableReward || uncompletedMissions > 0,
      badge: hasClaimableReward ? (
        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold animate-pulse">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Reward</span>
        </span>
      ) : uncompletedMissions > 0 ? (
        <span className="px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold">
          {uncompletedMissions}
        </span>
      ) : null,
      onClick: () => {
        soundManager.playCoin();
        onOpenMissions();
      },
    },
    {
      id: 'market',
      label: 'Market',
      subtitle: 'Seeds & Supplies',
      icon: ShoppingBag,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      hasAlert: false,
      badge: null,
      onClick: () => {
        soundManager.playCoin();
        onOpenMarket();
      },
    },
    {
      id: 'robots',
      label: 'Robots',
      subtitle: `${robotCount} Drone${robotCount === 1 ? '' : 's'} Fleet`,
      icon: Bot,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/15 border-purple-500/30',
      hasAlert: false,
      badge: (
        <span className="px-1.5 py-0.5 rounded-full bg-neutral-800 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
          {robotCount}
        </span>
      ),
      onClick: () => {
        soundManager.playRobotMove();
        onOpenRobots();
      },
    },
    {
      id: 'leaderboard',
      label: 'World Rank',
      subtitle: 'Global Standings',
      icon: Globe,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/15 border-sky-500/30',
      hasAlert: false,
      badge: null,
      onClick: () => {
        soundManager.playSuccess();
        onOpenWorldLeaderboard();
      },
    },
    {
      id: 'docs',
      label: 'API Docs',
      subtitle: 'Python Reference',
      icon: BookOpen,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30',
      hasAlert: false,
      badge: null,
      onClick: () => {
        soundManager.playSuccess();
        onOpenDocs();
      },
    },
  ];

  return (
    <nav
      className={`pointer-events-auto bg-neutral-950/80 hover:bg-neutral-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 transition-all duration-300 animate-in fade-in slide-in-from-left-2 ${
        isCollapsed ? 'w-14' : 'w-48'
      }`}
      aria-label="Farm Management Navigation"
    >
      {/* Navigation Buttons */}
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`group relative flex items-center rounded-xl transition-all duration-150 text-left ${
                isCollapsed
                  ? 'p-2 justify-center w-full'
                  : 'px-2.5 py-2 w-full gap-2.5'
              } hover:bg-neutral-900/80 border border-transparent hover:border-white/10`}
              title={isCollapsed ? `${item.label} • ${item.subtitle}` : undefined}
            >
              {/* Icon Badge */}
              <div
                className={`relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition group-hover:scale-105 shadow-sm ${item.iconBg} ${item.iconColor}`}
              >
                <Icon className="w-4 h-4" />
                {/* Ping alert indicator in collapsed mode */}
                {isCollapsed && item.hasAlert && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
              </div>

              {/* Text Label & Subtitle (Expanded mode) */}
              {!isCollapsed && (
                <div className="flex items-center justify-between min-w-0 flex-1">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-neutral-100 group-hover:text-white leading-tight truncate">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-neutral-400 group-hover:text-neutral-300 truncate font-sans">
                      {item.subtitle}
                    </span>
                  </div>
                  {item.badge && <div className="ml-1.5 shrink-0">{item.badge}</div>}
                </div>
              )}

              {/* Hover Floating Tooltip in Collapsed Mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-neutral-900/95 border border-neutral-700/80 rounded-xl text-xs font-semibold text-white whitespace-nowrap shadow-2xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  <span>{item.label}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {item.subtitle}
                  </span>
                  {item.badge}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={toggleCollapse}
        className={`flex items-center p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/70 transition mt-0.5 border-t border-white/5 ${
          isCollapsed ? 'justify-center w-full' : 'px-2.5 justify-between w-full'
        }`}
        title={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
      >
        {!isCollapsed && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Collapse
          </span>
        )}
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </nav>
  );
};
