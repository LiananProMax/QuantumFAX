var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.demoTask = {
    start: function (runToken) {
        var state = EVEQuantumFAX.state;
        var iteration = 0;

        while (state.isRunning && state.runToken === runToken && !isScriptExit()) {
            if (state.isPaused) {
                sleep(250);
                continue;
            }

            iteration += 1;

            try {
                EVEQuantumFAX.hooks.onTick(EVEQuantumFAX.createContext({
                    iteration: iteration,
                    runToken: runToken
                }));
            } catch (error) {
                EVEQuantumFAX.logger.error("主循环钩子执行失败：" + error);
            }

            sleep(EVEQuantumFAX.configManager.getTickIntervalMs());
        }

        if (state.runToken === runToken) {
            state.workerThread = null;
        }
    },

    stop: function () {
        var state = EVEQuantumFAX.state;
        state.runToken += 1;

        if (state.workerThread) {
            try {
                thread.cancelThread(state.workerThread);
            } catch (error) {
                logw("cancelThread failed: " + error);
            }
        }

        state.workerThread = null;
    }
};
