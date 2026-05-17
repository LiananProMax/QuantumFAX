/**
 * Fleet health telemetry store.
 *
 * The dashboard only needs recent status, so the store keeps latest snapshots
 * plus a bounded in-memory history per client and persists latest state to disk.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const STATE_FILE = path.join(DATA_DIR, "fleetState.json");
const DEFAULT_HISTORY_LIMIT = parseInt(process.env.FLEET_HISTORY_LIMIT, 10) || 120;
const DEFAULT_OFFLINE_TIMEOUT_MS = parseInt(process.env.FLEET_OFFLINE_TIMEOUT_MS, 10) || 15000;

const SHIP_TYPES = {
    apostle: { id: "apostle", label: "使徒" },
    telemachus: { id: "telemachus", label: "特勒马科斯" },
    sea_archon: { id: "sea_archon", label: "海执政官" }
};

const SHIP_TYPE_ALIASES = {
    "使徒": "apostle",
    apostle: "apostle",
    "特勒马科斯": "telemachus",
    telemachus: "telemachus",
    "海执政官": "sea_archon",
    sea_archon: "sea_archon",
    archon: "sea_archon"
};

let state = {
    ships: {},
    histories: {},
    updatedAt: null
};

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function loadState() {
    ensureDataDir();
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
            state = {
                ships: data.ships || {},
                histories: data.histories || {},
                updatedAt: data.updatedAt || null
            };
        }
    } catch (err) {
        console.error("[FleetStore] 加载失败:", err.message);
    }
}

function saveState() {
    ensureDataDir();
    try {
        state.updatedAt = new Date().toISOString();
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
        return true;
    } catch (err) {
        console.error("[FleetStore] 保存失败:", err.message);
        return false;
    }
}

function normalizeText(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value).trim();
}

function normalizeShipType(value) {
    const text = normalizeText(value);
    const key = SHIP_TYPE_ALIASES[text] || SHIP_TYPE_ALIASES[text.toLowerCase()];
    return key || "";
}

function normalizePercent(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return null;
    }
    return Math.max(0, Math.min(100, Math.round(parsed)));
}

function normalizeTimestamp(value) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
    }
    return Date.now();
}

function toBool(value) {
    return value === true || value === "true" || value === 1 || value === "1";
}

function enrichShip(ship, now = Date.now()) {
    const lastSeenAt = Number(ship.lastSeenAt) || 0;
    const ageMs = lastSeenAt > 0 ? Math.max(0, now - lastSeenAt) : null;
    return {
        ...ship,
        online: ageMs !== null && ageMs <= DEFAULT_OFFLINE_TIMEOUT_MS,
        ageMs
    };
}

function getAllowedShipTypes() {
    return Object.keys(SHIP_TYPES).map((key) => SHIP_TYPES[key]);
}

function buildReport(raw) {
    const clientId = normalizeText(raw.clientId);
    const shipType = normalizeShipType(raw.shipType);
    const observedAt = normalizeTimestamp(raw.observedAt);
    const now = Date.now();

    if (!clientId) {
        return { error: "缺少 clientId" };
    }
    if (!shipType) {
        return { error: "无效的 shipType" };
    }

    return {
        report: {
            clientId,
            shipType,
            shipTypeLabel: SHIP_TYPES[shipType].label,
            shipName: normalizeText(raw.shipName) || SHIP_TYPES[shipType].label,
            observedAt,
            receivedAt: now,
            lastSeenAt: now,
            shieldPercent: normalizePercent(raw.shieldPercent),
            armorPercent: normalizePercent(raw.armorPercent),
            shieldLabel: normalizeText(raw.shieldLabel || raw.shield),
            armorLabel: normalizeText(raw.armorLabel || raw.armor),
            emergencyTriggered: toBool(raw.emergencyTriggered || raw.triggered),
            damageControlActivated: toBool(raw.damageControlActivated || raw.activated),
            shieldDropRate: Number(raw.shieldDropRate || raw.shieldDropRatePerSec || 0) || 0,
            armorDropRate: Number(raw.armorDropRate || raw.armorDropRatePerSec || 0) || 0,
            armorDropPercent: Number(raw.armorDropPercent || raw.armorDropDeltaPercent || 0) || 0,
            reason: normalizeText(raw.reason),
            screen: raw.screen && typeof raw.screen === "object" ? raw.screen : null
        }
    };
}

function report(raw) {
    const built = buildReport(raw || {});
    if (built.error) {
        return built;
    }

    const snapshot = built.report;
    const clientHistory = state.histories[snapshot.clientId] || [];
    clientHistory.push({
        observedAt: snapshot.observedAt,
        receivedAt: snapshot.receivedAt,
        shieldPercent: snapshot.shieldPercent,
        armorPercent: snapshot.armorPercent,
        emergencyTriggered: snapshot.emergencyTriggered,
        damageControlActivated: snapshot.damageControlActivated,
        reason: snapshot.reason
    });

    state.ships[snapshot.clientId] = snapshot;
    state.histories[snapshot.clientId] = clientHistory.slice(-DEFAULT_HISTORY_LIMIT);
    saveState();

    return { ship: enrichShip(snapshot) };
}

function getShips() {
    const now = Date.now();
    return Object.keys(state.ships)
        .map((clientId) => enrichShip(state.ships[clientId], now))
        .sort((a, b) => {
            if (a.online !== b.online) {
                return a.online ? -1 : 1;
            }
            return b.lastSeenAt - a.lastSeenAt;
        });
}

function getSummary() {
    const ships = getShips();
    const summary = {
        total: ships.length,
        online: 0,
        offline: 0,
        lowShield: 0,
        lowArmor: 0,
        updatedAt: state.updatedAt,
        offlineTimeoutMs: DEFAULT_OFFLINE_TIMEOUT_MS,
        byShipType: getAllowedShipTypes().map((type) => ({
            shipType: type.id,
            shipTypeLabel: type.label,
            total: 0,
            online: 0,
            offline: 0
        }))
    };
    const byType = {};
    summary.byShipType.forEach((item) => {
        byType[item.shipType] = item;
    });

    ships.forEach((ship) => {
        const bucket = byType[ship.shipType];
        if (ship.online) {
            summary.online += 1;
            if (bucket) bucket.online += 1;
        } else {
            summary.offline += 1;
            if (bucket) bucket.offline += 1;
        }
        if (bucket) bucket.total += 1;
        if (ship.shieldPercent !== null && ship.shieldPercent <= 30) {
            summary.lowShield += 1;
        }
        if (ship.armorPercent !== null && ship.armorPercent <= 50) {
            summary.lowArmor += 1;
        }
    });

    return summary;
}

function getHistory(clientId) {
    const key = normalizeText(clientId);
    return state.histories[key] || [];
}

loadState();

module.exports = {
    getAllowedShipTypes,
    getShips,
    getSummary,
    getHistory,
    report,
    normalizeShipType,
    offlineTimeoutMs: DEFAULT_OFFLINE_TIMEOUT_MS
};
