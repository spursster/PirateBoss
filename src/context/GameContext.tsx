import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Player, CrewMember, Ship, PlayerQuest, InventoryItem, Island, VisitedIsland, ViewType, Enemy }
 from '../types/game';

interface GameContextType {
  player: Player | null;
  crew: CrewMember[];
  ships: Ship[];
  quests: PlayerQuest[];
  inventory: InventoryItem[];
  islands: Island[];
  visitedIslands: VisitedIsland[];
  currentView: ViewType;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, captainName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  createPlayer: (captainName: string) => Promise<void>;
  loadGameData: () => Promise<void>;
  setView: (view: ViewType) => void;
  updatePlayer: (updates: Partial<Player>) => Promise<void>;
  addCrewMember: (member: Omit<CrewMember, 'id' | 'player_id' | 'created_at'>) => Promise<void>;
  updateCrewMember: (id: string, updates: Partial<CrewMember>) => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'player_id' | 'created_at'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  acceptQuest: (questId: string) => Promise<void>;
  updateQuestProgress: (playerQuestId: string, progress: number) => Promise<void>;
  visitIsland: (islandId: string) => Promise<void>;
  currentEnemy: Enemy | null;
  setCurrentEnemy: (enemy: Enemy | null) => void;
  battleLog: string[];
  addBattleLog: (message: string) => void;
  clearBattleLog: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [quests, setQuests] = useState<PlayerQuest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [islands, setIslands] = useState<Island[]>([]);
  const [visitedIslands, setVisitedIslands] = useState<VisitedIsland[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('map');
  const [isLoading, setIsLoading] = useState(true);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const addBattleLog = useCallback((message: string) => {
    setBattleLog(prev => [...prev.slice(-19), message]);
  }, []);

  const clearBattleLog = useCallback(() => {
    setBattleLog([]);
  }, []);

  const setView = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

  const loadGameData = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPlayer(null);
        setCrew([]);
        setShips([]);
        setQuests([]);
        setInventory([]);
        setIslands([]);
        setVisitedIslands([]);
        setIsLoading(false);
        return;
      }

      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (playerError) throw playerError;

      if (!playerData) {
        setPlayer(null);
        setIsLoading(false);
        return;
      }

      setPlayer(playerData);

      const [crewData, shipsData, questsData, inventoryData, islandsData, visitedData] = await Promise.all([
        supabase.from('crew_members').select('*').eq('player_id', playerData.id),
        supabase.from('ships').select('*').eq('player_id', playerData.id),
        supabase.from('player_quests').select('*, quest:quests(*)').eq('player_id', playerData.id),
        supabase.from('inventory').select('*').eq('player_id', playerData.id),
        supabase.from('islands').select('*'),
        supabase.from('visited_islands').select('*, island:islands(*)').eq('player_id', playerData.id),
      ]);

      setCrew(crewData.data || []);
      setShips(shipsData.data || []);
      setQuests((questsData.data as PlayerQuest[]) || []);
      setInventory(inventoryData.data || []);
      setIslands(islandsData.data || []);
      setVisitedIslands(visitedData.data || []);
    } catch (error) {
      console.error('Error loading game data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGameData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      (async () => {
        await loadGameData();
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadGameData]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };
    await loadGameData();
    return { error: null };
  }, [loadGameData]);

  const signUp = useCallback(async (email: string, password: string, _captainName: string) => {
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) return { error: signUpError };

    await loadGameData();
    return { error: null };
  }, [loadGameData]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setPlayer(null);
    setCrew([]);
    setShips([]);
    setInventory([]);
    setQuests([]);
    setVisitedIslands([]);
  }, []);

  const createPlayer = useCallback(async (captainName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: startingIsland } = await supabase
      .from('islands')
      .select('id')
      .eq('name', 'Skull Harbor')
      .single();

    const { data: newPlayer, error: playerError } = await supabase
      .from('players')
      .insert({
        auth_user_id: user.id,
        captain_name: captainName,
        current_island_id: startingIsland?.id || null,
      })
      .select()
      .single();

    if (playerError) throw playerError;

    const { error: shipError } = await supabase.from('ships').insert({
      player_id: newPlayer.id,
      name: 'The Wandering Sail',
      type: 'sloop',
    });

    if (shipError) console.error('Error creating ship:', shipError);

    const { error: visitError } = await supabase.from('visited_islands').insert({
      player_id: newPlayer.id,
      island_id: startingIsland?.id,
    });

    if (visitError) console.error('Error creating initial visit:', visitError);

    await loadGameData();
  }, [loadGameData]);

  const updatePlayer = useCallback(async (updates: Partial<Player>) => {
    if (!player) return;

    const { error } = await supabase
      .from('players')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', player.id);

    if (!error) {
      setPlayer(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [player]);

  const addCrewMember = useCallback(async (member: Omit<CrewMember, 'id' | 'player_id' | 'created_at'>) => {
    if (!player) return;

    const { data, error } = await supabase
      .from('crew_members')
      .insert({ ...member, player_id: player.id })
      .select()
      .single();

    if (!error && data) {
      setCrew(prev => [...prev, data]);
    }
  }, [player]);

  const updateCrewMember = useCallback(async (id: string, updates: Partial<CrewMember>) => {
    const { error } = await supabase
      .from('crew_members')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setCrew(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    }
  }, []);

  const addItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'player_id' | 'created_at'>) => {
    if (!player) return;

    const { data, error } = await supabase
      .from('inventory')
      .insert({ ...item, player_id: player.id })
      .select()
      .single();

    if (!error && data) {
      setInventory(prev => [...prev, data]);
    }
  }, [player]);

  const updateItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    const { error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setInventory(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (!error) {
      setInventory(prev => prev.filter(i => i.id !== id));
    }
  }, []);

  const acceptQuest = useCallback(async (questId: string) => {
    if (!player) return;

    const { data, error } = await supabase
      .from('player_quests')
      .insert({
        player_id: player.id,
        quest_id: questId,
        status: 'in_progress',
      })
      .select('*, quest:quests(*)')
      .single();

    if (!error && data) {
      setQuests(prev => [...prev, data as PlayerQuest]);
    }
  }, [player]);

  const updateQuestProgress = useCallback(async (playerQuestId: string, progress: number) => {
    const { error } = await supabase
      .from('player_quests')
      .update({ progress })
      .eq('id', playerQuestId);

    if (!error) {
      setQuests(prev => prev.map(q => q.id === playerQuestId ? { ...q, progress } : q));
    }
  }, []);

  const visitIsland = useCallback(async (islandId: string) => {
    if (!player) return;

    const alreadyVisited = visitedIslands.some(v => v.island_id === islandId);
    if (!alreadyVisited) {
      await supabase.from('visited_islands').insert({
        player_id: player.id,
        island_id: islandId,
      });
    }

    await updatePlayer({ current_island_id: islandId });
    await loadGameData();
  }, [player, visitedIslands, updatePlayer, loadGameData]);

  const value: GameContextType = {
    player,
    crew,
    ships,
    quests,
    inventory,
    islands,
    visitedIslands,
    currentView,
    isLoading,
    signIn,
    signUp,
    signOut,
    createPlayer,
    loadGameData,
    setView,
    updatePlayer,
    addCrewMember,
    updateCrewMember,
    addItem,
    updateItem,
    deleteItem,
    acceptQuest,
    updateQuestProgress,
    visitIsland,
    currentEnemy,
    setCurrentEnemy,
    battleLog,
    addBattleLog,
    clearBattleLog,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
