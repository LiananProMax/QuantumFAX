var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.demoTask = {
    start: function (runToken) {
        var state = EVEQuantumFAX.state;
        var iteration = 0;

        while (state.isRunning && state.runToken === runToken && !isScriptExit()) {
            var tickStart;

            if (state.isPaused) {
                sleep(250);
                continue;
            }

            iteration += 1;
            tickStart = EVEQuantumFAX.perfStats ? EVEQuantumFAX.perfStats.now() : 0;

            try {
                EVEQuantumFAX.hooks.onTick(EVEQuantumFAX.createContext({
                    iteration: iteration,
                    runToken: runToken
                }));
            } catch (error) {
                EVEQuantumFAX.logger.error("主循环钩子执行失败：" + error);
            } finally {
                if (EVEQuantumFAX.perfStats && tickStart) {
                    EVEQuantumFAX.perfStats.recordFrom(
                        "tick",
                        tickStart,
                        "iteration=" + iteration,
                        EVEQuantumFAX.perfStats.getSlowTickThresholdMs()
                    );
                }
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
