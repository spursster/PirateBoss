import { useGame } from '../context/GameContext';
import { Coins, Heart, Zap, Shield, Sword, Star, Anchor } from 'lucide-react';
import { formatGold, calculateLevelFromXP } from '../utils/gameUtils';

export function StatsBar() {
  const { player, setView, currentView, signOut } = useGame();

  if (!player) return null;

  const currentLevel = calculateLevelFromXP(player.experience);
  const healthPercent = (player.health / player.max_health) * 100;
  const energyPercent = (player.energy / player.max_energy) * 100;

  return (
    <div className="bg-slate-900 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Anchor className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-white">{player.captain_name}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4" />
              <span className="text-sm font-semibold">Lv.{currentLevel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-400 font-semibold">{formatGold(player.gold)}</span>
            </div>

            <div className="flex flex-col gap-1 min-w-[100px]">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span className="text-slate-300">{player.health}/{player.max_health}</span>
                </div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-[100px]">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span className="text-slate-300">{player.energy}/{player.max_energy}</span>
                </div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                  style={{ width: `${energyPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <div className="flex items-center gap-1" title="Attack">
                <Sword className="w-4 h-4 text-orange-400" />
                <span className="text-sm">{player.attack}</span>
              </div>
              <div className="flex items-center gap-1" title="Defense">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-sm">{player.defense}</span>
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            className="text-slate-400 hover:text-red-400 text-sm transition-colors"
          >
            Abandon Ship
          </button>
        </div>
      </div>
    </div>
  );
}
