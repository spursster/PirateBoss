// js/core/gameState.js
import { eventBus } from './eventBus.js';

export const gameState = {
    // Играч и кораб
    player: {
        name: "Капитан Черния",
        level: 1, xp: 0, xpNeeded: 110,
        gold: 1350, reputation: 20,
        crew: 32, maxCrew: 48,
        ship: {
            name: "Морски Демон",
            hull: 125, maxHull: 125,
            cannons: 16, maxCannons: 28,
            cargoLimit: 95, speed: 13
        },
        supplies: { food: 110, rum: 42 },
        cargo: { sugar: 4, spice: 2, silk: 1, wood: 3 },
        upgrades: { armorPlating: 0, powderCharge: 0 }
    },
    world: {
        currentLocation: "Порт Роял",
        discoveredLocations: ["Порт Роял"],
        worldTime: 0,  // дни
        activeQuests: [],   // обекти на задачи
        completedQuests: []
    },
    flags: {},   // за специални събития (напр. "met_ghost_ship": true)

    // методи за промяна с автоматично излъчване на събития
    setGold(amount) {
        this.player.gold = Math.max(0, amount);
        eventBus.emit('gold:changed', this.player.gold);
    },
    addXP(amount) {
        this.player.xp += amount;
        eventBus.emit('xp:changed', { xp: this.player.xp, needed: this.player.xpNeeded });
        this.checkLevelUp();
    },
    checkLevelUp() { /* логика за ниване, emit 'player:levelup' */ }
    // ... други методи
};

// Автоматично запазване при важни промени
eventBus.on('state:changed', () => { /* saveManager.autoSave() */ });
