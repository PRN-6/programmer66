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
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Lock,
  GripHorizontal,
  Columns2,
  AppWindow,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEditorStore } from '../../store/useEditorStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useGameStore } from '../../store/useGameStore';
import { soundManager } from '../../audio/soundEffects';
import { evaluateChallenge } from '../../services/challengeEvaluator';
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
    addLog,
  } = useEditorStore();

  const currentRoom = useCompetitionStore((state) => state.currentRoom);
  const currentTeam = useCompetitionStore((state) => state.currentTeam);
  const activeChallenge = useCompetitionStore((state) => state.activeChallenge);
  const selectChallenge = useCompetitionStore((state) => state.selectChallenge);
  const submitChallengeSolution = useCompetitionStore((state) => state.submitChallengeSolution);
  const resetFarmPlots = useGameStore((state) => state.resetFarmPlots);

  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [taskDone, setTaskDone] = useState(false);
  const [evaluationMessage, setEvaluationMessage] = useState<string | null>(null);
  const [showBeginnerGuide, setShowBeginnerGuide] = useState(false);

  const challenges = currentRoom?.challenges || [];
  const activeChalIndex = challenges.findIndex((c) => c.id === activeChallenge?.id);
  const solvedChallengeIds = currentTeam?.completedChallenges || [];
  const solvedCount = challenges.filter((c) => solvedChallengeIds.includes(c.id)).length;

  const handleSelectQuestion = (chalId: string) => {
    selectChallenge(chalId);
    setTaskDone(false);
    setEvaluationMessage(null);
    setSubmissionError(null);

    const targetChal = challenges.find((c) => c.id === chalId);
    if (!targetChal) return;

    const tabName = `level_${targetChal.level}.py`;
    const existingTab = tabs.find((t) => t.name === tabName);
    if (existingTab) {
      setActiveTab(existingTab.id);
    } else {
      addTab(tabName, targetChal.starterCode);
    }
  };

  const handlePrevQuestion = () => {
    if (activeChalIndex > 0) {
      handleSelectQuestion(challenges[activeChalIndex - 1].id);
    }
  };

  const handleNextQuestion = () => {
    if (activeChalIndex >= 0 && activeChalIndex < challenges.length - 1) {
      handleSelectQuestion(challenges[activeChalIndex + 1].id);
    }
  };

  // --- Window Mode & Floating Position/Size State ---
  const [windowMode, setWindowMode] = useState<'floating' | 'docked'>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('prog66_editor_window_mode');
        if (saved === 'docked' || saved === 'floating') return saved;
      }
    } catch {
      // ignore
    }
    return 'floating';
  });

  const [panelWidth, setPanelWidth] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('prog66_editor_width');
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 380) return parsed;
        }
      }
    } catch {
      // ignore
    }
    return typeof window !== 'undefined' ? Math.min(620, Math.max(480, window.innerWidth - 60)) : 580;
  });

  const [panelHeight, setPanelHeight] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('prog66_editor_height');
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 320) return parsed;
        }
      }
    } catch {
      // ignore
    }
    return typeof window !== 'undefined' ? Math.min(680, window.innerHeight - 90) : 600;
  });

  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedX = localStorage.getItem('prog66_editor_x');
        const savedY = localStorage.getItem('prog66_editor_y');
        if (savedX && savedY) {
          const px = parseInt(savedX, 10);
          const py = parseInt(savedY, 10);
          if (!isNaN(px) && !isNaN(py)) {
            return {
              x: Math.max(10, Math.min(window.innerWidth - 200, px)),
              y: Math.max(56, Math.min(window.innerHeight - 80, py)),
            };
          }
        }
      }
    } catch {
      // ignore
    }
    const defaultW = 620;
    const defaultX = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - defaultW - 24) : 400;
    return { x: defaultX, y: 64 };
  });

  const [isMaximized, setIsMaximized] = useState(false);
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const [resizingDirection, setResizingDirection] = useState<string | null>(null);

  const handleStartDragWindow = (e: React.MouseEvent) => {
    if (isMaximized || windowMode === 'docked') return;

    // Do not initiate drag if user clicked a button, input, tab, etc.
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('.tab-item') ||
      target.closest('.no-drag')
    ) {
      return;
    }

    e.preventDefault();
    setIsDraggingWindow(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startPosX = position.x;
    const startPosY = position.y;
    let currentX = startPosX;
    let currentY = startPosY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;

      const maxX = window.innerWidth - 160;
      const maxY = window.innerHeight - 80;

      currentX = Math.max(10, Math.min(maxX, startPosX + deltaX));
      currentY = Math.max(56, Math.min(maxY, startPosY + deltaY));

      setPosition({ x: currentX, y: currentY });
    };

    const handleMouseUp = () => {
      setIsDraggingWindow(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('prog66_editor_x', String(currentX));
          localStorage.setItem('prog66_editor_y', String(currentY));
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleStartResize =
    (direction: 'left' | 'right' | 'bottom' | 'bottom-left' | 'bottom-right') =>
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isMaximized) return;

      setResizingDirection(direction);

      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startW = panelWidth;
      const startH = panelHeight;
      const startPosX = position.x;
      let currentW = startW;
      let currentH = startH;
      let currentX = startPosX;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startMouseX;
        const deltaY = moveEvent.clientY - startMouseY;

        const minW = 380;
        const maxW = Math.min(window.innerWidth - 30, 1200);
        const minH = 300;
        const maxH = Math.min(window.innerHeight - 70, 1000);

        if (direction === 'left' || direction === 'bottom-left') {
          currentW = Math.max(minW, Math.min(maxW, startW - deltaX));
          currentX = Math.max(10, startPosX - (currentW - startW));
          setPanelWidth(currentW);
          if (windowMode === 'floating') {
            setPosition((pos) => ({ ...pos, x: currentX }));
          }
        } else if (direction === 'right' || direction === 'bottom-right') {
          currentW = Math.max(minW, Math.min(maxW, startW + deltaX));
          setPanelWidth(currentW);
        }

        if (
          direction === 'bottom' ||
          direction === 'bottom-left' ||
          direction === 'bottom-right'
        ) {
          currentH = Math.max(minH, Math.min(maxH, startH + deltaY));
          setPanelHeight(currentH);
        }
      };

      const handleMouseUp = () => {
        setResizingDirection(null);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('prog66_editor_width', String(currentW));
            localStorage.setItem('prog66_editor_height', String(currentH));
            localStorage.setItem('prog66_editor_x', String(currentX));
          }
        } catch {
          // ignore
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

  // --- Dynamic Console Resizing & Minimizing ---
  const [consoleHeight, setConsoleHeight] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('prog66_console_height');
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 60) return parsed;
        }
      }
    } catch {
      // ignore
    }
    return 190;
  });
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
  const [isDraggingConsole, setIsDraggingConsole] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const isCompeting = Boolean(currentRoom);

  // Auto-populate challenge starter code on competition enter / round switch
  const lastLoadedChallengeIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (isCompeting && activeChallenge && lastLoadedChallengeIdRef.current !== activeChallenge.id) {
      lastLoadedChallengeIdRef.current = activeChallenge.id;
      setTaskDone(false);
      setEvaluationMessage(null);
      setSubmissionError(null);
      const currentCode = activeTab?.code || '';
      if (
        !currentCode.trim() ||
        currentCode.includes('Deploying AeroDrone-01...') ||
        currentCode.includes('# programmer66 - Autonomous Agricultural Drone')
      ) {
        updateCode(activeChallenge.starterCode);
      }
    }
  }, [isCompeting, activeChallenge, activeTab?.code, updateCode]);

  useEffect(() => {
    if (!isConsoleCollapsed) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs, isConsoleCollapsed]);

  // Automatically un-collapse console if runtime error occurs so user can see error log
  useEffect(() => {
    if (executionState === 'error') {
      const timer = setTimeout(() => setIsConsoleCollapsed(false), 0);
      return () => clearTimeout(timer);
    }
  }, [executionState]);

  // Console height drag handler
  const handleStartResizeConsole = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingConsole(true);
    const startY = e.clientY;
    const startH = isConsoleCollapsed ? 36 : consoleHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const maxH = Math.max(120, Math.round(window.innerHeight * 0.7));
      const nextH = Math.max(36, Math.min(maxH, startH + delta));

      if (nextH <= 48) {
        setIsConsoleCollapsed(true);
      } else {
        setIsConsoleCollapsed(false);
        setConsoleHeight(nextH);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingConsole(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setConsoleHeight((curr) => {
        try {
          localStorage.setItem('prog66_console_height', String(curr));
        } catch {
          // ignore
        }
        return curr;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

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

  const isAlreadyCompleted = Boolean(
    activeChallenge && currentTeam?.completedChallenges?.includes(activeChallenge.id)
  );

  const handleRunScript = async () => {
    setTaskDone(false);
    setSubmissionError(null);
    await runCode();

    // After script finishes running, evaluate challenge if in competition mode
    if (isCompeting && activeChallenge) {
      const gameState = useGameStore.getState();
      const evaluation = await evaluateChallenge(activeChallenge, gameState, activeTab.code);
      setEvaluationMessage(evaluation.message);

      if (evaluation.passed) {
        setTaskDone(true);
        soundManager.playSuccess();
        addLog(
          'success',
          `🏆 [TASK COMPLETED] All criteria passed! (${evaluation.message}) You can now submit your official answer.`
        );
      } else {
        setTaskDone(false);
        addLog('info', `📊 [Challenge Criteria Check] ${evaluation.message}`);
      }
    }
  };

  const handleSubmitSolution = async () => {
    if (!currentRoom || !currentTeam || !activeChallenge) return;

    // Verify task criteria are met before submission
    const gameState = useGameStore.getState();
    const evaluation = await evaluateChallenge(activeChallenge, gameState, activeTab.code);
    if (!evaluation.passed) {
      soundManager.playError();
      setSubmissionError(evaluation.message);
      setTaskDone(false);
      addLog('stderr', `❌ Verification Failed: ${evaluation.message}`);
      setTimeout(() => setSubmissionError(null), 7000);
      return;
    }

    setIsSubmittingChallenge(true);
    setSubmissionError(null);

    try {
      // Passed verification! Submit solution
      await submitChallengeSolution(
        activeTab.code,
        true,
        evaluation.message
      );

      soundManager.playSuccess();
      setSubmissionSuccess(true);
      setTaskDone(false);
      addLog(
        'success',
        `🏆 SUCCESS: ${evaluation.message} (+${activeChallenge.points} pts awarded to ${currentTeam.name})`
      );

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => setSubmissionSuccess(false), 4000);
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

  const COMPETITION_SNIPPETS = [
    {
      label: '🌱 Plant Target',
      title: 'Plant target crop on current plot or coordinate',
      code: activeChallenge?.targetCrop
        ? `plant(x, y, "${activeChallenge.targetCrop}")`
        : `plant(x, y, "carrot")`,
    },
    {
      label: '💧 Water Plot',
      title: 'Spray water mist on plot',
      code: `water(x, y)`,
    },
    {
      label: '🌾 Harvest Plot',
      title: 'Harvest mature crop from plot',
      code: `harvest(x, y)`,
    },
    {
      label: '🚁 fly_to(x, y)',
      title: 'Fly drone to target coordinate',
      code: `fly_to(x, y)`,
    },
  ];

  const snippetsToDisplay = isCompeting ? COMPETITION_SNIPPETS : QUICK_SNIPPETS;

  const visibleTabs = isCompeting
    ? [
        {
          id: activeTabId,
          name: activeChallenge ? `level_${activeChallenge.level}_solution.py` : 'solution.py',
        },
      ]
    : tabs;

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

  // Mode-based layout styles
  const windowStyles: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        left: '12px',
        top: '60px',
        width: 'calc(100vw - 24px)',
        height: 'calc(100vh - 72px)',
        zIndex: 40,
      }
    : windowMode === 'docked'
    ? {
        position: 'fixed',
        right: 0,
        top: '56px',
        bottom: 0,
        width: `${panelWidth}px`,
        height: 'calc(100vh - 56px)',
        zIndex: 40,
      }
    : {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${panelWidth}px`,
        height: `${panelHeight}px`,
        zIndex: 40,
      };

  return (
    <div
      style={windowStyles}
      className={`flex flex-col bg-neutral-950/92 backdrop-blur-2xl shadow-2xl overflow-hidden transition-[box-shadow] ${
        windowMode === 'docked'
          ? 'border-l border-white/10'
          : 'border border-white/15 rounded-2xl ring-1 ring-black/60 shadow-[0_20px_60px_rgba(0,0,0,0.85)]'
      } ${
        isDraggingWindow || resizingDirection
          ? 'select-none transition-none'
          : 'duration-150'
      }`}
    >
      {/* Resizing Edge Handles (Only in floating window mode and when not maximized) */}
      {windowMode === 'floating' && !isMaximized && (
        <>
          {/* Left Edge Handle */}
          <div
            onMouseDown={handleStartResize('left')}
            className="absolute -left-1 top-3 bottom-3 w-2.5 cursor-ew-resize z-40 hover:bg-sky-400/30 transition rounded-l"
            title="Resize width"
          />

          {/* Right Edge Handle */}
          <div
            onMouseDown={handleStartResize('right')}
            className="absolute -right-1 top-3 bottom-3 w-2.5 cursor-ew-resize z-40 hover:bg-sky-400/30 transition rounded-r"
            title="Resize width"
          />

          {/* Bottom Edge Handle */}
          <div
            onMouseDown={handleStartResize('bottom')}
            className="absolute -bottom-1 left-3 right-3 h-2.5 cursor-ns-resize z-40 hover:bg-sky-400/30 transition rounded-b"
            title="Resize height"
          />

          {/* Bottom-Left Corner Handle */}
          <div
            onMouseDown={handleStartResize('bottom-left')}
            className="absolute -bottom-1.5 -left-1.5 w-4 h-4 cursor-nesw-resize z-50 hover:bg-sky-400/50 rounded-bl transition"
            title="Resize diagonally"
          />

          {/* Bottom-Right Corner Handle */}
          <div
            onMouseDown={handleStartResize('bottom-right')}
            className="absolute -bottom-1.5 -right-1.5 w-4 h-4 cursor-nwse-resize z-50 hover:bg-sky-400/50 rounded-br transition"
            title="Resize diagonally"
          />
        </>
      )}

      {/* When docked, provide Left Border resize handle */}
      {windowMode === 'docked' && !isMaximized && (
        <div
          onMouseDown={handleStartResize('left')}
          className="absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize z-40 group flex items-center justify-center hover:bg-neutral-500/20 transition"
          title="Drag left/right to resize Code Editor width"
        >
          <div className="w-1 h-10 rounded-full bg-neutral-600 group-hover:bg-neutral-300 group-hover:h-16 transition-all" />
        </div>
      )}

      {/* Tab Bar / Title Bar (Draggable in floating mode) */}
      <div
        onMouseDown={handleStartDragWindow}
        className={`flex items-center justify-between bg-neutral-900/90 border-b border-neutral-800 px-3 py-1.5 shrink-0 select-none ${
          windowMode === 'floating' && !isMaximized ? 'cursor-move group' : ''
        }`}
        title={
          windowMode === 'floating' && !isMaximized
            ? 'Click and drag to move code editor window'
            : undefined
        }
      >
        <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar">
          {windowMode === 'floating' && !isMaximized && (
            <div
              className="p-1 text-neutral-500 group-hover:text-neutral-300 transition shrink-0"
              title="Drag window"
            >
              <GripHorizontal className="w-4 h-4" />
            </div>
          )}

          {visibleTabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-item flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition shrink-0 ${
                activeTabId === tab.id
                  ? 'bg-neutral-950 text-neutral-100 font-bold border border-white/10 shadow-sm'
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
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs flex items-center gap-1 shrink-0"
            title="Create new script file"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={() => setShowBeginnerGuide((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 border transition ${
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
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="API Documentation"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Dock / Float Toggle */}
          <button
            onClick={() => {
              setWindowMode((prev) => {
                const next = prev === 'floating' ? 'docked' : 'floating';
                try {
                  if (typeof window !== 'undefined' && window.localStorage) {
                    localStorage.setItem('prog66_editor_window_mode', next);
                  }
                } catch {
                  // ignore
                }
                return next;
              });
              if (isMaximized) setIsMaximized(false);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title={
              windowMode === 'floating'
                ? 'Dock editor to right side'
                : 'Float editor as movable window'
            }
          >
            {windowMode === 'floating' ? (
              <Columns2 className="w-4 h-4" />
            ) : (
              <AppWindow className="w-4 h-4" />
            )}
          </button>

          {/* Maximize / Restore Toggle */}
          <button
            onClick={() => setIsMaximized((prev) => !prev)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title={isMaximized ? 'Restore editor size' : 'Maximize editor width'}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-300 transition"
            title="Close editor panel (Esc / Hide Code)"
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
              onClick={handleRunScript}
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

      {/* Multi-Problem Switcher & Contest Question Navigator */}
      {currentRoom && challenges.length > 0 && (
        <div className="bg-neutral-950 border-b border-amber-500/30 flex flex-col shrink-0">
          {/* Top Multi-Question Pills Row */}
          <div className="px-3 py-1.5 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mr-1 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Questions:</span>
              </span>

              {/* Prev Button */}
              <button
                onClick={handlePrevQuestion}
                disabled={activeChalIndex <= 0}
                className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 hover:bg-neutral-800 transition"
                title="Previous Question"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Problem Pills */}
              {challenges.map((chal, idx) => {
                const isSelected = activeChallenge?.id === chal.id;
                const isSolved = solvedChallengeIds.includes(chal.id);
                const diffDot =
                  chal.difficulty === 'easy'
                    ? 'bg-emerald-400'
                    : chal.difficulty === 'medium'
                    ? 'bg-amber-400'
                    : chal.difficulty === 'hard'
                    ? 'bg-rose-400'
                    : 'bg-neutral-500';

                return (
                  <button
                    key={chal.id}
                    onClick={() => handleSelectQuestion(chal.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 border ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm font-bold ring-1 ring-amber-400/30'
                        : isSolved
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/40'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800'
                    }`}
                    title={`Question ${idx + 1} (${chal.topic === 'leetcode' ? 'LeetCode ' : ''}${chal.difficulty || 'normal'}): ${chal.title} (+${chal.points} pts)`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${diffDot}`} />
                    <span>Q{chal.level}</span>
                    {chal.topic === 'leetcode' && (
                      <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1 rounded border border-cyan-800/60">
                        LC
                      </span>
                    )}
                    {isSolved ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] opacity-75 font-mono">+{chal.points}p</span>
                    )}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={handleNextQuestion}
                disabled={activeChalIndex >= challenges.length - 1}
                className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 hover:bg-neutral-800 transition"
                title="Next Question"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Solved Summary Badge */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">
                Solved: <b className="text-emerald-400">{solvedCount}</b>/{challenges.length}
              </span>
            </div>
          </div>

          {/* Active Question Details & Actions */}
          {activeChallenge && (
            <div className="bg-amber-500/10 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300">
                      Q{activeChallenge.level}: {activeChallenge.title.replace(/^Level\s*\d+:\s*/i, '')}
                    </span>
                    {activeChallenge.topic === 'leetcode' && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border bg-cyan-500/15 text-cyan-300 border-cyan-500/40">
                        LeetCode
                      </span>
                    )}
                    {activeChallenge.difficulty && (
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                          activeChallenge.difficulty === 'easy'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                            : activeChallenge.difficulty === 'medium'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {activeChallenge.difficulty}
                      </span>
                    )}
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded">
                      +{activeChallenge.points} pts
                    </span>
                    {activeChallenge.functionName && (
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-1.5 py-0.2 rounded border border-cyan-800/60 hidden sm:inline">
                        def {activeChallenge.functionName}(...)
                      </span>
                    )}
                    {isAlreadyCompleted && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-700/80 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Solved
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">{activeChallenge.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetFarmPlots}
                  className="flex items-center gap-1 px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 text-xs font-medium transition"
                  title="Clear farm plots to test fresh execution"
                >
                  <RotateCcw className="w-3 h-3 text-neutral-400" />
                  <span className="hidden sm:inline">Reset Soil</span>
                </button>

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
                    disabled={isSubmittingChallenge || (!taskDone && !isAlreadyCompleted)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm ${
                      isAlreadyCompleted
                        ? 'bg-emerald-700/80 text-emerald-100 hover:bg-emerald-600 cursor-default'
                        : submissionSuccess
                        ? 'bg-emerald-600 text-white'
                        : taskDone
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-950/50 animate-pulse'
                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700/60 cursor-not-allowed'
                    }`}
                    title={
                      isAlreadyCompleted
                        ? 'Challenge already completed! Points earned.'
                        : taskDone
                        ? 'All test cases passed! Click to submit your official solution.'
                        : 'Run your Python script and pass all challenge criteria first to unlock submission!'
                    }
                  >
                    {isSubmittingChallenge ? (
                      <>
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : isAlreadyCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Solved (+{activeChallenge.points} pts)</span>
                      </>
                    ) : submissionSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Passed & Submitted!</span>
                      </>
                    ) : taskDone ? (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Answer (+{activeChallenge.points} pts)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Submit (Pass Tests First)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Task Done Success Banner (Unlocks Submission) */}
          {taskDone && !isAlreadyCompleted && (
            <div className="w-full mt-1.5 bg-emerald-950/70 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-[11px] text-emerald-300 flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold">
                  Task Done! All criteria passed{evaluationMessage ? ` (${evaluationMessage})` : ''}. Click &quot;Submit Answer&quot; to claim your points!
                </span>
              </div>
              <button
                onClick={handleSubmitSolution}
                disabled={isSubmittingChallenge}
                className="px-2.5 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[10px] rounded transition shadow shrink-0"
              >
                Submit Now
              </button>
            </div>
          )}

          {/* Challenge Evaluation Progress / Feedback Banner */}
          {!taskDone && !isAlreadyCompleted && evaluationMessage && (
            <div className="w-full mt-1.5 bg-amber-950/50 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-[11px] text-amber-200 flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Status: {evaluationMessage} (Run script again after modifying code)</span>
              </div>
            </div>
          )}

          {/* Submission Failure Banner */}
          {submissionError && (
            <div className="w-full mt-1.5 bg-red-950/80 border border-red-500/50 rounded-lg px-2.5 py-1.5 text-[11px] text-red-200 flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{submissionError}</span>
              </div>
              <button
                onClick={() => setSubmissionError(null)}
                className="text-red-400 hover:text-white p-0.5 rounded transition"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Beginner Quick Snippets Bar (1-Click Insert) */}
      <div className="bg-neutral-900/60 border-b border-neutral-800/80 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 pl-1 shrink-0">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Insert:</span>
        </span>
        {snippetsToDisplay.map((snip, idx) => (
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
        <div className="bg-neutral-900 border-b border-neutral-800 p-3.5 text-xs text-neutral-300 space-y-2.5 max-h-56 overflow-y-auto shrink-0 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-1.5 text-xs font-mono">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span>Beginner Programming Guide</span>
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  useGameStore.getState().resetFarmPlots();
                  addLog('info', '🧹 Farm plots cleared to empty soil.');
                }}
                className="text-[10px] text-amber-400 hover:text-amber-300 bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded border border-neutral-700 font-mono transition"
                title="Clear all crops and start with fresh empty soil"
              >
                🧹 Clear Soil
              </button>
              <button
                onClick={() => updateCode(isCompeting && activeChallenge ? activeChallenge.starterCode : STARTER_TUTORIAL)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded border border-neutral-700 font-mono transition"
              >
                Reset to Starter Code
              </button>
            </div>
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
              <div><code className="text-emerald-400">plant(x, y, "carrot")</code> - Plant crop</div>
              <div><code className="text-sky-400">water(x, y)</code> - Spray water</div>
              <div><code className="text-amber-400">harvest(x, y)</code> - Harvest ready crop</div>
              <div><code className="text-purple-400">fly_to(x, y)</code> - Fly to plot</div>
            </div>
            <p className="text-[10px] text-neutral-500 pt-1">
              💡 As you type, the editor will automatically pop up suggestions with autocomplete!
            </p>
          </div>
        </div>
      )}

      {/* Monaco Code Editor */}
      <div className="flex-1 relative min-h-[140px] bg-neutral-950 overflow-hidden">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={activeTab.code}
          onChange={(val) => {
            updateCode(val || '');
            if (taskDone) {
              setTaskDone(false);
            }
          }}
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

      {/* Bottom Console / Terminal Log (Resizable & Minimizable) */}
      <div
        style={{ height: isConsoleCollapsed ? '36px' : `${consoleHeight}px` }}
        className={`bg-black border-t border-neutral-800 flex flex-col font-mono text-xs shrink-0 relative transition-[height] ${
          isDraggingConsole ? 'select-none transition-none' : 'duration-150'
        }`}
      >
        {/* Console Vertical Resize Drag Handle */}
        <div
          onMouseDown={handleStartResizeConsole}
          className={`absolute -top-1.5 left-0 right-0 h-3 cursor-row-resize z-30 group flex items-center justify-center hover:bg-neutral-500/20 transition ${
            isDraggingConsole ? 'bg-neutral-500/40' : ''
          }`}
          title="Drag up/down to resize Console"
        >
          <div className="h-1 w-12 rounded-full bg-neutral-600 group-hover:bg-neutral-300 group-hover:w-20 transition-all" />
        </div>

        {/* Terminal Header */}
        <div
          onClick={() => {
            if (isConsoleCollapsed) setIsConsoleCollapsed(false);
          }}
          className={`flex items-center justify-between bg-neutral-900/90 px-3 py-1.5 border-b border-neutral-800 text-neutral-400 select-none ${
            isConsoleCollapsed ? 'cursor-pointer hover:bg-neutral-800/80' : ''
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-neutral-300">
            <Terminal className="w-3.5 h-3.5 text-neutral-400" />
            <span>Farm Console</span>
            <span className="text-[10px] text-neutral-500">({consoleLogs.length} events)</span>
            {isConsoleCollapsed && consoleLogs.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Logs available" />
            )}
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {!isConsoleCollapsed && (
              <button
                onClick={clearConsole}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
                title="Clear output"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={() => setIsConsoleCollapsed((prev) => !prev)}
              className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition"
              title={isConsoleCollapsed ? 'Expand Console' : 'Minimize / Collapse Console'}
            >
              {isConsoleCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-neutral-300" />
                  <span className="text-[10px] font-semibold">Expand</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-300" />
                  <span className="text-[10px] font-semibold">Minimize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Terminal Message Stream (Hidden when collapsed) */}
        {!isConsoleCollapsed && (
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1 bg-black min-h-0">
            {consoleLogs.map((log) => {
              let textColor = 'text-neutral-300';
              if (log.type === 'stderr') textColor = 'text-red-400 font-semibold';
              if (log.type === 'success') textColor = 'text-emerald-400 font-semibold';
              if (log.type === 'info') textColor = 'text-neutral-400';

              return (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[10px] text-neutral-500 font-mono select-none shrink-0 whitespace-nowrap">
                    {log.timestamp}
                  </span>
                  <span className={`flex-1 break-all whitespace-pre-wrap ${textColor}`}>
                    {log.text}
                  </span>
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditorPanel;
