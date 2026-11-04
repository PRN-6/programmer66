import React from 'react';
import {
  Coins,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ShoppingBag,
  Target,
  Bot,
  Settings,
  BookOpen,
  Code2,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useEditorStore } from '../../store/useEditorStore';
import { WEATHER_PROFILES } from '../../game/simulation/weatherConfig';

interface TopHUDProps {
  onOpenMarket: () => void;
  onOpenMissions: () => void;
  onOpenRobots: () => void;
  onOpenSettings: () => void;
  onToggleEditor: () => void;
  editorOpen: boolean;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  onOpenMarket,
  onOpenMissions,
  onOpenRobots,
  onOpenSettings,
  onToggleEditor,
  editorOpen,
}) => {
  const {
    money,
    level,
    xp,
    day,
    timeOfDay,
    weather,
    nextWeather,
    isPaused,
    gameSpeed,
    soundMuted,
    setPaused,
    setGameSpeed,
    toggleMute,
    missions,
  } = useGameStore();

  const setShowDocsModal = useEditorStore((state) => state.setShowDocsModal);

  const profile = WEATHER_PROFILES[weather];
  const nextProfile = WEATHER_PROFILES[nextWeather];

  // Format 24-hr time to HH:MM AM/PM
  const hours = Math.floor(timeOfDay);
  const minutes = Math.floor((timeOfDay - hours) * 60);
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const timeString = `${displayHours}:${formattedMinutes} ${ampm}`;

  // Next level threshold
  const levelThresholds = [0, 100, 250, 500, 900, 1500, 3000];
  const currentLevelBase = levelThresholds[level - 1] || 0;
  const nextLevelXp = levelThresholds[level] || 3000;
  const xpProgress = Math.min(100, Math.max(0, ((xp - currentLevelBase) / (nextLevelXp - currentLevelBase)) * 100));

  const uncompletedMissions = missions.filter((m) => !m.completed).length;

  const WeatherIcon = () => {
    switch (weather) {
      case 'sunny':
        return <Sun className="w-4 h-4 text-neutral-300" />;
      case 'cloudy':
        return <Cloud className="w-4 h-4 text-neutral-400" />;
      case 'rainy':
        return <CloudRain className="w-4 h-4 text-neutral-300" />;
      case 'stormy':
        return <CloudLightning className="w-4 h-4 text-neutral-200" />;
      case 'drought':
        return <Flame className="w-4 h-4 text-neutral-300" />;
      default:
        return <Sun className="w-4 h-4 text-neutral-300" />;
    }
  };

  return (
    <header className="h-14 shrink-0 w-full z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 px-4 flex items-center justify-between shadow-md">
      {/* Brand & Level */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center font-extrabold text-neutral-100 text-sm shadow-sm">
            68
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              FARMING 68
            </h1>
            <span className="text-[10px] font-medium text-neutral-400">
              Autonomous Agriculture
            </span>
          </div>
        </div>

        {/* Level & XP bar */}
        <div className="hidden sm:flex flex-col gap-0.5 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-300 gap-3 font-semibold">
            <span>Level {level}</span>
            <span className="text-[10px] text-neutral-500 font-mono">{xp} / {nextLevelXp} XP</span>
          </div>
          <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-400 transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Money / Treasury */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-neutral-100 font-bold text-xs shadow-inner">
          <Coins className="w-3.5 h-3.5 text-neutral-400" />
          <span>${money}</span>
        </div>
      </div>

      {/* Center: Day, Time & Weather */}
      <div className="flex items-center gap-3">
        {/* Day & Time */}
        <div className="text-center bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">
          <div className="text-xs font-bold text-neutral-200">Day {day}</div>
          <div className="text-[10px] font-mono text-neutral-400">{timeString}</div>
        </div>

        {/* Weather card */}
        <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">
          <WeatherIcon />
          <div>
            <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <span>{profile.name}</span>
              <span className="text-[10px] font-mono text-neutral-400">{profile.temperatureC}°C</span>
            </div>
            <div className="text-[10px] text-neutral-500">
              Next: {nextProfile.name}
            </div>
          </div>
        </div>

        {/* Simulation Speed & Pause */}
        <div className="hidden md:flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setPaused(!isPaused)}
            className={`p-1.5 rounded transition ${isPaused ? 'bg-neutral-200 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
            title={isPaused ? 'Resume simulation' : 'Pause simulation'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => {
                setGameSpeed(speed);
                if (isPaused) setPaused(false);
              }}
              className={`px-2 py-0.5 text-xs font-bold rounded transition ${
                !isPaused && gameSpeed === speed
                  ? 'bg-neutral-700 text-white border border-neutral-600'
                  : 'text-neutral-500 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls: Navigation Buttons */}
      <div className="flex items-center gap-2">
        {/* Marketplace */}
        <button
          onClick={onOpenMarket}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold transition"
          title="Marketplace & Supplies"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Market</span>
        </button>

        {/* Missions / Objectives */}
        <button
          onClick={onOpenMissions}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold transition"
          title="Missions & Objectives"
        >
          <Target className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Missions</span>
          {uncompletedMissions > 0 && (
            <span className="w-2 h-2 rounded-full bg-neutral-200 animate-ping absolute -top-0.5 -right-0.5" />
          )}
        </button>

        {/* Robots */}
        <button
          onClick={onOpenRobots}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold transition"
          title="Robots & Drones"
        >
          <Bot className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Robots</span>
        </button>

        {/* API Docs */}
        <button
          onClick={() => setShowDocsModal(true)}
          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
          title="API Reference Manual"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleMute}
          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
          title={soundMuted ? 'Unmute audio' : 'Mute audio'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-neutral-300" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Toggle Script Editor Panel */}
        <button
          onClick={onToggleEditor}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition border ${
            editorOpen
              ? 'bg-neutral-800 text-white border-neutral-600 shadow-sm'
              : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>{editorOpen ? 'Hide Code' : 'Open Code'}</span>
        </button>
      </div>
    </header>
  );
};
