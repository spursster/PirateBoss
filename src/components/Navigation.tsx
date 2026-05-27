import { useGame } from '../context/GameContext';
import { Map, Package, Users, Ship, Scroll, ShoppingBag, Swords } from 'lucide-react';
import type { ViewType } from '../types/game';

const navItems: { icon: React.ElementType; label: string; view: ViewType }[] = [
  { icon: Map, label: 'Map', view: 'map' },
  { icon: Swords, label: 'Battle', view: 'battle' },
  { icon: Package, label: 'Inventory', view: 'inventory' },
  { icon: Users, label: 'Crew', view: 'crew' },
  { icon: Ship, label: 'Ship', view: 'ship' },
  { icon: Scroll, label: 'Quests', view: 'quests' },
  { icon: ShoppingBag, label: 'Shop', view: 'shop' },
];

export function Navigation() {
  const { currentView, setView } = useGame();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-amber-500/20 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map(({ icon: Icon, label, view }) => {
            const isActive = currentView === view;
            return (
              <button
                key={view}
                onClick={() => setView(view)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
