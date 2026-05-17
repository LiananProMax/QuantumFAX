var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.clientLogReporter = {
    REPORT_TIMEOUT_MS: 5000,
    MAX_QUEUE_SIZE: 200,
    BATCH_SIZE: 20,
    FLUSH_INTERVAL_MS: 5000,
    FORCE_BATCH_LIMIT: 5,
    _queue: [],
    _lastFlushAt: 0,
    _flushing: false,
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
        return String(serverUrl).replace(/\/$/, "") + "/api/fleet/logs";
    },

    enqueue: function (entry) {
        var item;

        if (!entry || !entry.message) {
            return;
        }

        item = {
            time: String(entry.time || ""),
            timestamp: entry.timestamp || new Date().getTime(),
            level: String(entry.level || "INFO"),
            message: String(entry.message)
        };

        this._queue.push(item);
        if (this._queue.length > this.MAX_QUEUE_SIZE) {
            this._queue = this._queue.slice(this._queue.length - this.MAX_QUEUE_SIZE);
        }
    },

    flush: function (force) {
        var sentBatches = 0;
        var result;

        if (this._flushing || this._queue.length === 0) {
            return { ok: true, skipped: true };
        }

        this._flushing = true;
        try {
            do {
                result = this._flushOnce(force === true);
                if (!result.ok) {
                    return result;
                }
                sentBatches += 1;
            } while (force === true && this._queue.length > 0 && sentBatches < this.FORCE_BATCH_LIMIT);

            return { ok: true, sentBatches: sentBatches };
        } finally {
            this._flushing = false;
        }
    },

    _flushOnce: function (force) {
        var now = new Date().getTime();
        var url;
        var batch;
        var payload;
        var responseText;
        var responseJson;

        if (this._queue.length === 0) {
            return { ok: true, skipped: true };
        }
        if (!force && now - this._lastFlushAt < this.FLUSH_INTERVAL_MS) {
            return { ok: true, skipped: true };
        }

        url = this.getReportUrl();
        if (!url) {
            return { ok: false, skipped: true, error: "未配置客户端日志后端地址" };
        }

        batch = this._queue.slice(0, this.BATCH_SIZE);
        payload = {
            clientId: EVEQuantumFAX.configManager.ensureClientId(),
            shipType: EVEQuantumFAX.configManager.normalizeShipType(EVEQuantumFAX.config.shipType),
            shipName: EVEQuantumFAX.configManager.getShipTypeLabel(EVEQuantumFAX.config.shipType),
            sentAt: now,
            logs: batch
        };

        try {
            responseText = http.postJSON(url, payload, this.REPORT_TIMEOUT_MS, {
                "Content-Type": "application/json"
            });
            if (!responseText) {
                return this._recordError("客户端日志上报无响应");
            }

            responseJson = JSON.parse(responseText);
            if (!responseJson.success) {
                return this._recordError(responseJson.error || "客户端日志上报失败");
            }

            this._queue.splice(0, batch.length);
            this._lastFlushAt = now;
            return { ok: true, sent: batch.length };
        } catch (error) {
            return this._recordError("" + error);
        }
    },

    _recordError: function (message) {
        this._lastFlushAt = new Date().getTime();
        if (this.shouldLogError(message)) {
            logw("[ClientLogReporter] " + message);
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
