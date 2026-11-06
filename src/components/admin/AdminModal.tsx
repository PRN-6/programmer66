import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Users,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Check,
  Code,
  Shield,
  Layers,
  Sparkles,
  Settings as SettingsIcon,
  Database,
  ExternalLink,
  UserX,
  Power,
} from 'lucide-react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { Challenge, ChallengeCriterion } from '../../types/competition';
import { isSupabaseConfigured } from '../../services/supabase';
import { DEFAULT_CHALLENGES } from '../../services/defaultChallenges';

export const AdminModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    currentRoom,
    teams,
    submissions,
    recentRooms,
    createRoom,
    loadRoomAsAdmin,
    fetchRecentRooms,
    startCompetition,
    pauseCompetition,
    endCompetition,
    closeRoom,
    setActiveChallenge,
    addCustomChallenge,
    deleteChallenge,
    kickTeam,
    refreshRoomData,
    updateRoomSettings,
  } = useCompetitionStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'scoreboard' | 'challenges' | 'teams' | 'settings'>('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomDuration, setNewRoomDuration] = useState(30);
  const [selectedChallengeIds, setSelectedChallengeIds] = useState<string[]>(() =>
    DEFAULT_CHALLENGES.map((c) => c.id)
  );
  const [resumeCode, setResumeCode] = useState('');
  const [resumeError, setResumeError] = useState<string | null>(null);

  const toggleChallengeSelection = (id: string) => {
    setSelectedChallengeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectPresetChallenges = (preset: 'all' | '1-3' | '1-2' | 'speed') => {
    if (preset === 'all') {
      setSelectedChallengeIds(DEFAULT_CHALLENGES.map((c) => c.id));
    } else if (preset === '1-3') {
      setSelectedChallengeIds(['chal-1', 'chal-2', 'chal-3']);
    } else if (preset === '1-2') {
      setSelectedChallengeIds(['chal-1', 'chal-2']);
    } else if (preset === 'speed') {
      setSelectedChallengeIds(['chal-5']);
    }
  };

  // New challenge form state
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [newChalTitle, setNewChalTitle] = useState('');
  const [newChalDesc, setNewChalDesc] = useState('');
  const [newChalLevel, setNewChalLevel] = useState(1);
  const [newChalPoints, setNewChalPoints] = useState(100);
  const [newChalCriterion, setNewChalCriterion] = useState<ChallengeCriterion>('planted_count');
  const [newChalTargetCount, setNewChalTargetCount] = useState(10);
  const [newChalTimeLimit, setNewChalTimeLimit] = useState(120);
  const [newChalStarterCode, setNewChalStarterCode] = useState('# Starter python code for this challenge\n');

  // Inspected team code modal
  const [inspectedTeamCode, setInspectedTeamCode] = useState<{ teamName: string; code: string } | null>(null);

  // Auto-refresh room data and fetch recent rooms
  useEffect(() => {
    fetchRecentRooms();
    const timer = setInterval(() => {
      refreshRoomData();
    }, 3000);
    return () => clearInterval(timer);
  }, [fetchRecentRooms, refreshRoomData]);

  const handleResumeRoom = async (codeToResume?: string) => {
    const code = codeToResume || resumeCode;
    if (!code.trim()) return;
    setResumeError(null);
    const room = await loadRoomAsAdmin(code.trim().toUpperCase());
    if (!room) {
      setResumeError(`Room "${code}" not found.`);
    }
  };

  const handleCopyCode = () => {
    if (!currentRoom) return;
    navigator.clipboard.writeText(currentRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!currentRoom) return;
    const url = `${window.location.origin}?room=${currentRoom.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleKickTeam = async (teamId: string, teamName: string) => {
    if (window.confirm(`Are you sure you want to kick "${teamName}" from this competition? This will remove the team from the leaderboard and room.`)) {
      await kickTeam(teamId);
    }
  };

  const handleCloseRoom = async () => {
    if (!currentRoom) return;
    if (
      window.confirm(
        `Are you sure you want to close competition room "${currentRoom.code}"? All connected participants will be disconnected from the event.`
      )
    ) {
      await closeRoom();
    }
  };

  const handleCreateNewRoom = async () => {
    if (!newRoomTitle.trim() || selectedChallengeIds.length === 0) return;
    const chosenChallenges = DEFAULT_CHALLENGES.filter((c) =>
      selectedChallengeIds.includes(c.id)
    );
    const challengesToUse = chosenChallenges.length > 0 ? chosenChallenges : DEFAULT_CHALLENGES;
    await createRoom(newRoomTitle, newRoomDuration, undefined, challengesToUse);
    setNewRoomTitle('');
  };

  const handleSaveChallenge = async () => {
    if (!newChalTitle.trim()) return;
    const newChallenge: Challenge = {
      id: `custom_${Date.now()}`,
      title: newChalTitle,
      description: newChalDesc,
      level: newChalLevel,
      points: newChalPoints,
      targetCount: newChalTargetCount,
      timeLimitSeconds: newChalTimeLimit,
      testCriterion: newChalCriterion,
      starterCode: newChalStarterCode,
    };
    await addCustomChallenge(newChallenge);
    setShowAddChallenge(false);
    setNewChalTitle('');
    setNewChalDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[88vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        {/* --- HEADER --- */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">Event Admin & Competition Manager</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Organizer Console
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Manage live coding hackathons, multi-team challenges, and real-time scoreboards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- ROOM STATUS & QUICK CONTROLS BANNER (If room exists) --- */}
        {currentRoom && (
          <div className="px-6 py-3 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-1.5">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Room Code:</span>
                <span className="text-base font-mono font-bold text-amber-400 tracking-wider">
                  {currentRoom.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs text-neutral-300 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied Invite URL!' : 'Share Room URL'}</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
                <span className="text-neutral-400">Status:</span>
                <span
                  className={`font-semibold uppercase tracking-wider ${
                    currentRoom.status === 'active'
                      ? 'text-emerald-400'
                      : currentRoom.status === 'paused'
                      ? 'text-amber-400'
                      : currentRoom.status === 'completed'
                      ? 'text-blue-400'
                      : 'text-neutral-300'
                  }`}
                >
                  {currentRoom.status}
                </span>
              </div>
            </div>

            {/* Event Timer & Run Actions */}
            <div className="flex items-center gap-2">
              {currentRoom.status === 'waiting' && (
                <button
                  onClick={() => startCompetition()}
                  className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition shadow-lg shadow-emerald-950/40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Competition</span>
                </button>
              )}

              {currentRoom.status === 'active' && (
                <>
                  <button
                    onClick={() => pauseCompetition()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-xl transition"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </button>
                  <button
                    onClick={() => endCompetition()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-xl transition"
                  >
                    <span>End Event</span>
                  </button>
                </>
              )}

              {currentRoom.status === 'paused' && (
                <button
                  onClick={() => startCompetition()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </button>
              )}

              {/* Close Room Action Button */}
              <button
                onClick={handleCloseRoom}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-rose-950/80 border border-neutral-700 hover:border-rose-600/80 text-neutral-300 hover:text-rose-300 font-medium text-xs rounded-xl transition shadow-sm"
                title="Close room and return to event manager"
              >
                <Power className="w-3.5 h-3.5 text-rose-400" />
                <span>Close Room</span>
              </button>
            </div>
          </div>
        )}

        {/* --- NAVIGATION TABS --- */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-6 gap-2">
          {[
            { id: 'overview', label: 'Room & Controls', icon: Layers },
            { id: 'scoreboard', label: `Live Scoreboard (${teams.length})`, icon: Trophy },
            { id: 'challenges', label: `Problems & Levels (${currentRoom?.challenges.length || 0})`, icon: Code },
            { id: 'teams', label: `Teams Manager (${teams.length})`, icon: Users },
            { id: 'settings', label: 'Settings & Cloud DB', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition ${
                  active
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- TAB CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW & ROOM CONTROLLER */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {!currentRoom ? (
                <div className="max-w-2xl mx-auto py-6 space-y-6">
                  {/* Option 1: Resume / Connect to Existing Room */}
                  <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-amber-400" />
                        <span>Resume or Manage Existing Room</span>
                      </h3>
                      <span className="text-xs text-neutral-500">Already have a room code?</span>
                    </div>

                    {resumeError && (
                      <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl">
                        {resumeError}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Room Code (e.g. PROG-9774)"
                        value={resumeCode}
                        onChange={(e) => setResumeCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 font-mono text-sm tracking-wider text-amber-400 uppercase placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleResumeRoom()}
                        disabled={!resumeCode.trim()}
                        className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-xl transition"
                      >
                        Open Dashboard
                      </button>
                    </div>

                    {/* Quick list of recent rooms */}
                    {recentRooms.length > 0 && (
                      <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                          Recent Rooms:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {recentRooms.slice(0, 4).map((r) => (
                            <button
                              key={r.id}
                              onClick={() => handleResumeRoom(r.code)}
                              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left flex items-center justify-between transition"
                            >
                              <div className="overflow-hidden">
                                <div className="text-xs font-bold text-neutral-200 truncate">{r.title}</div>
                                <span className="font-mono text-[11px] text-amber-400">{r.code}</span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 uppercase font-semibold">
                                {r.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Create a New Competition Room */}
                  <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-neutral-100">Create a New Competition Event</h3>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Competition / Event Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Programmer66 National Coding Derby 2026"
                        value={newRoomTitle}
                        onChange={(e) => setNewRoomTitle(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Event Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="240"
                        value={newRoomDuration}
                        onChange={(e) => setNewRoomDuration(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Level / Challenge Selection */}
                    <div className="space-y-2 pt-2 border-t border-neutral-800">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <label className="block text-xs font-bold text-neutral-200">
                            Select Included Levels / Questions
                          </label>
                          <p className="text-[11px] text-neutral-400">
                            Participants can browse, select, and solve any of these questions during the contest.
                          </p>
                        </div>
                        {/* Quick Presets */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => selectPresetChallenges('all')}
                            className={`px-2 py-1 text-[10px] font-semibold rounded-lg border transition ${
                              selectedChallengeIds.length === DEFAULT_CHALLENGES.length
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-neutral-700'
                            }`}
                          >
                            All 5 Levels
                          </button>
                          <button
                            type="button"
                            onClick={() => selectPresetChallenges('1-3')}
                            className={`px-2 py-1 text-[10px] font-semibold rounded-lg border transition ${
                              selectedChallengeIds.length === 3 &&
                              selectedChallengeIds.includes('chal-1') &&
                              selectedChallengeIds.includes('chal-2') &&
                              selectedChallengeIds.includes('chal-3')
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-neutral-700'
                            }`}
                          >
                            Levels 1–3
                          </button>
                          <button
                            type="button"
                            onClick={() => selectPresetChallenges('1-2')}
                            className={`px-2 py-1 text-[10px] font-semibold rounded-lg border transition ${
                              selectedChallengeIds.length === 2 &&
                              selectedChallengeIds.includes('chal-1') &&
                              selectedChallengeIds.includes('chal-2')
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-neutral-700'
                            }`}
                          >
                            Beginner (1–2)
                          </button>
                          <button
                            type="button"
                            onClick={() => selectPresetChallenges('speed')}
                            className={`px-2 py-1 text-[10px] font-semibold rounded-lg border transition ${
                              selectedChallengeIds.length === 1 && selectedChallengeIds.includes('chal-5')
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-neutral-700'
                            }`}
                          >
                            Speed Run (L5)
                          </button>
                        </div>
                      </div>

                      {/* Level Cards */}
                      <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                        {DEFAULT_CHALLENGES.map((chal) => {
                          const isSelected = selectedChallengeIds.includes(chal.id);
                          return (
                            <div
                              key={chal.id}
                              onClick={() => toggleChallengeSelection(chal.id)}
                              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                                isSelected
                                  ? 'bg-amber-500/10 border-amber-500/40 text-neutral-100 shadow-sm'
                                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs font-bold transition ${
                                    isSelected
                                      ? 'bg-amber-500 text-neutral-950 border-amber-400'
                                      : 'bg-neutral-800 border-neutral-700 text-transparent'
                                  }`}
                                >
                                  ✓
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-amber-300">Level {chal.level}:</span>
                                    <span className="font-semibold text-neutral-100">{chal.title.replace(/^Level\s*\d+:\s*/i, '')}</span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-amber-400 font-bold">
                                      +{chal.points} pts
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                                    {chal.description}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono uppercase text-neutral-400 shrink-0">
                                {chal.testCriterion}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Selected Summary */}
                      <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                        <span>
                          Selected: <b className="text-amber-300">{selectedChallengeIds.length} Levels</b>
                        </span>
                        <span>
                          Total Available: <b className="text-amber-300">
                            {DEFAULT_CHALLENGES
                              .filter((c) => selectedChallengeIds.includes(c.id))
                              .reduce((acc, c) => acc + c.points, 0)} pts
                          </b>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCreateNewRoom}
                      disabled={!newRoomTitle.trim() || selectedChallengeIds.length === 0}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-950/40"
                    >
                      🚀 Generate Room & Launch Event ({selectedChallengeIds.length} Levels)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Event Details Card */}
                  <div className="md:col-span-2 p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-neutral-200">Active Competition Details</h3>
                      <span className="text-xs text-neutral-500 font-mono">ID: {currentRoom.id}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-neutral-900/80 border border-neutral-800/80 rounded-xl">
                        <span className="text-xs text-neutral-400">Total Teams</span>
                        <div className="text-xl font-bold text-neutral-100 mt-1">{teams.length}</div>
                      </div>
                      <div className="p-3 bg-neutral-900/80 border border-neutral-800/80 rounded-xl">
                        <span className="text-xs text-neutral-400">Challenges</span>
                        <div className="text-xl font-bold text-amber-400 mt-1">{currentRoom.challenges.length}</div>
                      </div>
                      <div className="p-3 bg-neutral-900/80 border border-neutral-800/80 rounded-xl">
                        <span className="text-xs text-neutral-400">Submissions</span>
                        <div className="text-xl font-bold text-emerald-400 mt-1">{submissions.length}</div>
                      </div>
                      <div className="p-3 bg-neutral-900/80 border border-neutral-800/80 rounded-xl">
                        <span className="text-xs text-neutral-400">Duration</span>
                        <div className="text-xl font-bold text-blue-400 mt-1">{currentRoom.durationMinutes}m</div>
                      </div>
                    </div>

                    {/* Active Challenge Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-2">
                        Currently Active Problem / Level for Participants:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentRoom.challenges.map((chal) => {
                          const isCurrent = currentRoom.activeChallengeId === chal.id;
                          return (
                            <button
                              key={chal.id}
                              onClick={() => setActiveChallenge(chal.id)}
                              className={`p-3 text-left rounded-xl border transition ${
                                isCurrent
                                  ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-400'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span>Level {chal.level}: {chal.title}</span>
                                <span className="text-amber-400">+{chal.points} pts</span>
                              </div>
                              <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{chal.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Quick Guide Card */}
                  <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>How It Works</span>
                    </h4>
                    <ol className="text-xs text-neutral-400 space-y-2 list-decimal list-inside leading-relaxed">
                      <li>Share the Room Code <strong className="text-neutral-200">{currentRoom.code}</strong> with your participants.</li>
                      <li>Participants click <strong className="text-neutral-200">&ldquo;Join Event&rdquo;</strong> in the game, enter the room code, and register their team name.</li>
                      <li>When ready, click <strong className="text-emerald-400">&ldquo;Start Competition&rdquo;</strong> above to begin!</li>
                      <li>Teams write and execute code in the Python editor. Correct algorithmic farming runs award points live to your Scoreboard!</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE SCOREBOARD */}
          {activeTab === 'scoreboard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-200">Live Team Leaderboard</h3>
                  <p className="text-xs text-neutral-500">Real-time standings based on completed challenges and points</p>
                </div>
                <button
                  onClick={() => refreshRoomData()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs text-neutral-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refresh Standings</span>
                </button>
              </div>

              {teams.length === 0 ? (
                <div className="p-12 text-center border border-neutral-800 border-dashed rounded-2xl space-y-2">
                  <Users className="w-8 h-8 mx-auto text-neutral-600" />
                  <p className="text-sm text-neutral-400">No teams have joined this room yet.</p>
                  <p className="text-xs text-neutral-600">
                    Instruct participants to use Room Code <span className="text-amber-400 font-mono font-bold">{currentRoom?.code}</span>
                  </p>
                </div>
              ) : (
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900/60 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-4 py-3">Rank</th>
                        <th className="px-4 py-3">Team Name</th>
                        <th className="px-4 py-3">Members</th>
                        <th className="px-4 py-3">Solved</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {teams.map((team, idx) => {
                        const isFirst = idx === 0;
                        const isSecond = idx === 1;
                        const isThird = idx === 2;

                        return (
                          <tr key={team.id} className="hover:bg-neutral-900/40 transition">
                            <td className="px-4 py-3 font-mono font-bold">
                              {isFirst && <span className="text-amber-400">🥇 #1</span>}
                              {isSecond && <span className="text-neutral-300">🥈 #2</span>}
                              {isThird && <span className="text-amber-600">🥉 #3</span>}
                              {!isFirst && !isSecond && !isThird && <span className="text-neutral-500">#{idx + 1}</span>}
                            </td>
                            <td className="px-4 py-3 font-semibold text-neutral-200">
                              {team.name}
                            </td>
                            <td className="px-4 py-3 text-neutral-400">
                              {team.members.join(', ')}
                            </td>
                            <td className="px-4 py-3 text-emerald-400 font-mono font-semibold">
                              {team.completedChallenges.length} challenges
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg font-mono font-bold">
                                {team.score} pts
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                  team.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {team.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {team.submittedCode && (
                                  <button
                                    onClick={() => setInspectedTeamCode({ teamName: team.name, code: team.submittedCode || '' })}
                                    className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 text-xs transition"
                                  >
                                    Inspect Code
                                  </button>
                                )}
                                <button
                                  onClick={() => handleKickTeam(team.id, team.name)}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 border border-red-700/60 text-red-300 hover:text-white rounded-lg text-xs transition"
                                  title="Kick and remove this team from the competition"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Kick</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROBLEMS & LEVELS */}
          {activeTab === 'challenges' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-200">Competition Challenges & Levels</h3>
                  <p className="text-xs text-neutral-500">Configure target tasks, test criteria, and starter Python code</p>
                </div>
                <button
                  onClick={() => setShowAddChallenge(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-950/40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Problem / Level</span>
                </button>
              </div>

              {/* Add Challenge Modal / Form Inline */}
              {showAddChallenge && (
                <div className="p-5 bg-neutral-950 border border-amber-500/40 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Create New Problem</h4>
                    <button onClick={() => setShowAddChallenge(false)} className="text-neutral-500 hover:text-neutral-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Problem Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Quadcopter Weed Eliminator"
                        value={newChalTitle}
                        onChange={(e) => setNewChalTitle(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Award Points</label>
                      <input
                        type="number"
                        value={newChalPoints}
                        onChange={(e) => setNewChalPoints(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Problem Description & Objective</label>
                    <textarea
                      rows={2}
                      placeholder="Explain what the students' code should achieve..."
                      value={newChalDesc}
                      onChange={(e) => setNewChalDesc(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Level Number</label>
                      <input
                        type="number"
                        value={newChalLevel}
                        onChange={(e) => setNewChalLevel(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Success Criteria</label>
                      <select
                        value={newChalCriterion}
                        onChange={(e) => setNewChalCriterion(e.target.value as ChallengeCriterion)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-200"
                      >
                        <option value="planted_count">Plant Target Count</option>
                        <option value="harvest_count">Harvest Target Count</option>
                        <option value="water_efficiency">Moisture / Water Optimal</option>
                        <option value="speed_run">Speed Run</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Target Quantity</label>
                      <input
                        type="number"
                        value={newChalTargetCount}
                        onChange={(e) => setNewChalTargetCount(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Time Limit (Sec)</label>
                      <input
                        type="number"
                        value={newChalTimeLimit}
                        onChange={(e) => setNewChalTimeLimit(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Starter Code Template</label>
                    <textarea
                      rows={4}
                      value={newChalStarterCode}
                      onChange={(e) => setNewChalStarterCode(e.target.value)}
                      className="w-full font-mono bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddChallenge(false)}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChallenge}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl transition"
                    >
                      Save Challenge
                    </button>
                  </div>
                </div>
              )}

              {/* Challenge List */}
              <div className="grid grid-cols-1 gap-3">
                {currentRoom?.challenges.map((chal) => (
                  <div
                    key={chal.id}
                    className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 text-xs font-mono font-bold rounded">
                          Level {chal.level}
                        </span>
                        <h4 className="text-sm font-semibold text-neutral-200">{chal.title}</h4>
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 text-xs font-mono font-bold rounded">
                          +{chal.points} pts
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">{chal.description}</p>
                      <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-1 font-mono">
                        <span>Criterion: {chal.testCriterion}</span>
                        <span>Target: {chal.targetCount}</span>
                        <span>Time Limit: {chal.timeLimitSeconds}s</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteChallenge(chal.id)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete Challenge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TEAMS MANAGER */}
          {activeTab === 'teams' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-200">Participating Teams ({teams.length})</h3>
                  <p className="text-xs text-neutral-500">Monitor active squads, roster sizes, and moderate participants</p>
                </div>
              </div>

              {teams.length === 0 ? (
                <div className="p-8 text-center border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                  No teams joined yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teams.map((t) => (
                    <div key={t.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-neutral-200">{t.name}</h4>
                        <span className="font-mono font-bold text-amber-400 text-xs">{t.score} pts</span>
                      </div>
                      <div className="text-xs text-neutral-400">
                        <span className="text-neutral-500 font-medium">Members: </span>
                        {t.members.join(', ')}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[11px]">
                        <span className="text-neutral-500">
                          Joined: {new Date(t.joinedAt).toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => handleKickTeam(t.id, t.name)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-red-950/60 hover:bg-red-900/80 border border-red-700/60 text-red-300 hover:text-white rounded-lg text-xs font-semibold transition"
                          title="Kick and remove this team from the competition"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Kick Team</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SETTINGS & SUPABASE CLOUD SYNC */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-200">Database & Realtime Status</h3>
                    <p className="text-xs text-neutral-400">
                      Multi-computer synchronization engine
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-neutral-900/60 border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-300">Sync Engine:</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isSupabaseConfigured
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {isSupabaseConfigured ? '⚡ Supabase Cloud Realtime Connected' : '💻 Local Peer & Demo Sync'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {isSupabaseConfigured
                      ? 'Live PostgreSQL WebSockets are active. Any team joining from anywhere in the world will automatically sync on this admin screen instantaneously.'
                      : 'Currently operating in Local / Offline Peer Mode. To enable live multi-computer sync across different laptops, connect a free Supabase project by adding VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'}
                  </p>
                </div>
              </div>

              {currentRoom && (
                <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-neutral-200">Room Rules & Limits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Max Teams</label>
                      <input
                        type="number"
                        value={currentRoom.settings.maxTeams}
                        onChange={(e) => updateRoomSettings({ maxTeams: Number(e.target.value) })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Max Members per Team</label>
                      <input
                        type="number"
                        value={currentRoom.settings.maxTeamSize}
                        onChange={(e) => updateRoomSettings({ maxTeamSize: Number(e.target.value) })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-200"
                      />
                    </div>
                  </div>

                  {/* Danger Zone: Close Room */}
                  <div className="pt-4 border-t border-neutral-900 space-y-2.5">
                    <div className="flex items-center gap-2 text-rose-400">
                      <Power className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">Danger Zone</h4>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Close this competition event. All connected participants will be returned to the sandbox.
                    </p>
                    <button
                      onClick={handleCloseRoom}
                      className="px-4 py-2 bg-red-950/60 hover:bg-red-900/80 border border-red-700/60 text-red-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Close & Terminate Room</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- CODE INSPECTOR POPUP (If admin wants to inspect student team's code) --- */}
        {inspectedTeamCode && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
              <div className="px-5 py-3 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-200">
                  Inspecting Solution: {inspectedTeamCode.teamName}
                </span>
                <button
                  onClick={() => setInspectedTeamCode(null)}
                  className="text-neutral-400 hover:text-neutral-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-auto bg-neutral-900 font-mono text-xs text-neutral-200 leading-relaxed">
                <pre>{inspectedTeamCode.code || '# No code submitted yet'}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
