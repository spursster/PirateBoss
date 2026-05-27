export interface Player {
  id: string;
  auth_user_id: string | null;
  captain_name: string;
  gold: number;
  level: number;
  experience: number;
  health: number;
  max_health: number;
  energy: number;
  max_energy: number;
  attack: number;
  defense: number;
  speed: number;
  current_island_id: string | null;
  ship_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrewMember {
  id: string;
  player_id: string;
  name: string;
  role: string;
  level: number;
  health: number;
  max_health: number;
  attack: number;
  defense: number;
  special_ability: string | null;
  hire_cost: number;
  is_active: boolean;
  created_at: string;
}

export interface Ship {
  id: string;
  player_id: string;
  name: string;
  type: string;
  hull: number;
  max_hull: number;
  speed: number;
  cannons: number;
  cargo_capacity: number;
  is_flagship: boolean;
  created_at: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  difficulty: string;
  gold_reward: number;
  experience_reward: number;
  objective_type: string;
  objective_target: number;
  prerequisite_level: number;
  island_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PlayerQuest {
  id: string;
  player_id: string;
  quest_id: string;
  status: 'available' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  completed_at: string | null;
  created_at: string;
  quest?: Quest;
}

export interface InventoryItem {
  id: string;
  player_id: string;
  item_name: string;
  item_type: string;
  quantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: Record<string, number>;
  description: string | null;
  equipped: boolean;
  created_at: string;
}

export interface Island {
  id: string;
  name: string;
  description: string;
  island_type: 'safe' | 'friendly' | 'neutral' | 'hostile' | 'dangerous' | 'treasure';
  x_coord: number;
  y_coord: number;
  danger_level: number;
  has_treasure: boolean;
  has_enemy: boolean;
  resources: Record<string, number>;
  created_at: string;
}

export interface VisitedIsland {
  id: string;
  player_id: string;
  island_id: string;
  visited_at: string;
  island?: Island;
}

export interface Enemy {
  id: string;
  name: string;
  type: string;
  health: number;
  max_health: number;
  attack: number;
  defense: number;
  speed: number;
  gold_drop: number;
  experience_drop: number;
  special_ability?: string;
}

export interface GameState {
  player: Player | null;
  crew: CrewMember[];
  ships: Ship[];
  quests: PlayerQuest[];
  inventory: InventoryItem[];
  islands: Island[];
  visitedIslands: VisitedIsland[];
  currentView: string;
  isLoading: boolean;
}

export type ViewType = 'map' | 'battle' | 'inventory' | 'crew' | 'ship' | 'quests' | 'shop';
