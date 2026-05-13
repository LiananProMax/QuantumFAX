var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.controller = {
    onStartPauseClick: function () {
        var state = EVEQuantumFAX.state;

        if (!state.isRunning) {
            this._doStart();
        } else if (state.isPaused) {
            this._doResume();
        } else {
            this._doPause();
        }
    },

    _doStart: function () {
        var config = EVEQuantumFAX.config;
        var state = EVEQuantumFAX.state;
        var runToken;

        EVEQuantumFAX.ui.savePanelConfig();
        EVEQuantumFAX.demoTask.stop();

        state.isRunning = true;
        state.isPaused = false;
        state.runToken += 1;
        runToken = state.runToken;

        EVEQuantumFAX.logger.info("Start requested");
        this._invokeHook("onStart", { runToken: runToken });

        EVEQuantumFAX.ui.updateMiniStatus("RUN");
        EVEQuantumFAX.ui.updatePanelStatus();
        EVEQuantumFAX.ui.closePanel();

        state.workerThread = thread.execAsync(function () {
            EVEQuantumFAX.demoTask.start(runToken);
        });

        if (!state.workerThread) {
            state.isRunning = false;
            state.isPaused = false;
            EVEQuantumFAX.logger.error("Background worker failed to start");
            EVEQuantumFAX.ui.updateMiniStatus("STOP");
            EVEQuantumFAX.ui.updatePanelStatus();
            toast("Worker start failed");
            return;
        }

        toast(config.projectTitle + " started");
    },

    _doPause: function () {
        var state = EVEQuantumFAX.state;

        state.isPaused = true;
        EVEQuantumFAX.logger.warn("Pause requested");
        this._invokeHook("onPause");
        EVEQuantumFAX.ui.updateMiniStatus("PAUSE");
        EVEQuantumFAX.ui.updatePanelStatus();
        EVEQuantumFAX.ui.refreshPanel();
        toast("Paused");
    },

    _doResume: function () {
        var state = EVEQuantumFAX.state;

        state.isPaused = false;
        EVEQuantumFAX.logger.info("Resume requested");
        this._invokeHook("onResume");
        EVEQuantumFAX.ui.updateMiniStatus("RUN");
        EVEQuantumFAX.ui.updatePanelStatus();
        EVEQuantumFAX.ui.refreshPanel();
        toast("Resumed");
    },

    onStopClick: function () {
        var state = EVEQuantumFAX.state;

        if (!state.isRunning && !state.isPaused) {
            EVEQuantumFAX.ui.updateMiniStatus("STOP");
            EVEQuantumFAX.ui.updatePanelStatus();
            return;
        }

        EVEQuantumFAX.demoTask.stop();
        state.isRunning = false;
        state.isPaused = false;

        EVEQuantumFAX.logger.info("Stop requested");
        this._invokeHook("onStop");

        EVEQuantumFAX.ui.updateMiniStatus("STOP");
        EVEQuantumFAX.ui.updatePanelStatus();
        EVEQuantumFAX.ui.refreshPanel();
        toast("Stopped");
    },

    exitApp: function () {
        EVEQuantumFAX.logger.info("Exit requested");
        this._invokeHook("onExit");
        this.onStopClick();
        EVEQuantumFAX.ui.closeAll();
        toast("Exiting");
        sleep(300);
        exit();
    },

    _invokeHook: function (hookName, extra) {
        var hook;

        try {
            hook = EVEQuantumFAX.hooks[hookName];
            if (typeof hook === "function") {
                hook(EVEQuantumFAX.createContext(extra));
            }
        } catch (error) {
            EVEQuantumFAX.logger.error(hookName + " failed: " + error);
        }
    }
};
