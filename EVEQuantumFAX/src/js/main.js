require("js/core/state.js");
require("js/core/runtime.js");
require("js/core/utils.js");
require("js/core/config.js");
require("js/services/perfStats.js");
require("js/services/logger.js");
require("js/core/hotupdateConfig.js");
require("js/services/updater.js");
require("js/constants/healthMonitorColors.js");
require("js/services/healthMonitor.js");
require("js/services/fleetReporter.js");
require("js/services/clientLogReporter.js");
require("js/services/perfReporter.js");
require("js/services/permissionManager.js");
require("js/core/hooks.js");
require("js/services/demoTask.js");
require("js/ui/xmlLayouts.js");
require("js/ui/floatWindow.js");
require("js/ui/entryScreen.js");
require("js/controller/appController.js");

setStopCallback(function () {
    logd("========== EVEQuantumFAX stop ==========");

    try {
        EVEQuantumFAX.demoTask.stop();
    } catch (error) {
        logw("demoTask.stop failed: " + error);
    }

    try {
        if (EVEQuantumFAX.clientLogReporter) {
            EVEQuantumFAX.clientLogReporter.flush(true);
        }
    } catch (flushError) {
        logw("clientLogReporter.flush failed: " + flushError);
    }

    try {
        if (EVEQuantumFAX.perfStats) {
            EVEQuantumFAX.perfStats.flush();
        }
        if (EVEQuantumFAX.perfReporter) {
            EVEQuantumFAX.perfReporter.flush(true);
        }
    } catch (perfFlushError) {
        logw("perfReporter.flush failed: " + perfFlushError);
    }

    try {
        if (EVEQuantumFAX.fleetReporter) {
            EVEQuantumFAX.fleetReporter.flush(true);
        }
    } catch (fleetFlushError) {
        logw("fleetReporter.flush failed: " + fleetFlushError);
    }

    try {
        if (EVEQuantumFAX.healthMonitor) {
            EVEQuantumFAX.healthMonitor.releaseResources();
        }
    } catch (resourceError) {
        logw("healthMonitor.releaseResources failed: " + resourceError);
    }

    try {
        EVEQuantumFAX.ui.closeAll();
    } catch (error2) {
        logw("ui.closeAll failed: " + error2);
    }
});

function main() {
    logd("========== EVEQuantumFAX start ==========");

    EVEQuantumFAX.utils.initScreen();
    EVEQuantumFAX.configManager.load();
    EVEQuantumFAX.ui.closeAll();

    EVEQuantumFAX.logger.info("QuantumFAX 启动完成");
    EVEQuantumFAX.logger.info("屏幕尺寸：" + EVEQuantumFAX.screen.width + "x" + EVEQuantumFAX.screen.height);

    if (EVEQuantumFAX.hotupdate.updater.checkAndApplyUpdate("程序启动")) {
        return;
    }

    EVEQuantumFAX.entryScreen.show();
    EVEQuantumFAX.entryScreen.refreshVersionInfoAsync();

    if (EVEQuantumFAX.permissions.hasFloatPermission()) {
        EVEQuantumFAX.entryScreen.startFloatingControls("程序启动");
    } else {
        EVEQuantumFAX.logger.warn("等待用户在入口界面授予悬浮窗权限");
    }

    while (!isScriptExit()) {
        EVEQuantumFAX.entryScreen.refreshPermissionInfo();
        if (EVEQuantumFAX.state.miniView) {
            EVEQuantumFAX.ui.syncOrientation();
        }
        sleep(1000);
    }
}

function safeMain() {
    try {
        main();
    } catch (error) {
        loge("========== EVEQuantumFAX crash ==========");
        loge("Error: " + error);
        if (error && error.stack) {
            loge(error.stack);
        }

        try {
            if (EVEQuantumFAX.clientLogReporter) {
                EVEQuantumFAX.clientLogReporter.enqueue({
                    time: EVEQuantumFAX.utils.formatTime(new Date()),
                    timestamp: new Date().getTime(),
                    level: "ERROR",
                    message: "QuantumFAX 发生异常：" + error
                });
                if (error && error.stack) {
                    EVEQuantumFAX.clientLogReporter.enqueue({
                        time: EVEQuantumFAX.utils.formatTime(new Date()),
                        timestamp: new Date().getTime(),
                        level: "ERROR",
                        message: error.stack
                    });
                }
                EVEQuantumFAX.clientLogReporter.flush(true);
            }
        } catch (logFlushError) {
            logw("crash log flush failed: " + logFlushError);
        }

        try {
            EVEQuantumFAX.ui.closeAll();
        } catch (cleanupError) {
            logw("Cleanup failed: " + cleanupError);
        }

        EVEQuantumFAX.toast("QuantumFAX 发生异常：" + error);
    }
}

safeMain();
