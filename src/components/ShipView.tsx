import { useGame } from '../context/GameContext';
import { supabase } from '../lib/supabase';
import { Ship, Anchor, Zap, Swords, Shield, Package, Edit2, Check } from 'lucide-react';
import { useState } from 'react';

export function ShipView() {
  const { player, ships, updatePlayer, setView } = useGame();
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!player) return null;

  const handleRename = async (shipId: string) => {
    if (!editName.trim()) return;

    await supabase.from('ships').update({ name: editName }).eq('id', shipId);

    setEditing(null);
    setEditName('');
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-500 mb-2">Your Fleet</h2>
        <p className="text-slate-400">{ships.length} ship{ships.length !== 1 ? 's' : ''} in your fleet</p>
      </div>

      {ships.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
          <Ship className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">No Ships</h3>
          <p className="text-slate-500">You should have been given a starting ship</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ships.map(ship => {
            const hullPercent = (ship.hull / ship.max_hull) * 100;

            return (
              <div
                key={ship.id}
                className={`bg-slate-800/80 rounded-xl p-5 border transition-all ${
                  ship.is_flagship ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-600/20 to-amber-800/20 rounded-xl flex items-center justify-center">
                      <Ship className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                      {editing === ship.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                            placeholder={ship.name}
                          />
                          <button
                            onClick={() => handleRename(ship.id)}
                            className="p-1 bg-green-600 hover:bg-green-500 rounded text-white"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{ship.name}</h3>
                          <button
                            onClick={() => {
                              setEditing(ship.id);
                              setEditName(ship.name);
                            }}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-slate-400 capitalize">{ship.type}</p>
                        {ship.is_flagship && (
                          <span className="px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full">
                            Flagship
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Hull Integrity</span>
                    <span className="text-cyan-400">{ship.hull}/{ship.max_hull}</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        hullPercent > 50
                          ? 'bg-gradient-to-r from-green-600 to-green-400'
                          : hullPercent > 25
                          ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                          : 'bg-gradient-to-r from-red-600 to-red-400'
                      }`}
                      style={{ width: `${hullPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                    <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <div className="font-bold text-white text-lg">{ship.speed}</div>
                    <div className="text-xs text-slate-400">Speed</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                    <Swords className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                    <div className="font-bold text-white text-lg">{ship.cannons}</div>
                    <div className="text-xs text-slate-400">Cannons</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                    <Shield className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <div className="font-bold text-white text-lg">{ship.max_hull}</div>
                    <div className="text-xs text-slate-400">Hull</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                    <Package className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <div className="font-bold text-white text-lg">{ship.cargo_capacity}</div>
                    <div className="text-xs text-slate-400">Cargo</div>
                  </div>
                </div>

                {ship.hull < ship.max_hull && (
                  <button
                    onClick={async () => {
                      const repairCost = Math.floor((ship.max_hull - ship.hull) * 0.5);
                      if (player.gold < repairCost) return;

                      await supabase.from('ships').update({ hull: ship.max_hull }).eq('id', ship.id);
                      await updatePlayer({ gold: player.gold - repairCost });
                    }}
                    disabled={player.gold < Math.floor((ship.max_hull - ship.hull) * 0.5)}
                    className={`mt-4 w-full py-2 rounded-lg font-semibold transition-all ${
                      player.gold >= Math.floor((ship.max_hull - ship.hull) * 0.5)
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Repair ({Math.floor((ship.max_hull - ship.hull) * 0.5)} 💰)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Fleet Command</h3>

        <div className="grid gap-3">
          <button
            onClick={() => setView('map')}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Anchor className="w-5 h-5" />
            Set Sail
          </button>

          <button
            onClick={() => setView('shop')}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
          >
            Visit Shipwright
          </button>
        </div>
      </div>
    </div>
  );
}
