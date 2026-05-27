import { eventBus } from '../core/eventBus.js';
import { gameState } from '../core/gameState.js';
import { dataLoader } from '../core/dataLoader.js';

let appDiv;

export function initUI() {
    appDiv = document.getElementById('app');
    renderFullUI();
    eventBus.on('state:changed', () => renderFullUI());
    eventBus.on('gold:changed', () => updateGoldDisplay());
    eventBus.on('combat:uiUpdate', (enemy) => showCombatPanel(enemy));
}

function renderFullUI() {
    if (!appDiv) return;
    appDiv.innerHTML = `
        <div class="stats-grid" id="statsPanel"></div>
        <div class="dashboard">
            <div class="map-panel">
                <h3>🗺️ Карта</h3>
                <div class="location-name" id="locName">${gameState.world.currentLocation}</div>
                <div class="button-group" id="travelButtons"></div>
                <div id="combatPanel" style="display:none;"></div>
            </div>
            <div class="action-panel">
                <h3>🏴‍☠️ Действия</h3>
                <div class="button-group" id="actionButtons"></div>
                <div class="log-area" id="gameLog"></div>
            </div>
        </div>
    `;
    renderStats();
    renderTravelButtons();
    renderPortActions();
}

function renderStats() {
    const statsDiv = document.getElementById('statsPanel');
    if (!statsDiv) return;
    statsDiv.innerHTML = `
        <div class="stat-card"><span>🏴 Капитан</span><span>${gameState.player.name} (Lv.${gameState.player.level})</span></div>
        <div class="stat-card"><span>💰 Злато</span><span id="goldVal">${Math.floor(gameState.player.gold)}</span></div>
        <div class="stat-card"><span>⚔️ Екипаж</span><span>${gameState.player.crew}/${gameState.player.maxCrew}</span></div>
        <div class="stat-card"><span>⛵ Кораб</span><span>${gameState.player.ship.name}</span></div>
        <div class="stat-card"><span>🔫 Топове</span><span>${gameState.player.ship.cannons}/${gameState.player.ship.maxCannons}</span></div>
        <div class="stat-card"><span>🛡️ Корпус</span><span>${gameState.player.ship.hull}/${gameState.player.ship.maxHull}</span></div>
    `;
}

function renderTravelButtons() {
    const travelDiv = document.getElementById('travelButtons');
    if (!travelDiv) return;
    travelDiv.innerHTML = '';
    dataLoader.locations.forEach(loc => {
        const btn = document.createElement('button');
        btn.textContent = `⛵ ${loc.name}`;
        btn.onclick = () => eventBus.emit('travel:to', loc.id);
        travelDiv.appendChild(btn);
    });
}

function renderPortActions() {
    const actionDiv = document.getElementById('actionButtons');
    if (!actionDiv) return;
    actionDiv.innerHTML = `
        <button id="tradeBtn">📦 Търговия</button>
        <button id="repairBtn">🔧 Ремонт (40💰)</button>
        <button id="hireBtn">⚓ Наеми екипаж (60💰)</button>
    `;
    document.getElementById('tradeBtn')?.addEventListener('click', () => alert("Търговията ще бъде реализирана скоро"));
    document.getElementById('repairBtn')?.addEventListener('click', () => {
        if (gameState.player.gold >= 40) {
            gameState.setGold(gameState.player.gold - 40);
            gameState.repairShip(40);
            addLog("Корабът е ремонтиран!");
        } else addLog("Нямаш пари!");
    });
    document.getElementById('hireBtn')?.addEventListener('click', () => {
        if (gameState.player.gold >= 60 && gameState.player.crew < gameState.player.maxCrew) {
            gameState.setGold(gameState.player.gold - 60);
            gameState.updateCrew(5);
            addLog("+5 моряци се присъединиха!");
        } else addLog("Нямаш място или пари");
    });
}

function addLog(msg) {
    const logDiv = document.getElementById('gameLog');
    if (logDiv) {
        const line = document.createElement('div');
        line.innerHTML = `⚓ ${new Date().toLocaleTimeString().slice(0,5)} ${msg}`;
        logDiv.appendChild(line);
        logDiv.scrollTop = logDiv.scrollHeight;
        if (logDiv.children.length > 25) logDiv.removeChild(logDiv.firstChild);
    }
}
function updateGoldDisplay() { const el = document.getElementById('goldVal'); if(el) el.innerText = Math.floor(gameState.player.gold); }
function showCombatPanel(enemy) { /* временно */ addLog(`Битка с ${enemy.name}!`); }
