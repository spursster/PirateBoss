import { gameState } from '../core/gameState.js';
import { eventBus } from '../core/eventBus.js';
import { dataLoader } from '../core/dataLoader.js';

let activeEnemy = null;

export function initCombatSystem() {
    eventBus.on('combat:start', (enemyId) => {
        const template = dataLoader.ships.find(s => s.id === enemyId);
        if (!template) return;
        activeEnemy = {
            ...template,
            currentHull: template.hull,
            currentCrew: template.crew
        };
        eventBus.emit('combat:uiUpdate', activeEnemy);
    });
    eventBus.on('combat:action', (action) => {
        if (!activeEnemy) return;
        // Проста логика – може да се разшири до стотици редове
        if (action.type === 'cannon') {
            // изчислява щети и т.н.
            eventBus.emit('combat:result', { victory: false, message: "Удар!" });
        }
    });
}
