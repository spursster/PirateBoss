import { useGame } from '../context/GameContext';
import { supabase } from '../lib/supabase';
import { Scroll, Map, Swords, Gem, Star, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { getDifficultyColor } from '../utils/gameUtils';
import type { PlayerQuest } from '../types/game';

export function QuestView() {
  const { player, quests, islands, acceptQuest, updateQuestProgress, updatePlayer } = useGame();

  const questTypeIcons = {
    exploration: Map,
    combat: Swords,
    treasure: Gem,
    boss: Swords,
    trade: Scroll,
  };

  const handleAcceptQuest = async (questId: string) => {
    await acceptQuest(questId);
  };

  const handleCompleteQuest = async (playerQuest: PlayerQuest) => {
    if (!player || playerQuest.status !== 'in_progress') return;

    const quest = quests.find(q => q.quest_id === playerQuest.quest_id)?.quest;
    if (!quest) return;

    await updatePlayer({
      gold: player.gold + quest.gold_reward,
      experience: player.experience + quest.experience_reward,
    });

    await supabase
      .from('player_quests')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', playerQuest.id);
  };

  const availableQuests = quests.filter(q => q.status === 'available' || q.status === 'in_progress');
  const completedQuests = quests.filter(q => q.status === 'completed');

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-500 mb-2">Quest Journal</h2>
        <p className="text-slate-400">Complete quests to earn rewards and fame</p>
      </div>

      {/* Active quests */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          Active Quests
        </h3>

        {availableQuests.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
            <Scroll className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No active quests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableQuests.map(playerQuest => {
              const quest = playerQuest.quest;
              if (!quest) return null;

              const Icon = questTypeIcons[quest.quest_type as keyof typeof questTypeIcons] || Scroll;
              const progressPercent = (playerQuest.progress / quest.objective_target) * 100;
              const isComplete = playerQuest.status === 'completed';

              return (
                <div
                  key={playerQuest.id}
                  className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-white truncate">{quest.title}</h4>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full text-white ${getDifficultyColor(
                            quest.difficulty
                          )}`}
                        >
                          {quest.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{quest.description}</p>

                      {playerQuest.status === 'in_progress' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{quest.objective_type}</span>
                            <span>
                              {playerQuest.progress}/{quest.objective_target}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
                              style={{ width: `${Math.min(100, progressPercent)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1 text-yellow-400">
                            <span>💰</span>
                            <span>{quest.gold_reward}</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-4 h-4" />
                            <span>{quest.experience_reward} XP</span>
                          </div>
                        </div>

                        {playerQuest.status === 'available' && (
                          <button
                            onClick={() => handleAcceptQuest(quest.id)}
                            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-all"
                          >
                            Accept
                          </button>
                        )}

                        {playerQuest.status === 'in_progress' &&
                          playerQuest.progress >= quest.objective_target && (
                            <button
                              onClick={() => handleCompleteQuest(playerQuest)}
                              className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition-all"
                            >
                              Complete
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed quests */}
      {completedQuests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Completed Quests ({completedQuests.length})
          </h3>

          <div className="space-y-2">
            {completedQuests.slice(0, 5).map(playerQuest => {
              const quest = playerQuest.quest;
              if (!quest) return null;

              return (
                <div
                  key={playerQuest.id}
                  className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-slate-300">{quest.title}</span>
                    </div>
                    <div className="flex gap-2 text-xs text-slate-500">
                      <span>+{quest.gold_reward} 💰</span>
                      <span>+{quest.experience_reward} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
