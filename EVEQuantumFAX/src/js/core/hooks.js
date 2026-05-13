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
        context.logger.success("Default onStart hook executed");
    },

    onPause: function (context) {
        context.logger.warn("Default onPause hook executed");
    },

    onResume: function (context) {
        context.logger.info("Default onResume hook executed");
    },

    onStop: function (context) {
        context.logger.info("Default onStop hook executed");
    },

    onExit: function (context) {
        context.logger.info("Default onExit hook executed");
    },

    onTick: function (context) {
        var iteration = context.extra.iteration || 0;
        context.logger.info(context.config.demoMessage + " #" + iteration);
    }
};
