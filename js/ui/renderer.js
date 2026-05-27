import { eventBus } from '../core/eventBus.js';
import { gameState } from '../core/gameState.js';

let appDiv;

export function initUI() {
    appDiv = document.getElementById('app');
    renderMainPanel();
    eventBus.on('state:changed', () => renderMainPanel());
    eventBus.on('gold:changed', () => updateGoldDisplay());
}

function renderMainPanel() {
    if (!appDiv) return;
    appDiv.innerHTML = `
        <div class="stats-grid" id="statsPanel"></div>
        <div class="dashboard">
            <div class="map-panel"><div id="locationInfo"></div><div id="travelButtons"></div></div>
            <div class="action-panel"><div id="portActions"></div><div class="log-area" id="gameLog"></div></div>
        </div>
    `;
    refreshStats();
    refreshLocation();
}

function refreshStats() { /* обновява всички статистики от gameState */ }
function refreshLocation() { /* показва текущата локация */ }

// и т.н.
