/*
  # Seed Initial Game Data

  1. Initial Islands
    - Starting island (safe harbor)
    - Various islands for exploration with different danger levels
    - Treasure islands

  2. Initial Quests
    - Tutorial quests for new players
    - Various quest types (exploration, combat, treasure hunt)
  
  3. Notes
    - Islands placed on coordinate grid (10x10)
    - Quests have varying difficulty levels
*/

-- Insert initial islands
INSERT INTO islands (name, description, island_type, x_coord, y_coord, danger_level, has_treasure, has_enemy, resources) VALUES
  ('Skull Harbor', 'A safe harbor for new captains. Trading post and tavern available.', 'safe', 5, 5, 1, false, false, '{"gold": 100, "food": 50}'::jsonb),
  ('Dead Man''s Isle', 'Rumored to hold buried treasure. Beware of traps.', 'treasure', 3, 2, 3, true, false, '{"treasure": 500}'::jsonb),
  ('Cannon Beach', 'Hostile territory with enemy pirates.', 'hostile', 7, 3, 4, true, true, '{"cannons": 2}'::jsonb),
  ('Mermaid Cove', 'Peaceful island with friendly natives.', 'friendly', 2, 7, 2, false, false, '{"food": 200, "rum": 100}'::jsonb),
  ('The Kraken''s Lair', 'Dangerous waters. Ancient beast rumored to sleep here.', 'dangerous', 8, 8, 5, true, true, '{"legendary": 1}'::jsonb),
  ('Rum Runner''s Rock', 'Small island used by smugglers.', 'neutral', 4, 3, 2, false, false, '{"rum": 300}'::jsonb),
  ('Treacherous Tides', 'Strong currents make navigation difficult.', 'hostile', 6, 7, 3, true, true, '{"gold": 250}'::jsonb),
  ('Sailor''s Rest', 'Memorial island with old shipwreck.', 'neutral', 1, 4, 1, false, false, '{"scrap": 100}'::jsonb),
  ('Crimson Bay', 'Base of the Red Skull pirate gang.', 'hostile', 9, 4, 4, true, true, '{"weapons": 5}'::jsonb),
  ('Whale Sanctuary', 'Marine life paradise. No threats.', 'friendly', 3, 9, 1, false, false, '{"food": 400}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert initial quests
INSERT INTO quests (title, description, quest_type, difficulty, gold_reward, experience_reward, objective_type, objective_target, prerequisite_level, island_id) VALUES
  ('First Voyage', 'Complete your first journey to a nearby island.', 'exploration', 'easy', 50, 25, 'visit_islands', 1, 1, NULL),
  ('Treasure Hunter', 'Find buried treasure on Dead Man''s Isle.', 'treasure', 'medium', 200, 100, 'find_treasure', 1, 2, (SELECT id FROM islands WHERE name = 'Dead Man''s Isle' LIMIT 1)),
  ('Pirate Hunter', 'Defeat enemy pirates on Cannon Beach.', 'combat', 'hard', 300, 150, 'defeat_enemies', 3, 3, (SELECT id FROM islands WHERE name = 'Cannon Beach' LIMIT 1)),
  ('Merchant''s Friend', 'Trade resources at Mermaid Cove.', 'trade', 'easy', 100, 50, 'complete_trade', 1, 2, (SELECT id FROM islands WHERE name = 'Mermaid Cove' LIMIT 1)),
  ('The Kraken Awakens', 'Challenge the ancient sea beast.', 'boss', 'legendary', 1000, 500, 'defeat_boss', 1, 5, (SELECT id FROM islands WHERE name = 'The Kraken''s Lair' LIMIT 1)),
  ('Smuggler''s Run', 'Acquire rare rum from Rum Runner''s Rock.', 'exploration', 'medium', 150, 75, 'collect_resource', 300, 2, (SELECT id FROM islands WHERE name = 'Rum Runner''s Rock' LIMIT 1)),
  ('Explorer of the Seas', 'Discover 5 different islands.', 'exploration', 'medium', 250, 125, 'visit_islands', 5, 3, NULL),
  ('Red Skull Bane', 'Clear out the Crimson Bay base.', 'combat', 'hard', 400, 200, 'defeat_enemies', 5, 4, (SELECT id FROM islands WHERE name = 'Crimson Bay' LIMIT 1))
ON CONFLICT DO NOTHING;
