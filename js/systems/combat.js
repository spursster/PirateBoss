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
        if (action.type === 'cannon') {
            const playerDamage = Math.floor((gameState.player.ship.cannons * 4.5) + Math.random() * 18);
            const enemyDamage = Math.floor((activeEnemy.cannons * 3.8) + Math.random() * 15);
            activeEnemy.currentHull -= playerDamage;
            gameState.player.ship.hull -= enemyDamage;
            eventBus.emit('combat:log', `Топове: +${playerDamage} щети, получаваш ${enemyDamage}`);
            if (activeEnemy.currentHull <= 0) eventBus.emit('combat:victory');
            else if (gameState.player.ship.hull <= 0) eventBus.emit('combat:defeat');
            else eventBus.emit('combat:uiUpdate', activeEnemy);
        }
        // Другите действия (абордаж, ремонт, бягство) се добавят аналогично
    });
}
