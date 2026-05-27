import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Swords, Shield, Zap, Coins, Star, Skull } from 'lucide-react';
import { calculateDamage, generateLoot, getRarityColor, calculateLevelFromXP } from '../utils/gameUtils';

export function BattleView() {
  const {
    player,
    crew,
    currentEnemy,
    setCurrentEnemy,
    battleLog,
    addBattleLog,
    clearBattleLog,
    updatePlayer,
    addItem,
    setView,
  } = useGame();

  const [playerHealth, setPlayerHealth] = useState(player?.health || 100);
  const [enemyHealth, setEnemyHealth] = useState(currentEnemy?.health || 0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleEnded, setBattleEnded] = useState(false);
  const [lootDropped, setLootDropped] = useState<ReturnType<typeof generateLoot> | null>(null);
  const [animatingAttack, setAnimatingAttack] = useState<'player' | 'enemy' | null>(null);

  useEffect(() => {
    if (player) {
      setPlayerHealth(player.health);
    }
    if (currentEnemy) {
      setEnemyHealth(currentEnemy.health);
    }
    setIsPlayerTurn(true);
    setBattleEnded(false);
    setLootDropped(null);
  }, [player, currentEnemy]);

  if (!player || !currentEnemy) {
    return (
      <div className="p-4 pb-20 text-center">
        <Skull className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-400 mb-2">No Enemies Nearby</h2>
        <p className="text-slate-500 mb-4">Travel to hostile islands to find battles</p>
        <button
          onClick={() => setView('map')}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-all"
        >
          Return to Map
        </button>
      </div>
    );
  }

  const performAttack = () => {
    if (!isPlayerTurn || battleEnded) return;

    setAnimatingAttack('player');
    setTimeout(() => setAnimatingAttack(null), 300);

    const damage = calculateDamage(player.attack + (crew.length * 2), currentEnemy.defense);
    const newHealth = Math.max(0, enemyHealth - damage);
    setEnemyHealth(newHealth);
    addBattleLog(`You deal ${damage} damage!`);

    if (newHealth <= 0) {
      handleVictory();
    } else {
      setIsPlayerTurn(false);
      setTimeout(() => {
        performEnemyAttack();
      }, 1000);
    }
  };

  const performHeavyAttack = () => {
    if (!isPlayerTurn || battleEnded) return;

    setAnimatingAttack('player');
    setTimeout(() => setAnimatingAttack(null), 300);

    const hitChance = 0.6;
    if (Math.random() > hitChance) {
      addBattleLog('Heavy attack missed!');
      setIsPlayerTurn(false);
      setTimeout(() => {
        performEnemyAttack();
      }, 1000);
      return;
    }

    const damage = Math.floor(calculateDamage(player.attack + (crew.length * 2), currentEnemy.defense) * 1.8);
    const newHealth = Math.max(0, enemyHealth - damage);
    setEnemyHealth(newHealth);
    addBattleLog(`Heavy attack! ${damage} damage!`);

    if (newHealth <= 0) {
      handleVictory();
    } else {
      setIsPlayerTurn(false);
      setTimeout(() => {
        performEnemyAttack();
      }, 1000);
    }
  };

  const performEnemyAttack = () => {
    if (battleEnded) return;

    setAnimatingAttack('enemy');
    setTimeout(() => setAnimatingAttack(null), 300);

    const damage = calculateDamage(currentEnemy.attack, player.defense + (crew.length));
    const newHealth = Math.max(0, playerHealth - damage);
    setPlayerHealth(newHealth);
    addBattleLog(`${currentEnemy.name} deals ${damage} damage!`);

    if (newHealth <= 0) {
      handleDefeat();
    } else {
      setIsPlayerTurn(true);
    }
  };

  const attemptFlee = () => {
    if (!currentEnemy) return;

    const fleeChance = 0.3 + (player.speed * 0.05) - (currentEnemy.speed * 0.05);
    if (Math.random() < fleeChance) {
      addBattleLog('You escaped successfully!');
      setBattleEnded(true);
      endBattle();
    } else {
      addBattleLog('Escape failed!');
      setIsPlayerTurn(false);
      setTimeout(() => {
        performEnemyAttack();
      }, 1000);
    }
  };

  const handleVictory = async () => {
    setBattleEnded(true);
    addBattleLog(`${currentEnemy.name} has been defeated!`);

    const loot = generateLoot(currentEnemy.speed);
    setLootDropped(loot);

    const goldEarned = currentEnemy.gold_drop;
    const xpEarned = currentEnemy.experience_drop;

    addBattleLog(`Earned ${goldEarned} gold!`);
    addBattleLog(`Gained ${xpEarned} XP!`);

    const newXP = player.experience + xpEarned;
    const newLevel = calculateLevelFromXP(newXP);
    const levelUp = newLevel > player.level;

    if (levelUp) {
      addBattleLog(`LEVEL UP! Now level ${newLevel}!`);
    }

    await updatePlayer({
      gold: player.gold + goldEarned,
      experience: newXP,
      level: newLevel,
    });

    if (loot) {
      await addItem({
        item_name: loot.name,
        item_type: loot.type,
        quantity: 1,
        rarity: loot.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
        stats: loot.stats,
        description: null,
        equipped: false,
      });
      addBattleLog(`Found ${loot.rarity} ${loot.name}!`);
    }
  };

  const handleDefeat = async () => {
    setBattleEnded(true);
    addBattleLog('You have been defeated!');

    const goldLost = Math.floor(player.gold * 0.1);
    addBattleLog(`Lost ${goldLost} gold...`);

    await updatePlayer({
      gold: Math.max(0, player.gold - goldLost),
      health: Math.floor(player.max_health * 0.5),
    });
  };

  const endBattle = () => {
    setCurrentEnemy(null);
    clearBattleLog();
    setView('map');
  };

  const playerHealthPercent = (playerHealth / player.max_health) * 100;
  const enemyHealthPercent = (enemyHealth / currentEnemy.max_health) * 100;

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Battle!</h2>
        <p className="text-slate-400">Defeat the enemy to claim victory</p>
      </div>

      <div className="grid gap-6 mb-6">
        {/* Enemy card */}
        <div className={`bg-slate-800 rounded-xl p-4 border transition-all duration-200 ${
          animatingAttack === 'enemy' ? 'border-red-500 scale-105' : 'border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Skull className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{currentEnemy.name}</h3>
                <p className="text-sm text-slate-400">{currentEnemy.type}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Drops</div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Coins className="w-4 h-4" />
                <span>{currentEnemy.gold_drop}</span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Health</span>
              <span className="text-red-400">{enemyHealth}/{currentEnemy.max_health}</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{ width: `${enemyHealthPercent}%` }}
              />
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1 text-slate-400">
              <Swords className="w-4 h-4 text-orange-400" />
              <span>{currentEnemy.attack}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>{currentEnemy.defense}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>{currentEnemy.speed}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Star className="w-4 h-4 text-amber-400" />
              <span>{currentEnemy.experience_drop} XP</span>
            </div>
          </div>
        </div>

        {/* Player card */}
        <div className={`bg-slate-800 rounded-xl p-4 border transition-all duration-200 ${
          animatingAttack === 'player' ? 'border-amber-500 scale-105' : 'border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚓</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{player.captain_name}</h3>
                <p className="text-sm text-slate-400">Lv.{player.level} Captain</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">+{crew.length} Crew</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Health</span>
              <span className="text-green-400">{playerHealth}/{player.max_health}</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
                style={{ width: `${playerHealthPercent}%` }}
              />
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1 text-slate-400">
              <Swords className="w-4 h-4 text-orange-400" />
              <span>{player.attack + (crew.length * 2)}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>{player.defense + (crew.length)}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>{player.speed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Battle log */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-6 max-h-40 overflow-y-auto border border-slate-700">
        {battleLog.map((log, i) => (
          <p key={i} className="text-sm text-slate-300 mb-1">{log}</p>
        ))}
        {battleLog.length === 0 && (
          <p className="text-sm text-slate-500 italic">Battle has begun...</p>
        )}
      </div>

      {/* Loot display */}
      {lootDropped && (
        <div className="bg-gradient-to-r from-amber-900/50 to-yellow-900/50 rounded-lg p-4 mb-6 border border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-900/50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💎</span>
            </div>
            <div>
              <h4 className={`font-bold ${getRarityColor(lootDropped.rarity)}`}>
                {lootDropped.name}
              </h4>
              <p className="text-sm text-slate-400 capitalize">{lootDropped.rarity} {lootDropped.type}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!battleEnded ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={performAttack}
            disabled={!isPlayerTurn}
            className={`py-3 rounded-lg font-semibold transition-all ${
              isPlayerTurn
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            Attack
          </button>
          <button
            onClick={performHeavyAttack}
            disabled={!isPlayerTurn}
            className={`py-3 rounded-lg font-semibold transition-all ${
              isPlayerTurn
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            Heavy Attack
          </button>
          <button
            onClick={attemptFlee}
            disabled={!isPlayerTurn}
            className={`col-span-2 py-3 rounded-lg font-semibold transition-all ${
              isPlayerTurn
                ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            Flee
          </button>
        </div>
      ) : (
        <button
          onClick={endBattle}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg transition-all"
        >
          {enemyHealth <= 0 ? 'Claim Victory' : 'Return to Map'}
        </button>
      )}
    </div>
  );
}
