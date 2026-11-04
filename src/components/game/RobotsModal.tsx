import React from 'react';
import {
  X,
  Bot,
  Zap,
  BatteryCharging,
  Navigation,
  Clock,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

interface RobotsModalProps {
  onClose: () => void;
}

export const RobotsModal: React.FC<RobotsModalProps> = ({ onClose }) => {
  const { robots, rechargeRobot } = useGameStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between bg-neutral-900 px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Robotic Fleet Management</h2>
              <p className="text-xs text-neutral-400">Configure autonomous units and hardware</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fleet List */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {robots.map((bot) => (
            <div
              key={bot.id}
              className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white border border-neutral-700 shadow"
                    style={{ backgroundColor: '#27272a' }}
                  >
                    <Bot className="w-6 h-6 text-neutral-200" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{bot.name}</h3>
                    <span className="text-xs text-neutral-400 font-medium">
                      Autonomous Agricultural Rover
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800 text-neutral-300">
                    Plot ({bot.x}, {bot.y})
                  </span>
                  <button
                    onClick={() => rechargeRobot(bot.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-lg text-xs font-bold transition shadow"
                  >
                    <BatteryCharging className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Recharge</span>
                  </button>
                </div>
              </div>

              {/* Status & Energy */}
              <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs">
                <div>
                  <span className="text-neutral-400 flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-neutral-400" /> Current Activity
                  </span>
                  <span className="font-semibold text-neutral-200 capitalize">
                    {bot.currentTask || 'Standby'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-neutral-400" /> Solar Battery
                    </span>
                    <span className="font-mono text-neutral-300">{Math.round(bot.energy)}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-neutral-400 transition-all duration-300"
                      style={{ width: `${bot.energy}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Hardware specifications */}
              <div className="text-[11px] text-neutral-400 flex items-center justify-between pt-1">
                <span>Drive Speed: <b className="text-neutral-200">{bot.speed} tiles/s</b></span>
                <span>Payload: <b className="text-neutral-200">{bot.inventoryCapacity} units</b></span>
                <span>Active Tool: <b className="capitalize text-neutral-200">{bot.currentTool}</b></span>
              </div>
            </div>
          ))}

          {/* Locked Next-Gen Units Preview */}
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider pt-2">
            Advanced Tech Tree
          </div>

          <div className="border border-dashed border-neutral-800 p-4 rounded-2xl bg-neutral-950/40 opacity-75 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-200">AeroSprinkler Drone</h4>
                <p className="text-xs text-neutral-400">
                  Aerial irrigation unit. Flies directly over crops ignoring ground terrain.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
              Unlocks at Level 4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
