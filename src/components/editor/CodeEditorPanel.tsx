import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Square,
  Plus,
  X,
  Trash2,
  BookOpen,
  Terminal,
  FastForward,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Sparkles,
  Trophy,
  Send,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEditorStore } from '../../store/useEditorStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { registerProgrammer66Autocomplete } from './monacoAutocomplete';

interface CodeEditorPanelProps {
  onClose: () => void;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({ onClose }) => {
  const {
    tabs,
    activeTabId,
    executionState,
    speedMode,
    consoleLogs,
    setActiveTab,
    updateCode,
    insertSnippet,
    addTab,
    closeTab,
    setSpeedMode,
    setShowDocsModal,
    clearConsole,
    runCode,
    stopCode,
  } = useEditorStore();

  const currentRoom = useCompetitionStore((state) => state.currentRoom);
  const currentTeam = useCompetitionStore((state) => state.currentTeam);
  const activeChallenge = useCompetitionStore((state) => state.activeChallenge);
  const submitChallengeSolution = useCompetitionStore((state) => state.submitChallengeSolution);

  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [showBeginnerGuide, setShowBeginnerGuide] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  const handleCreateTab = () => {
    const name = prompt('Enter script name (e.g. harvest.py):', 'custom.py');
    if (name) {
      addTab(name.endsWith('.py') ? name : `${name}.py`);
    }
  };

  const handleLoadStarterCode = () => {
    if (!activeChallenge) return;
    updateCode(activeChallenge.starterCode);
  };

  const handleSubmitSolution = async () => {
    if (!currentRoom || !currentTeam || !activeChallenge) return;
    setIsSubmittingChallenge(true);
    try {
      await submitChallengeSolution(
        activeTab.code,
        true,
        `Solution verified & submitted by ${currentTeam.name}`
      );
      setSubmissionSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      setTimeout(() => setSubmissionSuccess(false), 3500);
    } finally {
      setIsSubmittingChallenge(false);
    }
  };

  const QUICK_SNIPPETS = [
    {
      label: '🌱 Plant All',
      title: 'Dispatches drone to plant wheat on all empty plots',
      code: `# Dispatches drone to plant wheat on all empty plots\nfor tile in farm.tiles:\n    if tile.is_empty():\n        tile.plant("wheat")`,
    },
    {
      label: '💧 Water All',
      title: 'Dispatches drone to spray water mist on thirsty plots',
      code: `# Dispatches drone to spray water mist on dry soil\nfor tile in farm.tiles:\n    if tile.needs_water():\n        tile.water()`,
    },
    {
      label: '🌾 Harvest Ready',
      title: 'Dispatches drone to harvest all mature crops',
      code: `# Dispatches drone to harvest mature crops\nfor tile in farm.tiles:\n    if tile.is_ready():\n        tile.harvest()`,
    },
    {
      label: '🚁 Fly to (0, 0)',
      title: 'Send drone back to base coordinates',
      code: `# Send drone back to base station\nrobot.move_to(0, 0)`,
    },
    {
      label: '🔁 4x4 Area Patrol',
      title: 'Drone patrols a 4x4 grid area',
      code: `# Drone patrols a 4x4 grid area\nfor y in range(4):\n    for x in range(4):\n        robot.move_to(x, y)\n        tile = farm.get_tile(x, y)\n        if tile.is_empty():\n            robot.plant("wheat")\n        elif tile.needs_water():\n            robot.water()`,
    },
  ];

  const STARTER_TUTORIAL = `# programmer66 - Beginner Starter Script
# Click "Run Script" to watch your drone fly and automate the farm!

print("AeroDrone-01 initiating farm routine...")

# Loop through every soil plot on your farm
for tile in farm.tiles:
    # 1. If plot is empty, fly over and plant wheat
    if tile.is_empty():
        print("Drone planting wheat at (", tile.x, ",", tile.y, ")")
        tile.plant("wheat")

    # 2. If soil is dry, spray hydration mist
    if tile.needs_water():
        print("Drone watering plot at (", tile.x, ",", tile.y, ")")
        tile.water()

    # 3. If crop is fully grown, harvest it!
    if tile.is_ready():
        print("Drone harvesting mature crop at (", tile.x, ",", tile.y, ")")
        tile.harvest()

print("Routine complete! Returning to base.")
robot.move_to(0, 0)
`;

  return (
    <div className="w-full md:w-[460px] lg:w-[520px] xl:w-[580px] shrink-0 h-full bg-neutral-950 border-l border-neutral-800 flex flex-col z-20 shadow-2xl transition-all">
      {/* Tab Bar */}
      <div className="flex items-center justify-between bg-neutral-900 border-b border-neutral-800 px-2 pt-1.5 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-mono cursor-pointer transition ${
                activeTabId === tab.id
                  ? 'bg-neutral-950 text-neutral-100 font-bold border-t-2 border-neutral-400'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <span>{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="hover:text-neutral-200 text-neutral-500 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleCreateTab}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs flex items-center gap-1"
            title="Create new script file"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 mb-1">
          <button
            onClick={() => setShowBeginnerGuide((prev) => !prev)}
            className={`p-1.5 rounded text-xs flex items-center gap-1 border transition ${
              showBeginnerGuide
                ? 'bg-neutral-800 text-emerald-400 border-emerald-500/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border-neutral-700'
            }`}
            title="Toggle Beginner Guide"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">Guide</span>
          </button>
          <button
            onClick={() => setShowDocsModal(true)}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="API Documentation"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Close editor panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Controls Bar */}
      <div className="flex items-center justify-between bg-neutral-900/90 border-b border-neutral-800 px-3 py-2 shrink-0">
        <div className="flex items-center gap-2">
          {executionState === 'running' ? (
            <button
              onClick={stopCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg font-bold text-xs shadow-md transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={runCode}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-lg font-bold text-xs shadow-md transition"
            >
              <Play className="w-3.5 h-3.5 fill-current text-neutral-300" />
              <span>Run Script</span>
            </button>
          )}

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
            <FastForward className="w-3 h-3 text-neutral-500 ml-1.5" />
            {(['1x', '2x', '5x', 'instant'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSpeedMode(mode)}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase transition ${
                  speedMode === mode
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Execution Indicator Status */}
        <div className="flex items-center gap-2">
          {executionState === 'running' && (
            <span className="flex items-center gap-1 text-xs text-neutral-300 animate-pulse font-medium">
              <span className="w-2 h-2 rounded-full bg-neutral-300" />
              Flying & Working...
            </span>
          )}
          {executionState === 'success' && (
            <span className="flex items-center gap-1 text-xs text-neutral-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-300" />
              Completed
            </span>
          )}
          {executionState === 'error' && (
            <span className="flex items-center gap-1 text-xs text-neutral-300 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
              Check Error Log
            </span>
          )}
        </div>
      </div>

      {/* Active Competition Challenge Banner */}
      {currentRoom && activeChallenge && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300">
                  Level {activeChallenge.level}: {activeChallenge.title}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded">
                  +{activeChallenge.points} pts
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-1">{activeChallenge.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadStarterCode}
              className="flex items-center gap-1 px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 text-xs font-medium transition"
              title="Replace current editor text with the starter code for this challenge"
            >
              <Download className="w-3 h-3 text-neutral-400" />
              <span>Load Starter</span>
            </button>

            {currentTeam && (
              <button
                onClick={handleSubmitSolution}
                disabled={isSubmittingChallenge}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm ${
                  submissionSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                }`}
              >
                {submissionSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Submitted!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>{isSubmittingChallenge ? 'Grading...' : 'Submit Solution'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Beginner Quick Snippets Bar (1-Click Insert) */}
      <div className="bg-neutral-900/60 border-b border-neutral-800/80 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 pl-1 shrink-0">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Insert:</span>
        </span>
        {QUICK_SNIPPETS.map((snip, idx) => (
          <button
            key={idx}
            onClick={() => insertSnippet(snip.code)}
            title={snip.title}
            className="px-2 py-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 hover:text-white text-[11px] font-mono text-neutral-300 border border-neutral-700/60 whitespace-nowrap transition shrink-0 active:scale-95"
          >
            {snip.label}
          </button>
        ))}
      </div>

      {/* Collapsible Beginner Guide Drawer */}
      {showBeginnerGuide && (
        <div className="bg-neutral-900 border-b border-neutral-800 p-3.5 text-xs text-neutral-300 space-y-2.5 max-h-60 overflow-y-auto shrink-0 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-1.5 text-xs font-mono">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span>Beginner Programming Guide</span>
            </h3>
            <button
              onClick={() => updateCode(STARTER_TUTORIAL)}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded border border-neutral-700 font-mono transition"
            >
              Reset to Starter Code
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-400">
            <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 space-y-1">
              <b className="text-neutral-200">Rule 1: Colons (:)</b>
              <p>Every <code className="text-neutral-300">if</code>, <code className="text-neutral-300">for</code>, and <code className="text-neutral-300">while</code> line must end with a colon <code className="text-neutral-200">:</code>.</p>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 space-y-1">
              <b className="text-neutral-200">Rule 2: Indentation (Tab)</b>
              <p>Lines inside loops or <code className="text-neutral-300">if</code> conditions must be indented using the <code className="text-neutral-200">Tab</code> key.</p>
            </div>
          </div>

          <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 space-y-1.5 text-[11px]">
            <b className="text-neutral-200">Essential Drone Commands:</b>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[10px]">
              <div><code className="text-emerald-400">tile.plant("wheat")</code> - Plant crop</div>
              <div><code className="text-sky-400">tile.water()</code> - Spray water</div>
              <div><code className="text-amber-400">tile.harvest()</code> - Harvest ready crop</div>
              <div><code className="text-purple-400">robot.move_to(x, y)</code> - Fly to plot</div>
            </div>
            <p className="text-[10px] text-neutral-500 pt-1">
              💡 As you type, the editor will automatically pop up suggestions with autocomplete!
            </p>
          </div>
        </div>
      )}

      {/* Monaco Code Editor */}
      <div className="flex-1 relative min-h-[180px] bg-neutral-950">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={activeTab.code}
          onChange={(val) => updateCode(val || '')}
          onMount={(editor, monaco) => {
            registerProgrammer66Autocomplete(monaco);
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            wordBasedSuggestions: 'currentDocument',
            renderLineHighlight: 'all',
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>

      {/* Bottom Console / Terminal Log */}
      <div className="h-48 bg-black border-t border-neutral-800 flex flex-col font-mono text-xs shrink-0">
        {/* Terminal Header */}
        <div className="flex items-center justify-between bg-neutral-900/90 px-3 py-1.5 border-b border-neutral-800 text-neutral-400">
          <div className="flex items-center gap-1.5 font-bold text-neutral-300">
            <Terminal className="w-3.5 h-3.5 text-neutral-400" />
            <span>Farm Console</span>
            <span className="text-[10px] text-neutral-500">({consoleLogs.length} events)</span>
          </div>
          <button
            onClick={clearConsole}
            className="flex items-center gap-1 text-[11px] hover:text-white p-1 rounded hover:bg-neutral-800 transition"
            title="Clear output"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Terminal Message Stream */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1 bg-black">
          {consoleLogs.map((log) => {
            let textColor = 'text-neutral-300';
            if (log.type === 'stderr') textColor = 'text-neutral-200 font-semibold underline decoration-neutral-500';
            if (log.type === 'success') textColor = 'text-neutral-200 font-semibold';
            if (log.type === 'info') textColor = 'text-neutral-400';

            return (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-[10px] text-neutral-600 select-none">{log.timestamp}</span>
                <span className={`flex-1 break-all whitespace-pre-wrap ${textColor}`}>
                  {log.text}
                </span>
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
