// js/main.js
import { eventBus } from './core/eventBus.js';
import { gameState } from './core/gameState.js';
import { saveManager } from './core/saveManager.js';
import { dataLoader } from './core/dataLoader.js';
import { initCombatSystem } from './systems/combat.js';
import { initUITriggers } from './ui/renderer.js';

async function initGame() {
    await dataLoader.loadAll();
    initCombatSystem();
    initUITriggers();
    saveManager.load('auto');  // опит за зареждане
    eventBus.emit('game:ready');
}

initGame();
