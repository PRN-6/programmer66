import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layers,
  Trash2,
  Check,
  RotateCcw,
  Save,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { FieldConfig, FieldTheme, FieldTileConfig } from '../../types/field';
import { DEFAULT_FIELD_PRESETS } from '../../services/defaultFields';

export type DesignerTool =
  | 'plot'
  | 'waterway'
  | 'hydrate'
  | 'dry'
  | 'fertile'
  | 'weeds'
  | 'carrot'
  | 'wheat'
  | 'clear';

const CUSTOM_FIELDS_STORAGE_KEY = 'programmer66_custom_fields';

function getInitialCustomPresets(): FieldConfig[] {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CUSTOM_FIELDS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load custom field presets:', e);
  }
  return [];
}

interface FieldDesignerTabProps {
  currentRoomField?: FieldConfig;
  onApplyToActiveRoom?: (field: FieldConfig) => Promise<void>;
  onSelectForRoomCreation?: (field: FieldConfig) => void;
  selectedForRoomId?: string;
  isRoomActive: boolean;
}

export const FieldDesignerTab: React.FC<FieldDesignerTabProps> = ({
  currentRoomField,
  onApplyToActiveRoom,
  onSelectForRoomCreation,
  selectedForRoomId,
  isRoomActive,
}) => {
  // Designer working state
  const [designerField, setDesignerField] = useState<FieldConfig>(() => {
    return currentRoomField ? JSON.parse(JSON.stringify(currentRoomField)) : { ...DEFAULT_FIELD_PRESETS[0] };
  });

  const [activeTool, setActiveTool] = useState<DesignerTool>('plot');
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [customPresets, setCustomPresets] = useState<FieldConfig[]>(getInitialCustomPresets);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const isMouseDownRef = useRef(false);

  const saveCustomPresetsToStorage = (updated: FieldConfig[]) => {
    setCustomPresets(updated);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CUSTOM_FIELDS_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Failed to save custom field presets:', e);
    }
  };

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Resize grid while preserving existing tiles
  const handleDimensionChange = (newWidth: number, newHeight: number) => {
    const updatedTiles: Record<string, FieldTileConfig> = {};
    for (let x = 0; x < newWidth; x++) {
      for (let y = 0; y < newHeight; y++) {
        const key = `${x}_${y}`;
        if (designerField.tiles[key]) {
          updatedTiles[key] = { ...designerField.tiles[key] };
        } else {
          updatedTiles[key] = {
            x,
            y,
            unlocked: true,
            moisture: 50,
            nutrients: 55,
            weedLevel: 0,
            crop: null,
          };
        }
      }
    }

    setDesignerField((prev) => ({
      ...prev,
      width: newWidth,
      height: newHeight,
      tiles: updatedTiles,
    }));
  };

  // Apply active tool to a specific cell
  const paintTile = useCallback(
    (x: number, y: number) => {
      setDesignerField((prev) => {
        const key = `${x}_${y}`;
        const current = prev.tiles[key] || {
          x,
          y,
          unlocked: true,
          moisture: 50,
          nutrients: 55,
          weedLevel: 0,
          crop: null,
        };

        const updated: FieldTileConfig = { ...current };

        switch (activeTool) {
          case 'plot':
            updated.unlocked = true;
            break;
          case 'waterway':
            updated.unlocked = false;
            updated.moisture = 100;
            updated.crop = null;
            break;
          case 'hydrate':
            updated.unlocked = true;
            updated.moisture = 85;
            break;
          case 'dry':
            updated.unlocked = true;
            updated.moisture = 18;
            break;
          case 'fertile':
            updated.unlocked = true;
            updated.nutrients = 85;
            break;
          case 'weeds':
            updated.unlocked = true;
            updated.weedLevel = 60;
            break;
          case 'carrot':
            updated.unlocked = true;
            updated.crop = 'carrot';
            break;
          case 'wheat':
            updated.unlocked = true;
            updated.crop = 'wheat';
            break;
          case 'clear':
            updated.unlocked = true;
            updated.moisture = 50;
            updated.nutrients = 55;
            updated.weedLevel = 0;
            updated.crop = null;
            break;
        }

        return {
          ...prev,
          tiles: {
            ...prev.tiles,
            [key]: updated,
          },
        };
      });
    },
    [activeTool]
  );

  // Bulk operations
  const handleFillAll = (unlocked: boolean) => {
    setDesignerField((prev) => {
      const nextTiles: Record<string, FieldTileConfig> = {};
      for (let x = 0; x < prev.width; x++) {
        for (let y = 0; y < prev.height; y++) {
          const key = `${x}_${y}`;
          const current = prev.tiles[key];
          nextTiles[key] = {
            x,
            y,
            unlocked,
            moisture: unlocked ? (current?.moisture ?? 50) : 100,
            nutrients: unlocked ? (current?.nutrients ?? 55) : 0,
            weedLevel: unlocked ? (current?.weedLevel ?? 0) : 0,
            crop: unlocked ? current?.crop || null : null,
          };
        }
      }
      return { ...prev, tiles: nextTiles };
    });
  };

  const handleRandomizeConditions = () => {
    setDesignerField((prev) => {
      const nextTiles: Record<string, FieldTileConfig> = {};
      for (let x = 0; x < prev.width; x++) {
        for (let y = 0; y < prev.height; y++) {
          const key = `${x}_${y}`;
          const current = prev.tiles[key];
          const isUnlocked = current ? current.unlocked : true;
          nextTiles[key] = {
            x,
            y,
            unlocked: isUnlocked,
            moisture: isUnlocked ? 20 + Math.floor(Math.random() * 70) : 100,
            nutrients: isUnlocked ? 30 + Math.floor(Math.random() * 60) : 0,
            weedLevel: isUnlocked ? (Math.random() > 0.75 ? 50 : 0) : 0,
            crop: isUnlocked ? current?.crop || null : null,
          };
        }
      }
      return { ...prev, tiles: nextTiles };
    });
  };

  const handleAddCanal = () => {
    const midY = Math.floor(designerField.height / 2);
    setDesignerField((prev) => {
      const nextTiles: Record<string, FieldTileConfig> = { ...prev.tiles };
      for (let x = 0; x < prev.width; x++) {
        const key = `${x}_${midY}`;
        nextTiles[key] = {
          x,
          y: midY,
          unlocked: false,
          moisture: 100,
          nutrients: 0,
          weedLevel: 0,
          crop: null,
        };
      }
      return { ...prev, tiles: nextTiles };
    });
  };

  // Save current design as a new custom preset
  const handleSaveAsPreset = () => {
    const newPreset: FieldConfig = {
      ...designerField,
      id: `custom_field_${Date.now()}`,
      presetId: 'custom_designed',
      name: designerField.name || `Custom Arena ${customPresets.length + 1}`,
    };
    const updated = [newPreset, ...customPresets];
    saveCustomPresetsToStorage(updated);
    showNotification(`Field "${newPreset.name}" saved to your presets!`);
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p.id !== id);
    saveCustomPresetsToStorage(updated);
    showNotification('Custom preset removed.');
  };

  const loadPresetIntoDesigner = (preset: FieldConfig) => {
    setDesignerField(JSON.parse(JSON.stringify(preset)));
    showNotification(`Loaded "${preset.name}" into designer.`);
  };

  // Calculate live field metrics
  const tileList = Object.values(designerField.tiles || {});
  const arableCount = tileList.filter((t) => t.unlocked).length;
  const waterwayCount = tileList.filter((t) => !t.unlocked).length;
  const totalTiles = designerField.width * designerField.height;
  const avgMoisture =
    arableCount > 0
      ? Math.round(
          tileList.filter((t) => t.unlocked).reduce((acc, t) => acc + (t.moisture || 50), 0) / arableCount
        )
      : 0;
  const avgNutrients =
    arableCount > 0
      ? Math.round(
          tileList.filter((t) => t.unlocked).reduce((acc, t) => acc + (t.nutrients || 50), 0) / arableCount
        )
      : 0;
  const preplantedCount = tileList.filter((t) => t.unlocked && t.crop).length;

  // Track global mouse up for drag-painting
  useEffect(() => {
    const handleUp = () => {
      isMouseDownRef.current = false;
    };
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, []);

  const allPresets = [...DEFAULT_FIELD_PRESETS, ...customPresets];

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-50 bg-amber-500 text-neutral-950 font-bold px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-amber-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-100">Agricultural Terrain & Field Designer</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Organizer Pro
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Select championship terrain layouts or design custom arable zones, waterways, and soil conditions for competition rooms.
            </p>
          </div>
        </div>

        {isRoomActive && onApplyToActiveRoom && (
          <button
            onClick={() => onApplyToActiveRoom(designerField)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-950/40"
            title="Broadcast this designed field layout to the active competition room"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Apply to Active Room</span>
          </button>
        )}
      </div>

      {/* --- PRESETS LIBRARY CAROUSEL / GRID --- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <span>Select Preset Terrain Layout</span>
            <span className="text-neutral-500 font-mono text-[10px]">({allPresets.length} available)</span>
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 max-h-48 overflow-y-auto pr-1">
          {allPresets.map((preset) => {
            const isCurrentlySelected = selectedForRoomId === preset.id;
            const isLoadedInDesigner = designerField.name === preset.name;
            const presetArable = Object.values(preset.tiles).filter((t) => t.unlocked).length;

            return (
              <div
                key={preset.id}
                onClick={() => loadPresetIntoDesigner(preset)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between group ${
                  isLoadedInDesigner
                    ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/40 text-neutral-100'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-bold truncate text-[11px] text-amber-300">{preset.name}</span>
                    {preset.presetId === 'custom_designed' && (
                      <button
                        onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                        className="text-neutral-500 hover:text-rose-400 p-0.5 rounded transition"
                        title="Delete custom preset"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Visual Mini Matrix Preview */}
                  <div
                    className="grid gap-0.5 p-1 bg-neutral-900 rounded-lg border border-neutral-800/80 mb-2 aspect-square max-w-[84px] mx-auto"
                    style={{
                      gridTemplateColumns: `repeat(${preset.width}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: preset.height }).map((_, y) =>
                      Array.from({ length: preset.width }).map((_, x) => {
                        const tile = preset.tiles[`${x}_${y}`];
                        const isUnlocked = tile ? tile.unlocked : true;
                        return (
                          <div
                            key={`${x}_${y}`}
                            className={`rounded-[1px] aspect-square ${
                              isUnlocked ? 'bg-emerald-600/70' : 'bg-sky-900/80'
                            }`}
                          />
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-neutral-800/60">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                    <span>{preset.width}x{preset.height}</span>
                    <span>{presetArable} plots</span>
                  </div>

                  {onSelectForRoomCreation && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectForRoomCreation(preset);
                        showNotification(`Selected "${preset.name}" for new rooms.`);
                      }}
                      className={`w-full py-1 rounded text-[10px] font-semibold transition border ${
                        isCurrentlySelected
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {isCurrentlySelected ? '✓ Active for Room' : 'Select for Room'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- INTERACTIVE 2D FIELD DESIGNER CANVAS --- */}
      <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          {/* Field Meta Settings */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Field Name</label>
              <input
                type="text"
                value={designerField.name}
                onChange={(e) => setDesignerField((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-100 font-semibold focus:outline-none focus:border-amber-500 w-52"
                placeholder="e.g. Championship Arena A"
              />
            </div>

            {/* Grid Dimensions */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Dimensions (W x H)</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={designerField.width}
                  onChange={(e) => handleDimensionChange(Number(e.target.value), designerField.height)}
                  className="bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200"
                >
                  {[4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>
                      {w} Width
                    </option>
                  ))}
                </select>
                <span className="text-neutral-500 font-bold text-xs">×</span>
                <select
                  value={designerField.height}
                  onChange={(e) => handleDimensionChange(designerField.width, Number(e.target.value))}
                  className="bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200"
                >
                  {[4, 5, 6, 7, 8].map((h) => (
                    <option key={h} value={h}>
                      {h} Height
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Biome Theme</label>
              <select
                value={designerField.theme || 'temperate'}
                onChange={(e) => setDesignerField((prev) => ({ ...prev, theme: e.target.value as FieldTheme }))}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200"
              >
                <option value="temperate">🌱 Temperate Valley</option>
                <option value="desert">🏜️ Arid Desert</option>
                <option value="wetlands">🌊 Wetland Marsh</option>
                <option value="autumn">🍁 Autumn Meadow</option>
                <option value="cyber">⚡ Cyber Agro-Grid</option>
              </select>
            </div>
          </div>

          {/* Quick Bulk Tools */}
          <div className="flex items-center flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleFillAll(true)}
              className="px-2.5 py-1 text-[11px] font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 transition"
              title="Make all cells plantable soil plots"
            >
              Fill All Soil
            </button>
            <button
              type="button"
              onClick={handleAddCanal}
              className="px-2.5 py-1 text-[11px] font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 transition"
              title="Add a horizontal irrigation waterway through the center"
            >
              Add Canal
            </button>
            <button
              type="button"
              onClick={handleRandomizeConditions}
              className="px-2.5 py-1 text-[11px] font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 transition"
              title="Randomize moisture and nutrient levels across plots"
            >
              Randomize Soil
            </button>
            <button
              type="button"
              onClick={() => handleFillAll(false)}
              className="px-2.5 py-1 text-[11px] font-medium bg-neutral-900 hover:bg-rose-950/60 border border-neutral-700 hover:border-rose-700/60 text-neutral-400 hover:text-rose-300 rounded-lg transition"
              title="Clear all plots"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* --- TOOL PALETTE BAR --- */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-neutral-400">Brush & Soil Tool Palette</label>
          <div className="flex items-center flex-wrap gap-2">
            {[
              { id: 'plot', label: '🌾 Soil Bed', desc: 'Active farming plot (arable)' },
              { id: 'waterway', label: '🌊 Waterway / Canal', desc: 'Locked water canal or stone barrier' },
              { id: 'hydrate', label: '💧 Moist Soil (85%)', desc: 'Pre-hydrated optimal plot' },
              { id: 'dry', label: '🏜️ Dry Soil (18%)', desc: 'Arid plot requiring watering' },
              { id: 'fertile', label: '✨ Fertile Soil (85%)', desc: 'Enriched soil nutrients' },
              { id: 'weeds', label: '🌿 Weeds (60%)', desc: 'Plot infested with weeds' },
              { id: 'carrot', label: '🥕 Pre-seed Carrot', desc: 'Pre-planted carrot crop' },
              { id: 'wheat', label: '🌾 Pre-seed Wheat', desc: 'Pre-planted wheat crop' },
              { id: 'clear', label: '🧹 Neutral Bed', desc: 'Reset plot to default 50% values' },
            ].map((tool) => {
              const isSelected = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveTool(tool.id as DesignerTool)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-md shadow-amber-950/50'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                  }`}
                  title={tool.desc}
                >
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- INTERACTIVE 2D GRID BOARD --- */}
        <div className="flex flex-col items-center justify-center p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
          <div
            className="grid gap-2 p-3 bg-neutral-950 border border-neutral-800 rounded-xl shadow-inner select-none"
            style={{
              gridTemplateColumns: `repeat(${designerField.width}, minmax(0, 1fr))`,
            }}
            onMouseDown={() => {
              isMouseDownRef.current = true;
            }}
          >
            {Array.from({ length: designerField.height }).map((_, y) =>
              Array.from({ length: designerField.width }).map((_, x) => {
                const key = `${x}_${y}`;
                const tile = designerField.tiles[key] || {
                  x,
                  y,
                  unlocked: true,
                  moisture: 50,
                  nutrients: 55,
                  weedLevel: 0,
                  crop: null,
                };

                const isUnlocked = tile.unlocked;
                const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;

                return (
                  <div
                    key={key}
                    onMouseEnter={() => {
                      setHoveredTile({ x, y });
                      if (isMouseDownRef.current) {
                        paintTile(x, y);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      isMouseDownRef.current = true;
                      paintTile(x, y);
                    }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex flex-col items-center justify-center relative cursor-pointer transition-transform transform active:scale-95 ${
                      !isUnlocked
                        ? 'bg-sky-950/80 border-sky-800/80 text-sky-300 shadow-inner'
                        : (tile.moisture ?? 50) >= 75
                        ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-200'
                        : (tile.moisture ?? 50) <= 25
                        ? 'bg-amber-950/60 border-amber-700/70 text-amber-200'
                        : 'bg-neutral-800/90 border-neutral-700 text-neutral-200'
                    } ${isHovered ? 'ring-2 ring-amber-400 z-10' : ''}`}
                    title={`Plot (${x}, ${y}): ${
                      isUnlocked
                        ? `Moisture ${tile.moisture ?? 50}% | Nutrients ${tile.nutrients ?? 50}% | Weeds ${tile.weedLevel ?? 0}% ${
                            tile.crop ? `| Crop: ${tile.crop}` : ''
                          }`
                        : 'Locked Canal / Waterway'
                    }`}
                  >
                    {/* Coordinate indicator */}
                    <span className="absolute top-1 left-1 text-[8px] font-mono opacity-50 font-bold">
                      {x},{y}
                    </span>

                    {/* Tile content icon / details */}
                    {!isUnlocked ? (
                      <span className="text-base">🌊</span>
                    ) : tile.crop ? (
                      <span className="text-base">{tile.crop === 'carrot' ? '🥕' : '🌾'}</span>
                    ) : (tile.weedLevel ?? 0) > 30 ? (
                      <span className="text-base">🌿</span>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[9px] font-mono font-bold">{tile.moisture ?? 50}%</span>
                        {(tile.nutrients ?? 50) >= 75 && <span className="text-[8px] text-amber-400">✨</span>}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Hover Status Readout */}
          <div className="mt-3 text-xs text-neutral-400 font-mono flex items-center gap-3">
            {hoveredTile ? (
              <span>
                Inspecting: <b className="text-amber-300">Plot ({hoveredTile.x}, {hoveredTile.y})</b> - Click or drag to paint with active tool
              </span>
            ) : (
              <span>Hover or drag over plots to paint terrain features</span>
            )}
          </div>
        </div>

        {/* --- FIELD TELEMETRY METRICS BAR --- */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Arable Plots</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              {arableCount} <span className="text-xs text-neutral-500 font-normal">/ {totalTiles}</span>
            </div>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Canals / Barriers</span>
            <div className="text-base font-bold text-sky-400 mt-0.5">{waterwayCount} plots</div>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Avg Soil Moisture</span>
            <div className="text-base font-bold text-blue-400 mt-0.5">{avgMoisture}%</div>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Avg Nutrients</span>
            <div className="text-base font-bold text-amber-400 mt-0.5">{avgNutrients}%</div>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Pre-seeded Crops</span>
            <div className="text-base font-bold text-purple-400 mt-0.5">{preplantedCount} plots</div>
          </div>
        </div>

        {/* --- FOOTER ACTION BUTTONS --- */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => {
              setDesignerField({ ...DEFAULT_FIELD_PRESETS[0] });
              showNotification('Reset designer to Standard 6x6.');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAsPreset}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 border border-neutral-700 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as Custom Preset</span>
            </button>

            {onSelectForRoomCreation && (
              <button
                type="button"
                onClick={() => {
                  onSelectForRoomCreation(designerField);
                  showNotification(`Selected "${designerField.name}" for new room creation!`);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 rounded-xl text-xs font-bold transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Use for Room Creation</span>
              </button>
            )}

            {isRoomActive && onApplyToActiveRoom && (
              <button
                type="button"
                onClick={() => onApplyToActiveRoom(designerField)}
                className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-950/50"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Apply to Live Room</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
