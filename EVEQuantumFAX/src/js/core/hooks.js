var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.createContext = function (extra) {
    return {
        state: EVEQuantumFAX.state,
        config: EVEQuantumFAX.config,
        logger: EVEQuantumFAX.logger,
        ui: EVEQuantumFAX.ui,
        storage: EVEQuantumFAX.storage,
        utils: EVEQuantumFAX.utils,
        extra: extra || {}
    };
};

EVEQuantumFAX.hooks = {
    _lastHealthStatusSignature: "",
    _lastHealthStatusLogAt: 0,
    _lastHealthErrorSignature: "",
    _lastHealthErrorAt: 0,

    onStart: function (context) {
        context.logger.success("启动钩子已执行");
        EVEQuantumFAX.hooks._flushClientLogs(true);
    },

    onPause: function (context) {
        context.logger.warn("暂停钩子已执行");
        EVEQuantumFAX.hooks._flushClientLogs(true);
    },

    onResume: function (context) {
        context.logger.info("继续钩子已执行");
        EVEQuantumFAX.hooks._flushClientLogs(true);
    },

    onStop: function (context) {
        context.logger.info("停止钩子已执行");
        EVEQuantumFAX.hooks._flushClientLogs(true);
    },

    onExit: function (context) {
        context.logger.info("退出钩子已执行");
        EVEQuantumFAX.hooks._flushClientLogs(true);
    },

    onTick: function (context) {
        var iteration = context.extra.iteration || 0;
        EVEQuantumFAX.hooks._checkDamageControl(context, iteration);
        EVEQuantumFAX.hooks._flushClientLogs(false);
    },

    _checkDamageControl: function (context, iteration) {
        var start = EVEQuantumFAX.perfStats ? EVEQuantumFAX.perfStats.now() : 0;
        var emergencyResult;
        var message;

        if (!EVEQuantumFAX.healthMonitor) {
            context.logger.warn("损控检测服务未加载");
            return;
        }

        emergencyResult = EVEQuantumFAX.healthMonitor.handleShipEmergency();
        if (EVEQuantumFAX.perfStats && start) {
            EVEQuantumFAX.perfStats.recordFrom("health.emergency", start, "iteration=" + iteration);
        }

        if (!emergencyResult.ok) {
            message = "舰船应急检测 #" + iteration + "失败：" + emergencyResult.error;
            if (this._shouldLogHealthError(message)) {
                context.logger.warn(message);
                EVEQuantumFAX.toast(message);
            }
            return;
        }

        EVEQuantumFAX.hooks._reportFleetHealth(context, emergencyResult);

        if (emergencyResult.activated) {
            message = "舰船应急 #" + iteration + "：已开启损控（" + emergencyResult.reason + "）";
            context.logger.warn(message);
            EVEQuantumFAX.toast(message);
            return;
        }

        message = "舰船应急 #" + iteration + "：" + emergencyResult.reason +
            "，护盾 " + emergencyResult.shield +
            "，装甲 " + emergencyResult.armor;
        if (this._shouldLogHealthStatus(emergencyResult)) {
            context.logger.info(message);
        }
    },

    _showHealthToast: function (context) {
        if (!EVEQuantumFAX.healthMonitor) {
            context.logger.warn("血量检测服务未加载");
            return;
        }

        EVEQuantumFAX.healthMonitor.showHealthToast();
    },

    _reportFleetHealth: function (context, emergencyResult) {
        var start = EVEQuantumFAX.perfStats ? EVEQuantumFAX.perfStats.now() : 0;
        var reportResult;

        if (!EVEQuantumFAX.fleetReporter) {
            return;
        }

        reportResult = EVEQuantumFAX.fleetReporter.report(emergencyResult, context);
        if (EVEQuantumFAX.perfStats && start) {
            EVEQuantumFAX.perfStats.recordFrom("fleet.schedule", start);
        }
        if (!reportResult.ok && !reportResult.skipped &&
            EVEQuantumFAX.fleetReporter.shouldLogError(reportResult.error)) {
            context.logger.warn("舰队上报失败：" + reportResult.error);
        }
    },

    _flushClientLogs: function (force) {
        var start = EVEQuantumFAX.perfStats ? EVEQuantumFAX.perfStats.now() : 0;
        var result;

        if (!EVEQuantumFAX.clientLogReporter) {
            return;
        }

        result = EVEQuantumFAX.clientLogReporter.flush(force === true);
        if (EVEQuantumFAX.perfStats && start) {
            EVEQuantumFAX.perfStats.recordFrom("logs.schedule", start);
        }
        if (!result.ok && !result.skipped &&
            EVEQuantumFAX.clientLogReporter.shouldLogError(result.error)) {
            logw("客户端日志上报失败：" + result.error);
        }
    },

    _shouldLogHealthStatus: function (emergencyResult) {
        var now = new Date().getTime();
        var intervalMs = EVEQuantumFAX.configManager.getNormalStatusLogIntervalMs();
        var signature = [
            emergencyResult.reason,
            emergencyResult.shield,
            emergencyResult.armor,
            emergencyResult.triggered ? "1" : "0",
            emergencyResult.activated ? "1" : "0"
        ].join("|");

        if (signature !== this._lastHealthStatusSignature ||
            now - this._lastHealthStatusLogAt >= intervalMs) {
            this._lastHealthStatusSignature = signature;
            this._lastHealthStatusLogAt = now;
            return true;
        }

        return false;
    },

    _shouldLogHealthError: function (message) {
        var now = new Date().getTime();
        if (message !== this._lastHealthErrorSignature || now - this._lastHealthErrorAt >= 10000) {
            this._lastHealthErrorSignature = message;
            this._lastHealthErrorAt = now;
            return true;
        }
        return false;
    }
};
