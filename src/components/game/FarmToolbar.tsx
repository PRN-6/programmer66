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

export const FarmToolbar: React.FC = () => {
  const currentRoom = useCompetitionStore((state) => state.currentRoom);
  const {
    activeTool,
    setActiveTool,
    selectedSeed,
    setSelectedSeed,
    inventory,
  } = useGameStore();

  if (currentRoom) return null;

  const tools: { id: typeof activeTool; label: string; icon: React.ReactNode }[] = [
    { id: 'inspect', label: 'Select / Inspect', icon: <MousePointer className="w-4 h-4 text-neutral-300" /> },
    { id: 'plant', label: 'Plant Seed', icon: <Sprout className="w-4 h-4 text-neutral-300" /> },
    { id: 'water', label: 'Water Soil', icon: <Droplets className="w-4 h-4 text-neutral-300" /> },
    { id: 'fertilize', label: 'Fertilize', icon: <Sparkles className="w-4 h-4 text-neutral-300" /> },
    { id: 'harvest', label: 'Harvest Crop', icon: <Scissors className="w-4 h-4 text-neutral-300" /> },
    { id: 'clear', label: 'Clear Weeds', icon: <Shovel className="w-4 h-4 text-neutral-300" /> },
  ];

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
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTool === t.id
                ? 'bg-neutral-800 text-white shadow-inner border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80'
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
