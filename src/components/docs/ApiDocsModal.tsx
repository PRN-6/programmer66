import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Copy,
  Check,
  Terminal,
  Layers,
  Bot,
  Package,
} from 'lucide-react';

interface ApiDocsModalProps {
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copySnippet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sections = [
    {
      category: 'Farm Grid & Environment',
      icon: <Layers className="w-4 h-4 text-neutral-300" />,
      apis: [
        {
          sig: 'farm.get_tiles()',
          desc: 'Returns a list of all unlocked soil tile objects on the farm grid.',
          example: 'tiles = farm.get_tiles()\nprint("Total tiles:", len(tiles))',
        },
        {
          sig: 'farm.get_tile(x, y)',
          desc: 'Returns the tile object at grid coordinates (x, y) or None if out of bounds.',
          example: 'tile = farm.get_tile(0, 0)\nif tile.is_empty():\n    tile.plant("wheat")',
        },
        {
          sig: 'farm.get_weather()',
          desc: 'Returns current weather string: "sunny", "cloudy", "rainy", "stormy", or "drought".',
          example: 'weather = farm.get_weather()\nif weather == "drought":\n    print("Heatwave warning!")',
        },
        {
          sig: 'farm.get_money()',
          desc: 'Returns the current cash balance in treasury ($).',
          example: 'cash = farm.get_money()\nprint("Treasury:", cash)',
        },
      ],
    },
    {
      category: 'Tile Operations',
      icon: <Terminal className="w-4 h-4 text-neutral-300" />,
      apis: [
        {
          sig: 'tile.plant(crop_name)',
          desc: 'Plants seed in empty soil. Consumes 1 seed from inventory. Crops: "wheat", "corn", "carrot", "tomato", "potato".',
          example: 'if tile.is_empty():\n    tile.plant("corn")',
        },
        {
          sig: 'tile.water(amount=55)',
          desc: 'Waters the tile. Prevents crops from drying out and boosts growth.',
          example: 'if tile.needs_water():\n    tile.water()',
        },
        {
          sig: 'tile.harvest()',
          desc: 'Harvests mature crop and stores produce in inventory. Fails if crop is not mature.',
          example: 'if tile.is_ready():\n    tile.harvest()',
        },
        {
          sig: 'tile.fertilize()',
          desc: 'Applies organic fertilizer to add +50% soil nutrients, speeding up future growth.',
          example: 'if tile.get_nutrients() < 40:\n    tile.fertilize()',
        },
        {
          sig: 'tile.is_empty() / tile.is_ready() / tile.needs_water()',
          desc: 'Helper boolean queries to check status without raw number math.',
          example: 'if tile.is_empty():\n    tile.plant("wheat")',
        },
      ],
    },
    {
      category: 'Autonomous Robot',
      icon: <Bot className="w-4 h-4 text-neutral-300" />,
      apis: [
        {
          sig: 'robot.move_to(x, y)',
          desc: 'Commands the physical 3D robot to navigate across the terrain to coordinates (x, y).',
          example: 'robot.move_to(2, 3)\nprint("Arrived at target plot.")',
        },
        {
          sig: 'robot.move(direction)',
          desc: 'Moves the robot one step in "up", "down", "left", or "right".',
          example: 'robot.move("right")',
        },
        {
          sig: 'robot.plant(crop) / robot.water() / robot.harvest()',
          desc: 'Commands the robot to perform the action at its current tile location with 3D tool animation.',
          example: 'robot.move_to(0, 0)\nrobot.plant("wheat")\nrobot.water()',
        },
        {
          sig: 'robot.recharge()',
          desc: 'Restores robot solar battery back to 100%.',
          example: 'if robot.get_energy() < 20:\n    robot.recharge()',
        },
      ],
    },
    {
      category: 'Inventory & Trading',
      icon: <Package className="w-4 h-4 text-neutral-300" />,
      apis: [
        {
          sig: 'inventory.count(item_name)',
          desc: 'Returns the quantity of an item in storage (e.g. "wheat", "wheat_seed", "fertilizer").',
          example: 'seeds = inventory.count("wheat_seed")\nprint("Seeds left:", seeds)',
        },
        {
          sig: 'inventory.sell(crop_name, count)',
          desc: 'Sells harvested produce to the market for instant cash revenue.',
          example: 'if inventory.count("wheat") >= 10:\n    inventory.sell("wheat", 10)',
        },
        {
          sig: 'inventory.buy_seeds(crop_name, count)',
          desc: 'Purchases seeds directly from script if treasury has sufficient funds.',
          example: 'if inventory.count("corn_seed") == 0:\n    inventory.buy_seeds("corn", 5)',
        },
      ],
    },
  ];

  let snippetCounter = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between bg-neutral-900 px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">programmer66 Scripting Manual</h2>
              <p className="text-xs text-neutral-400">Complete API reference for Python automation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manual Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-200 border-b border-neutral-800 pb-1.5">
                {sec.icon}
                <span>{sec.category}</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {sec.apis.map((api) => {
                  const currentSnippetId = snippetCounter++;
                  return (
                    <div
                      key={api.sig}
                      className="bg-neutral-900/60 border border-neutral-800 p-3.5 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-mono font-bold text-neutral-200 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
                          {api.sig}
                        </code>
                        <button
                          onClick={() => copySnippet(api.example, currentSnippetId)}
                          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition"
                        >
                          {copiedIndex === currentSnippetId ? (
                            <>
                              <Check className="w-3 h-3 text-neutral-200" />
                              <span className="text-neutral-200">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Example</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-neutral-300 leading-relaxed">{api.desc}</p>

                      <pre className="bg-black p-2.5 rounded-lg text-[11px] font-mono text-neutral-300 overflow-x-auto border border-neutral-800">
                        <code>{api.example}</code>
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
