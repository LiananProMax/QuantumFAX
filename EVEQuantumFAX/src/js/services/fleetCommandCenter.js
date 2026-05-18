var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.fleetCommandCenter = {
    POLL_INTERVAL_MS: 2000,
    COMMAND_TIMEOUT_MS: 5000,
    ELIGIBLE_SHIP_TYPES: {
        apostle: true,
        telemachus: true
    },
    _polling: false,
    _lastPollAt: 0,
    _backoffUntil: 0,
    _lastCommand: null,
    _lastStatus: null,
    _lastHandledCommandId: "",
    _watchlistRunning: false,
    _watchlistCancelRequested: false,
    _watchlistCommandId: "",
    _teammateLockRunning: false,
    _teammateLockCancelRequested: false,
    _teammateLockCommandId: "",
    _acking: false,
    _lastLoggedError: "",
    _lastLoggedAt: 0,

    getCommandUrl: function () {
        return this._getFleetUrl("/api/fleet/commands");
    },

    getAckUrl: function () {
        return this._getFleetUrl("/api/fleet/commands/ack");
    },

    _getFleetUrl: function (path) {
        var config = EVEQuantumFAX.config;
        var serverUrl = config.fleetServerUrl;

        if (!serverUrl && EVEQuantumFAX.hotupdate && EVEQuantumFAX.hotupdate.config) {
            serverUrl = EVEQuantumFAX.hotupdate.config.serverUrl;
        }
        if (!serverUrl) {
            return "";
        }
        return String(serverUrl).replace(/\/$/, "") + path;
    },

    poll: function (force) {
        var now = new Date().getTime();
        var workerThread;

        if (!this.getCommandUrl()) {
            return { ok: false, skipped: true, error: "未配置舰队后端地址" };
        }
        if (this._polling) {
            return { ok: true, skipped: true, pending: true };
        }
        if (force !== true && now - this._lastPollAt < this.POLL_INTERVAL_MS) {
            return { ok: true, skipped: true };
        }
        if (force !== true && now < this._backoffUntil) {
            return { ok: true, skipped: true, backoff: true };
        }

        this._polling = true;
        this._lastPollAt = now;
        try {
            workerThread = thread.execAsync(function () {
                EVEQuantumFAX.fleetCommandCenter._pollWorker();
            });
            if (!workerThread) {
                this._polling = false;
                return this._recordError("舰队指令轮询线程启动失败");
            }
            return { ok: true, scheduled: true };
        } catch (error) {
            this._polling = false;
            return this._recordError("" + error);
        }
    },

    handleRemoteDamageControl: function (context) {
        var pollResult = this.poll(false);
        var command = this._lastCommand;
        var now = new Date().getTime();
        var result;
        var activated;
        var reason;
        var logger = context && context.logger ? context.logger : EVEQuantumFAX.logger;

        if (!pollResult.ok && !pollResult.skipped && this.shouldLogError(pollResult.error)) {
            logger.warn("舰队指令轮询失败：" + pollResult.error);
        }

        if (!command) {
            return { ok: true, skipped: true };
        }
        if (command.commandId === this._lastHandledCommandId) {
            return { ok: true, skipped: true };
        }
        if (Number(command.commandExpiresAt || command.activeUntil || 0) <= now) {
            return { ok: true, skipped: true, expired: true };
        }

        if (command.type === "cancel_fleet_members_to_watchlist") {
            this._lastHandledCommandId = command.commandId;
            if (!command.targetCommandId || command.targetCommandId === this._watchlistCommandId) {
                this._watchlistCancelRequested = true;
                logger.warn("舰队关注列表：收到终止指令");
            }
            return { ok: true, cancelled: true, reason: command.reason || "用户终止" };
        }

        if (command.type === "cancel_fleet_teammate_lock") {
            this._lastHandledCommandId = command.commandId;
            if (!command.targetCommandId || command.targetCommandId === this._teammateLockCommandId) {
                this._teammateLockCancelRequested = true;
                logger.warn("锁定队友：收到终止指令");
            }
            return { ok: true, cancelled: true, reason: command.reason || "用户终止" };
        }

        if (command.type === "add_fleet_members_to_watchlist") {
            this._lastHandledCommandId = command.commandId;
            if (this._isRemoteDamageControlEnabled()) {
                reason = "远程损害管控开启中，跳过加入关注操作";
                this._ack(command, false, reason, {
                    ok: false,
                    completed: false,
                    error: reason
                });
                logger.warn("舰队关注列表：" + reason);
                return { ok: true, skipped: true, reason: reason };
            }
            return this._startFleetWatchlistWorker(command, logger);
        }

        if (command.type === "lock_fleet_teammates") {
            if (!this._isLocalEligible()) {
                this._lastHandledCommandId = command.commandId;
                reason = "当前舰船不支持锁定队友";
                this._ack(command, false, reason, {
                    ok: false,
                    completed: false,
                    error: reason
                });
                logger.warn("锁定队友：" + reason);
                return { ok: true, skipped: true, reason: reason };
            }
            if (this._watchlistRunning) {
                this._watchlistCancelRequested = true;
                return { ok: true, skipped: true, pending: true, reason: "等待关注列表操作终止" };
            }
            this._lastHandledCommandId = command.commandId;
            return this._startFleetTeammateLockWorker(command, logger);
        }

        if (command.type !== "activate_remote_damage_control") {
            return { ok: true, skipped: true };
        }
        if (command.clientId !== EVEQuantumFAX.configManager.ensureClientId()) {
            return { ok: true, skipped: true };
        }

        this._lastHandledCommandId = command.commandId;
        result = this._activateRemoteDamageControl();
        activated = result && result.activated === true;
        reason = (result && (result.reason || result.error)) || (activated ? "已开启" : "不可开启");
        this._ack(command, activated, reason, result);

        if (activated) {
            logger.warn("舰队远程损害管控：已执行轮转指令");
            EVEQuantumFAX.toast("已开启舰队远程损害管控");
        } else {
            logger.warn("舰队远程损害管控：执行失败，" + reason);
        }

        return {
            ok: true,
            activated: activated,
            reason: reason
        };
    },

    _pollWorker: function () {
        var responseText;
        var responseJson;

        try {
            responseText = http.httpGet(this.getCommandUrl(), {
                clientId: EVEQuantumFAX.configManager.ensureClientId(),
                shipType: EVEQuantumFAX.configManager.normalizeShipType(EVEQuantumFAX.config.shipType)
            }, this._getTimeoutMs(), {
                "Content-Type": "application/json"
            });
            if (!responseText) {
                this._recordError("舰队指令轮询无响应");
                return;
            }

            responseJson = JSON.parse(responseText);
            if (!responseJson.success) {
                this._recordError(responseJson.error || "舰队指令轮询失败");
                return;
            }

            this._lastStatus = responseJson.status || null;
            this._lastCommand = responseJson.command || null;
            this._backoffUntil = 0;
        } catch (error) {
            this._recordError("" + error);
        } finally {
            this._polling = false;
        }
    },

    _activateRemoteDamageControl: function () {
        if (!EVEQuantumFAX.healthMonitor || !EVEQuantumFAX.healthMonitor.activateRemoteDamageControlSkill) {
            return { ok: false, activated: false, error: "远程损害管控服务未加载" };
        }
        if (!this._isLocalEligible()) {
            return { ok: false, activated: false, error: "当前舰船不支持远程损害管控" };
        }

        return EVEQuantumFAX.healthMonitor.activateRemoteDamageControlSkill();
    },

    _startFleetWatchlistWorker: function (command, logger) {
        var workerThread;

        if (this._watchlistRunning) {
            return { ok: true, skipped: true, pending: true };
        }

        this._watchlistRunning = true;
        this._watchlistCancelRequested = false;
        this._watchlistCommandId = command.commandId;

        try {
            workerThread = thread.execAsync(function () {
                EVEQuantumFAX.fleetCommandCenter._watchlistWorker(command);
            });
            if (!workerThread) {
                this._watchlistRunning = false;
                this._watchlistCommandId = "";
                return this._recordError("关注列表执行线程启动失败");
            }
            logger.warn("舰队关注列表：开始执行加入关注操作");
            return { ok: true, scheduled: true };
        } catch (error) {
            this._watchlistRunning = false;
            this._watchlistCommandId = "";
            return this._recordError("" + error);
        }
    },

    _watchlistWorker: function (command) {
        var result;
        var completed;
        var reason;

        try {
            result = this._addFleetMembersToWatchlist(command.commandId);
            completed = result && result.completed === true;
            reason = (result && (result.reason || result.error)) || (completed ? "已执行" : "执行失败");
            this._ack(command, completed, reason, result);

            if (result && result.cancelled) {
                EVEQuantumFAX.logger.warn("舰队关注列表：已终止，" + reason);
                EVEQuantumFAX.toast("已终止舰队关注列表操作");
            } else if (completed) {
                EVEQuantumFAX.logger.warn("舰队关注列表：已执行加入关注操作，" + reason);
                EVEQuantumFAX.toast("已执行舰队关注列表操作");
            } else {
                EVEQuantumFAX.logger.warn("舰队关注列表：执行失败，" + reason);
            }
        } catch (error) {
            result = { ok: false, completed: false, error: "" + error };
            this._ack(command, false, "" + error, result);
            EVEQuantumFAX.logger.warn("舰队关注列表：执行失败，" + error);
        } finally {
            if (this._watchlistCommandId === command.commandId) {
                this._watchlistRunning = false;
                this._watchlistCancelRequested = false;
                this._watchlistCommandId = "";
            }
        }
    },

    _addFleetMembersToWatchlist: function (commandId) {
        var self = this;

        if (!EVEQuantumFAX.healthMonitor || !EVEQuantumFAX.healthMonitor.addFleetMembersToWatchlist) {
            return { ok: false, completed: false, error: "关注列表服务未加载" };
        }

        return EVEQuantumFAX.healthMonitor.addFleetMembersToWatchlist(function () {
            return self._watchlistCancelRequested === true || self._watchlistCommandId !== commandId;
        });
    },

    _startFleetTeammateLockWorker: function (command, logger) {
        var workerThread;

        if (this._teammateLockRunning) {
            return { ok: true, skipped: true, pending: true };
        }

        this._teammateLockRunning = true;
        this._teammateLockCancelRequested = false;
        this._teammateLockCommandId = command.commandId;

        try {
            workerThread = thread.execAsync(function () {
                EVEQuantumFAX.fleetCommandCenter._teammateLockWorker(command);
            });
            if (!workerThread) {
                this._teammateLockRunning = false;
                this._teammateLockCommandId = "";
                return this._recordError("锁定队友执行线程启动失败");
            }
            logger.warn("锁定队友：开始执行锁定操作");
            return { ok: true, scheduled: true };
        } catch (error) {
            this._teammateLockRunning = false;
            this._teammateLockCommandId = "";
            return this._recordError("" + error);
        }
    },

    _teammateLockWorker: function (command) {
        var result;
        var completed;
        var reason;

        try {
            result = this._lockFleetTeammates(command.commandId);
            completed = result && result.completed === true;
            reason = (result && (result.reason || result.error)) || (completed ? "已执行" : "执行失败");
            this._ack(command, completed, reason, result);

            if (result && result.cancelled) {
                EVEQuantumFAX.logger.warn("锁定队友：已终止，" + reason);
                EVEQuantumFAX.toast("已终止锁定队友操作");
            } else if (completed) {
                EVEQuantumFAX.logger.warn("锁定队友：已执行，" + reason);
                EVEQuantumFAX.toast("已执行锁定队友操作");
            } else {
                EVEQuantumFAX.logger.warn("锁定队友：执行失败，" + reason);
            }
        } catch (error) {
            result = { ok: false, completed: false, error: "" + error };
            this._ack(command, false, "" + error, result);
            EVEQuantumFAX.logger.warn("锁定队友：执行失败，" + error);
        } finally {
            if (this._teammateLockCommandId === command.commandId) {
                this._teammateLockRunning = false;
                this._teammateLockCancelRequested = false;
                this._teammateLockCommandId = "";
            }
        }
    },

    _lockFleetTeammates: function (commandId) {
        var self = this;

        if (!EVEQuantumFAX.healthMonitor || !EVEQuantumFAX.healthMonitor.lockFleetTeammates) {
            return { ok: false, completed: false, error: "锁定队友服务未加载" };
        }
        if (!this._isLocalEligible()) {
            return { ok: false, completed: false, error: "当前舰船不支持锁定队友" };
        }

        return EVEQuantumFAX.healthMonitor.lockFleetTeammates(function () {
            return self._teammateLockCancelRequested === true || self._teammateLockCommandId !== commandId;
        });
    },

    _isWatchlistCommandRunning: function (commandId) {
        return this._watchlistRunning && this._watchlistCommandId === commandId;
    },

    _isRemoteDamageControlEnabled: function () {
        var status = this._lastStatus && this._lastStatus.remoteDamageControl;
        return !!(status && status.enabled === true);
    },

    _ack: function (command, activated, reason, details) {
        var url = this.getAckUrl();
        var workerThread;

        if (!url || !command || this._acking) {
            return;
        }

        this._acking = true;
        try {
            workerThread = thread.execAsync(function () {
                EVEQuantumFAX.fleetCommandCenter._ackWorker(command, activated, reason, details);
            });
            if (!workerThread) {
                this._acking = false;
                this._recordError("舰队指令回执线程启动失败");
            }
        } catch (error) {
            this._acking = false;
            this._recordError("" + error);
        }
    },

    _ackWorker: function (command, activated, reason, details) {
        var responseText;
        var responseJson;
        var payload;

        try {
            details = details || {};
            payload = {
                clientId: EVEQuantumFAX.configManager.ensureClientId(),
                shipType: EVEQuantumFAX.configManager.normalizeShipType(EVEQuantumFAX.config.shipType),
                commandId: command.commandId,
                type: command.type,
                activated: activated === true,
                completed: activated === true,
                reason: reason || "",
                matchedCount: Number(details.matchedCount || 0) || 0,
                addedCount: Number(details.addedCount || 0) || 0,
                fallbackCount: Number(details.fallbackCount || 0) || 0,
                checkedCount: Number(details.checkedCount || 0) || 0,
                alreadyLockedCount: Number(details.alreadyLockedCount || 0) || 0,
                lockedCount: Number(details.lockedCount || 0) || 0,
                uncertainCount: Number(details.uncertainCount || 0) || 0,
                unavailableCount: Number(details.unavailableCount || 0) || 0,
                cancelled: details.cancelled === true,
                error: details.error || "",
                resultAt: new Date().getTime()
            };

            responseText = http.postJSON(this.getAckUrl(), payload, this._getTimeoutMs(), {
                "Content-Type": "application/json"
            });
            if (!responseText) {
                this._recordError("舰队指令回执无响应");
                return;
            }
            responseJson = JSON.parse(responseText);
            if (!responseJson.success) {
                this._recordError(responseJson.error || "舰队指令回执失败");
            }
        } catch (error) {
            this._recordError("" + error);
        } finally {
            this._acking = false;
        }
    },

    _isLocalEligible: function () {
        var shipType = EVEQuantumFAX.configManager.normalizeShipType(EVEQuantumFAX.config.shipType);
        return this.ELIGIBLE_SHIP_TYPES[shipType] === true;
    },

    _getTimeoutMs: function () {
        if (EVEQuantumFAX.configManager && EVEQuantumFAX.configManager.getFleetReportTimeoutMs) {
            return EVEQuantumFAX.configManager.getFleetReportTimeoutMs();
        }
        return this.COMMAND_TIMEOUT_MS;
    },

    _recordError: function (message) {
        var now = new Date().getTime();
        this._backoffUntil = now + this.POLL_INTERVAL_MS;
        if (this.shouldLogError(message)) {
            logw("[FleetCommandCenter] " + message);
        }
        return { ok: false, skipped: false, error: message };
    },

    shouldLogError: function (message) {
        var now = new Date().getTime();
        if (message !== this._lastLoggedError || now - this._lastLoggedAt > 30000) {
            this._lastLoggedError = message;
            this._lastLoggedAt = now;
            return true;
        }
        return false;
    }
};
