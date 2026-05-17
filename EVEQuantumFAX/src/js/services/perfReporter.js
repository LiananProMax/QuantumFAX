var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.perfReporter = {
    REPORT_TIMEOUT_MS: 5000,
    MAX_QUEUE_SIZE: 20,
    BATCH_SIZE: 5,
    _queue: [],
    _flushing: false,
    _backoffUntil: 0,
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
        return String(serverUrl).replace(/\/$/, "") + "/api/fleet/perf";
    },

    enqueue: function (summary) {
        if (!summary || !summary.metrics) {
            return;
        }

        this._queue.push(summary);
        if (this._queue.length > this.MAX_QUEUE_SIZE) {
            this._queue = this._queue.slice(this._queue.length - this.MAX_QUEUE_SIZE);
        }
    },

    flush: function (force) {
        var now = new Date().getTime();
        var workerThread;

        if (this._flushing || this._queue.length === 0) {
            return { ok: true, skipped: true };
        }
        if (!this.getReportUrl()) {
            return { ok: false, skipped: true, error: "未配置性能指标后端地址" };
        }
        if (force !== true && now < this._backoffUntil) {
            return { ok: true, skipped: true, backoff: true };
        }

        this._flushing = true;
        try {
            workerThread = thread.execAsync(function () {
                EVEQuantumFAX.perfReporter._flushWorker(force === true);
            });
            if (!workerThread) {
                this._flushing = false;
                return this._recordError("性能指标上报线程启动失败");
            }
            return { ok: true, scheduled: true };
        } catch (error) {
            this._flushing = false;
            return this._recordError("" + error);
        }
    },

    _flushWorker: function (force) {
        var sentBatches = 0;
        var result;

        try {
            do {
                result = this._flushOnce();
                if (!result.ok || result.skipped) {
                    return;
                }
                sentBatches += 1;
            } while (force === true && this._queue.length > 0 && sentBatches < this.BATCH_SIZE);
        } finally {
            this._flushing = false;
        }
    },

    _flushOnce: function () {
        var url = this.getReportUrl();
        var batch;
        var payload;
        var responseText;
        var responseJson;

        if (this._queue.length === 0) {
            return { ok: true, skipped: true };
        }
        if (!url) {
            return { ok: false, skipped: true, error: "未配置性能指标后端地址" };
        }

        batch = this._queue.slice(0, this.BATCH_SIZE);
        payload = {
            clientId: EVEQuantumFAX.configManager.ensureClientId(),
            shipType: EVEQuantumFAX.configManager.normalizeShipType(EVEQuantumFAX.config.shipType),
            shipName: EVEQuantumFAX.configManager.getShipTypeLabel(EVEQuantumFAX.config.shipType),
            sentAt: new Date().getTime(),
            summaries: batch
        };

        try {
            responseText = http.postJSON(url, payload, this._getReportTimeoutMs(), {
                "Content-Type": "application/json"
            });
            if (!responseText) {
                return this._recordError("性能指标上报无响应");
            }

            responseJson = JSON.parse(responseText);
            if (!responseJson.success) {
                return this._recordError(responseJson.error || "性能指标上报失败");
            }

            this._queue.splice(0, batch.length);
            this._backoffUntil = 0;
            return { ok: true, sent: batch.length };
        } catch (error) {
            return this._recordError("" + error);
        }
    },

    _recordError: function (message) {
        var now = new Date().getTime();
        this._backoffUntil = now + 10000;
        if (this.shouldLogError(message)) {
            logw("[PerfReporter] " + message);
        }
        return { ok: false, skipped: false, error: message };
    },

    _getReportTimeoutMs: function () {
        if (EVEQuantumFAX.configManager && EVEQuantumFAX.configManager.getPerfReportTimeoutMs) {
            return EVEQuantumFAX.configManager.getPerfReportTimeoutMs();
        }
        return this.REPORT_TIMEOUT_MS;
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
