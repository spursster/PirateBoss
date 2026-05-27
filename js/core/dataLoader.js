import { eventBus } from './eventBus.js';

export const dataLoader = {
    locations: [],
    ships: [],
    items: [],
    async loadAll() {
        try {
            const [locs, ships, items] = await Promise.all([
                fetch('./data/locations.json').then(r => r.json()),
                fetch('./data/ships.json').then(r => r.json()),
                fetch('./data/items.json').then(r => r.json())
            ]);
            this.locations = locs;
            this.ships = ships;
            this.items = items;
            eventBus.emit('data:loaded');
        } catch(e) {
            console.error("Failed to load game data", e);
            eventBus.emit('data:error', e);
        }
    }
};
