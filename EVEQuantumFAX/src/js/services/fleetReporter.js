var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.fleetReporter = {
    REPORT_TIMEOUT_MS: 5000,
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
        var responseText;
        var responseJson;

        if (!healthResult || !healthResult.ok) {
            return { ok: false, skipped: true, error: "血量检测失败，跳过上报" };
        }
        if (!url) {
            return { ok: false, skipped: true, error: "未配置舰队后端地址" };
        }

        payload = this.buildPayload(healthResult, context);
        try {
            responseText = http.postJSON(url, payload, this.REPORT_TIMEOUT_MS, {
                "Content-Type": "application/json"
            });
            if (!responseText) {
                return this._recordError("舰队上报无响应");
            }

            responseJson = JSON.parse(responseText);
            if (!responseJson.success) {
                return this._recordError(responseJson.error || "舰队上报失败");
            }

            this._lastError = "";
            return { ok: true };
        } catch (error) {
            return this._recordError("" + error);
        }
    },

    _recordError: function (message) {
        this._lastError = message;
        this._lastErrorAt = new Date().getTime();
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
