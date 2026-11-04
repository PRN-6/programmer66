import React, { useState, useEffect } from 'react';
import { FarmCanvas } from './game/world/FarmCanvas';
import { TopHUD } from './components/hud/TopHUD';
import { FarmToolbar } from './components/game/FarmToolbar';
import { TileInspector } from './components/game/TileInspector';
import { CodeEditorPanel } from './components/editor/CodeEditorPanel';
import { MarketplaceModal } from './components/marketplace/MarketplaceModal';
import { MissionsModal } from './components/missions/MissionsModal';
import { RobotsModal } from './components/game/RobotsModal';
import { ApiDocsModal } from './components/docs/ApiDocsModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { useEditorStore } from './store/useEditorStore';
import { useGameStore } from './store/useGameStore';
import { soundManager } from './audio/soundEffects';

export function App() {
  const [editorOpen, setEditorOpen] = useState(true);
  const [showMarket, setShowMarket] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showRobots, setShowRobots] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const showDocsModal = useEditorStore((state) => state.showDocsModal);
  const setShowDocsModal = useEditorStore((state) => state.setShowDocsModal);
  const loadGame = useGameStore((state) => state.loadGame);

  // Auto-load saved game on mount and start audio on first interaction
  useEffect(() => {
    loadGame();

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
  }, [loadGame]);

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-neutral-950 font-sans select-none flex flex-col">
      {/* Top HUD (Fixed at top across entire screen) */}
      <TopHUD
        onOpenMarket={() => setShowMarket(true)}
        onOpenMissions={() => setShowMissions(true)}
        onOpenRobots={() => setShowRobots(true)}
        onOpenSettings={() => setShowSettings(true)}
        onToggleEditor={() => setEditorOpen((prev) => !prev)}
        editorOpen={editorOpen}
      />

      {/* Main Workspace below Top HUD */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        {/* 3D Farm Canvas Area - with min-w-0 to guarantee clean responsive resizing without overflow */}
        <div className="flex-1 min-w-0 h-full relative overflow-hidden">
          <FarmCanvas />

          {/* Floating Tile Inspector */}
          <TileInspector />

          {/* Bottom Farm Interaction Toolbar */}
          <FarmToolbar />
        </div>

        {/* Collapsible Programming Editor Panel */}
        {editorOpen && (
          <CodeEditorPanel onClose={() => setEditorOpen(false)} />
        )}
      </div>

      {/* Modals */}
      {showMarket && <MarketplaceModal onClose={() => setShowMarket(false)} />}
      {showMissions && (
        <MissionsModal
          onClose={() => setShowMissions(false)}
          onOpenEditor={() => setEditorOpen(true)}
        />
      )}
      {showRobots && <RobotsModal onClose={() => setShowRobots(false)} />}
      {showDocsModal && <ApiDocsModal onClose={() => setShowDocsModal(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
