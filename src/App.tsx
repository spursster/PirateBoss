import { GameProvider, useGame } from './context/GameContext';
import { Auth } from './components/Auth';
import { StatsBar } from './components/StatsBar';
import { Navigation } from './components/Navigation';
import { MapView } from './components/MapView';
import { BattleView } from './components/BattleView';
import { InventoryView } from './components/InventoryView';
import { CrewView } from './components/CrewView';
import { ShipView } from './components/ShipView';
import { QuestView } from './components/QuestView';
import { ShopView } from './components/ShopView';

function GameContent() {
  const { player, isLoading, currentView } = useGame();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-500 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return <Auth />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'map':
        return <MapView />;
      case 'battle':
        return <BattleView />;
      case 'inventory':
        return <InventoryView />;
      case 'crew':
        return <CrewView />;
      case 'ship':
        return <ShipView />;
      case 'quests':
        return <QuestView />;
      case 'shop':
        return <ShopView />;
      default:
        return <MapView />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <StatsBar />
      <main className="max-w-7xl mx-auto">
        {renderView()}
      </main>
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
