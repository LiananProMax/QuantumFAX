var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.perfStats = {
    _metrics: {},
    _lastSummaryAt: 0,
    _lastSlowLogAt: {},
    _slowEvents: [],
    _exclusions: [],
    MAX_SLOW_EVENTS: 50,

    now: function () {
        return new Date().getTime();
    },

    isEnabled: function () {
        var config = EVEQuantumFAX.config || {};
        return config.perfLogEnabled !== false;
    },

    record: function (name, elapsedMs, detail, slowThresholdMs) {
        var metric;
        var now;
        var threshold;
        var lastSlowAt;

        if (!this.isEnabled() || elapsedMs == null) {
            return;
        }

        metric = this._metrics[name];
        if (!metric) {
            metric = {
                count: 0,
                totalMs: 0,
                maxMs: 0,
                slowCount: 0
            };
            this._metrics[name] = metric;
        }

        metric.count += 1;
        metric.totalMs += elapsedMs;
        metric.maxMs = Math.max(metric.maxMs, elapsedMs);

        threshold = slowThresholdMs || this._getSlowOperationThresholdMs();
        if (elapsedMs >= threshold) {
            metric.slowCount += 1;
            now = this.now();
            lastSlowAt = this._lastSlowLogAt[name] || 0;
            if (now - lastSlowAt >= 10000) {
                this._lastSlowLogAt[name] = now;
                logd("[Perf] slow " + name + "=" + elapsedMs + "ms" + (detail ? " " + detail : ""));
            }
            this._recordSlowEvent(name, elapsedMs, detail, now);
        }

        this._summarizeIfDue();
    },

    recordFrom: function (name, startMs, detail, slowThresholdMs) {
        var endMs = this.now();
        var elapsedMs = Math.max(0, endMs - startMs - this._getExcludedMs(startMs, endMs));
        this.record(name, elapsedMs, detail, slowThresholdMs);
    },

    excludeFrom: function (name, startMs) {
        var endMs = this.now();

        if (!this.isEnabled() || !startMs || endMs <= startMs) {
            return;
        }

        this._exclusions.push({
            name: name || "excluded",
            startMs: startMs,
            endMs: endMs
        });
        this._trimExclusions(endMs);
    },

    flush: function () {
        var now = this.now();
        this._enqueueRemoteSummary(now);
        this._metrics = {};
        this._lastSummaryAt = now;
    },

    _summarizeIfDue: function () {
        var now = this.now();
        var intervalMs = this._getSummaryIntervalMs();
        var parts = [];
        var name;
        var metric;

        if (intervalMs <= 0) {
            return;
        }

        if (!this._lastSummaryAt) {
            this._lastSummaryAt = now;
            return;
        }

        if (now - this._lastSummaryAt < intervalMs) {
            return;
        }

        for (name in this._metrics) {
            if (this._metrics.hasOwnProperty(name)) {
                metric = this._metrics[name];
                if (metric.count > 0) {
                    parts.push(name + " avg=" + Math.round(metric.totalMs / metric.count) +
                        "ms max=" + metric.maxMs + "ms count=" + metric.count +
                        (metric.slowCount ? " slow=" + metric.slowCount : ""));
                }
            }
        }

        if (parts.length > 0) {
            logd("[Perf] " + parts.join(" | "));
            this._enqueueRemoteSummary(now);
        }

        this._metrics = {};
        this._lastSummaryAt = now;
        this._trimExclusions(now);
    },

    _getExcludedMs: function (startMs, endMs) {
        var totalMs = 0;
        var i;
        var exclusion;
        var overlapStart;
        var overlapEnd;

        for (i = 0; i < this._exclusions.length; i++) {
            exclusion = this._exclusions[i];
            overlapStart = Math.max(startMs, exclusion.startMs);
            overlapEnd = Math.min(endMs, exclusion.endMs);
            if (overlapEnd > overlapStart) {
                totalMs += overlapEnd - overlapStart;
            }
        }

        return totalMs;
    },

    _trimExclusions: function (now) {
        var cutoff = now - 120000;
        var items = [];
        var i;

        for (i = 0; i < this._exclusions.length; i++) {
            if (this._exclusions[i].endMs >= cutoff) {
                items.push(this._exclusions[i]);
            }
        }

        this._exclusions = items;
    },

    _recordSlowEvent: function (name, elapsedMs, detail, now) {
        this._slowEvents.push({
            name: name,
            elapsedMs: elapsedMs,
            detail: detail || "",
            occurredAt: now || this.now()
        });

        if (this._slowEvents.length > this.MAX_SLOW_EVENTS) {
            this._slowEvents = this._slowEvents.slice(this._slowEvents.length - this.MAX_SLOW_EVENTS);
        }
    },

    _enqueueRemoteSummary: function (now) {
        var metrics = [];
        var slowEvents = this._slowEvents;
        var name;
        var metric;

        if (!EVEQuantumFAX.perfReporter || !EVEQuantumFAX.perfReporter.enqueue) {
            return;
        }

        for (name in this._metrics) {
            if (this._metrics.hasOwnProperty(name)) {
                metric = this._metrics[name];
                if (metric.count > 0) {
                    metrics.push({
                        name: name,
                        count: metric.count,
                        totalMs: metric.totalMs,
                        avgMs: Math.round(metric.totalMs / metric.count),
                        maxMs: metric.maxMs,
                        slowCount: metric.slowCount
                    });
                }
            }
        }

        if (metrics.length === 0 && slowEvents.length === 0) {
            return;
        }

        EVEQuantumFAX.perfReporter.enqueue({
            collectedAt: now,
            intervalMs: this._getSummaryIntervalMs(),
            metrics: metrics,
            slowEvents: slowEvents
        });
        this._slowEvents = [];
        EVEQuantumFAX.perfReporter.flush(false);
    },

    _getSlowOperationThresholdMs: function () {
        var config = EVEQuantumFAX.config || {};
        var utils = EVEQuantumFAX.utils;
        if (utils && utils.parsePositiveInt) {
            return utils.parsePositiveInt(config.slowOperationThresholdMs, 800);
        }
        return 800;
    },

    getSlowTickThresholdMs: function () {
        var config = EVEQuantumFAX.config || {};
        var utils = EVEQuantumFAX.utils;
        if (utils && utils.parsePositiveInt) {
            return utils.parsePositiveInt(config.slowTickThresholdMs, 1500);
        }
        return 1500;
    },

    _getSummaryIntervalMs: function () {
        var config = EVEQuantumFAX.config || {};
        var utils = EVEQuantumFAX.utils;
        if (utils && utils.parsePositiveInt) {
            return utils.parsePositiveInt(config.perfSummaryIntervalSec, 60) * 1000;
        }
        return 60000;
    }
};
