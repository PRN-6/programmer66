import React, { useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

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
    addTab,
    closeTab,
    setSpeedMode,
    setShowDocsModal,
    clearConsole,
    runCode,
    stopCode,
  } = useEditorStore();

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
              Running...
            </span>
          )}
          {executionState === 'success' && (
            <span className="flex items-center gap-1 text-xs text-neutral-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-300" />
              Done
            </span>
          )}
          {executionState === 'error' && (
            <span className="flex items-center gap-1 text-xs text-neutral-300 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
              Error
            </span>
          )}
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 relative min-h-[200px] bg-neutral-950">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={activeTab.code}
          onChange={(val) => updateCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            renderLineHighlight: 'all',
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>

      {/* Bottom Console / Terminal Log */}
      <div className="h-52 bg-black border-t border-neutral-800 flex flex-col font-mono text-xs shrink-0">
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
