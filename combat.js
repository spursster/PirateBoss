// js/systems/combat.js
import { gameState } from '../core/gameState.js';
import { eventBus } from '../core/eventBus.js';
import { dataLoader } from '../core/dataLoader.js';

let activeCombat = null;

export function initCombatSystem() {
    eventBus.on('combat:start', (enemyId) => {
        const enemyTemplate = dataLoader.ships.find(s => s.id === enemyId);
        activeCombat = {
            ...enemyTemplate,
            currentHull: enemyTemplate.hull,
            currentCrew: enemyTemplate.crew
        };
        eventBus.emit('combat:uiUpdate', activeCombat);
    });

    eventBus.on('combat:action', (action) => {
        // обработка на действията (cannon, board, repair, flee)
        // emit 'combat:result', 'combat:end'
    });
}
