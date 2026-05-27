import { eventBus } from './core/eventBus.js';
import { gameState } from './core/gameState.js';
import { saveManager } from './core/saveManager.js';
import { dataLoader } from './core/dataLoader.js';
import { initCombatSystem } from './systems/combat.js';
import { initUI } from './ui/renderer.js';
import { initTravelSystem } from './systems/travel.js';  // ще се добави

async function bootstrap() {
    await dataLoader.loadAll();
    initUI();
    initCombatSystem();
    // initTravelSystem();
    saveManager.load('auto');
    eventBus.emit('game:ready');
    console.log("Pirate Boss е жив!");
}

bootstrap();
