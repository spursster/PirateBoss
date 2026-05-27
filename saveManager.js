// js/core/saveManager.js
import { gameState } from './gameState.js';
import { eventBus } from './eventBus.js';

const SAVE_KEY = 'PirateBossSave';

export const saveManager = {
    save(slot = 0) {
        const saveData = {
            version: 1,
            timestamp: Date.now(),
            state: JSON.parse(JSON.stringify(gameState)) // дълбоко копие
        };
        localStorage.setItem(`${SAVE_KEY}_${slot}`, JSON.stringify(saveData));
        eventBus.emit('save:completed', { slot });
    },
    load(slot = 0) {
        const raw = localStorage.getItem(`${SAVE_KEY}_${slot}`);
        if (!raw) return false;
        const saveData = JSON.parse(raw);
        // валидация и сливане със структурата
        Object.assign(gameState.player, saveData.state.player);
        Object.assign(gameState.world, saveData.state.world);
        eventBus.emit('state:loaded');
        return true;
    },
    autoSave() {
        this.save('auto');
    },
    exportSave(slot = 0) {
        const data = localStorage.getItem(`${SAVE_KEY}_${slot}`);
        if (data) return btoa(data);
        return null;
    }
};

// Автосейв на всеки 5 минути
setInterval(() => saveManager.autoSave(), 300000);
