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
        var appInfo = EVEQuantumFAX.appInfo;
        var state = EVEQuantumFAX.state;
        var runToken;

        EVEQuantumFAX.ui.savePanelConfig();
        EVEQuantumFAX.demoTask.stop();

        if (!EVEQuantumFAX.permissions.ensureAccessibilityPermission("主循环启动")) {
            return;
        }

        if (EVEQuantumFAX.hotupdate.updater.checkAndApplyUpdate("主循环启动")) {
            return;
        }

        state.isRunning = true;
        state.isPaused = false;
        state.runToken += 1;
        runToken = state.runToken;

        EVEQuantumFAX.logger.info("已请求启动");
        this._invokeHook("onStart", { runToken: runToken });

        EVEQuantumFAX.ui.updateMiniStatus("运行");
        EVEQuantumFAX.ui.updatePanelStatus();
        EVEQuantumFAX.ui.closePanel();

        state.workerThread = thread.execAsync(function () {
            EVEQuantumFAX.demoTask.start(runToken);
        });

        if (!state.workerThread) {
            state.isRunning = false;
            state.isPaused = false;
            EVEQuantumFAX.logger.error("后台任务启动失败");
            EVEQuantumFAX.ui.updateMiniStatus("停止");
            EVEQuantumFAX.ui.updatePanelStatus();
            EVEQuantumFAX.toast("后台任务启动失败");
            return;
        }

        EVEQuantumFAX.toast(appInfo.title + "已启动");
    },

    _doPause: function () {
        var state = EVEQuantumFAX.state;

        state.isPaused = true;
        EVEQuantumFAX.logger.warn("已请求暂停");
        this._invokeHook("onPause");
        EVEQuantumFAX.ui.updateMiniStatus("暂停");
        EVEQuantumFAX.ui.updatePanelStatus();
        EVEQuantumFAX.ui.refreshPanel();
        EVEQuantumFAX.toast("已暂停");
    },

    _doResume: function () {
        var state = EVEQuantumFAX.state;

        state.isPaused = false;
        EVEQuantumFAX.logger.info("已请求继续");
        this._invokeHook("onResume");
        EVEQuantumFAX.ui.updateMiniStatus("运行");
        EVEQuantumFAX.ui.updatePanelStatus();
        EVEQuantumFAX.ui.refreshPanel();
        EVEQuantumFAX.toast("已继续");
    },

    onStopClick: function () {
        var state = EVEQuantumFAX.state;

        if (!state.isRunning && !state.isPaused) {
            EVEQuantumFAX.ui.updateMiniStatus("停止");
            EVEQuantumFAX.ui.updatePanelStatus();
            return;
        }

        EVEQuantumFAX.demoTask.stop();
        state.isRunning = false;
        state.isPaused = false;

        EVEQuantumFAX.logger.info("已请求停止");
        this._invokeHook("onStop");

        EVEQuantumFAX.ui.updateMiniStatus("停止");
        EVEQuantumFAX.ui.updatePanelStatus();
        EVEQuantumFAX.ui.refreshPanel();
        EVEQuantumFAX.toast("已停止");
    },

    exitApp: function () {
        EVEQuantumFAX.logger.info("已请求退出");
        this._invokeHook("onExit");
        this.onStopClick();
        EVEQuantumFAX.ui.closeAll();
        EVEQuantumFAX.toast("正在退出");
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
            EVEQuantumFAX.logger.error("钩子执行失败：" + hookName + "，" + error);
        }
    }
};
