import { gameState } from '../core/gameState.js';
import { eventBus } from '../core/eventBus.js';
import { dataLoader } from '../core/dataLoader.js';

export function initTravelSystem() {
    eventBus.on('travel:to', (locationId) => {
        const loc = dataLoader.locations.find(l => l.id === locationId);
        if (!loc) return;
        if (loc.id === gameState.world.currentLocation) {
            eventBus.emit('travel:impossible', "Вече сте тук");
            return;
        }
        const foodCost = Math.max(1, Math.floor(loc.distance * 2.5 + gameState.player.crew/12));
        if (gameState.player.supplies.food < foodCost) {
            eventBus.emit('travel:impossible', "Няма храна");
            return;
        }
        gameState.player.supplies.food -= foodCost;
        gameState.world.currentLocation = loc.name;
        eventBus.emit('travel:arrived', loc.name);
        eventBus.emit('state:changed');
        
        // Случайна среща
        if (Math.random() < loc.danger) {
            const enemyId = dataLoader.ships[Math.floor(Math.random() * dataLoader.ships.length)].id;
            eventBus.emit('combat:start', enemyId);
        }
    });
}
