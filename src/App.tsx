import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import confetti from 'canvas-confetti';
import { FarmCanvas } from './game/world/FarmCanvas';
import { TopHUD } from './components/hud/TopHUD';
import { LeftSidebar } from './components/navigation/LeftSidebar';
import { FarmToolbar } from './components/game/FarmToolbar';
import { MissionsTrackerCard } from './components/missions/MissionsTrackerWidget';
import { CodeEditorPanel } from './components/editor/CodeEditorPanel';
import { useEditorStore } from './store/useEditorStore';
import { useGameStore } from './store/useGameStore';
import { useCompetitionStore } from './store/useCompetitionStore';
import { useAuthStore } from './store/useAuthStore';
import { CompetitionService } from './services/competitionService';
import { soundManager } from './audio/soundEffects';

import { MaintenanceScreen } from './components/maintenance/MaintenanceScreen';
import { useMaintenanceStore } from './store/useMaintenanceStore';
import { X, Wrench } from 'lucide-react';

// Lazy-loaded modal components to reduce initial page bundle
const MarketplaceModal = lazy(() =>
  import('./components/marketplace/MarketplaceModal').then((m) => ({ default: m.MarketplaceModal }))
);
const MissionsModal = lazy(() =>
  import('./components/missions/MissionsModal').then((m) => ({ default: m.MissionsModal }))
);
const RobotsModal = lazy(() =>
  import('./components/game/RobotsModal').then((m) => ({ default: m.RobotsModal }))
);
const ApiDocsModal = lazy(() =>
  import('./components/docs/ApiDocsModal').then((m) => ({ default: m.ApiDocsModal }))
);
const SettingsModal = lazy(() =>
  import('./components/settings/SettingsModal').then((m) => ({ default: m.SettingsModal }))
);
const AdminModal = lazy(() =>
  import('./components/admin/AdminModal').then((m) => ({ default: m.AdminModal }))
);
const SystemMaintenanceModal = lazy(() =>
  import('./components/admin/SystemMaintenanceModal').then((m) => ({
    default: m.SystemMaintenanceModal,
  }))
);
const JoinCompetitionModal = lazy(() =>
  import('./components/competition/JoinCompetitionModal').then((m) => ({ default: m.JoinCompetitionModal }))
);
const ScoreboardModal = lazy(() =>
  import('./components/competition/ScoreboardModal').then((m) => ({ default: m.ScoreboardModal }))
);
const WaitingLobby = lazy(() =>
  import('./components/competition/WaitingLobby').then((m) => ({ default: m.WaitingLobby }))
);
const AuthModal = lazy(() =>
  import('./components/auth/AuthModal').then((m) => ({ default: m.AuthModal }))
);
const WorldLeaderboardModal = lazy(() =>
  import('./components/leaderboard/WorldLeaderboardModal').then((m) => ({
    default: m.WorldLeaderboardModal,
  }))
);

export function App() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showRobots, setShowRobots] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWorldLeaderboard, setShowWorldLeaderboard] = useState(false);
  const [showMissionsTracker, setShowMissionsTracker] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const isMaintenanceActive = useMaintenanceStore((state) => state.isMaintenanceActive);
  const maintenanceType = useMaintenanceStore((state) => state.maintenanceType);
  const broadcastMessage = useMaintenanceStore((state) => state.broadcastMessage);
  const clearBroadcast = useMaintenanceStore((state) => state.clearBroadcast);

  const showDocsModal = useEditorStore((state) => state.showDocsModal);
  const setShowDocsModal = useEditorStore((state) => state.setShowDocsModal);
  const loadGame = useGameStore((state) => state.loadGame);

  const showAuthModal = useAuthStore((state) => state.showAuthModal);
  const setShowAuthModal = useAuthStore((state) => state.setShowAuthModal);
  const initAuth = useAuthStore((state) => state.initAuth);
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);

  const showAdminModal = useCompetitionStore((state) => state.showAdminModal);
  const setShowAdminModal = useCompetitionStore((state) => state.setShowAdminModal);
  const showJoinModal = useCompetitionStore((state) => state.showJoinModal);
  const setShowJoinModal = useCompetitionStore((state) => state.setShowJoinModal);
  const showScoreboardModal = useCompetitionStore((state) => state.showScoreboardModal);
  const setShowScoreboardModal = useCompetitionStore((state) => state.setShowScoreboardModal);
  const initSession = useCompetitionStore((state) => state.initSession);
  const currentRoom = useCompetitionStore((state) => state.currentRoom);
  const currentTeam = useCompetitionStore((state) => state.currentTeam);
  const isAdmin = useCompetitionStore((state) => state.isAdmin);
  const refreshRoomData = useCompetitionStore((state) => state.refreshRoomData);

  // Global real-time competition synchronization for all active competitors & admin
  useEffect(() => {
    if (!currentRoom?.id) return;

    // Realtime websocket listener (Supabase Realtime + cross-tab BroadcastChannel)
    const unsubscribe = CompetitionService.subscribeToRoomChanges(currentRoom.id, () => {
      refreshRoomData();
    });

    // 3-second heartbeat fallback polling
    const interval = setInterval(() => {
      refreshRoomData();
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [currentRoom?.id, refreshRoomData]);

  const prevStatusRef = useRef<string | null>(null);

  // Check if participant is waiting for host to start competition
  const isWaitingForAdmin = Boolean(
    currentRoom &&
    currentTeam &&
    !isAdmin &&
    currentRoom.status === 'waiting'
  );

  // Play celebration sound & burst confetti when room status shifts from waiting to active
  useEffect(() => {
    if (prevStatusRef.current === 'waiting' && currentRoom?.status === 'active' && !isAdmin) {
      soundManager.playSuccess();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
    prevStatusRef.current = currentRoom?.status || null;
  }, [currentRoom?.status, isAdmin]);

  // Automatically open the code editor when active competition starts
  useEffect(() => {
    if (currentRoom?.status === 'active') {
      const timer = setTimeout(() => setEditorOpen(true), 0);
      return () => clearTimeout(timer);
    }
  }, [currentRoom?.status]);

  // Auto-load saved game, competition session, and auth session on mount
  useEffect(() => {
    loadGame();
    initSession();
    initAuth();

    const handleFirstInteraction = () => {
      soundManager.startAmbience();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [loadGame, initSession, initAuth]);

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-neutral-950 font-sans select-none flex">
      {/* 3D Farm Canvas Area - with min-w-0 to guarantee clean responsive resizing without overflow */}
      <div className="flex-1 min-w-0 h-full relative overflow-hidden">
        <FarmCanvas />

        {/* Left Floating Sidebar Navigation & Adjacent Side Panels */}
        <div className="absolute top-16 left-3.5 z-20 pointer-events-none flex items-start gap-3 max-h-[calc(100vh-80px)]">
          <LeftSidebar
            onOpenMarket={() => setShowMarket(true)}
            onOpenMissionsModal={() => setShowMissions(true)}
            onToggleMissionsTracker={() => setShowMissionsTracker((prev) => !prev)}
            isMissionsTrackerOpen={showMissionsTracker}
            onOpenRobots={() => setShowRobots(true)}
            onOpenWorldLeaderboard={() => setShowWorldLeaderboard(true)}
            onOpenDocs={() => setShowDocsModal(true)}
          />

          {/* Adjacent Flyout Panels */}
          {showMissionsTracker && !currentRoom && (
            <div className="flex flex-col gap-2.5 overflow-y-auto no-scrollbar max-h-[calc(100vh-90px)]">
              <MissionsTrackerCard
                onOpenEditor={() => setEditorOpen(true)}
                onOpenFullModal={() => setShowMissions(true)}
                onClose={() => setShowMissionsTracker(false)}
              />
            </div>
          )}
        </div>

        {/* Bottom Farm Interaction Toolbar */}
        <FarmToolbar />
      </div>

      {/* Collapsible Programming Editor Panel */}
      {editorOpen && (
        <CodeEditorPanel onClose={() => setEditorOpen(false)} />
      )}

      {/* Top HUD (Floating overlay across the top with transparent background) */}
      <TopHUD
        onOpenWorldLeaderboard={() => setShowWorldLeaderboard(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenMaintenance={() => setShowMaintenanceModal(true)}
        onToggleEditor={() => setEditorOpen((prev) => !prev)}
        editorOpen={editorOpen}
      />

      {/* Floating System Broadcast Alert Banner */}
      {broadcastMessage && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-500/95 text-neutral-950 font-bold text-xs shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4">
          <span className="font-mono uppercase text-[10px] bg-neutral-950 text-amber-300 px-1.5 py-0.5 rounded font-black">
            System Notice
          </span>
          <span>{broadcastMessage}</span>
          <button
            onClick={clearBroadcast}
            className="p-1 hover:bg-black/20 rounded-lg transition"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Super Admin Bypass Floating Indicator when Maintenance is active */}
      {isMaintenanceActive && isSuperAdmin && (
        <div className="fixed top-16 right-4 z-40 animate-in fade-in flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/95 text-neutral-950 font-bold text-xs shadow-xl shadow-amber-950/40 border border-amber-400">
          <span className="w-2 h-2 rounded-full bg-neutral-950 animate-ping" />
          <span>Live Maintenance Active (Admin Bypass)</span>
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="px-2 py-0.5 rounded-lg bg-neutral-950/20 hover:bg-neutral-950/40 text-neutral-950 text-[10px] uppercase font-mono ml-1 flex items-center gap-1"
          >
            <Wrench className="w-3 h-3" />
            <span>Console</span>
          </button>
        </div>
      )}

      {/* Full Lockdown Screen for Public Visitors during Maintenance */}
      {isMaintenanceActive && maintenanceType === 'lockdown' && !isSuperAdmin && (
        <MaintenanceScreen onOpenAdminAuth={() => setShowAuthModal(true)} />
      )}

      {/* Lazy Loaded Modals & Overlays */}
      <Suspense fallback={null}>
        {showMarket && <MarketplaceModal onClose={() => setShowMarket(false)} />}
        {showMissions && (
          <MissionsModal
            onClose={() => setShowMissions(false)}
            onOpenEditor={() => setEditorOpen(true)}
            onOpenWorldLeaderboard={() => {
              setShowMissions(false);
              setShowWorldLeaderboard(true);
            }}
          />
        )}
        {showRobots && <RobotsModal onClose={() => setShowRobots(false)} />}
        {showDocsModal && <ApiDocsModal onClose={() => setShowDocsModal(false)} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {showAdminModal && <AdminModal onClose={() => setShowAdminModal(false)} />}
        {showMaintenanceModal && (
          <SystemMaintenanceModal
            onClose={() => setShowMaintenanceModal(false)}
            onOpenOrganizer={() => {
              setShowMaintenanceModal(false);
              setShowAdminModal(true);
            }}
          />
        )}
        {showJoinModal && <JoinCompetitionModal onClose={() => setShowJoinModal(false)} />}
        {showScoreboardModal && <ScoreboardModal onClose={() => setShowScoreboardModal(false)} />}
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onOpenMaintenance={() => setShowMaintenanceModal(true)}
          />
        )}
        {showWorldLeaderboard && (
          <WorldLeaderboardModal
            onClose={() => setShowWorldLeaderboard(false)}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenEditor={() => setEditorOpen(true)}
          />
        )}

        {/* Fullscreen Waiting Lobby for Participants when Room is in 'waiting' status */}
        {isWaitingForAdmin && (
          <WaitingLobby
            onOpenScoreboard={() => setShowScoreboardModal(true)}
            onOpenDocs={() => setShowDocsModal(true)}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;
