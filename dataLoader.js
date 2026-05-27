// js/core/dataLoader.js
import { eventBus } from './eventBus.js';

export const dataLoader = {
    locations: [],
    ships: [],
    items: [],
    questTemplates: [],

    async loadAll() {
        try {
            this.locations = await fetch('./data/locations.json').then(r => r.json());
            this.ships = await fetch('./data/ships.json').then(r => r.json());
            this.items = await fetch('./data/items.json').then(r => r.json());
            this.questTemplates = await fetch('./data/questsTemplates.json').then(r => r.json());
            eventBus.emit('data:loaded', { locations: this.locations.length, ships: this.ships.length });
        } catch(e) {
            console.error("Failed to load game data", e);
            eventBus.emit('data:error', e);
        }
    }
};
