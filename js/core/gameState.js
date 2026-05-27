import { eventBus } from './eventBus.js';

export const gameState = {
    player: {
        name: "Капитан Черния",
        level: 1,
        xp: 0,
        xpNeeded: 110,
        gold: 1350,
        reputation: 20,
        crew: 32,
        maxCrew: 48,
        ship: {
            name: "Морски Демон",
            hull: 125,
            maxHull: 125,
            cannons: 16,
            maxCannons: 28,
            cargoLimit: 95,
            speed: 13
        },
        supplies: { food: 110, rum: 42 },
        cargo: { sugar: 4, spice: 2, silk: 1, wood: 3 },
        upgrades: { armorPlating: 0, powderCharge: 0 }
    },
    world: {
        currentLocation: "port_royal",
        discoveredLocations: ["port_royal"],   // <-- ЗАПЕТАЯТА Е ТУК!
        worldTime: 0,
        activeQuest: null,
        completedQuests: []
    },
    flags: {},

    setGold(amount) {
        this.player.gold = Math.max(0, amount);
        eventBus.emit('gold:changed', this.player.gold);
        eventBus.emit('state:changed');
    },
    addXP(amount) {
        this.player.xp += amount;
        eventBus.emit('xp:changed', { xp: this.player.xp, needed: this.player.xpNeeded });
        this.checkLevelUp();
        eventBus.emit('state:changed');
    },
    checkLevelUp() {
        while (this.player.xp >= this.player.xpNeeded) {
            this.player.level++;
            this.player.xp -= this.player.xpNeeded;
            this.player.xpNeeded = Math.floor(this.player.xpNeeded * 1.28);
            this.player.maxCrew += 5;
            this.player.ship.maxHull += 15;
            this.player.ship.hull = this.player.ship.maxHull;
            this.player.ship.maxCannons = Math.min(38, this.player.ship.maxCannons + 2);
            eventBus.emit('player:levelup', this.player.level);
        }
    },
    updateCrew(delta) {
        this.player.crew = Math.min(this.player.maxCrew, Math.max(1, this.player.crew + delta));
        eventBus.emit('state:changed');
    },
    repairShip(amount) {
        this.player.ship.hull = Math.min(this.player.ship.maxHull, this.player.ship.hull + amount);
        eventBus.emit('state:changed');
    }
};
