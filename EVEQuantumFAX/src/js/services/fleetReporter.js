var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.fleetReporter = {
    REPORT_TIMEOUT_MS: 5000,
    _pendingPayload: null,
    _flushing: false,
    _lastSentAt: 0,
    _lastScheduleAt: 0,
    _backoffUntil: 0,
    _lastError: "",
    _lastErrorAt: 0,
    _lastLoggedError: "",
    _lastLoggedAt: 0,

    getReportUrl: function () {
        var config = EVEQuantumFAX.config;
        var serverUrl = config.fleetServerUrl;

        if (!serverUrl && EVEQuantumFAX.hotupdate && EVEQuantumFAX.hotupdate.config) {
            serverUrl = EVEQuantumFAX.hotupdate.config.serverUrl;
        }
        if (!serverUrl) {
            return "";
        }
        return String(serverUrl).replace(/\/$/, "") + "/api/fleet/report";
    },

    buildPayload: function (healthResult, context) {
        var config = EVEQuantumFAX.config;
        var extra = context && context.extra ? context.extra : {};
        var screen = EVEQuantumFAX.screen || {};

        return {
            clientId: EVEQuantumFAX.configManager.ensureClientId(),
            shipType: EVEQuantumFAX.configManager.normalizeShipType(config.shipType),
            observedAt: new Date().getTime(),
            tickIteration: extra.iteration || 0,
            runToken: extra.runToken || 0,
            shieldPercent: healthResult.shieldPercent,
            armorPercent: healthResult.armorPercent,
            shieldLabel: healthResult.shield,
            armorLabel: healthResult.armor,
            emergencyTriggered: healthResult.triggered,
            damageControlActivated: healthResult.activated,
            remoteDamageControlSkill: healthResult.remoteDamageControlSkill || null,
            shieldDropRate: healthResult.shieldDropRate,
            armorDropRate: healthResult.armorDropRate,
            armorDropPercent: healthResult.armorDropPercent,
            reason: healthResult.reason,
            screen: {
                width: screen.width || 0,
                height: screen.height || 0,
                isLandscape: screen.isLandscape === true
            }
        };
    },

    report: function (healthResult, context) {
        var url = this.getReportUrl();
        var payload;

        if (!healthResult || !healthResult.ok) {
            return { ok: false, skipped: true, error: "血量检测失败，跳过上报" };
        }
        if (!url) {
            return { ok: false, skipped: true, error: "未配置舰队后端地址" };
        }

        payload = this.buildPayload(healthResult, context);
        this._pendingPayload = payload;
        return this.flush(false);
    },

    flush: function (force) {
        var now = new Date().getTime();
        var intervalMs = EVEQuantumFAX.configManager.getFleetReportIntervalMs();
        var workerThread;

        if (!this._pendingPayload) {
            return { ok: true, skipped: true };
        }
        if (this._flushing) {
            return { ok: true, skipped: true, pending: true };
        }
        if (force !== true && now - this._lastSentAt < intervalMs) {
            return { ok: true, skipped: true, pending: true };
        }
        if (force !== true && now < this._backoffUntil) {
            return { ok: true, skipped: true, backoff: true };
        }

        this._flushing = true;
        this._lastScheduleAt = now;
        try {
            workerThread = thread.execAsync(function () {
                EVEQuantumFAX.fleetReporter._flushPendingPayload();
            });
            if (!workerThread) {
                this._flushing = false;
                return this._recordError("舰队上报线程启动失败");
            }
            return { ok: true, scheduled: true };
        } catch (error) {
            this._flushing = false;
            return this._recordError("" + error);
        }
    },

    _flushPendingPayload: function () {
        var payload = this._pendingPayload;
        var url = this.getReportUrl();
        var start = EVEQuantumFAX.perfStats ? EVEQuantumFAX.perfStats.now() : 0;
        var responseText;
        var responseJson;

        if (!payload || !url) {
            this._flushing = false;
            return;
        }

        this._pendingPayload = null;
        try {
            responseText = http.postJSON(url, payload, this._getReportTimeoutMs(), {
                "Content-Type": "application/json"
            });
            if (!responseText) {
                this._pendingPayload = this._pendingPayload || payload;
                this._recordError("舰队上报无响应");
                return;
            }

            responseJson = JSON.parse(responseText);
            if (!responseJson.success) {
                this._pendingPayload = this._pendingPayload || payload;
                this._recordError(responseJson.error || "舰队上报失败");
                return;
            }

            this._lastSentAt = new Date().getTime();
            this._backoffUntil = 0;
            this._lastError = "";
        } catch (error) {
            this._pendingPayload = this._pendingPayload || payload;
            this._recordError("" + error);
        } finally {
            if (EVEQuantumFAX.perfStats && start) {
                EVEQuantumFAX.perfStats.recordFrom("fleet.http", start);
            }
            this._flushing = false;
        }
    },

    _getReportTimeoutMs: function () {
        if (EVEQuantumFAX.configManager && EVEQuantumFAX.configManager.getFleetReportTimeoutMs) {
            return EVEQuantumFAX.configManager.getFleetReportTimeoutMs();
        }
        return this.REPORT_TIMEOUT_MS;
    },

    _recordError: function (message) {
        var now = new Date().getTime();
        this._lastError = message;
        this._lastErrorAt = now;
        this._backoffUntil = now + EVEQuantumFAX.configManager.getFleetReportIntervalMs();
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
