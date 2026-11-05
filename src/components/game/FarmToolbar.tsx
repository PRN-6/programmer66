import React from 'react';
import {
  MousePointer,
  Sprout,
  Droplets,
  Sparkles,
  Scissors,
  Shovel,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { CROPS } from '../../game/simulation/cropConfig';
import type { CropId } from '../../types/game';

type FarmTool = 'inspect' | 'plant' | 'water' | 'fertilize' | 'harvest' | 'clear';

interface ToolItem {
  id: FarmTool;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const TOOLS: ToolItem[] = [
  { id: 'inspect', label: 'Select / Inspect', shortcut: '1', icon: <MousePointer className="w-4 h-4 text-neutral-300" /> },
  { id: 'plant', label: 'Plant Seed', shortcut: '2', icon: <Sprout className="w-4 h-4 text-neutral-300" /> },
  { id: 'water', label: 'Water Soil', shortcut: '3', icon: <Droplets className="w-4 h-4 text-neutral-300" /> },
  { id: 'fertilize', label: 'Fertilize', shortcut: '4', icon: <Sparkles className="w-4 h-4 text-neutral-300" /> },
  { id: 'harvest', label: 'Harvest Crop', shortcut: '5', icon: <Scissors className="w-4 h-4 text-neutral-300" /> },
  { id: 'clear', label: 'Clear Weeds', shortcut: '6', icon: <Shovel className="w-4 h-4 text-neutral-300" /> },
];

const FarmToolbarContent: React.FC = () => {
  const activeTool = useGameStore((s) => s.activeTool);
  const setActiveTool = useGameStore((s) => s.setActiveTool);
  const selectedSeed = useGameStore((s) => s.selectedSeed);
  const setSelectedSeed = useGameStore((s) => s.setSelectedSeed);
  const inventory = useGameStore((s) => s.inventory);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('.monaco-editor'))
      ) {
        return;
      }

      const keyIndex = parseInt(e.key, 10);
      if (keyIndex >= 1 && keyIndex <= TOOLS.length) {
        setActiveTool(TOOLS[keyIndex - 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool]);

  const seedOptions: { id: CropId; label: string; count: number }[] = [
    { id: 'wheat', label: 'Wheat', count: inventory['wheat_seed'] || 0 },
    { id: 'corn', label: 'Corn', count: inventory['corn_seed'] || 0 },
    { id: 'carrot', label: 'Carrot', count: inventory['carrot_seed'] || 0 },
    { id: 'tomato', label: 'Tomato', count: inventory['tomato_seed'] || 0 },
    { id: 'potato', label: 'Potato', count: inventory['potato_seed'] || 0 },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center gap-2">
      {/* Seed Selector when Plant tool is active */}
      {activeTool === 'plant' && (
        <div className="flex items-center gap-1.5 bg-neutral-950/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-800 shadow-2xl">
          <span className="text-xs font-semibold text-neutral-400 mr-1">Seed:</span>
          {seedOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedSeed(opt.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                selectedSeed === opt.id
                  ? 'bg-neutral-800 text-white font-bold border border-neutral-700 shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <span>{CROPS[opt.id].name.split(' ')[1] || opt.label}</span>
              <span
                className={`text-[10px] px-1 rounded-full ${
                  opt.count > 0 ? 'bg-neutral-900 text-neutral-300 border border-neutral-800' : 'bg-neutral-900 text-neutral-600'
                }`}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Tool Bar */}
      <div className="flex items-center gap-1 bg-neutral-950/95 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-800 shadow-2xl">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTool === t.id
                ? 'bg-neutral-800 text-white shadow-inner border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80'
            }`}
            title={`${t.label} (Key ${t.shortcut})`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
            <span className="hidden lg:inline text-[10px] text-neutral-500 font-mono">({t.shortcut})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const FarmToolbar: React.FC = () => {
  const currentRoom = useCompetitionStore((state) => state.currentRoom);
  if (currentRoom) return null;
  return <FarmToolbarContent />;
};
