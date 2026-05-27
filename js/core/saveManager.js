import { gameState } from './gameState.js';
import { eventBus } from './eventBus.js';

const SAVE_PREFIX = 'PirateBoss_';

export const saveManager = {
    save(slot = 'auto') {
        const saveData = {
            version: 1,
            timestamp: Date.now(),
            state: JSON.parse(JSON.stringify(gameState))
        };
        localStorage.setItem(SAVE_PREFIX + slot, JSON.stringify(saveData));
        eventBus.emit('save:done', slot);
    },
    load(slot = 'auto') {
        const raw = localStorage.getItem(SAVE_PREFIX + slot);
        if (!raw) return false;
        try {
            const saved = JSON.parse(raw);
            Object.assign(gameState.player, saved.state.player);
            Object.assign(gameState.world, saved.state.world);
            Object.assign(gameState.flags, saved.state.flags);
            eventBus.emit('state:loaded');
            return true;
        } catch(e) { return false; }
    },
    autoSave() {
        this.save('auto');
    }
};
setInterval(() => saveManager.autoSave(), 300000);
