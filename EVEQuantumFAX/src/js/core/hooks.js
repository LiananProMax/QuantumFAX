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
    onStart: function (context) {
        context.logger.success("启动钩子已执行");
    },

    onPause: function (context) {
        context.logger.warn("暂停钩子已执行");
    },

    onResume: function (context) {
        context.logger.info("继续钩子已执行");
    },

    onStop: function (context) {
        context.logger.info("停止钩子已执行");
    },

    onExit: function (context) {
        context.logger.info("退出钩子已执行");
    },

    onTick: function (context) {
        var iteration = context.extra.iteration || 0;
        EVEQuantumFAX.hooks._checkDamageControl(context, iteration);
    },

    _checkDamageControl: function (context, iteration) {
        var emergencyResult;
        var message;

        if (!EVEQuantumFAX.healthMonitor) {
            context.logger.warn("损控检测服务未加载");
            return;
        }

        emergencyResult = EVEQuantumFAX.healthMonitor.handleShipEmergency();
        if (!emergencyResult.ok) {
            message = "舰船应急检测 #" + iteration + "失败：" + emergencyResult.error;
            context.logger.warn(message);
            EVEQuantumFAX.toast(message);
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
        context.logger.info(message);
        EVEQuantumFAX.toast(message);
    },

    _showHealthToast: function (context) {
        if (!EVEQuantumFAX.healthMonitor) {
            context.logger.warn("血量检测服务未加载");
            return;
        }

        EVEQuantumFAX.healthMonitor.showHealthToast();
    },

    _reportFleetHealth: function (context, emergencyResult) {
        var reportResult;

        if (!EVEQuantumFAX.fleetReporter) {
            return;
        }

        reportResult = EVEQuantumFAX.fleetReporter.report(emergencyResult, context);
        if (!reportResult.ok && !reportResult.skipped &&
            EVEQuantumFAX.fleetReporter.shouldLogError(reportResult.error)) {
            context.logger.warn("舰队上报失败：" + reportResult.error);
        }
    }
};
