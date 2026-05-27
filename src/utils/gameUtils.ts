import type { Player, Enemy } from '../types/game';

export const EXPERIENCE_PER_LEVEL = 100;
export const LEVEL_SCALING = 1.5;

export function calculateLevelFromXP(experience: number): number {
  return Math.floor(Math.sqrt(experience / EXPERIENCE_PER_LEVEL)) + 1;
}

export function xpToNextLevel(level: number): number {
  return Math.floor(EXPERIENCE_PER_LEVEL * Math.pow(level, LEVEL_SCALING));
}

export function calculateDamage(attack: number, defense: number): number {
  const baseDamage = Math.max(1, attack - defense * 0.5);
  const variance = baseDamage * 0.2;
  return Math.floor(baseDamage + (Math.random() * variance * 2 - variance));
}

export function calculateBattleTurn(attacker: { speed: number; attack: number; defense: number }, defender: { speed: number; attack: number; defense: number; health: number }):

  { damage: number; isCritical: boolean } {
  const speedBonus = attacker.speed > defender.speed ? 0.2 : 0;
  const criticalChance = 0.1 + speedBonus;
  const isCritical = Math.random() < criticalChance;

  let damage = calculateDamage(attacker.attack, defender.defense);
  if (isCritical) {
    damage = Math.floor(damage * 1.5);
  }

  return { damage, isCritical };
}

export function generateEnemy(dangerLevel: number): Enemy {
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
}

export function generateLoot(dangerLevel: number): { name: string; type: string; rarity: string;

  stats: Record<string, number> } | null {
  const lootChance = 0.3 + dangerLevel * 0.1;
  if (Math.random() > lootChance) return null;

  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const rarityIndex = Math.min(Math.floor(Math.random() * (dangerLevel * 0.8)), rarities.length - 1);
  const rarity = rarities[rarityIndex];

  const items = [
    { name: 'Rum Bottle', type: 'consumable', stats: { health: 20 } },
    { name: 'Steel Cutlass', type: 'weapon', stats: { attack: 5 } },
    { name: 'Leather Vest', type: 'armor', stats: { defense: 3 } },
    { name: 'Compass', type: 'accessory', stats: { speed: 2 } },
    { name: 'Silver Coin', type: 'treasure', stats: { gold: 50 } },
    { name: 'Ruby Amulet', type: 'accessory', stats: { health: 15, attack: 2 } },
    { name: 'Captain\'s Hat', type: 'armor', stats: { defense: 5, speed: 1 } },
    { name: 'Golden Pistol', type: 'weapon', stats: { attack: 10, speed: 2 } },
  ];

  const item = items[Math.floor(Math.random() * items.length)];
  const statMultiplier = rarityIndex + 1;

  return {
    name: item.name,
    type: item.type,
    rarity,
    stats: Object.fromEntries(
      Object.entries(item.stats).map(([key, value]) => [key, value * statMultiplier])
    ),
  };
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: 'text-gray-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-amber-400',
  };
  return colors[rarity] || 'text-gray-400';
}

export function getIslandTypeColor(type: string): string {
  const colors: Record<string, string> = {
    safe: 'text-green-400',
    friendly: 'text-emerald-400',
    neutral: 'text-amber-400',
    hostile: 'text-red-400',
    dangerous: 'text-rose-600',
    treasure: 'text-yellow-400',
  };
  return colors[type] || 'text-gray-400';
}

export function formatGold(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: 'bg-green-600',
    medium: 'bg-amber-600',
    hard: 'bg-red-600',
    legendary: 'bg-rose-600',
  };
  return colors[difficulty] || 'bg-gray-600';
}
