import React from 'react';
import {
  X,
  Droplets,
  Sparkles,
  Sprout,
  Scissors,
  Heart,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { CROPS } from '../../game/simulation/cropConfig';

export const TileInspector: React.FC = () => {
  const currentRoom = useCompetitionStore((state) => state.currentRoom);
  const isCompeting = Boolean(currentRoom);
  const {
    selectedTileCoord,
    tiles,
    clearSelection,
    plantCrop,
    waterTile,
    harvestTile,
    fertilizeTile,
    clearWeeds,
    selectedSeed,
    inventory,
  } = useGameStore();

  if (!selectedTileCoord) return null;

  const key = `${selectedTileCoord.x}_${selectedTileCoord.y}`;
  const tile = tiles[key];
  if (!tile || !tile.unlocked) return null;

  const cropConfig = tile.crop ? CROPS[tile.crop] : null;
  const seedKey = `${selectedSeed}_seed`;
  const seedCount = inventory[seedKey] || 0;
  const fertCount = inventory['fertilizer'] || 0;

  return (
    <div className="absolute top-4 left-4 z-20 pointer-events-auto w-72 bg-neutral-950/95 backdrop-blur-md rounded-2xl border border-neutral-800 shadow-2xl p-4 text-neutral-100 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-xs flex items-center justify-center font-bold">
            {tile.x},{tile.y}
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight text-white">Soil Plot ({tile.x}, {tile.y})</h3>
            <span className="text-[11px] text-neutral-400">
              {tile.crop ? cropConfig?.name : 'Empty Bed'}
            </span>
          </div>
        </div>
        <button
          onClick={clearSelection}
          className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Moisture & Nutrients Gauges */}
      <div className="flex flex-col gap-2.5 text-xs">
        {/* Moisture */}
        <div>
          <div className="flex items-center justify-between mb-1 font-semibold">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Droplets className="w-3.5 h-3.5 text-neutral-400" />
              Moisture
            </span>
            <span className="font-mono text-neutral-400">{Math.round(tile.moisture)}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-neutral-400 transition-all duration-300"
              style={{ width: `${tile.moisture}%` }}
            />
          </div>
        </div>

        {/* Nutrients */}
        <div>
          <div className="flex items-center justify-between mb-1 font-semibold">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              Nutrients
            </span>
            <span className="font-mono text-neutral-400">{Math.round(tile.nutrients)}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-neutral-500 transition-all duration-300"
              style={{ width: `${tile.nutrients}%` }}
            />
          </div>
        </div>

        {/* Crop Growth & Health if planted */}
        {tile.crop && (
          <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-200 font-semibold capitalize flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5 text-neutral-400" />
                Stage: {tile.stage}
              </span>
              <span className="font-mono text-[11px] text-neutral-400">
                {Math.round(tile.growthProgress * 100)}%
              </span>
            </div>

            {/* Growth progress bar */}
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-300 transition-all duration-300"
                style={{ width: `${Math.round(tile.growthProgress * 100)}%` }}
              />
            </div>

            {/* Health */}
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-neutral-400" /> Health
              </span>
              <span className="font-mono font-semibold text-neutral-200">{tile.health}%</span>
            </div>
          </div>
        )}

        {/* Weeds Warning */}
        {tile.weedLevel > 0 && (
          <div className="flex items-center justify-between text-xs bg-neutral-900 border border-neutral-800 px-2 py-1.5 rounded-lg text-neutral-300">
            <span>Weeds Present: {tile.weedLevel}%</span>
            <button
              onClick={() => clearWeeds(tile.x, tile.y)}
              className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] font-bold border border-neutral-700"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Manual Quick Actions (Sandbox only) vs Automated Telemetry (Competition Mode) */}
      {!isCompeting ? (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800">
          {tile.crop === null ? (
            <button
              onClick={() => plantCrop(tile.x, tile.y, selectedSeed)}
              disabled={seedCount <= 0}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition border ${
                seedCount > 0
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700 shadow-sm'
                  : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Plant ({seedCount})</span>
            </button>
          ) : tile.stage === 'mature' ? (
            <button
              onClick={() => harvestTile(tile.x, tile.y)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-neutral-200 hover:bg-white text-neutral-950 shadow-md animate-pulse"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Harvest!</span>
            </button>
          ) : (
            <div className="flex items-center justify-center text-xs text-neutral-500 font-medium py-2">
              Growing...
            </div>
          )}

          <button
            onClick={() => waterTile(tile.x, tile.y)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition shadow-sm"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Water</span>
          </button>

          <button
            onClick={() => fertilizeTile(tile.x, tile.y)}
            disabled={fertCount <= 0}
            className={`col-span-2 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-bold text-xs transition border ${
              fertCount > 0
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fertilize Soil ({fertCount} in stock)</span>
          </button>
        </div>
      ) : (
        <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 font-mono text-center bg-neutral-900/60 p-2 rounded-xl">
          🤖 Drone Target: <code className="text-emerald-400">fly_to({tile.x}, {tile.y})</code>
        </div>
      )}
    </div>
  );
};
