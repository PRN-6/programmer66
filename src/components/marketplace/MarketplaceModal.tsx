import React, { useState } from 'react';
import {
  X,
  Coins,
  ShoppingBag,
  Sparkles,
  Check,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { CROPS, CROP_LIST } from '../../game/simulation/cropConfig';
import type { CropId } from '../../types/game';

interface MarketplaceModalProps {
  onClose: () => void;
}

export const MarketplaceModal: React.FC<MarketplaceModalProps> = ({ onClose }) => {
  const { money, inventory, buyItem, sellItem } = useGameStore();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleBuySeed = (cropId: CropId, count: number = 1) => {
    const config = CROPS[cropId];
    const totalCost = config.seedCost * count;
    if (money < totalCost) {
      showFeedback('Not enough money!');
      return;
    }
    const success = buyItem(`${cropId}_seed`, count, totalCost);
    if (success) {
      showFeedback(`Purchased ${count}x ${config.name} seeds!`);
    }
  };

  const handleBuyFertilizer = (count: number = 5) => {
    const cost = 15 * count;
    if (money < cost) {
      showFeedback('Not enough money!');
      return;
    }
    const success = buyItem('fertilizer', count, cost);
    if (success) {
      showFeedback(`Purchased ${count}x Fertilizer bags!`);
    }
  };

  const handleSellProduce = (cropId: CropId, count: number) => {
    const config = CROPS[cropId];
    const currentCount = inventory[cropId] || 0;
    if (currentCount < count) {
      showFeedback(`You don't have ${count} ${config.name} in storage!`);
      return;
    }
    const revenue = config.sellPrice * count;
    const success = sellItem(cropId, count, revenue);
    if (success) {
      showFeedback(`Sold ${count}x ${config.name} for +$${revenue}!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between bg-neutral-900 px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Agricultural Marketplace</h2>
              <p className="text-xs text-neutral-400">Trade seeds, produce, fertilizer, and supplies</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-lg text-neutral-200 font-bold text-sm">
              <Coins className="w-4 h-4 text-neutral-400" />
              <span>${money}</span>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-neutral-900 p-1.5 border-b border-neutral-800">
          <button
            onClick={() => setTab('buy')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition border ${
              tab === 'buy'
                ? 'bg-neutral-800 text-white border-neutral-700 shadow'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent'
            }`}
          >
            Buy Seeds & Supplies
          </button>
          <button
            onClick={() => setTab('sell')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition border ${
              tab === 'sell'
                ? 'bg-neutral-800 text-white border-neutral-700 shadow'
                : 'text-neutral-400 hover:text-neutral-200 border-transparent'
            }`}
          >
            Sell Harvested Produce
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2 text-xs text-neutral-200 font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-neutral-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {tab === 'buy' ? (
            <div className="space-y-4">
              {/* Seeds Section */}
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Crop Seeds
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CROP_LIST.map((crop) => {
                  const ownedSeeds = inventory[`${crop.id}_seed`] || 0;
                  return (
                    <div
                      key={crop.id}
                      className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between gap-3 hover:border-neutral-700 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-neutral-100">{crop.name}</h4>
                          <span className="text-xs font-bold text-neutral-300">
                            ${crop.seedCost} / seed
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                          {crop.description}
                        </p>
                        <div className="text-[10px] text-neutral-400 mt-1.5 flex items-center justify-between">
                          <span>Growth: ~{crop.growthDuration}s</span>
                          <span>In Bag: <b className="text-neutral-200">{ownedSeeds}</b></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                        <button
                          onClick={() => handleBuySeed(crop.id, 1)}
                          disabled={money < crop.seedCost}
                          className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-semibold transition"
                        >
                          Buy 1 (${crop.seedCost})
                        </button>
                        <button
                          onClick={() => handleBuySeed(crop.id, 5)}
                          disabled={money < crop.seedCost * 5}
                          className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white border border-neutral-600 rounded-lg text-xs font-semibold transition"
                        >
                          Buy 5 (${crop.seedCost * 5})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fertilizer Supplies */}
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider pt-2">
                Supplies
              </div>
              <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neutral-400" />
                    <h4 className="text-sm font-bold text-neutral-100">Enriched Soil Fertilizer</h4>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Increases soil nutrients by +50%, boosting crop growth rate by 30%.
                  </p>
                  <span className="text-[10px] text-neutral-400">
                    Owned: <b className="text-neutral-200">{inventory['fertilizer'] || 0} bags</b>
                  </span>
                </div>
                <button
                  onClick={() => handleBuyFertilizer(5)}
                  disabled={money < 75}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white border border-neutral-700 rounded-xl text-xs font-bold transition shadow"
                >
                  Buy 5 ($75)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Harvested Produce Storage
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {CROP_LIST.map((crop) => {
                  const count = inventory[crop.id] || 0;
                  return (
                    <div
                      key={crop.id}
                      className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-neutral-100">{crop.name} Produce</h4>
                        <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-3">
                          <span>Market Rate: <b className="text-neutral-200">${crop.sellPrice}</b> each</span>
                          <span>In Stock: <b className="text-white">{count} units</b></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSellProduce(crop.id, 1)}
                          disabled={count < 1}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 border border-neutral-700 rounded-lg text-xs font-semibold transition"
                        >
                          Sell 1 (+${crop.sellPrice})
                        </button>
                        <button
                          onClick={() => handleSellProduce(crop.id, count)}
                          disabled={count < 1}
                          className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white border border-neutral-600 rounded-lg text-xs font-bold transition shadow"
                        >
                          Sell All (+${count * crop.sellPrice})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
