import { useGame } from '../context/GameContext';
import { Package, Trash2, Shield, Swords, Heart, Zap, Star } from 'lucide-react';
import { getRarityColor } from '../utils/gameUtils';
import type { InventoryItem } from '../types/game';

export function InventoryView() {
  const { player, inventory, updatePlayer, updateItem, deleteItem } = useGame();

  const itemIcons: Record<string, React.ElementType> = {
    weapon: Swords,
    armor: Shield,
    consumable: Heart,
    accessory: Star,
    treasure: Zap,
  };

  const useConsumable = async (item: InventoryItem) => {
    if (!player || item.item_type !== 'consumable') return;

    const healthBonus = item.stats.health || 0;
    const energyBonus = item.stats.energy || 0;

    const newHealth = Math.min(player.max_health, player.health + healthBonus);
    const newEnergy = Math.min(player.max_energy, player.energy + energyBonus);

    await updatePlayer({
      health: newHealth,
      energy: newEnergy,
    });

    if (item.quantity <= 1) {
      await deleteItem(item.id);
    } else {
      await updateItem(item.id, { quantity: item.quantity - 1 });
    }
  };

  const equipItem = async (item: InventoryItem) => {
    if (!player || item.item_type === 'consumable') return;

    const currentEquipped = inventory.find(
      i => i.item_type === item.item_type && i.equipped && i.id !== item.id
    );

    if (currentEquipped) {
      await updateItem(currentEquipped.id, { equipped: false });
    }

    await updateItem(item.id, { equipped: true });
  };

  const unequipItem = async (item: InventoryItem) => {
    await updateItem(item.id, { equipped: false });
  };

  const getStatDisplay = (stats: Record<string, number>) => {
    return Object.entries(stats)
      .map(([key, value]) => {
        const icons: Record<string, string> = {
          attack: '⚔️',
          defense: '🛡️',
          health: '❤️',
          speed: '⚡',
          gold: '💰',
        };
        return `${icons[key] || key}: +${value}`;
      })
      .join(' ');
  };

  const groupedInventory = inventory.reduce(
    (acc, item) => {
      const type = item.item_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    },
    {} as Record<string, InventoryItem[]>
  );

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-500 mb-2">Inventory</h2>
        <p className="text-slate-400">Manage your equipment and consumables</p>
      </div>

      {inventory.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">Empty Satchel</h3>
          <p className="text-slate-500">Find items while exploring or battling</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedInventory).map(([type, items]) => (
            <div key={type}>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                {type === 'weapon' && <Swords className="w-4 h-4" />}
                {type === 'armor' && <Shield className="w-4 h-4" />}
                {type === 'consumable' && <Heart className="w-4 h-4" />}
                {type === 'accessory' && <Star className="w-4 h-4" />}
                {type === 'treasure' && <Zap className="w-4 h-4" />}
                {type} ({items.length})
              </h3>

              <div className="grid gap-3">
                {items.map(item => {
                  const Icon = itemIcons[item.item_type] || Package;
                  const rarityColor = getRarityColor(item.rarity);

                  return (
                    <div
                      key={item.id}
                      className={`bg-slate-800/80 rounded-xl p-4 border transition-all ${
                        item.equipped
                          ? 'border-amber-500/50 ring-1 ring-amber-500/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 ${
                            item.equipped ? 'bg-amber-600/20' : 'bg-slate-700'
                          }`}
                        >
                          <Icon className={`w-7 h-7 ${item.equipped ? 'text-amber-400' : 'text-slate-400'}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-bold capitalize ${rarityColor}`}>{item.item_name}</h4>
                              {item.equipped && (
                                <span className="px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full">
                                  Equipped
                                </span>
                              )}
                            </div>
                            {item.quantity > 1 && (
                              <span className="text-slate-400 text-sm">x{item.quantity}</span>
                            )}
                          </div>

                          <p className="text-sm text-slate-400 mb-2 capitalize">
                            {item.rarity} {item.item_type}
                          </p>

                          {Object.keys(item.stats).length > 0 && (
                            <div className="text-sm text-slate-300 mb-3">{getStatDisplay(item.stats)}</div>
                          )}

                          <div className="flex gap-2 flex-wrap">
                            {item.item_type === 'consumable' && (
                              <button
                                onClick={() => useConsumable(item)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-all"
                              >
                                Use
                              </button>
                            )}

                            {item.item_type !== 'consumable' && item.item_type !== 'treasure' && (
                              <>
                                {!item.equipped ? (
                                  <button
                                    onClick={() => equipItem(item)}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-all"
                                  >
                                    Equip
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => unequipItem(item)}
                                    className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded-lg transition-all"
                                  >
                                    Unequip
                                  </button>
                                )}
                              </>
                            )}

                            <button
                              onClick={() => deleteItem(item.id)}
                              className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800 text-red-300 text-sm font-medium rounded-lg transition-all flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Drop
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
