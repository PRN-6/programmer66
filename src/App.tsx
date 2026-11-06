import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import confetti from 'canvas-confetti';
import { FarmCanvas } from './game/world/FarmCanvas';
import { TopHUD } from './components/hud/TopHUD';
import { LeftSidebar } from './components/navigation/LeftSidebar';
import { FarmToolbar } from './components/game/FarmToolbar';
import { TileInspector } from './components/game/TileInspector';
import { MissionsTrackerWidget } from './components/missions/MissionsTrackerWidget';
import { CodeEditorPanel } from './components/editor/CodeEditorPanel';
import { useEditorStore } from './store/useEditorStore';
import { useGameStore } from './store/useGameStore';
import { useCompetitionStore } from './store/useCompetitionStore';
import { useAuthStore } from './store/useAuthStore';
import { soundManager } from './audio/soundEffects';

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

  const showDocsModal = useEditorStore((state) => state.showDocsModal);
  const setShowDocsModal = useEditorStore((state) => state.setShowDocsModal);
  const loadGame = useGameStore((state) => state.loadGame);

  const showAuthModal = useAuthStore((state) => state.showAuthModal);
  const setShowAuthModal = useAuthStore((state) => state.setShowAuthModal);
  const initAuth = useAuthStore((state) => state.initAuth);

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

        {/* Left-docked floating panels: Navigation Sidebar, Soil Plot Inspector & Missions Tracker */}
        <div className="absolute top-16 left-3.5 z-20 pointer-events-none flex flex-col items-start gap-2.5 max-h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">
          <LeftSidebar
            onOpenMarket={() => setShowMarket(true)}
            onOpenMissions={() => setShowMissions(true)}
            onOpenRobots={() => setShowRobots(true)}
            onOpenWorldLeaderboard={() => setShowWorldLeaderboard(true)}
            onOpenDocs={() => setShowDocsModal(true)}
          />
          <TileInspector />
          <MissionsTrackerWidget
            onOpenEditor={() => setEditorOpen(true)}
            onOpenFullModal={() => setShowMissions(true)}
          />
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
        onToggleEditor={() => setEditorOpen((prev) => !prev)}
        editorOpen={editorOpen}
      />

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
        {showJoinModal && <JoinCompetitionModal onClose={() => setShowJoinModal(false)} />}
        {showScoreboardModal && <ScoreboardModal onClose={() => setShowScoreboardModal(false)} />}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        {showWorldLeaderboard && (
          <WorldLeaderboardModal
            onClose={() => setShowWorldLeaderboard(false)}
            onOpenAuth={() => setShowAuthModal(true)}
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
