import { create } from 'zustand';
import { Lexer } from '../scripting/lexer';
import { Parser } from '../scripting/parser';
import { Interpreter } from '../scripting/interpreter';
import { createGameAPI } from '../scripting/api';
import { soundManager } from '../audio/soundEffects';

export interface ConsoleMessage {
  id: string;
  timestamp: string;
  type: 'stdout' | 'stderr' | 'info' | 'success';
  text: string;
}

export interface ScriptTab {
  id: string;
  name: string;
  code: string;
}

const DEFAULT_SCRIPTS: ScriptTab[] = [
  {
    id: 'main',
    name: 'main.py',
    code: `# programmer66 - Autonomous Agricultural Drone
# Write Python code to control your drone and automate the farm!

print("Deploying AeroDrone-01...")

# Loop through all farm plots
for tile in farm.get_tiles():
    # If the plot is empty, the drone flies over and plants wheat
    if tile.is_empty():
        print("Drone planting wheat at (", tile.x, ",", tile.y, ")")
        tile.plant("wheat")

    # If the soil needs water, the drone sprays hydration mist
    if tile.needs_water():
        print("Drone watering plot at (", tile.x, ",", tile.y, ")")
        tile.water()

    # If the crop is ready, the drone harvests it
    if tile.is_ready():
        print("Drone harvesting mature crop at (", tile.x, ",", tile.y, ")")
        tile.harvest()

print("Routine complete. Drone returning to station.")
robot.move_to(0, 0)
`,
  },
  {
    id: 'robot_patrol',
    name: 'patrol.py',
    code: `# Autonomous Drone Grid Patrol
print("AeroDrone-01 initiating area patrol...")

for y in range(4):
    for x in range(4):
        robot.move_to(x, y)
        tile = farm.get_tile(x, y)
        if tile.is_ready():
            robot.harvest()
        elif tile.is_empty():
            robot.plant("corn")
        elif tile.needs_water():
            robot.water()

print("Patrol complete. Returning to base.")
robot.move_to(0, 0)
`,
  },
  {
    id: 'auto_market',
    name: 'economy.py',
    code: `# Economy & Trading Automation
print("Checking warehouse stocks...")

wheat_count = inventory.count("wheat")
print("Harvested wheat in storage:", wheat_count)

if wheat_count >= 5:
    print("Selling 5 wheat to marketplace...")
    inventory.sell("wheat", 5)

corn_count = inventory.count("corn")
if corn_count >= 3:
    print("Selling 3 corn...")
    inventory.sell("corn", 3)

money = farm.get_money()
print("Current treasury balance: $", money)
`,
  },
];

export interface EditorState {
  tabs: ScriptTab[];
  activeTabId: string;
  executionState: 'idle' | 'running' | 'paused' | 'error' | 'success';
  speedMode: '1x' | '2x' | '5x' | 'instant';
  consoleLogs: ConsoleMessage[];
  showDocsModal: boolean;
  activeLine: number | null;

  // Actions
  setActiveTab: (tabId: string) => void;
  updateCode: (code: string) => void;
  addTab: (name: string, code?: string) => void;
  closeTab: (tabId: string) => void;
  setSpeedMode: (mode: EditorState['speedMode']) => void;
  setShowDocsModal: (show: boolean) => void;
  clearConsole: () => void;
  addLog: (type: ConsoleMessage['type'], text: string) => void;

  // Execution
  runCode: () => Promise<void>;
  stopCode: () => void;
}

let cancellationFlag = false;

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: DEFAULT_SCRIPTS,
  activeTabId: 'main',
  executionState: 'idle',
  speedMode: '2x',
  consoleLogs: [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      text: 'programmer66 Python Automation Runtime v2.0 ready.',
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      text: 'Type scripts and click "Run Script" to automate the farm.',
    },
  ],
  showDocsModal: false,
  activeLine: null,

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  updateCode: (newCode) => {
    set((prev) => ({
      tabs: prev.tabs.map((tab) =>
        tab.id === prev.activeTabId ? { ...tab, code: newCode } : tab
      ),
    }));
  },

  addTab: (name, code = '# New script\nprint("Hello Farm!")\n') => {
    const id = `script_${Date.now()}`;
    set((prev) => ({
      tabs: [...prev.tabs, { id, name, code }],
      activeTabId: id,
    }));
  },

  closeTab: (tabId) => {
    set((prev) => {
      if (prev.tabs.length <= 1) return prev;
      const nextTabs = prev.tabs.filter((t) => t.id !== tabId);
      const nextActive = prev.activeTabId === tabId ? nextTabs[0].id : prev.activeTabId;
      return { tabs: nextTabs, activeTabId: nextActive };
    });
  },

  setSpeedMode: (mode) => set({ speedMode: mode }),

  setShowDocsModal: (show) => set({ showDocsModal: show }),

  clearConsole: () => set({ consoleLogs: [] }),

  addLog: (type, text) => {
    const id = `log_${Date.now()}_${Math.random()}`;
    const timestamp = new Date().toLocaleTimeString();
    set((prev) => ({
      consoleLogs: [...prev.consoleLogs.slice(-200), { id, timestamp, type, text }],
    }));
  },

  runCode: async () => {
    const state = get();
    if (state.executionState === 'running') return;

    const currentTab = state.tabs.find((t) => t.id === state.activeTabId);
    if (!currentTab) return;

    cancellationFlag = false;
    set({ executionState: 'running' });
    state.addLog('info', `>>> Running ${currentTab.name}...`);

    const speedDelays: Record<EditorState['speedMode'], number> = {
      '1x': 250,
      '2x': 110,
      '5x': 30,
      instant: 0,
    };

    const getDelay = () => speedDelays[get().speedMode];

    const api = createGameAPI({
      getStepDelay: getDelay,
      isCancelled: () => cancellationFlag,
      onLog: (msg) => state.addLog('stdout', msg),
    });

    try {
      // 1. Lexical Analysis
      const lexer = new Lexer(currentTab.code);
      const tokens = lexer.tokenize();

      // 2. Syntax Parsing into AST
      const parser = new Parser(tokens);
      const ast = parser.parse();

      // 3. Setup Interpreter & inject controlled Game API
      const interpreter = new Interpreter({
        stepDelayMs: getDelay(),
        isCancelled: () => cancellationFlag,
        onPrint: (msg: string) => {
          get().addLog('stdout', msg);
        },
      });

      const env = interpreter.getGlobalEnv();
      env.define('farm', api.farm);
      env.define('robot', api.robot);
      env.define('inventory', api.inventory);

      // 4. Run execution
      await interpreter.run(ast);

      if (cancellationFlag) {
        get().addLog('info', `[Script stopped by user]`);
        set({ executionState: 'idle' });
      } else {
        soundManager.playSuccess();
        get().addLog('success', `[Program exited normally with code 0]`);
        set({ executionState: 'success' });
        setTimeout(() => {
          if (get().executionState === 'success') {
            set({ executionState: 'idle' });
          }
        }, 2000);
      }
    } catch (err: unknown) {
      soundManager.playError();
      const message = err instanceof Error ? err.message : String(err);
      get().addLog('stderr', `Runtime Error: ${message}`);
      set({ executionState: 'error' });
    }
  },

  stopCode: () => {
    cancellationFlag = true;
    set({ executionState: 'idle' });
    get().addLog('info', '[Execution stopped]');
  },
}));
