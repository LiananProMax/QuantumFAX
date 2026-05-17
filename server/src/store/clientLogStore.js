/**
 * Client runtime log store.
 *
 * Logs are kept per client with a bounded history so the dashboard can inspect
 * recent EasyClick activity without letting log volume grow unbounded.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const STATE_FILE = path.join(DATA_DIR, "clientLogs.json");
const DEFAULT_LOG_LIMIT = parseInt(process.env.CLIENT_LOG_LIMIT, 10) || 500;
const DEFAULT_BATCH_LIMIT = parseInt(process.env.CLIENT_LOG_BATCH_LIMIT, 10) || 50;
const DEFAULT_MESSAGE_LIMIT = parseInt(process.env.CLIENT_LOG_MESSAGE_LIMIT, 10) || 2000;
const ALLOWED_LEVELS = new Set(["INFO", "WARN", "ERROR", "SUCCESS", "DEBUG"]);

let state = {
    logs: {},
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
                logs: data.logs || {},
                updatedAt: data.updatedAt || null
            };
        }
    } catch (err) {
        console.error("[ClientLogStore] 加载失败:", err.message);
    }
}

function saveState() {
    ensureDataDir();
    try {
        state.updatedAt = new Date().toISOString();
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
        return true;
    } catch (err) {
        console.error("[ClientLogStore] 保存失败:", err.message);
        return false;
    }
}

function normalizeText(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value).trim();
}

function truncateText(value, maxLength) {
    const text = normalizeText(value);
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength);
}

function normalizeTimestamp(value) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
    }
    return Date.now();
}

function normalizeLimit(value, fallback) {
    const parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    return Math.min(parsed, DEFAULT_LOG_LIMIT);
}

function normalizeLevel(value) {
    const level = normalizeText(value).toUpperCase();
    return ALLOWED_LEVELS.has(level) ? level : "INFO";
}

function buildLog(raw, common, index, receivedAt) {
    const message = truncateText(raw.message, DEFAULT_MESSAGE_LIMIT);
    const timestamp = normalizeTimestamp(raw.timestamp || raw.createdAt || raw.observedAt);
    if (!message) {
        return null;
    }

    return {
        id: `${receivedAt}-${timestamp}-${index}`,
        clientId: common.clientId,
        shipType: common.shipType,
        shipName: common.shipName,
        time: truncateText(raw.time, 64),
        timestamp,
        receivedAt,
        level: normalizeLevel(raw.level),
        message
    };
}

function append(raw) {
    const payload = raw || {};
    const clientId = normalizeText(payload.clientId);
    const logs = Array.isArray(payload.logs) ? payload.logs.slice(0, DEFAULT_BATCH_LIMIT) : [];
    const receivedAt = Date.now();

    if (!clientId) {
        return { error: "缺少 clientId" };
    }
    if (logs.length === 0) {
        return { error: "缺少 logs" };
    }

    const common = {
        clientId,
        shipType: normalizeText(payload.shipType),
        shipName: normalizeText(payload.shipName)
    };
    const acceptedLogs = logs
        .map((item, index) => buildLog(item || {}, common, index, receivedAt))
        .filter(Boolean);

    if (acceptedLogs.length === 0) {
        return { error: "没有可保存的日志" };
    }

    const clientLogs = state.logs[clientId] || [];
    state.logs[clientId] = clientLogs.concat(acceptedLogs).slice(-DEFAULT_LOG_LIMIT);
    saveState();

    return {
        clientId,
        accepted: acceptedLogs.length,
        total: state.logs[clientId].length
    };
}

function getLogs(clientId, options = {}) {
    const key = normalizeText(clientId);
    const limit = normalizeLimit(options.limit, 100);
    const logs = state.logs[key] || [];

    return logs.slice(-limit).reverse();
}

loadState();

module.exports = {
    append,
    getLogs,
    logLimit: DEFAULT_LOG_LIMIT
};
