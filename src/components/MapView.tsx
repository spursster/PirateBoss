import { useGame } from '../context/GameContext';
import { Anchor, Gem, AlertTriangle, Heart, Coins, Navigation as NavIcon } from 'lucide-react';
import { getIslandTypeColor } from '../utils/gameUtils';
import { useState } from 'react';
import type { Island } from '../types/game';

export function MapView() {
  const { islands, player, visitedIslands, visitIsland, setView, setCurrentEnemy, addBattleLog } = useGame();
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
  const [traveling, setTraveling] = useState(false);

  if (!player) return null;

  const handleTravel = async (island: Island) => {
    if (player.current_island_id === island.id) {
      setSelectedIsland(island);
      return;
    }

    setTraveling(true);

    if (island.has_enemy && Math.random() < 0.4 + island.danger_level * 0.1) {
      const enemy = generateEnemy(island.danger_level);
      setCurrentEnemy(enemy);
      addBattleLog(`Enemy spotted near ${island.name}!`);
      addBattleLog(`${enemy.name} blocks your path!`);
      setView('battle');
    } else {
      await visitIsland(island.id);
      setSelectedIsland(island);
    }

    setTraveling(false);
  };

  const generateEnemy = (dangerLevel: number) => {
    const enemyTypes = [
      { name: 'Pirate Scout', type: 'scout' },
      { name: 'Sea Bandit', type: 'bandit' },
      { name: 'Cursed Sailor', type: 'cursed' },
      { name: 'Pirate Captain', type: 'captain' },
      { name: 'Sea Monster', type: 'monster' },
    ];

    const typeIndex = Math.min(dangerLevel - 1, enemyTypes.length - 1);
    const enemyType = enemyTypes[typeIndex];

    const baseHealth = 30 + dangerLevel * 20;
    const baseAttack = 5 + dangerLevel * 3;
    const baseDefense = 2 + dangerLevel * 2;
    const baseSpeed = 3 + dangerLevel;

    return {
      id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: enemyType.name,
      type: enemyType.type,
      health: baseHealth,
      max_health: baseHealth,
      attack: baseAttack,
      defense: baseDefense,
      speed: baseSpeed,
      gold_drop: Math.floor(10 + dangerLevel * 15 + Math.random() * 20),
      experience_drop: Math.floor(20 + dangerLevel * 10 + Math.random() * 10),
      special_ability: dangerLevel >= 4 ? 'regeneration' : undefined,
    };
  };

  const currentIsland = islands.find(i => i.id === player.current_island_id);
  const visitedIds = new Set(visitedIslands.map(v => v.island_id));
  const gridMax = 10;

  const islandIcons: Record<string, React.ElementType> = {
    safe: Anchor,
    friendly: Heart,
    neutral: Anchor,
    hostile: AlertTriangle,
    dangerous: AlertTriangle,
    treasure: Gem,
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-500 mb-2">The Seas Await</h2>
        <p className="text-slate-400">
          {currentIsland ? (
            <>
              Current location: <span className="text-white font-semibold">{currentIsland.name}</span>
            </>
          ) : (
            'Set sail to discover new lands'
          )}
        </p>
      </div>

      <div className="relative bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="10%" height="10%" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-500"/>
          </svg>
        </div>

        <div className="relative aspect-square max-h-[60vh]">
          {islands.map(island => {
            const Icon = islandIcons[island.island_type] || Anchor;
            const isVisited = visitedIds.has(island.id);
            const isCurrentLocation = island.id === player.current_island_id;
            const left = (island.x_coord / gridMax) * 100;
            const top = (island.y_coord / gridMax) * 100;

            return (
              <button
                key={island.id}
                onClick={() => handleTravel(island)}
                disabled={traveling}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 ${
                  traveling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-125'
                }`}
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCurrentLocation
                      ? 'bg-amber-500 ring-4 ring-amber-500/30'
                      : isVisited
                      ? 'bg-slate-600'
                      : 'bg-slate-700/50'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isCurrentLocation ? 'text-slate-900' : getIslandTypeColor(island.island_type)
                    }`}
                  />
                </div>

                {(isVisited || isCurrentLocation) && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs
 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {island.name}
                  </div>
                )}

                {island.has_enemy && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}

                {island.has_treasure && (
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-500 rounded-full" />
                )}
              </button>
            );
          })}

          {currentIsland && (
            <div
              className="absolute bg-amber-500 w-2 h-2 rounded-full animate-pulse"
              style={{
                left: `calc(${(currentIsland.x_coord / gridMax) * 100}% + 20px)`,
                top: `calc(${(currentIsland.y_coord / gridMax) * 100}% - 2px)`,
              }}
            />
          )}
        </div>
      </div>

      {selectedIsland && (
        <div className="mt-6 bg-slate-800/80 rounded-xl p-4 border border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{selectedIsland.name}</h3>
              <p className={`${getIslandTypeColor(selectedIsland.island_type)} text-sm uppercase tracking-wide`}>
                {selectedIsland.island_type} Waters
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedIsland.danger_level > 1 && (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  Danger Lv.{selectedIsland.danger_level}
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-300 mb-4">{selectedIsland.description}</p>

          <div className="flex flex-wrap gap-3 mb-4">
            {selectedIsland.has_treasure && (
              <span className="flex items-center gap-1 px-3 py-1 bg-yellow-900/50 text-yellow-300 text-sm rounded-full">
                <Gem className="w-4 h-4" />
                Treasure
              </span>
            )}
            {selectedIsland.has_enemy && (
              <span className="flex items-center gap-1 px-3 py-1 bg-red-900/50 text-red-300 text-sm rounded-full">
                <AlertTriangle className="w-4 h-4" />
                Enemies
              </span>
            )}
            {Object.entries(selectedIsland.resources).map(([key, value]) => (
              <span
                key={key}
                className="flex items-center gap-1 px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-full"
              >
                <Coins className="w-4 h-4" />
                {key}: {value}
              </span>
            ))}
          </div>

          {selectedIsland.id === player.current_island_id && (
            <div className="flex gap-3">
              <button
                onClick={() => setView('shop')}
                className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg transition-all"
              >
                Trade Resources
              </button>
              {selectedIsland.has_enemy && (
                <button
                  onClick={() => {
                    const enemy = generateEnemy(selectedIsland.danger_level);
                    setCurrentEnemy(enemy);
                    addBattleLog(`You encounter ${enemy.name}!`);
                    setView('battle');
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
                >
                  Hunt Enemies
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
