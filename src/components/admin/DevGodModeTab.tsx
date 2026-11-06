import React, { useState } from 'react';
import {
  Zap,
  Coins,
  Sparkles,
  Sprout,
  Droplets,
  Flame,
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  Trash2,
  Package,
  Bot,
  Users,
  Check,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { soundManager } from '../../audio/soundEffects';
import { Team } from '../../types/competition';

export const DevGodModeTab: React.FC = () => {
  const money = useGameStore((s) => s.money);
  const level = useGameStore((s) => s.level);
  const xp = useGameStore((s) => s.xp);
  const weather = useGameStore((s) => s.weather);
  const tiles = useGameStore((s) => s.tiles);
  const currentRoom = useCompetitionStore((s) => s.currentRoom);
  const teams = useCompetitionStore((s) => s.teams);

  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    soundManager.playSuccess();
    setTimeout(() => setNotification(null), 3000);
  };

  // 1. Money Controls
  const addCash = (amount: number) => {
    useGameStore.setState((s) => ({ money: s.money + amount }));
    notify(`Added +$${amount.toLocaleString()} Treasury`);
  };

  const resetCash = (amount: number) => {
    useGameStore.setState({ money: amount });
    notify(`Treasury set to $${amount}`);
  };

  // 2. Level & XP Controls
  const setPlayerLevel = (lvl: number, xpAmount: number) => {
    useGameStore.setState({ level: lvl, xp: xpAmount });
    notify(`Set Player to Level ${lvl} (${xpAmount} XP)`);
  };

  // 3. Crop & Farm Manipulators
  const forceGrowAllCrops = () => {
    let count = 0;
    useGameStore.setState((s) => {
      const newTiles = { ...s.tiles };
      for (const k of Object.keys(newTiles)) {
        if (newTiles[k].crop) {
          newTiles[k] = { ...newTiles[k], growthProgress: 1, stage: 'mature' };
          count++;
        }
      }
      return { tiles: newTiles };
    });
    notify(`Instant Force-Grown ${count} Crops to 100% Mature!`);
  };

  const waterAllSoil = () => {
    useGameStore.setState((s) => {
      const newTiles = { ...s.tiles };
      for (const k of Object.keys(newTiles)) {
        newTiles[k] = { ...newTiles[k], moisture: 100 };
      }
      return { tiles: newTiles };
    });
    notify(`All ${Object.keys(tiles).length} Soil Plots Hydrated to 100%`);
  };

  const fertilizeAllSoil = () => {
    useGameStore.setState((s) => {
      const newTiles = { ...s.tiles };
      for (const k of Object.keys(newTiles)) {
        newTiles[k] = { ...newTiles[k], nutrients: 100 };
      }
      return { tiles: newTiles };
    });
    notify(`All Soil Plots Fertilized with 100% Nutrients`);
  };

  const removeAllWeeds = () => {
    useGameStore.setState((s) => {
      const newTiles = { ...s.tiles };
      for (const k of Object.keys(newTiles)) {
        newTiles[k] = { ...newTiles[k], weedLevel: 0 };
      }
      return { tiles: newTiles };
    });
    notify(`Cleared All Weeds Across Farm Field`);
  };

  const clearAllPlots = () => {
    useGameStore.setState((s) => {
      const newTiles = { ...s.tiles };
      for (const k of Object.keys(newTiles)) {
        newTiles[k] = {
          ...newTiles[k],
          crop: null,
          growthProgress: 0,
          stage: 'empty',
          weedLevel: 0,
          moisture: 50,
          nutrients: 50,
        };
      }
      return { tiles: newTiles };
    });
    notify(`Reset All Soil Plots to Clean Empty Tilled Land`);
  };

  // 4. Seed Inventory Grants
  const giveSeeds = (count: number) => {
    useGameStore.setState((s) => {
      const inv = { ...s.inventory };
      const seedTypes = ['wheat_seed', 'carrot_seed', 'corn_seed', 'potato_seed', 'tomato_seed'];
      for (const seed of seedTypes) {
        inv[seed] = (inv[seed] || 0) + count;
      }
      return { inventory: inv };
    });
    notify(`Granted +${count} seeds of every crop!`);
  };

  // 5. Weather Machine
  const setDevWeather = (w: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'drought') => {
    useGameStore.setState({ weather: w });
    notify(`Weather force-changed to ${w.toUpperCase()}`);
  };

  // 6. Mock Contest Teams
  const injectMockTeams = () => {
    if (!currentRoom) {
      alert('Create or join a competition room first in the Room & Controls tab!');
      return;
    }

    const mockNames = [
      'ByteBandits',
      'QuantumFarmers',
      'CyberHarvesters',
      'NeuralAgronomists',
      'ZeroDayGrowers',
    ];

    const currentTeams = useCompetitionStore.getState().teams;
    const newMockTeams: Team[] = mockNames.map((name, i) => ({
      id: `mock-team-${Date.now()}-${i}`,
      roomId: currentRoom.id,
      name: `${name} #${i + 1}`,
      members: [`Player_${i + 1}`],
      score: Math.floor(Math.random() * 800) + 150,
      completedChallenges: currentRoom.challenges.slice(0, Math.floor(Math.random() * 4) + 1).map((c) => c.id),
      status: 'active' as const,
      joinedAt: new Date().toISOString(),
    }));

    useCompetitionStore.setState({
      teams: [...currentTeams, ...newMockTeams],
    });

    notify(`Injected 5 Simulated Competitor Teams into Room ${currentRoom.code}!`);
  };

  const cropPlotsCount = Object.values(tiles).filter((t) => t.crop).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <h3 className="text-base font-bold text-white font-mono">Developer God Mode & Sandbox Cheats</h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase font-mono">
              Dev Only
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Manipulate game economy, fast-forward crop lifecycles, inject simulated hackathon competitors, and test automation scripts without grinding.
          </p>
        </div>

        {notification && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Grid of Cheat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Economy & Level Cheats */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <div className="flex items-center gap-2 text-neutral-200 text-xs font-bold">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Economy & Player Progression</span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400">${money} | Lv {level} ({xp} XP)</span>
          </div>

          <p className="text-[11px] text-neutral-400">Spawn starting capital or elevate progression level:</p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addCash(1000)}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-semibold text-amber-300 transition"
            >
              +$1,000 Cash
            </button>
            <button
              onClick={() => addCash(10000)}
              className="py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-bold text-amber-300 transition"
            >
              +$10,000 Cash
            </button>
            <button
              onClick={() => setPlayerLevel(5, 500)}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-neutral-200 transition"
            >
              Set Level 5
            </button>
            <button
              onClick={() => setPlayerLevel(10, 5000)}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-purple-300 transition"
            >
              Max Level 10
            </button>
          </div>

          <button
            onClick={() => resetCash(120)}
            className="w-full py-1 text-[11px] text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900 rounded transition"
          >
            Reset Capital to Initial ($120)
          </button>
        </div>

        {/* Card 2: Soil & Crop Lifecycle Accelerator */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <div className="flex items-center gap-2 text-neutral-200 text-xs font-bold">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>Crop & Soil Accelerator</span>
            </div>
            <span className="font-mono text-xs text-neutral-400">{cropPlotsCount} Crops Active</span>
          </div>

          <p className="text-[11px] text-neutral-400">Manipulate growth stages instantly to test harvesting:</p>

          <button
            onClick={forceGrowAllCrops}
            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
            <span>Force-Grow All Crops (100% Mature)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={waterAllSoil}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-sky-300 transition flex items-center justify-center gap-1.5"
            >
              <Droplets className="w-3 h-3 text-sky-400" />
              <span>100% Water</span>
            </button>
            <button
              onClick={fertilizeAllSoil}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-emerald-300 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>100% Nutrients</span>
            </button>
            <button
              onClick={removeAllWeeds}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-neutral-300 transition"
            >
              Wipe All Weeds
            </button>
            <button
              onClick={clearAllPlots}
              className="py-1.5 px-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 rounded-lg text-xs font-medium text-rose-300 transition flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>Clear Field</span>
            </button>
          </div>
        </div>

        {/* Card 3: Weather Machine */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <div className="flex items-center gap-2 text-neutral-200 text-xs font-bold">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Atmospheric Weather Machine</span>
            </div>
            <span className="font-mono text-xs uppercase font-bold text-amber-400">{weather}</span>
          </div>

          <p className="text-[11px] text-neutral-400">Force environmental weather systems to test soil physics:</p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDevWeather('sunny')}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-amber-300 flex items-center gap-1.5"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Sunny 24°C</span>
            </button>
            <button
              onClick={() => setDevWeather('rainy')}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-sky-300 flex items-center gap-1.5"
            >
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>Rainy (Auto Hydrate)</span>
            </button>
            <button
              onClick={() => setDevWeather('stormy')}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-indigo-300 flex items-center gap-1.5"
            >
              <CloudLightning className="w-3.5 h-3.5 text-indigo-400" />
              <span>Stormy</span>
            </button>
            <button
              onClick={() => setDevWeather('drought')}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-orange-300 flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Drought 36°C</span>
            </button>
          </div>

          <button
            onClick={() => setDevWeather('cloudy')}
            className="w-full py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-neutral-300 flex items-center justify-center gap-1.5"
          >
            <Cloud className="w-3.5 h-3.5 text-neutral-400" />
            <span>Cloudy / Overcast</span>
          </button>
        </div>

        {/* Card 4: Inventory & Supplies Grants */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <div className="flex items-center gap-2 text-neutral-200 text-xs font-bold">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Seeds & Inventory Grants</span>
            </div>
            <span className="font-mono text-xs text-neutral-400">Inventory</span>
          </div>

          <p className="text-[11px] text-neutral-400">Stock supply warehouse with free seeds:</p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => giveSeeds(20)}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-semibold text-emerald-300 transition"
            >
              +20 All Seeds
            </button>
            <button
              onClick={() => giveSeeds(100)}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-bold text-emerald-300 transition"
            >
              +100 All Seeds
            </button>
          </div>
        </div>

        {/* Card 5: Competition Multiplayer Simulator */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <div className="flex items-center gap-2 text-neutral-200 text-xs font-bold">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Competition Simulator</span>
            </div>
            <span className="font-mono text-xs text-neutral-400">{teams.length} Teams In Room</span>
          </div>

          <p className="text-[11px] text-neutral-400">
            Inject mock competitor teams to test live scoreboards, ranking calculations, and contest pacing without multiple devices:
          </p>

          <button
            onClick={injectMockTeams}
            className="w-full py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Inject 5 Mock Teams with Random Scores</span>
          </button>
        </div>

        {/* Card 6: Developer Advice & Best Practices */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 shadow-md">
          <div className="flex items-center gap-2 text-neutral-200 text-xs font-bold border-b border-neutral-800/80 pb-2">
            <Bot className="w-4 h-4 text-sky-400" />
            <span>Developer Tip</span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            As the platform creator, you can use the <b>Room & Controls</b> tab to generate custom hackathons, <b>Field & Terrain</b> to design custom 2D soil layouts, and this <b>God Mode</b> tab to stress-test your code scripts instantly.
          </p>
        </div>
      </div>
    </div>
  );
};
