/*
  # Pirate Adventure RPG Game Schema

  1. New Tables
    - `players`: Main player profiles with game state (gold, level, experience, etc.)
    - `crew_members`: Crew members hired by players with stats and abilities
    - `ships`: Player ships with attributes and equipment slots
    - `quests`: Quest definitions with objectives, rewards, and prerequisites
    - `player_quests`: Progress tracking for quests undertaken by players
    - `inventory`: Items collected by players
    - `islands`: Discoverable islands on the map
    - `visited_islands`: Track which islands players have explored

  2. Security (RLS)
    - Enabled on all tables
    - Players can only access their own data
    - Public read access to quests and islands (shared content)

  3. Important Notes
    - All tables use UUID primary keys with gen_random_uuid()
    - Timestamps use timestamptz DEFAULT now()
    - Foreign key constraints ensure data integrity
    - Default values provided for most columns
*/

-- Players table: Main player profile and game state
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  captain_name text NOT NULL DEFAULT 'Captain',
  gold integer NOT NULL DEFAULT 100,
  level integer NOT NULL DEFAULT 1,
  experience integer NOT NULL DEFAULT 0,
  health integer NOT NULL DEFAULT 100,
  max_health integer NOT NULL DEFAULT 100,
  energy integer NOT NULL DEFAULT 50,
  max_energy integer NOT NULL DEFAULT 50,
  attack integer NOT NULL DEFAULT 10,
  defense integer NOT NULL DEFAULT 5,
  speed integer NOT NULL DEFAULT 5,
  current_island_id uuid,
  ship_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crew members table: Members hired by the player
CREATE TABLE IF NOT EXISTS crew_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'sailor',
  level integer NOT NULL DEFAULT 1,
  health integer NOT NULL DEFAULT 50,
  max_health integer NOT NULL DEFAULT 50,
  attack integer NOT NULL DEFAULT 5,
  defense integer NOT NULL DEFAULT 3,
  special_ability text,
  hire_cost integer NOT NULL DEFAULT 50,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Ships table: Player ships
CREATE TABLE IF NOT EXISTS ships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'The Black Pearl',
  type text NOT NULL DEFAULT 'sloop',
  hull integer NOT NULL DEFAULT 100,
  max_hull integer NOT NULL DEFAULT 100,
  speed integer NOT NULL DEFAULT 10,
  cannons integer NOT NULL DEFAULT 4,
  cargo_capacity integer NOT NULL DEFAULT 50,
  is_flagship boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Quests table: Quest definitions
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  quest_type text NOT NULL DEFAULT 'exploration',
  difficulty text NOT NULL DEFAULT 'normal',
  gold_reward integer NOT NULL DEFAULT 100,
  experience_reward integer NOT NULL DEFAULT 50,
  objective_type text NOT NULL,
  objective_target integer NOT NULL DEFAULT 1,
  prerequisite_level integer NOT NULL DEFAULT 1,
  island_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Player quests table: Quest progress tracking
CREATE TABLE IF NOT EXISTS player_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'available',
  progress integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, quest_id)
);

-- Inventory table: Player items
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_type text NOT NULL DEFAULT 'consumable',
  quantity integer NOT NULL DEFAULT 1,
  rarity text NOT NULL DEFAULT 'common',
  stats jsonb DEFAULT '{}',
  description text,
  equipped boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Islands table: Discoverable islands
CREATE TABLE IF NOT EXISTS islands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  island_type text NOT NULL DEFAULT 'neutral',
  x_coord integer NOT NULL,
  y_coord integer NOT NULL,
  danger_level integer NOT NULL DEFAULT 1,
  has_treasure boolean NOT NULL DEFAULT false,
  has_enemy boolean NOT NULL DEFAULT false,
  resources jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Visited islands table: Track explored islands
CREATE TABLE IF NOT EXISTS visited_islands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  island_id uuid NOT NULL REFERENCES islands(id) ON DELETE CASCADE,
  visited_at timestamptz DEFAULT now(),
  UNIQUE(player_id, island_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE islands ENABLE ROW LEVEL SECURITY;
ALTER TABLE visited_islands ENABLE ROW LEVEL SECURITY;

-- Players RLS policies
CREATE POLICY "Players can view own profile"
  ON players FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Players can update own profile"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Players can insert own profile"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Crew members RLS policies
CREATE POLICY "Players can view own crew"
  ON crew_members FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

CREATE POLICY "Players can insert own crew"
  ON crew_members FOR INSERT
  TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

CREATE POLICY "Players can update own crew"
  ON crew_members FOR UPDATE
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()))
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

CREATE POLICY "Players can delete own crew"
  ON crew_members FOR DELETE
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

-- Ships RLS policies
CREATE POLICY "Players can view own ships"
  ON ships FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

CREATE POLICY "Players can insert own ships"
  ON ships FOR INSERT
  TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

CREATE POLICY "Players can update own ships"
  ON ships FOR UPDATE
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()))
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

CREATE POLICY "Players can delete own ships"
  ON ships FOR DELETE
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

-- Quests RLS policies (public read for all authenticated)
CREATE POLICY "Players can view quests"
  ON quests FOR SELECT
  TO authenticated
  USING (true);

-- Player quests RLS policies
CREATE POLICY "Players can view own quests"
  ON player_quests FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

CREATE POLICY "Players can insert own quests"
  ON player_quests FOR INSERT
  TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

CREATE POLICY "Players can update own quests"
  ON player_quests FOR UPDATE
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()))
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

-- Inventory RLS policies
CREATE POLICY "Players can view own inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

CREATE POLICY "Players can insert own inventory"
  ON inventory FOR INSERT
  TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

CREATE POLICY "Players can update own inventory"
  ON inventory FOR UPDATE
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()))
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

CREATE POLICY "Players can delete own inventory"
  ON inventory FOR DELETE
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

-- Islands RLS policies (public read for all authenticated)
CREATE POLICY "Players can view islands"
  ON islands FOR SELECT
  TO authenticated
  USING (true);

-- Visited islands RLS policies
CREATE POLICY "Players can view own visited islands"
  ON visited_islands FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

CREATE POLICY "Players can insert own visited islands"
  ON visited_islands FOR INSERT
  TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid()));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_crew_members_player_id ON crew_members(player_id);
CREATE INDEX IF NOT EXISTS idx_ships_player_id ON ships(player_id);
CREATE INDEX IF NOT EXISTS idx_player_quests_player_id ON player_quests(player_id);
CREATE INDEX IF NOT EXISTS idx_player_quests_quest_id ON player_quests(quest_id);
CREATE INDEX IF NOT EXISTS idx_inventory_player_id ON inventory(player_id);
CREATE INDEX IF NOT EXISTS idx_visited_islands_player_id ON visited_islands(player_id);
CREATE INDEX IF NOT EXISTS idx_visited_islands_island_id ON visited_islands(island_id);
CREATE INDEX IF NOT EXISTS idx_islands_coords ON islands(x_coord, y_coord);
