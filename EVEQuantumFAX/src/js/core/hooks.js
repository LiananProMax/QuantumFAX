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
        context.logger.info(EVEQuantumFAX.appInfo.tickMessage + " #" + iteration);
    }
};
