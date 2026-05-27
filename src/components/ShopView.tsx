import { useGame } from '../context/GameContext';
import { supabase } from '../lib/supabase';
import { Package, Coins, ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';

const SHOP_ITEMS = [
  { name: 'Health Potion', type: 'consumable', rarity: 'common', cost: 25, stats: { health: 30 }, description: 'Restores 30 health' },
  { name: 'Energy Elixir', type: 'consumable', rarity: 'uncommon', cost: 40, stats: { energy: 20 }, description: 'Restores 20 energy' },
  { name: 'Steel Cutlass', type: 'weapon', rarity: 'uncommon', cost: 100, stats: { attack: 5 }, description: '+5 Attack' },
  { name: 'Iron Rapier', type: 'weapon', rarity: 'rare', cost: 300, stats: { attack: 12, speed: 2 }, description: '+12 Attack, +2 Speed' },
  { name: 'Leather Vest', type: 'armor', rarity: 'common', cost: 50, stats: { defense: 3 }, description: '+3 Defense' },
  { name: 'Chainmail Armor', type: 'armor', rarity: 'uncommon', cost: 200, stats: { defense: 8, health: 10 }, description: '+8 Defense, +10 Health' },
  { name: 'Brass Knuckles', type: 'weapon', rarity: 'common', cost: 60, stats: { attack: 3 }, description: '+3 Attack' },
  { name: 'Compass', type: 'accessory', rarity: 'uncommon', cost: 150, stats: { speed: 3 }, description: '+3 Speed' },
  { name: 'Golden Amulet', type: 'accessory', rarity: 'rare', cost: 400, stats: { health: 25, attack: 5 }, description: '+25 Health, +5 Attack' },
  { name: 'Captain\'s Hat', type: 'armor', rarity: 'rare', cost: 350, stats: { defense: 6, speed: 2 }, description: '+6 Defense, +2 Speed' },
];

export function ShopView() {
  const { player, inventory, addItem, updatePlayer, islands } = useGame();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');

  if (!player) return null;

  const currentIsland = islands.find(i => i.id === player.current_island_id);
  const isSafePort = currentIsland?.island_type === 'safe' || currentIsland?.island_type === 'friendly';

  const handleBuy = async (item: typeof SHOP_ITEMS[0]) => {
    if (player.gold < item.cost) return;

    await addItem({
      item_name: item.name,
      item_type: item.type,
      quantity: 1,
      rarity: item.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
      stats: item.stats as unknown as Record<string, number>,
      description: item.description,
      equipped: false,
    });

    await updatePlayer({ gold: player.gold - item.cost });
  };

  const handleSell = async (itemId: string, sellPrice: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const price = sellPrice || Math.floor(
      (item.rarity === 'legendary' ? 200 :
       item.rarity === 'epic' ? 100 :
       item.rarity === 'rare' ? 50 :
       item.rarity === 'uncommon' ? 25 : 10)
    );

    if (item.quantity > 1) {
      await updatePlayer({ gold: player.gold + price });
      await supabase.from('inventory').update({ quantity: item.quantity - 1 }).eq('id', itemId);
    } else {
      await updatePlayer({ gold: player.gold + price });
      await supabase.from('inventory').delete().eq('id', itemId);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-500 mb-2">Trading Post</h2>
        <p className="text-slate-400">
          {isSafePort
            ? `Welcome to ${currentIsland?.name || 'the shop'}`
            : 'Shop prices increased - you\'re not in a safe harbor'}
        </p>
      </div>

      {!isSafePort && currentIsland && (
        <div className="mb-6 bg-amber-900/30 border border-amber-500/30 rounded-lg p-3 text-amber-300 text-sm">
          Travel to a safe harbor like Skull Harbor to get better prices!
        </div>
      )}

      <div className="bg-slate-900/50 rounded-lg p-4 mb-6 flex items-center justify-between border border-slate-700">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="text-lg text-slate-400">Your gold:</span>
          <span className="text-xl font-bold text-yellow-400">{player.gold}</span>
        </div>
      </div>

      <div className="flex mb-6 bg-slate-700/50 rounded-lg p-1">
        <button
          onClick={() => setTab('buy')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'buy' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setTab('sell')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'sell' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      {tab === 'buy' && (
        <div className="grid gap-3">
          {SHOP_ITEMS.map((item, index) => {
            const adjustedCost = isSafePort ? item.cost : Math.floor(item.cost * 1.3);
            const canAfford = player.gold >= adjustedCost;

            const rarityColors = {
              common: 'border-slate-600',
              uncommon: 'border-green-600',
              rare: 'border-blue-600',
              epic: 'border-purple-600',
              legendary: 'border-amber-600',
            };

            return (
              <div
                key={index}
                className={`bg-slate-800/80 rounded-xl p-4 border ${
                  rarityColors[item.rarity as keyof typeof rarityColors]
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white">{item.name}</h4>
                    <p className="text-sm text-slate-400 capitalize">{item.rarity} {item.type}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Coins className="w-4 h-4" />
                      <span className="font-bold">{adjustedCost}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-3">{item.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-xs text-slate-400">
                    {Object.entries(item.stats).map(([key, value]) => (
                      <span key={key} className="px-2 py-1 bg-slate-700/50 rounded">
                        {key}: +{value}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Buy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'sell' && (
        <div>
          {inventory.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Nothing to sell</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {inventory.map(item => {
                const basePrice = Math.floor(
                  item.rarity === 'legendary' ? 100 :
                  item.rarity === 'epic' ? 50 :
                  item.rarity === 'rare' ? 25 :
                  item.rarity === 'uncommon' ? 12 : 5
                );
                const sellPrice = isSafePort ? basePrice : Math.floor(basePrice * 0.7);

                return (
                  <div
                    key={item.id}
                    className="bg-slate-800/80 rounded-xl p-4 border border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-white">
                          {item.item_name} {item.quantity > 1 && <span className="text-slate-400">x{item.quantity}</span>}
                        </h4>
                        <p className="text-sm text-slate-400 capitalize">{item.rarity} {item.item_type}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Coins className="w-4 h-4" />
                        <span className="font-bold">{sellPrice}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {Object.keys(item.stats).length > 0 && (
                        <div className="flex gap-2 text-xs text-slate-400">
                          {Object.entries(item.stats).slice(0, 3).map(([key, value]) => (
                            <span key={key} className="px-2 py-1 bg-slate-700/50 rounded">
                              {key}: +{value}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => handleSell(item.id, sellPrice)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                        Sell
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
