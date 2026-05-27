import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Users, Plus, Heart, Swords, Shield, Zap, X } from 'lucide-react';
import type { CrewMember } from '../types/game';

const CREW_NAMES = [
  'First Mate Flint',
  'Salty Jack',
  'Redbeard',
  'Sea Dog Pete',
  'Blind Tom',
  'Iron Will',
  'Swordmaster Jen',
  'Navigator Kai',
  'Cannoneer Bruno',
  'Swabby Sam',
];

const CREW_ROLES = [
  { name: 'Sailor', attack: 5, defense: 3, health: 50, cost: 50 },
  { name: 'Gunner', attack: 8, defense: 2, health: 40, cost: 100 },
  { name: 'Navigator', attack: 3, defense: 5, health: 60, cost: 80 },
  { name: 'Swordmaster', attack: 10, defense: 6, health: 55, cost: 150 },
  { name: 'Quartermaster', attack: 7, defense: 8, health: 70, cost: 200 },
];

export function CrewView() {
  const { player, crew, addCrewMember, updateCrewMember } = useGame();
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);

  if (!player) return null;

  const hiredNames = new Set(crew.map(c => c.name));
  const availableCrew = CREW_NAMES.filter(n => !hiredNames.has(n));
  const activeCrew = crew.filter(c => c.is_active);
  const inactiveCrew = crew.filter(c => !c.is_active);

  const handleHire = async (role: typeof CREW_ROLES[0]) => {
    if (availableCrew.length === 0) return;
    const name = availableCrew[Math.floor(Math.random() * availableCrew.length)];

    await addCrewMember({
      name,
      role: role.name,
      level: 1,
      health: role.health,
      max_health: role.health,
      attack: role.attack,
      defense: role.defense,
      special_ability: null,
      hire_cost: role.cost,
      is_active: true,
    });

    setShowHireModal(false);
  };

  const handleToggleActive = async (member: CrewMember) => {
    await updateCrewMember(member.id, { is_active: !member.is_active });
    setSelectedCrew(null);
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-amber-500 mb-2">Crew Management</h2>
          <p className="text-slate-400">
            {activeCrew.length} active / {crew.length} total
          </p>
        </div>
        <button
          onClick={() => setShowHireModal(true)}
          disabled={player.gold < 50}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
            player.gold >= 50
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          Hire
        </button>
      </div>

      {crew.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">No Crew Members</h3>
          <p className="text-slate-500 mb-4">Hire crew to boost your combat abilities</p>
          <button
            onClick={() => setShowHireModal(true)}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-all"
          >
            Hire First Mate
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active crew */}
          {activeCrew.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Active Crew
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {activeCrew.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedCrew(member)}
                    className="bg-slate-800/80 rounded-xl p-4 border border-amber-500/30 text-left hover:border-amber-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{member.name}</h4>
                        <p className="text-sm text-amber-400">{member.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-700/50 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1 text-red-400">
                          <Heart className="w-3 h-3" />
                          <span className="text-xs">{member.health}/{member.max_health}</span>
                        </div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1 text-orange-400">
                          <Swords className="w-3 h-3" />
                          <span className="text-xs">{member.attack}</span>
                        </div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1 text-cyan-400">
                          <Shield className="w-3 h-3" />
                          <span className="text-xs">{member.defense}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Inactive crew */}
          {inactiveCrew.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Reservists
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {inactiveCrew.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedCrew(member)}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 opacity-60 text-left hover:opacity-100 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-300">{member.name}</h4>
                        <p className="text-xs text-slate-500">{member.role}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hire modal */}
      {showHireModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Hire New Crew</h3>
              <button onClick={() => setShowHireModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 text-sm text-slate-400">
              Available gold: <span className="text-yellow-400 font-semibold">{player.gold}</span>
            </div>

            <div className="space-y-3">
              {CREW_ROLES.map(role => {
                const canAfford = player.gold >= role.cost;
                return (
                  <button
                    key={role.name}
                    onClick={() => canAfford && handleHire(role)}
                    disabled={!canAfford}
                    className={`w-full rounded-xl p-4 text-left transition-all border ${
                      canAfford
                        ? 'bg-slate-700/50 hover:bg-slate-700 border-slate-600'
                        : 'bg-slate-800 opacity-50 cursor-not-allowed border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white">{role.name}</h4>
                      <span className="text-yellow-400 font-semibold">{role.cost} 💰</span>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Swords className="w-3 h-3 text-orange-400" />
                        {role.attack}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-cyan-400" />
                        {role.defense}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-400" />
                        {role.health}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Crew detail modal */}
      {selectedCrew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedCrew.name}</h3>
                <p className="text-amber-400">{selectedCrew.role}</p>
              </div>
              <button onClick={() => setSelectedCrew(null)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400">{selectedCrew.health}/{selectedCrew.max_health}</div>
                <div className="text-sm text-slate-400">Health</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-500">Lv.{selectedCrew.level}</div>
                <div className="text-sm text-slate-400">Level</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <Swords className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <div className="font-bold text-white">{selectedCrew.attack}</div>
                <div className="text-xs text-slate-400">Attack</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <Shield className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <div className="font-bold text-white">{selectedCrew.defense}</div>
                <div className="text-xs text-slate-400">Defense</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="font-bold text-white">-</div>
                <div className="text-xs text-slate-400">Speed</div>
              </div>
            </div>

            <button
              onClick={() => handleToggleActive(selectedCrew)}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                selectedCrew.is_active
                  ? 'bg-slate-600 hover:bg-slate-500 text-white'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white'
              }`}
            >
              {selectedCrew.is_active ? 'Move to Reserves' : 'Add to Active Crew'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
