import React, { useState } from 'react';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  BarChart3,
  Check,
  Zap,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const {
    soundMuted,
    sfxVolume,
    ambienceVolume,
    graphicsQuality,
    toggleMute,
    setVolumes,
    setGraphicsQuality,
    saveGame,
    loadGame,
    resetGame,
    stats,
  } = useGameStore();

  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleSave = () => {
    saveGame();
    notify('Farm state saved to local storage!');
  };

  const handleLoad = () => {
    const success = loadGame();
    if (success) {
      notify('Farm state restored successfully!');
    } else {
      notify('No saved game found.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your farm? All progress will restart.')) {
      resetGame();
      notify('Farm reset to day 1.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between bg-neutral-900 px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Settings & Stats</h2>
              <p className="text-xs text-neutral-400">Audio, data persistence, and telemetry</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notification && (
          <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2 text-xs text-neutral-200 font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-neutral-400" />
            <span>{notification}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Graphics & Performance Optimization */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Graphics & Hardware Profile</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {graphicsQuality === 'low' ? 'Max FPS / Low Power' : graphicsQuality === 'balanced' ? 'Balanced (Default)' : 'High Detail'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setGraphicsQuality('low')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                  graphicsQuality === 'low'
                    ? 'bg-neutral-800 border-amber-400/80 text-white shadow-md'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
              >
                <span className="text-xs font-bold">Fast / Eco</span>
                <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">Old PCs & Laptops</span>
              </button>

              <button
                onClick={() => setGraphicsQuality('balanced')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                  graphicsQuality === 'balanced'
                    ? 'bg-neutral-800 border-emerald-400/80 text-white shadow-md'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
              >
                <span className="text-xs font-bold">Balanced</span>
                <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">Recommended</span>
              </button>

              <button
                onClick={() => setGraphicsQuality('high')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                  graphicsQuality === 'high'
                    ? 'bg-neutral-800 border-sky-400/80 text-white shadow-md'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
              >
                <span className="text-xs font-bold">High</span>
                <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">Detailed 3D</span>
              </button>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Audio Settings
              </span>
              <button
                onClick={toggleMute}
                className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
              >
                {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-500" /> : <Volume2 className="w-3.5 h-3.5 text-neutral-300" />}
                <span>{soundMuted ? 'Muted' : 'Sound On'}</span>
              </button>
            </div>

            {/* SFX Volume */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-neutral-300 font-medium">
                <span>Sound Effects (SFX)</span>
                <span>{Math.round(sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVolume}
                onChange={(e) => setVolumes(parseFloat(e.target.value), ambienceVolume)}
                className="w-full accent-neutral-400 cursor-pointer"
              />
            </div>

            {/* Ambience Volume */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-neutral-300 font-medium">
                <span>Country Ambience (Breeze & Birds)</span>
                <span>{Math.round(ambienceVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambienceVolume}
                onChange={(e) => setVolumes(sfxVolume, parseFloat(e.target.value))}
                className="w-full accent-neutral-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Farm Statistics */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-neutral-400" />
              <span>Farm Telemetry</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-900 p-3 rounded-xl border border-neutral-800">
              <div className="text-neutral-400">Total Harvested: <b className="text-neutral-200">{stats.totalHarvested}</b></div>
              <div className="text-neutral-400">Total Planted: <b className="text-neutral-200">{stats.totalPlanted}</b></div>
              <div className="text-neutral-400">Tiles Watered: <b className="text-neutral-200">{stats.totalWatered}</b></div>
              <div className="text-neutral-400">Revenue Earned: <b className="text-neutral-200">${stats.moneyEarned}</b></div>
            </div>
          </div>

          {/* Save / Load / Reset Buttons */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold border border-neutral-700 transition"
              >
                <Save className="w-3.5 h-3.5 text-neutral-400" />
                <span>Save Farm</span>
              </button>
              <button
                onClick={handleLoad}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold border border-neutral-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                <span>Load Save</span>
              </button>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded-xl text-xs font-semibold transition"
            >
              Reset Farm & Clear Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
