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
const REMOTE_DAMAGE_CONTROL_ACTIVATION_MS = 30 * 1000;
const REMOTE_DAMAGE_CONTROL_REACTIVATION_DELAY_MS = 120 * 1000;
const REMOTE_DAMAGE_CONTROL_COOLDOWN_MS =
    REMOTE_DAMAGE_CONTROL_ACTIVATION_MS + REMOTE_DAMAGE_CONTROL_REACTIVATION_DELAY_MS;
const REMOTE_DAMAGE_CONTROL_ELIGIBLE_TYPES = ["apostle", "telemachus"];
const REMOTE_DAMAGE_CONTROL_COMMAND_TIMEOUT_MS = 8 * 1000;
const FLEET_WATCHLIST_COMMAND_TIMEOUT_MS = 90 * 1000;
const FLEET_WATCHLIST_CANCEL_GRACE_MS = 15 * 1000;
const FLEET_WATCHLIST_RESULT_LIMIT = 20;
const FLEET_TEAMMATE_LOCK_COMMAND_TIMEOUT_MS = 90 * 1000;
const FLEET_TEAMMATE_LOCK_CANCEL_GRACE_MS = 15 * 1000;
const FLEET_TEAMMATE_LOCK_RESULT_LIMIT = 20;

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
    remoteDamageControl: createDefaultRemoteDamageControlState(),
    fleetWatchlist: createDefaultFleetWatchlistState(),
    fleetTeammateLock: createDefaultFleetTeammateLockState(),
    updatedAt: null
};

function createDefaultRemoteDamageControlState() {
    return {
        enabled: false,
        commandSeq: 0,
        currentCommand: null,
        cooldowns: {},
        lastAssignedClientId: "",
        lastDecisionReason: "",
        lastCommandResult: null,
        updatedAt: null
    };
}

function createDefaultFleetWatchlistState() {
    return {
        commandSeq: 0,
        currentCommand: null,
        lastCommandResult: null,
        updatedAt: null
    };
}

function createDefaultFleetTeammateLockState() {
    return {
        commandSeq: 0,
        currentCommand: null,
        lastCommandResult: null,
        updatedAt: null
    };
}

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
                remoteDamageControl: {
                    ...createDefaultRemoteDamageControlState(),
                    ...(data.remoteDamageControl || {}),
                    cooldowns: (data.remoteDamageControl && data.remoteDamageControl.cooldowns) || {}
                },
                fleetWatchlist: {
                    ...createDefaultFleetWatchlistState(),
                    ...(data.fleetWatchlist || {})
                },
                fleetTeammateLock: {
                    ...createDefaultFleetTeammateLockState(),
                    ...(data.fleetTeammateLock || {})
                },
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

function isRemoteDamageControlShipType(shipType) {
    return REMOTE_DAMAGE_CONTROL_ELIGIBLE_TYPES.indexOf(normalizeShipType(shipType)) >= 0;
}

function normalizeRemoteDamageControlSkill(raw, now = Date.now()) {
    const data = raw && typeof raw === "object" ? raw : null;
    const reason = normalizeText(data && data.reason);
    const stateText = normalizeText(data && data.state).toLowerCase();
    const active = toBool(data && data.active);
    const available = toBool(data && (data.available || data.canActivate));
    let state = "unknown";

    if (active || stateText === "active") {
        state = "active";
    } else if (available || stateText === "available") {
        state = "available";
    } else if (stateText === "cooldown" || reason.indexOf("冷却") >= 0 || reason.toLowerCase().indexOf("cooldown") >= 0) {
        state = "cooldown";
    }

    return {
        ok: toBool(data && data.ok),
        state,
        active: state === "active",
        available: state === "available",
        canActivate: state === "available",
        reason,
        error: normalizeText(data && data.error),
        observedAt: normalizeTimestamp(data && data.observedAt) || now
    };
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
            remoteDamageControlSkill: normalizeRemoteDamageControlSkill(raw.remoteDamageControlSkill, observedAt),
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
        remoteDamageControlSkill: snapshot.remoteDamageControlSkill,
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

function ensureRemoteDamageControlState() {
    if (!state.remoteDamageControl) {
        state.remoteDamageControl = createDefaultRemoteDamageControlState();
    }
    state.remoteDamageControl.cooldowns = state.remoteDamageControl.cooldowns || {};
    state.remoteDamageControl.commandSeq = Number(state.remoteDamageControl.commandSeq) || 0;
    return state.remoteDamageControl;
}

function ensureFleetWatchlistState() {
    if (!state.fleetWatchlist) {
        state.fleetWatchlist = createDefaultFleetWatchlistState();
    }
    state.fleetWatchlist.commandSeq = Number(state.fleetWatchlist.commandSeq) || 0;
    return state.fleetWatchlist;
}

function ensureFleetTeammateLockState() {
    if (!state.fleetTeammateLock) {
        state.fleetTeammateLock = createDefaultFleetTeammateLockState();
    }
    state.fleetTeammateLock.commandSeq = Number(state.fleetTeammateLock.commandSeq) || 0;
    return state.fleetTeammateLock;
}

function getOnlineRemoteDamageControlShips(now = Date.now()) {
    return Object.keys(state.ships)
        .map((clientId) => enrichShip(state.ships[clientId], now))
        .filter((ship) => ship.online && isRemoteDamageControlShipType(ship.shipType))
        .sort((a, b) => a.clientId.localeCompare(b.clientId));
}

function getFreshRemoteDamageControlSkill(ship, now) {
    const skill = ship.remoteDamageControlSkill && typeof ship.remoteDamageControlSkill === "object"
        ? ship.remoteDamageControlSkill
        : normalizeRemoteDamageControlSkill(null, now);
    const observedAt = Number(skill.observedAt) || 0;
    const ageMs = observedAt > 0 ? Math.max(0, now - observedAt) : null;

    if (ageMs === null || ageMs > DEFAULT_OFFLINE_TIMEOUT_MS) {
        return {
            ...skill,
            state: "unknown",
            active: false,
            available: false,
            canActivate: false,
            stale: true,
            ageMs
        };
    }

    return {
        ...skill,
        stale: false,
        ageMs
    };
}

function classifyRemoteDamageControlShips(eligibleShips, now) {
    const groups = {
        eligibleShips: [],
        activeShips: [],
        availableShips: [],
        cooldownShips: [],
        unknownShips: []
    };

    eligibleShips.forEach((ship) => {
        const skill = getFreshRemoteDamageControlSkill(ship, now);
        const item = {
            clientId: ship.clientId,
            shipType: ship.shipType,
            shipTypeLabel: ship.shipTypeLabel,
            shipName: ship.shipName,
            ageMs: ship.ageMs,
            remoteDamageControlSkill: skill
        };

        groups.eligibleShips.push(item);
        if (skill.state === "active") {
            groups.activeShips.push(item);
        } else if (skill.state === "available") {
            groups.availableShips.push(item);
        } else if (skill.state === "cooldown") {
            groups.cooldownShips.push(item);
        } else {
            groups.unknownShips.push(item);
        }
    });

    return groups;
}

function pickNextRemoteDamageControlShip(eligibleShips, availableShips, control) {
    const availableByClientId = {};
    const lastIndex = eligibleShips.findIndex((ship) => ship.clientId === control.lastAssignedClientId);
    const startIndex = lastIndex >= 0 ? (lastIndex + 1) % eligibleShips.length : 0;

    availableShips.forEach((ship) => {
        availableByClientId[ship.clientId] = true;
    });

    for (let offset = 0; offset < eligibleShips.length; offset += 1) {
        const ship = eligibleShips[(startIndex + offset) % eligibleShips.length];
        if (availableByClientId[ship.clientId]) {
            return ship;
        }
    }

    return availableShips[0] || null;
}

function createRemoteDamageControlCommand(ship, control, now) {
    const commandSeq = (Number(control.commandSeq) || 0) + 1;
    const command = {
        commandId: `rdc-${commandSeq}-${now}`,
        type: "activate_remote_damage_control",
        clientId: ship.clientId,
        shipType: ship.shipType,
        shipTypeLabel: ship.shipTypeLabel,
        shipName: ship.shipName || ship.shipTypeLabel,
        assignedAt: now,
        commandExpiresAt: now + REMOTE_DAMAGE_CONTROL_COMMAND_TIMEOUT_MS,
        activationDurationMs: REMOTE_DAMAGE_CONTROL_ACTIVATION_MS,
        reactivationDelayMs: REMOTE_DAMAGE_CONTROL_REACTIVATION_DELAY_MS,
        acknowledgedAt: null,
        activated: null,
        resultReason: ""
    };

    control.commandSeq = commandSeq;
    control.currentCommand = command;
    control.lastAssignedClientId = ship.clientId;
    control.lastDecisionReason = "已指派 " + command.shipName + " 开启远程损害管控";
    control.updatedAt = new Date(now).toISOString();
    return command;
}

function syncRemoteDamageControl(now = Date.now()) {
    const control = ensureRemoteDamageControlState();
    const eligibleShips = getOnlineRemoteDamageControlShips(now);
    const groups = classifyRemoteDamageControlShips(eligibleShips, now);
    const eligibleIds = {};
    let changed = false;

    eligibleShips.forEach((ship) => {
        eligibleIds[ship.clientId] = true;
    });

    if (!control.enabled) {
        if (control.currentCommand) {
            control.currentCommand = null;
            changed = true;
        }
        control.lastDecisionReason = "开关关闭";
        return { control, groups, changed };
    }

    if (groups.activeShips.length > 0) {
        if (control.currentCommand) {
            control.currentCommand = null;
            changed = true;
        }
        control.lastDecisionReason = "已有舰船处于远程损害管控激活状态";
        return { control, groups, changed };
    }

    if (control.currentCommand &&
        control.currentCommand.commandExpiresAt > now &&
        eligibleIds[control.currentCommand.clientId]) {
        control.lastDecisionReason = "等待 " + control.currentCommand.shipName + " 执行指令";
        return { control, groups, changed };
    }

    if (control.currentCommand) {
        control.currentCommand = null;
        changed = true;
    }

    if (groups.availableShips.length > 0) {
        const nextShip = pickNextRemoteDamageControlShip(groups.eligibleShips, groups.availableShips, control);
        if (nextShip) {
            createRemoteDamageControlCommand(nextShip, control, now);
            changed = true;
        }
    } else if (groups.eligibleShips.length > 0) {
        control.lastDecisionReason = "所有技能冷却中或等待状态更新";
    } else {
        control.lastDecisionReason = "暂无在线使徒或特勒马科斯";
    }

    return { control, groups, changed };
}

function buildRemoteDamageControlStatus(now = Date.now()) {
    const synced = syncRemoteDamageControl(now);
    const control = synced.control;
    const groups = synced.groups;

    if (synced.changed) {
        saveState();
    }

    return {
        enabled: control.enabled === true,
        activationDurationMs: REMOTE_DAMAGE_CONTROL_ACTIVATION_MS,
        reactivationDelayMs: REMOTE_DAMAGE_CONTROL_REACTIVATION_DELAY_MS,
        cooldownMs: REMOTE_DAMAGE_CONTROL_COOLDOWN_MS,
        eligibleShipTypes: REMOTE_DAMAGE_CONTROL_ELIGIBLE_TYPES.map((shipType) => SHIP_TYPES[shipType]),
        requiredForContinuousCoverage: Math.ceil(REMOTE_DAMAGE_CONTROL_COOLDOWN_MS / REMOTE_DAMAGE_CONTROL_ACTIVATION_MS),
        coverageSufficient: groups.eligibleShips.length >= Math.ceil(REMOTE_DAMAGE_CONTROL_COOLDOWN_MS / REMOTE_DAMAGE_CONTROL_ACTIVATION_MS),
        eligibleCount: groups.eligibleShips.length,
        activeCount: groups.activeShips.length,
        availableCount: groups.availableShips.length,
        cooldownCount: groups.cooldownShips.length,
        unknownCount: groups.unknownShips.length,
        eligibleShips: groups.eligibleShips,
        activeShips: groups.activeShips,
        availableShips: groups.availableShips,
        cooldownShips: groups.cooldownShips,
        unknownShips: groups.unknownShips,
        currentCommand: control.currentCommand,
        nextActionAt: control.currentCommand ? control.currentCommand.commandExpiresAt : null,
        waitingReason: control.lastDecisionReason || "",
        lastCommandResult: control.lastCommandResult || null,
        updatedAt: control.updatedAt,
        now
    };
}

function getRemoteDamageControlStatus() {
    return buildRemoteDamageControlStatus();
}

function setRemoteDamageControlEnabled(enabled) {
    const control = ensureRemoteDamageControlState();
    const nextEnabled = toBool(enabled);
    const now = Date.now();

    if (control.enabled !== nextEnabled) {
        control.enabled = nextEnabled;
        control.currentCommand = null;
        control.updatedAt = new Date(now).toISOString();
        if (nextEnabled) {
            requestFleetWatchlistCancel(now, "远程损害管控已开启");
            requestFleetTeammateLockCancel(now, "远程损害管控已开启");
        }
        saveState();
    }

    return buildRemoteDamageControlStatus();
}

function getRemoteDamageControlCommand(raw) {
    const request = raw || {};
    const clientId = normalizeText(request.clientId);
    const shipType = normalizeShipType(request.shipType);
    const status = buildRemoteDamageControlStatus();
    const command = status.currentCommand;

    if (!clientId) {
        return { error: "缺少 clientId" };
    }

    return {
        status,
        command: command &&
            command.clientId === clientId &&
            command.commandExpiresAt > status.now &&
            isRemoteDamageControlShipType(shipType || (state.ships[clientId] && state.ships[clientId].shipType))
            ? command
            : null
    };
}

function acknowledgeRemoteDamageControlCommand(raw) {
    const control = ensureRemoteDamageControlState();
    const payload = raw || {};
    const clientId = normalizeText(payload.clientId);
    const commandId = normalizeText(payload.commandId);
    const activated = toBool(payload.activated);
    const now = Date.now();

    if (!clientId || !commandId) {
        return { error: "缺少 clientId 或 commandId" };
    }
    if (!control.currentCommand ||
        control.currentCommand.clientId !== clientId ||
        control.currentCommand.commandId !== commandId) {
        return { accepted: false, status: buildRemoteDamageControlStatus(now) };
    }

    control.currentCommand.acknowledgedAt = now;
    control.currentCommand.activated = activated;
    control.currentCommand.resultReason = normalizeText(payload.reason);
    control.lastCommandResult = {
        clientId,
        commandId,
        activated,
        reason: normalizeText(payload.reason),
        resultAt: normalizeTimestamp(payload.resultAt),
        receivedAt: now
    };
    if (!activated) {
        control.currentCommand = null;
    }
    control.updatedAt = new Date(now).toISOString();
    saveState();

    return { accepted: true, status: buildRemoteDamageControlStatus(now) };
}

function createFleetWatchlistCommand() {
    const now = Date.now();
    const remoteStatus = buildRemoteDamageControlStatus(now);
    const teammateLockStatus = buildFleetTeammateLockStatus(now);
    const watchlist = ensureFleetWatchlistState();
    const commandSeq = (Number(watchlist.commandSeq) || 0) + 1;

    if (remoteStatus.enabled) {
        return {
            error: "远程损害管控开启中，无法执行加入关注操作",
            status: buildFleetWatchlistStatus(now),
            remoteDamageControl: remoteStatus
        };
    }
    if (teammateLockStatus.active) {
        return {
            error: "锁定队友操作执行中，无法执行加入关注操作",
            status: buildFleetWatchlistStatus(now),
            teammateLock: teammateLockStatus
        };
    }

    watchlist.commandSeq = commandSeq;
    watchlist.currentCommand = {
        commandId: `watchlist-${commandSeq}-${now}`,
        type: "add_fleet_members_to_watchlist",
        requestedAt: now,
        commandExpiresAt: now + FLEET_WATCHLIST_COMMAND_TIMEOUT_MS,
        cancelRequestedAt: null,
        cancelReason: "",
        acknowledgedClientIds: {},
        results: []
    };
    watchlist.updatedAt = new Date(now).toISOString();
    saveState();

    return buildFleetWatchlistStatus(now);
}

function buildFleetWatchlistStatus(now = Date.now()) {
    const watchlist = ensureFleetWatchlistState();
    const command = watchlist.currentCommand || null;
    const active = !!(command && Number(command.commandExpiresAt || 0) > now);
    const cancelRequestedAt = command ? Number(command.cancelRequestedAt || 0) || null : null;
    const acknowledgedClientIds = command && command.acknowledgedClientIds ? command.acknowledgedClientIds : {};
    const acknowledgedCount = Object.keys(acknowledgedClientIds).length;

    return {
        active,
        cancelling: active && !!cancelRequestedAt,
        timeoutMs: FLEET_WATCHLIST_COMMAND_TIMEOUT_MS,
        currentCommand: command ? {
            commandId: command.commandId,
            type: command.type,
            requestedAt: command.requestedAt,
            commandExpiresAt: command.commandExpiresAt,
            cancelRequestedAt,
            cancelReason: command.cancelReason || "",
            acknowledgedCount,
            results: (command.results || []).slice(-FLEET_WATCHLIST_RESULT_LIMIT)
        } : null,
        lastCommandResult: watchlist.lastCommandResult || null,
        updatedAt: watchlist.updatedAt,
        now
    };
}

function getFleetWatchlistStatus() {
    return buildFleetWatchlistStatus();
}

function getFleetWatchlistCommand(raw) {
    const request = raw || {};
    const clientId = normalizeText(request.clientId);
    const status = buildFleetWatchlistStatus();
    const command = status.active ? ensureFleetWatchlistState().currentCommand : null;
    const acknowledgedClientIds = command && command.acknowledgedClientIds ? command.acknowledgedClientIds : {};
    let remoteStatus = null;
    let teammateLockStatus = null;

    if (!clientId) {
        return { error: "缺少 clientId" };
    }
    remoteStatus = command && !command.cancelRequestedAt
        ? buildRemoteDamageControlStatus(status.now)
        : null;
    if (remoteStatus && remoteStatus.enabled) {
        return {
            status,
            command: null
        };
    }
    teammateLockStatus = command && !command.cancelRequestedAt
        ? buildFleetTeammateLockStatus(status.now)
        : null;
    if (teammateLockStatus && teammateLockStatus.active) {
        return {
            status,
            command: null
        };
    }

    return {
        status,
        command: command && command.cancelRequestedAt ? {
            commandId: `${command.commandId}-cancel`,
            type: "cancel_fleet_members_to_watchlist",
            targetCommandId: command.commandId,
            requestedAt: command.cancelRequestedAt,
            commandExpiresAt: command.commandExpiresAt,
            reason: command.cancelReason || "用户终止"
        } : command && !acknowledgedClientIds[clientId] ? {
            commandId: command.commandId,
            type: command.type,
            requestedAt: command.requestedAt,
            commandExpiresAt: command.commandExpiresAt
        } : null
    };
}

function requestFleetWatchlistCancel(now, reason) {
    const watchlist = ensureFleetWatchlistState();
    const command = watchlist.currentCommand;

    if (!command || Number(command.commandExpiresAt || 0) <= now) {
        return false;
    }

    command.cancelRequestedAt = command.cancelRequestedAt || now;
    command.cancelReason = reason || "用户终止";
    command.commandExpiresAt = Math.min(Number(command.commandExpiresAt || 0), now + FLEET_WATCHLIST_CANCEL_GRACE_MS);
    watchlist.updatedAt = new Date(now).toISOString();
    return true;
}

function cancelFleetWatchlistCommand(raw) {
    const now = Date.now();
    const cancelled = requestFleetWatchlistCancel(now, normalizeText(raw && raw.reason) || "用户终止");

    if (cancelled) {
        saveState();
    }

    return buildFleetWatchlistStatus(now);
}

function acknowledgeFleetWatchlistCommand(raw) {
    const watchlist = ensureFleetWatchlistState();
    const payload = raw || {};
    const clientId = normalizeText(payload.clientId);
    const commandId = normalizeText(payload.commandId);
    const completed = payload.completed !== undefined
        ? toBool(payload.completed)
        : toBool(payload.activated || payload.success);
    const now = Date.now();
    const command = watchlist.currentCommand;
    let result;

    if (!clientId || !commandId) {
        return { error: "缺少 clientId 或 commandId" };
    }
    if (!command || command.commandId !== commandId) {
        return { accepted: false, status: buildFleetWatchlistStatus(now) };
    }

    command.acknowledgedClientIds = command.acknowledgedClientIds || {};
    command.results = command.results || [];
    command.acknowledgedClientIds[clientId] = true;

    result = {
        clientId,
        commandId,
        completed,
        reason: normalizeText(payload.reason),
        matchedCount: Number(payload.matchedCount || 0) || 0,
        addedCount: Number(payload.addedCount || 0) || 0,
        fallbackCount: Number(payload.fallbackCount || 0) || 0,
        cancelled: toBool(payload.cancelled),
        error: normalizeText(payload.error),
        resultAt: normalizeTimestamp(payload.resultAt),
        receivedAt: now
    };

    command.results.push(result);
    command.results = command.results.slice(-FLEET_WATCHLIST_RESULT_LIMIT);
    watchlist.lastCommandResult = result;
    watchlist.updatedAt = new Date(now).toISOString();
    saveState();

    return { accepted: true, status: buildFleetWatchlistStatus(now) };
}

function createFleetTeammateLockCommand() {
    const now = Date.now();
    const lockState = ensureFleetTeammateLockState();
    const currentCommand = lockState.currentCommand;
    const active = !!(currentCommand && Number(currentCommand.commandExpiresAt || 0) > now);
    const eligibleShips = getOnlineRemoteDamageControlShips(now);
    const commandSeq = (Number(lockState.commandSeq) || 0) + 1;
    const remoteControl = ensureRemoteDamageControlState();
    const targetClientIds = {};

    if (active) {
        return {
            error: "锁定队友操作执行中",
            status: buildFleetTeammateLockStatus(now)
        };
    }
    if (eligibleShips.length === 0) {
        return {
            error: "暂无在线使徒或特勒马科斯",
            status: buildFleetTeammateLockStatus(now),
            remoteDamageControl: buildRemoteDamageControlStatus(now)
        };
    }

    eligibleShips.forEach((ship) => {
        targetClientIds[ship.clientId] = true;
    });

    remoteControl.enabled = false;
    remoteControl.currentCommand = null;
    remoteControl.lastDecisionReason = "锁定队友操作已暂停远程损害管控";
    remoteControl.updatedAt = new Date(now).toISOString();
    requestFleetWatchlistCancel(now, "锁定队友操作已下发");

    lockState.commandSeq = commandSeq;
    lockState.currentCommand = {
        commandId: `teammate-lock-${commandSeq}-${now}`,
        type: "lock_fleet_teammates",
        requestedAt: now,
        commandExpiresAt: now + FLEET_TEAMMATE_LOCK_COMMAND_TIMEOUT_MS,
        cancelRequestedAt: null,
        cancelReason: "",
        targetClientIds,
        targetCount: eligibleShips.length,
        acknowledgedClientIds: {},
        results: []
    };
    lockState.updatedAt = new Date(now).toISOString();
    saveState();

    return {
        status: buildFleetTeammateLockStatus(now),
        remoteDamageControl: buildRemoteDamageControlStatus(now),
        fleetWatchlist: buildFleetWatchlistStatus(now)
    };
}

function buildFleetTeammateLockStatus(now = Date.now()) {
    const lockState = ensureFleetTeammateLockState();
    const command = lockState.currentCommand || null;
    const active = !!(command && Number(command.commandExpiresAt || 0) > now);
    const cancelRequestedAt = command ? Number(command.cancelRequestedAt || 0) || null : null;
    const acknowledgedClientIds = command && command.acknowledgedClientIds ? command.acknowledgedClientIds : {};
    const acknowledgedCount = Object.keys(acknowledgedClientIds).length;
    const eligibleShips = getOnlineRemoteDamageControlShips(now);

    return {
        active,
        cancelling: active && !!cancelRequestedAt,
        timeoutMs: FLEET_TEAMMATE_LOCK_COMMAND_TIMEOUT_MS,
        eligibleShipTypes: REMOTE_DAMAGE_CONTROL_ELIGIBLE_TYPES.map((shipType) => SHIP_TYPES[shipType]),
        eligibleCount: eligibleShips.length,
        eligibleShips,
        currentCommand: command ? {
            commandId: command.commandId,
            type: command.type,
            requestedAt: command.requestedAt,
            commandExpiresAt: command.commandExpiresAt,
            cancelRequestedAt,
            cancelReason: command.cancelReason || "",
            targetCount: Number(command.targetCount || 0) || 0,
            acknowledgedCount,
            results: (command.results || []).slice(-FLEET_TEAMMATE_LOCK_RESULT_LIMIT)
        } : null,
        lastCommandResult: lockState.lastCommandResult || null,
        updatedAt: lockState.updatedAt,
        now
    };
}

function getFleetTeammateLockStatus() {
    return buildFleetTeammateLockStatus();
}

function getFleetTeammateLockCommand(raw) {
    const request = raw || {};
    const clientId = normalizeText(request.clientId);
    const shipType = normalizeShipType(request.shipType);
    const status = buildFleetTeammateLockStatus();
    const command = status.active ? ensureFleetTeammateLockState().currentCommand : null;
    const acknowledgedClientIds = command && command.acknowledgedClientIds ? command.acknowledgedClientIds : {};
    const targetClientIds = command && command.targetClientIds ? command.targetClientIds : {};

    if (!clientId) {
        return { error: "缺少 clientId" };
    }
    if (!command ||
        !targetClientIds[clientId] ||
        !isRemoteDamageControlShipType(shipType || (state.ships[clientId] && state.ships[clientId].shipType))) {
        return {
            status,
            command: null
        };
    }

    return {
        status,
        command: command.cancelRequestedAt ? {
            commandId: `${command.commandId}-cancel`,
            type: "cancel_fleet_teammate_lock",
            targetCommandId: command.commandId,
            requestedAt: command.cancelRequestedAt,
            commandExpiresAt: command.commandExpiresAt,
            reason: command.cancelReason || "用户终止"
        } : !acknowledgedClientIds[clientId] ? {
            commandId: command.commandId,
            type: command.type,
            requestedAt: command.requestedAt,
            commandExpiresAt: command.commandExpiresAt
        } : null
    };
}

function requestFleetTeammateLockCancel(now, reason) {
    const lockState = ensureFleetTeammateLockState();
    const command = lockState.currentCommand;

    if (!command || Number(command.commandExpiresAt || 0) <= now) {
        return false;
    }

    command.cancelRequestedAt = command.cancelRequestedAt || now;
    command.cancelReason = reason || "用户终止";
    command.commandExpiresAt = Math.min(Number(command.commandExpiresAt || 0), now + FLEET_TEAMMATE_LOCK_CANCEL_GRACE_MS);
    lockState.updatedAt = new Date(now).toISOString();
    return true;
}

function cancelFleetTeammateLockCommand(raw) {
    const now = Date.now();
    const cancelled = requestFleetTeammateLockCancel(now, normalizeText(raw && raw.reason) || "用户终止");

    if (cancelled) {
        saveState();
    }

    return buildFleetTeammateLockStatus(now);
}

function acknowledgeFleetTeammateLockCommand(raw) {
    const lockState = ensureFleetTeammateLockState();
    const payload = raw || {};
    const clientId = normalizeText(payload.clientId);
    const commandId = normalizeText(payload.commandId);
    const completed = payload.completed !== undefined
        ? toBool(payload.completed)
        : toBool(payload.activated || payload.success);
    const now = Date.now();
    const command = lockState.currentCommand;
    let result;

    if (!clientId || !commandId) {
        return { error: "缺少 clientId 或 commandId" };
    }
    if (!command || command.commandId !== commandId) {
        return { accepted: false, status: buildFleetTeammateLockStatus(now) };
    }

    command.acknowledgedClientIds = command.acknowledgedClientIds || {};
    command.results = command.results || [];
    command.acknowledgedClientIds[clientId] = true;

    result = {
        clientId,
        commandId,
        completed,
        reason: normalizeText(payload.reason),
        checkedCount: Number(payload.checkedCount || 0) || 0,
        alreadyLockedCount: Number(payload.alreadyLockedCount || 0) || 0,
        lockedCount: Number(payload.lockedCount || 0) || 0,
        uncertainCount: Number(payload.uncertainCount || 0) || 0,
        unavailableCount: Number(payload.unavailableCount || 0) || 0,
        cancelled: toBool(payload.cancelled),
        error: normalizeText(payload.error),
        resultAt: normalizeTimestamp(payload.resultAt),
        receivedAt: now
    };

    command.results.push(result);
    command.results = command.results.slice(-FLEET_TEAMMATE_LOCK_RESULT_LIMIT);
    lockState.lastCommandResult = result;
    lockState.updatedAt = new Date(now).toISOString();
    saveState();

    return { accepted: true, status: buildFleetTeammateLockStatus(now) };
}

function getFleetCommand(raw) {
    const request = raw || {};
    const remoteResult = getRemoteDamageControlCommand(request);
    const teammateLockResult = getFleetTeammateLockCommand(request);
    const watchlistResult = getFleetWatchlistCommand(request);

    if (remoteResult.error) {
        return remoteResult;
    }
    if (teammateLockResult.error) {
        return teammateLockResult;
    }
    if (watchlistResult.error) {
        return watchlistResult;
    }

    return {
        status: {
            remoteDamageControl: remoteResult.status,
            fleetTeammateLock: teammateLockResult.status,
            fleetWatchlist: watchlistResult.status
        },
        command: remoteResult.command || teammateLockResult.command || watchlistResult.command || null
    };
}

function acknowledgeFleetCommand(raw) {
    const payload = raw || {};
    const type = normalizeText(payload.type);

    if (type === "cancel_fleet_members_to_watchlist") {
        return { accepted: true, status: buildFleetWatchlistStatus() };
    }
    if (type === "add_fleet_members_to_watchlist" || String(payload.commandId || "").indexOf("watchlist-") === 0) {
        return acknowledgeFleetWatchlistCommand(payload);
    }
    if (type === "cancel_fleet_teammate_lock") {
        return { accepted: true, status: buildFleetTeammateLockStatus() };
    }
    if (type === "lock_fleet_teammates" || String(payload.commandId || "").indexOf("teammate-lock-") === 0) {
        return acknowledgeFleetTeammateLockCommand(payload);
    }

    return acknowledgeRemoteDamageControlCommand(payload);
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
    getRemoteDamageControlStatus,
    setRemoteDamageControlEnabled,
    getRemoteDamageControlCommand,
    acknowledgeRemoteDamageControlCommand,
    createFleetWatchlistCommand,
    cancelFleetWatchlistCommand,
    getFleetWatchlistStatus,
    getFleetWatchlistCommand,
    acknowledgeFleetWatchlistCommand,
    createFleetTeammateLockCommand,
    cancelFleetTeammateLockCommand,
    getFleetTeammateLockStatus,
    getFleetTeammateLockCommand,
    acknowledgeFleetTeammateLockCommand,
    getFleetCommand,
    acknowledgeFleetCommand,
    report,
    normalizeShipType,
    offlineTimeoutMs: DEFAULT_OFFLINE_TIMEOUT_MS
};
