// js/ui/renderer.js
import { eventBus } from '../core/eventBus.js';
import { gameState } from '../core/gameState.js';
import { dataLoader } from '../core/dataLoader.js';

let appDiv;
let logMessages = [];   // съхранение на всички лог съобщения

export function initUI() {
    appDiv = document.getElementById('app');
    renderFullUI();
    eventBus.on('state:changed', () => renderFullUI());
    eventBus.on('gold:changed', () => updateGoldDisplay());
    eventBus.on('combat:uiUpdate', (enemy) => showCombatPanel(enemy));
    eventBus.on('combat:log', (msg) => addLog(msg));
    eventBus.on('combat:victory', () => {
        addLog("🏆 ПОБЕДА! Врагът е победен.");
        hideCombatPanel();
    });
    eventBus.on('combat:defeat', () => {
        addLog("💀 ПОРАЖЕНИЕ...");
        hideCombatPanel();
    });
    eventBus.on('combat:end', () => hideCombatPanel());
    eventBus.on('travel:arrived', (msg) => addLog(`🚢 ${msg}`));
    eventBus.on('travel:impossible', (reason) => addLog(`❌ ${reason}`));
}

function renderFullUI() {
    if (!appDiv) return;
    appDiv.innerHTML = `
        <div class="stats-grid" id="statsPanel"></div>
        <div class="dashboard">
            <div class="map-panel">
                <h3>🗺️ КАРТА</h3>
                <div class="location-name" id="locName"></div>
                <div class="button-group" id="travelButtons"></div>
                <div id="combatPanel" style="display:none;" class="combat-panel"></div>
            </div>
            <div class="action-panel">
                <h3>⚓ ДЕЙСТВИЯ</h3>
                <div class="button-group" id="actionButtons"></div>
                <div class="log-area" id="gameLog"></div>
            </div>
        </div>
    `;
    renderStats();
    renderLocationName();
    renderTravelButtons();
    renderPortActions();
    renderLog();   // показва всички запазени съобщения
    if (window._combatActive) showCombatPanel(window._combatActive);
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
        <div class="stat-card"><span>🍗 Храна</span><span>${gameState.player.supplies.food}</span></div>
        <div class="stat-card"><span>📦 Товар</span><span>${getUsedCargo()}/${gameState.player.ship.cargoLimit}</span></div>
    `;
}

function getUsedCargo() {
    const c = gameState.player.cargo;
    return (c.sugar||0)+(c.spice||0)+(c.silk||0)+(c.wood||0);
}

function renderLocationName() {
    const locDiv = document.getElementById('locName');
    if (locDiv) {
        const loc = dataLoader.locations.find(l => l.id === gameState.world.currentLocation);
        locDiv.innerText = loc ? loc.name : gameState.world.currentLocation;
    }
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
    const currentLoc = dataLoader.locations.find(l => l.id === gameState.world.currentLocation);
    const isPort = currentLoc && currentLoc.type === 'port';
    if (isPort) {
        actionDiv.innerHTML = `
            <button id="tradeBtn">📦 ТЪРГОВИЯ</button>
            <button id="repairBtn">🔧 РЕМОНТ (40💰)</button>
            <button id="hireBtn">⚓ НАЕМИ ЕКИПАЖ (60💰)</button>
            <button id="buySuppliesBtn">🍖 ПРОВИЗИИ (90💰)</button>
        `;
        document.getElementById('tradeBtn')?.addEventListener('click', () => openTradeMenu());
        document.getElementById('repairBtn')?.addEventListener('click', () => {
            if (gameState.player.gold >= 40) {
                gameState.setGold(gameState.player.gold - 40);
                gameState.repairShip(40);
                addLog("🔧 Корабът е ремонтиран (+40 корпус).");
            } else addLog("Нямаш 40 злато!");
        });
        document.getElementById('hireBtn')?.addEventListener('click', () => {
            if (gameState.player.gold >= 60 && gameState.player.crew < gameState.player.maxCrew) {
                gameState.setGold(gameState.player.gold - 60);
                gameState.updateCrew(5);
                addLog("⚓ +5 моряци се присъединиха!");
            } else addLog("Нямаш пари или екипажът е пълен!");
        });
        document.getElementById('buySuppliesBtn')?.addEventListener('click', () => {
            if (gameState.player.gold >= 90) {
                gameState.setGold(gameState.player.gold - 90);
                gameState.player.supplies.food += 40;
                gameState.player.supplies.rum += 20;
                addLog("🍖 Купихте 40 храна и 20 ром.");
                eventBus.emit('state:changed');
            } else addLog("Нужни 90 злато!");
        });
    } else {
        actionDiv.innerHTML = `<button disabled>🏝️ Див бряг - няма услуги</button>`;
    }
}

function showCombatPanel(enemy) {
    window._combatActive = enemy;
    const panel = document.getElementById('combatPanel');
    if (!panel) return;
    panel.style.display = 'block';
    panel.innerHTML = `
        <h3>⚔️ МОРСКА БИТКА ⚔️</h3>
        <div class="enemy-box">
            <div><strong>☠️ ${enemy.name}</strong></div>
            <div>🏴 Корпус: ${enemy.currentHull}/${enemy.hull}</div>
            <div>👥 Екипаж: ${enemy.currentCrew}/${enemy.crew}</div>
            <div>🔫 Топове: ${enemy.cannons}</div>
        </div>
        <div class="button-group" id="combatActions">
            <button id="combatCannon">🔥 ТОПОВЕ</button>
            <button id="combatBoard">🏴‍☠️ АБОРДАЖ</button>
            <button id="combatRepair">🛠️ РЕМОНТ (35💰)</button>
            <button id="combatFlee">💨 БЯГСТВО</button>
        </div>
    `;
    document.getElementById('combatCannon')?.addEventListener('click', () => eventBus.emit('combat:action', { type: 'cannon' }));
    document.getElementById('combatBoard')?.addEventListener('click', () => eventBus.emit('combat:action', { type: 'board' }));
    document.getElementById('combatRepair')?.addEventListener('click', () => eventBus.emit('combat:action', { type: 'repair' }));
    document.getElementById('combatFlee')?.addEventListener('click', () => eventBus.emit('combat:action', { type: 'flee' }));
}

function hideCombatPanel() {
    const panel = document.getElementById('combatPanel');
    if (panel) panel.style.display = 'none';
    window._combatActive = null;
}

function openTradeMenu() {
    const sugarPrice = 14 + Math.floor(Math.random() * 14);
    const spicePrice = 24 + Math.floor(Math.random() * 18);
    const silkPrice = 70 + Math.floor(Math.random() * 40);
    const woodPrice = 8 + Math.floor(Math.random() * 7);
    let msg = `📊 ПАЗАР (текуща локация)\n`;
    msg += `Захар: ${sugarPrice}💰 (имаш: ${gameState.player.cargo.sugar||0})\n`;
    msg += `Подправки: ${spicePrice}💰 (имаш: ${gameState.player.cargo.spice||0})\n`;
    msg += `Коприна: ${silkPrice}💰 (имаш: ${gameState.player.cargo.silk||0})\n`;
    msg += `Дърво: ${woodPrice}💰 (имаш: ${gameState.player.cargo.wood||0})\n\n`;
    msg += `Формат: "купи захар 3" или "продай подправки 2" / "продай всичко"`;
    const action = prompt(msg);
    if (!action) return;
    const parts = action.toLowerCase().split(' ');
    if (parts[0] === 'купи' && parts[2]) {
        const item = parts[1];
        const qty = parseInt(parts[2]);
        if (isNaN(qty)) return;
        let cost = 0, itemKey = '';
        if (item === 'захар') { cost = sugarPrice * qty; itemKey = 'sugar'; }
        else if (item === 'подправки') { cost = spicePrice * qty; itemKey = 'spice'; }
        else if (item === 'коприна') { cost = silkPrice * qty; itemKey = 'silk'; }
        else if (item === 'дърво') { cost = woodPrice * qty; itemKey = 'wood'; }
        else { addLog("Невалидна стока"); return; }
        const newCargo = getUsedCargo() + qty;
        if (cost <= gameState.player.gold && newCargo <= gameState.player.ship.cargoLimit) {
            gameState.setGold(gameState.player.gold - cost);
            gameState.player.cargo[itemKey] = (gameState.player.cargo[itemKey] || 0) + qty;
            addLog(`Купено ${qty} ${item} за ${cost}💰.`);
            eventBus.emit('state:changed');
        } else addLog("Няма място или пари!");
    } 
    else if (parts[0] === 'продай' && parts[2]) {
        const item = parts[1];
        const qty = parseInt(parts[2]);
        let price = 0, itemKey = '';
        if (item === 'захар') { price = Math.floor(sugarPrice * 0.65); itemKey = 'sugar'; }
        else if (item === 'подправки') { price = Math.floor(spicePrice * 0.65); itemKey = 'spice'; }
        else if (item === 'коприна') { price = Math.floor(silkPrice * 0.65); itemKey = 'silk'; }
        else if (item === 'дърво') { price = Math.floor(woodPrice * 0.7); itemKey = 'wood'; }
        else { addLog("Невалидна стока"); return; }
        const have = gameState.player.cargo[itemKey] || 0;
        if (qty > have) { addLog(`Нямате ${qty} ${item}!`); return; }
        const income = price * qty;
        gameState.setGold(gameState.player.gold + income);
        gameState.player.cargo[itemKey] = have - qty;
        addLog(`Продадено ${qty} ${item} за ${income}💰.`);
        eventBus.emit('state:changed');
    }
    else if (action === 'продай всичко') {
        let total = 0;
        total += (gameState.player.cargo.sugar||0) * Math.floor(sugarPrice * 0.65);
        total += (gameState.player.cargo.spice||0) * Math.floor(spicePrice * 0.65);
        total += (gameState.player.cargo.silk||0) * Math.floor(silkPrice * 0.65);
        total += (gameState.player.cargo.wood||0) * Math.floor(woodPrice * 0.7);
        gameState.setGold(gameState.player.gold + total);
        gameState.player.cargo = { sugar:0, spice:0, silk:0, wood:0 };
        addLog(`Продаден целият товар за ${total}💰.`);
        eventBus.emit('state:changed');
    }
}

function updateGoldDisplay() {
    const goldSpan = document.getElementById('goldVal');
    if (goldSpan) goldSpan.innerText = Math.floor(gameState.player.gold);
}

function renderLog() {
    const logDiv = document.getElementById('gameLog');
    if (!logDiv) return;
    logDiv.innerHTML = '';
    logMessages.forEach(msg => {
        const line = document.createElement('div');
        line.innerHTML = msg;
        logDiv.appendChild(line);
    });
    logDiv.scrollTop = logDiv.scrollHeight;
}

function addLog(msg) {
    const time = new Date().toLocaleTimeString().slice(0,5);
    const formatted = `⚓ ${time} ${msg}`;
    logMessages.push(formatted);
    if (logMessages.length > 35) logMessages.shift(); // държим последните 35
    const logDiv = document.getElementById('gameLog');
    if (logDiv) {
        const line = document.createElement('div');
        line.innerHTML = formatted;
        logDiv.appendChild(line);
        logDiv.scrollTop = logDiv.scrollHeight;
    }
}
