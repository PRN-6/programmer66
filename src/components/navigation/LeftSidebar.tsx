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
  Maximize2,
  X,
  Droplets,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { soundManager } from '../../audio/soundEffects';
import { CROPS } from '../../game/simulation/cropConfig';

export interface LeftSidebarProps {
  onOpenMarket: () => void;
  onOpenMissionsModal: () => void;
  onToggleMissionsTracker: () => void;
  isMissionsTrackerOpen: boolean;
  onOpenRobots: () => void;
  onOpenWorldLeaderboard: () => void;
  onOpenDocs: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onOpenMarket,
  onOpenMissionsModal,
  onToggleMissionsTracker,
  isMissionsTrackerOpen,
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
  const selectedTileCoord = useGameStore((s) => s.selectedTileCoord);
  const clearSelection = useGameStore((s) => s.clearSelection);

  // Read selected tile details if present
  const selectedTileKey = selectedTileCoord
    ? `${selectedTileCoord.x}_${selectedTileCoord.y}`
    : null;
  const selectedTile = useGameStore((s) =>
    selectedTileKey ? s.tiles[selectedTileKey] : null
  );

  const selectedCropConfig = selectedTile?.crop ? CROPS[selectedTile.crop] : null;

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
      iconBg: isMissionsTrackerOpen
        ? 'bg-emerald-500/25 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/40'
        : 'bg-emerald-500/15 border-emerald-500/30',
      isActive: isMissionsTrackerOpen,
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
        onToggleMissionsTracker();
      },
      onPopOut: () => {
        soundManager.playCoin();
        onOpenMissionsModal();
      },
    },
    {
      id: 'market',
      label: 'Market',
      subtitle: 'Seeds & Supplies',
      icon: ShoppingBag,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      isActive: false,
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
      isActive: false,
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
      isActive: false,
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
      isActive: false,
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
              } ${
                item.isActive
                  ? 'bg-neutral-900/90 border border-white/15 shadow-sm'
                  : 'hover:bg-neutral-900/80 border border-transparent hover:border-white/10'
              }`}
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
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {item.onPopOut && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          item.onPopOut?.();
                        }}
                        className="text-neutral-500 hover:text-white p-1 rounded-md hover:bg-neutral-800 transition"
                        title="Open full dialog"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    )}
                    {item.badge}
                  </div>
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

        {/* Selected Soil Plot Item (Shown seamlessly inside the dock whenever a plot is selected!) */}
        {selectedTile && (
          <div className="pt-1 mt-0.5 border-t border-white/10">
            <div
              className={`group relative flex items-center rounded-xl transition-all duration-150 text-left ${
                isCollapsed
                  ? 'p-2 justify-center w-full'
                  : 'px-2.5 py-2 w-full gap-2.5'
              } bg-sky-500/15 border border-sky-500/30 text-sky-200`}
              title={
                isCollapsed
                  ? `Plot (${selectedTile.x}, ${selectedTile.y}) • ${
                      selectedCropConfig?.name || 'Empty'
                    } • 💧${Math.round(selectedTile.moisture)}% • ✦${Math.round(selectedTile.nutrients)}%`
                  : undefined
              }
            >
              {/* Plot Coordinates Icon Badge */}
              <div className="relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border bg-sky-500/20 border-sky-500/40 text-sky-300 font-mono text-[10px] font-bold shadow-sm group-hover:scale-105 transition">
                <span>
                  {selectedTile.x},{selectedTile.y}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-400 shadow-sm" />
              </div>

              {/* Text in Expanded Mode */}
              {!isCollapsed && (
                <div className="flex items-center justify-between min-w-0 flex-1">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-neutral-100 leading-tight truncate">
                      Plot ({selectedTile.x}, {selectedTile.y})
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate font-sans flex items-center gap-1 mt-0.5">
                      <span className="text-neutral-300 font-medium">{selectedCropConfig?.name || 'Empty Bed'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-sky-400 font-mono">
                        <Droplets className="w-2.5 h-2.5" />
                        {Math.round(selectedTile.moisture)}%
                      </span>
                      <span>•</span>
                      <span className="text-amber-400 font-mono">
                        ✦{Math.round(selectedTile.nutrients)}%
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelection();
                    }}
                    className="text-neutral-500 hover:text-white p-1 rounded-md hover:bg-neutral-800 transition"
                    title="Deselect plot"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Hover Floating Tooltip in Collapsed Mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-neutral-900/95 border border-neutral-700/80 rounded-xl text-xs font-semibold text-white whitespace-nowrap shadow-2xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  <span>
                    Plot ({selectedTile.x}, {selectedTile.y})
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {selectedCropConfig?.name || 'Empty'} • 💧
                    {Math.round(selectedTile.moisture)}% • ✦
                    {Math.round(selectedTile.nutrients)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
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
