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
    _acking: false,
    _lastLoggedError: "",
    _lastLoggedAt: 0,

    getCommandUrl: function () {
        return this._getFleetUrl("/api/fleet/remote-damage-control/command");
    },

    getAckUrl: function () {
        return this._getFleetUrl("/api/fleet/remote-damage-control/ack");
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

        if (!this._isLocalEligible()) {
            this._lastCommand = null;
            return { ok: true, skipped: true };
        }
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

        if (!command || command.type !== "activate_remote_damage_control") {
            return { ok: true, skipped: true };
        }
        if (command.clientId !== EVEQuantumFAX.configManager.ensureClientId()) {
            return { ok: true, skipped: true };
        }
        if (command.commandId === this._lastHandledCommandId) {
            return { ok: true, skipped: true };
        }
        if (Number(command.commandExpiresAt || command.activeUntil || 0) <= now) {
            return { ok: true, skipped: true, expired: true };
        }

        this._lastHandledCommandId = command.commandId;
        result = this._activateRemoteDamageControl();
        activated = result && result.activated === true;
        reason = (result && (result.reason || result.error)) || (activated ? "已开启" : "不可开启");
        this._ack(command, activated, reason);

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

    _ack: function (command, activated, reason) {
        var url = this.getAckUrl();
        var workerThread;

        if (!url || !command || this._acking) {
            return;
        }

        this._acking = true;
        try {
            workerThread = thread.execAsync(function () {
                EVEQuantumFAX.fleetCommandCenter._ackWorker(command, activated, reason);
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

    _ackWorker: function (command, activated, reason) {
        var responseText;
        var responseJson;

        try {
            responseText = http.postJSON(this.getAckUrl(), {
                clientId: EVEQuantumFAX.configManager.ensureClientId(),
                shipType: EVEQuantumFAX.configManager.normalizeShipType(EVEQuantumFAX.config.shipType),
                commandId: command.commandId,
                activated: activated === true,
                reason: reason || "",
                resultAt: new Date().getTime()
            }, this._getTimeoutMs(), {
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
