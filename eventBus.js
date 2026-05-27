// js/core/eventBus.js
class EventBus {
    constructor() {
        this.events = new Map();
    }
    on(event, callback) {
        if (!this.events.has(event)) this.events.set(event, []);
        this.events.get(event).push(callback);
    }
    off(event, callback) {
        if (!this.events.has(event)) return;
        const callbacks = this.events.get(event);
        const index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
    }
    emit(event, data) {
        if (!this.events.has(event)) return;
        this.events.get(event).forEach(cb => {
            try { cb(data); } catch(e) { console.error(e); }
        });
    }
}
export const eventBus = new EventBus();
