import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  Coins,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Settings,
  Code2,
  Trophy,
  UploadCloud,
  LogOut,
  Shield,
  ChevronDown,
  CheckCircle2,
  Globe,
  Wrench,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { WEATHER_PROFILES } from '../../game/simulation/weatherConfig';
import { CompetitionHUDWidget } from '../competition/CompetitionHUDWidget';

interface TopHUDProps {
  onOpenWorldLeaderboard?: () => void;
  onOpenSettings: () => void;
  onOpenMaintenance?: () => void;
  onToggleEditor: () => void;
  editorOpen: boolean;
}

const WeatherIcon: React.FC<{ weather: string }> = ({ weather }) => {
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

export const TopHUD: React.FC<TopHUDProps> = ({
  onOpenWorldLeaderboard,
  onOpenSettings,
  onOpenMaintenance,
  onToggleEditor,
  editorOpen,
}) => {
  const {
    money,
    level,
    xp,
    day,
    timeString,
    isNight,
    weather,
    nextWeather,
    isPaused,
    gameSpeed,
    soundMuted,
  } = useGameStore(
    useShallow((s) => {
      const hours = Math.floor(s.timeOfDay);
      const minutes = Math.floor((s.timeOfDay - hours) * 60);
      const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;

      return {
        money: s.money,
        level: s.level,
        xp: s.xp,
        day: s.day,
        timeString: `${displayHours}:${formattedMinutes} ${ampm}`,
        isNight: s.timeOfDay < 5.5 || s.timeOfDay > 18.5,
        weather: s.weather,
        nextWeather: s.nextWeather,
        isPaused: s.isPaused,
        gameSpeed: s.gameSpeed,
        soundMuted: s.soundMuted,
      };
    })
  );

  const setPaused = useGameStore((s) => s.setPaused);
  const setGameSpeed = useGameStore((s) => s.setGameSpeed);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const toggleDayNight = useGameStore((s) => s.toggleDayNight);

  const currentRoom = useCompetitionStore((state) => state.currentRoom);
  const currentTeam = useCompetitionStore((state) => state.currentTeam);
  const activeChallenge = useCompetitionStore((state) => state.activeChallenge);
  const selectChallenge = useCompetitionStore((state) => state.selectChallenge);
  const setShowAdminModal = useCompetitionStore((state) => state.setShowAdminModal);
  const isCompeting = Boolean(currentRoom);

  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showQuestionsDropdown, setShowQuestionsDropdown] = React.useState(false);
  const { user, profile: playerProfile, isSyncing, isSuperAdmin, syncToCloud, signOut, setShowAuthModal } = useAuthStore();

  const profile = WEATHER_PROFILES[weather];
  const nextProfile = WEATHER_PROFILES[nextWeather];

  // Next level threshold
  const levelThresholds = [0, 100, 250, 500, 900, 1500, 3000];
  const currentLevelBase = levelThresholds[level - 1] || 0;
  const nextLevelXp = levelThresholds[level] || 3000;
  const xpProgress = Math.min(100, Math.max(0, ((xp - currentLevelBase) / (nextLevelXp - currentLevelBase)) * 100));

  return (
    <header className="absolute top-0 left-0 right-0 h-14 z-40 pointer-events-none px-4 flex items-center justify-between bg-gradient-to-b from-neutral-950/70 via-neutral-950/20 to-transparent">
      {/* Brand & Level */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 bg-neutral-950/40 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 shadow-lg">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-extrabold text-emerald-300 text-xs shadow-sm font-mono">
            66
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-white leading-none font-mono">
              programmer66
            </h1>
            <span className="text-[9px] font-semibold text-emerald-400">
              Autonomous Agriculture
            </span>
          </div>
        </div>

        {/* Level & XP bar (Sandbox only) */}
        {!isCompeting && (
          <>
            <div className="hidden sm:flex flex-col gap-0.5 bg-neutral-950/40 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shadow-lg">
              <div className="flex items-center justify-between text-xs text-neutral-300 gap-3 font-semibold">
                <span>Level {level}</span>
                <span className="text-[10px] text-neutral-400 font-mono">{xp} / {nextLevelXp} XP</span>
              </div>
              <div className="w-24 h-1.5 bg-neutral-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300 shadow-sm"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>

            {/* Money / Treasury */}
            <div className="flex items-center gap-1.5 bg-neutral-950/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-neutral-100 font-bold text-xs shadow-lg">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-emerald-400">${money}</span>
            </div>
          </>
        )}
      </div>

      {/* Center Display: Interactive Competition Questions Dropdown vs Sandbox Day/Time/Weather */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        {isCompeting && currentRoom ? (
          <div className="relative">
            <button
              onClick={() => setShowQuestionsDropdown((prev) => !prev)}
              className="flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 backdrop-blur-md border border-amber-500/40 hover:border-amber-500/60 px-3 py-1.5 rounded-xl shadow-lg transition group"
              title="Click to view all competition questions and switch problems"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-300">
                  {activeChallenge ? `Q${activeChallenge.level}: ${activeChallenge.title.replace(/^Level\s*\d+:\s*/i, '')}` : 'Questions'}
                </span>
                {activeChallenge?.difficulty && (
                  <span className={`text-[9px] font-semibold uppercase px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 ${
                    activeChallenge.difficulty === 'easy'
                      ? 'text-emerald-400'
                      : activeChallenge.difficulty === 'medium'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}>
                    {activeChallenge.difficulty}
                  </span>
                )}
                {activeChallenge && currentTeam?.completedChallenges.includes(activeChallenge.id) && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {activeChallenge && (
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                    +{activeChallenge.points}p
                  </span>
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400/80 group-hover:translate-y-0.5 transition" />
            </button>

            {/* Questions Dropdown Menu */}
            {showQuestionsDropdown && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-100 flex flex-col gap-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 flex items-center justify-between">
                  <span>Contest Questions</span>
                  <span>{currentTeam?.completedChallenges.length || 0}/{currentRoom.challenges.length} Solved</span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 pt-1">
                  {currentRoom.challenges.map((chal) => {
                    const isSelected = activeChallenge?.id === chal.id;
                    const isSolved = currentTeam?.completedChallenges.includes(chal.id);

                    return (
                      <button
                        key={chal.id}
                        onClick={() => {
                          selectChallenge(chal.id);
                          setShowQuestionsDropdown(false);
                          if (!editorOpen) onToggleEditor();
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                            : 'hover:bg-neutral-900 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] font-mono flex items-center justify-center shrink-0">
                            Q{chal.level}
                          </span>
                          {chal.topic === 'leetcode' && (
                            <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-800/60 shrink-0">
                              LC
                            </span>
                          )}
                          <span className="truncate">{chal.title.replace(/^Level\s*\d+:\s*/i, '')}</span>
                          {chal.difficulty && (
                            <span
                              className={`text-[9px] font-semibold uppercase px-1 py-0.2 rounded shrink-0 bg-neutral-900 border border-neutral-800 ${
                                chal.difficulty === 'easy'
                                  ? 'text-emerald-400'
                                  : chal.difficulty === 'medium'
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {chal.difficulty}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-[10px] font-mono text-amber-400">+{chal.points}p</span>
                          {isSolved ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-neutral-700" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Day & Time (Click to toggle Day / Night Stadium Lights) */}
            <button
              onClick={toggleDayNight}
              className="text-left bg-neutral-950/40 hover:bg-neutral-900/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 hover:border-white/20 transition flex items-center gap-2 group cursor-pointer shadow-lg"
              title={isNight ? 'Click to switch to Daytime' : 'Click to switch to Nighttime (Activate Stadium Floodlights)'}
            >
              <div>
                <div className="text-xs font-bold text-neutral-200">Day {day}</div>
                <div className="text-[10px] font-mono text-neutral-400">{timeString}</div>
              </div>
              <div className="p-1 rounded-lg bg-neutral-800/80 group-hover:bg-neutral-700/80 text-neutral-300">
                {isNight ? (
                  <Moon className="w-3.5 h-3.5 text-amber-300" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
            </button>

            {/* Weather card */}
            <div className="flex items-center gap-2 bg-neutral-950/40 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shadow-lg">
              <WeatherIcon weather={weather} />
              <div>
                <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <span>{profile.name}</span>
                  <span className="text-[10px] font-mono text-neutral-400">{profile.temperatureC}°C</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  Next: {nextProfile.name}
                </div>
              </div>
            </div>

            {/* Simulation Speed & Pause */}
            <div className="hidden md:flex items-center gap-1 bg-neutral-950/40 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
              <button
                onClick={() => setPaused(!isPaused)}
                className={`p-1.5 rounded-lg transition ${isPaused ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'}`}
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
                  className={`px-2 py-0.5 text-xs font-bold rounded-lg transition ${
                    !isPaused && gameSpeed === speed
                      ? 'bg-neutral-700/90 text-white border border-neutral-600/70 shadow'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right Controls: Navigation Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Live Competition / Admin Widget */}
        <CompetitionHUDWidget />

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleMute}
          className="p-1.5 rounded-xl bg-neutral-950/40 hover:bg-neutral-900/60 backdrop-blur-md text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 transition shadow-lg"
          title={soundMuted ? 'Unmute audio' : 'Mute audio'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-neutral-300" />}
        </button>

        {/* Cloud Sync & Player Account */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg transition ${
                isSuperAdmin
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40'
                  : 'bg-neutral-950/40 hover:bg-neutral-900/60 text-neutral-200 border border-white/10 hover:border-white/20'
              }`}
              title={isSuperAdmin ? 'Super Admin Profile & Controls' : 'Cloud Profile & Sync'}
            >
              {isSuperAdmin ? (
                <Shield className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
              )}
              <span className="font-mono text-xs max-w-[90px] truncate">
                {playerProfile?.displayName || user.email?.split('@')[0]}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-3 z-50 text-xs flex flex-col gap-2.5 animate-in fade-in duration-100">
                <div className="border-b border-neutral-800 pb-2">
                  <div className="font-bold text-white truncate flex items-center justify-between">
                    <span>{playerProfile?.displayName}</span>
                    {isSuperAdmin && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded font-mono font-bold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">{user.email}</div>
                  {isSuperAdmin ? (
                    <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-1 font-mono">
                      <Shield className="w-3 h-3" />
                      <span>Organizer Privileges Active</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
                      <Cloud className="w-3 h-3" />
                      <span>{isSyncing ? 'Syncing...' : 'Cloud Synced'}</span>
                    </div>
                  )}
                </div>

                {/* Super Admin Quick Actions: System Maintenance & Organizer Console */}
                {isSuperAdmin && (
                  <>
                    <button
                      onClick={() => {
                        onOpenMaintenance?.();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition font-bold flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        <span>System Maintenance</span>
                      </div>
                      <span className="text-[10px] bg-neutral-950/80 px-1 py-0.5 rounded text-amber-400 font-mono">
                        DEV
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAdminModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 transition font-semibold flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Organizer Console</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        ROOMS
                      </span>
                    </button>
                  </>
                )}

                {!isSuperAdmin && (
                  <button
                    onClick={() => {
                      syncToCloud();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 transition font-medium flex items-center justify-between"
                  >
                    <span>Sync Farm to Cloud</span>
                    <UploadCloud className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenWorldLeaderboard?.();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 transition font-medium flex items-center justify-between"
                >
                  <span>World Leaderboard</span>
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                </button>

                <button
                  onClick={() => {
                    signOut();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 transition font-medium flex items-center justify-between"
                >
                  <span>Sign Out</span>
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 backdrop-blur-md text-sky-200 border border-sky-500/30 hover:border-sky-500/50 text-xs font-semibold transition shadow-lg"
            title="Sign in or authenticate as Super Admin"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}

        {/* Super Admin Quick Direct Button */}
        {isSuperAdmin && (
          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-md text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-lg"
            title="Open Event Organizer & Competition Dashboard"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Admin Dashboard</span>
          </button>
        )}

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-xl bg-neutral-950/40 hover:bg-neutral-900/60 backdrop-blur-md text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 transition shadow-lg"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Toggle Script Editor Panel */}
        <button
          onClick={onToggleEditor}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition border shadow-lg backdrop-blur-md ${
            editorOpen
              ? 'bg-neutral-800/90 text-white border-neutral-600'
              : 'bg-neutral-950/40 hover:bg-neutral-900/60 text-neutral-200 hover:text-white border-white/10 hover:border-white/20'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>{editorOpen ? 'Hide Code' : 'Open Code'}</span>
        </button>
      </div>
    </header>
  );
};
