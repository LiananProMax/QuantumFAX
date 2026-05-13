require("js/core/state.js");
require("js/core/runtime.js");
require("js/core/utils.js");
require("js/core/config.js");
require("js/services/logger.js");
require("js/core/hotupdateConfig.js");
require("js/services/updater.js");
require("js/core/hooks.js");
require("js/services/demoTask.js");
require("js/ui/xmlLayouts.js");
require("js/ui/floatWindow.js");
require("js/controller/appController.js");

setStopCallback(function () {
    logd("========== EVEQuantumFAX stop ==========");

    try {
        EVEQuantumFAX.demoTask.stop();
    } catch (error) {
        logw("demoTask.stop failed: " + error);
    }

    try {
        EVEQuantumFAX.ui.closeAll();
    } catch (error2) {
        logw("ui.closeAll failed: " + error2);
    }
});

function runHotUpdateCheck() {
    var debugInfo;
    var updateResult;
    var newVersion;
    var currentVersion;

    EVEQuantumFAX.hotupdate.configManager.load();

    try {
        debugInfo = EVEQuantumFAX.hotupdate.updater.getDebugInfo();
        logd("[Update] IEC version: " + debugInfo.iecVersion);
        logd("[Update] local version: " + debugInfo.localVersion);
        logd("[Update] current version: " + debugInfo.currentVersion);

        updateResult = EVEQuantumFAX.hotupdate.updater.checkUpdate(true);
        if (!updateResult.hasUpdate) {
            EVEQuantumFAX.logger.info("No hot update available");
            return false;
        }

        newVersion = updateResult.version;
        currentVersion = debugInfo.currentVersion;
        logd("[Update] server version: " + newVersion + ", current version: " + currentVersion);
        if (newVersion <= currentVersion) {
            EVEQuantumFAX.logger.info("Hot update skipped: server version is not newer");
            return false;
        }

        EVEQuantumFAX.logger.info("Hot update found: v" + newVersion);
        toast("Found update v" + newVersion);
        if (EVEQuantumFAX.hotupdate.updater.performUpdate(newVersion)) {
            return true;
        }

        EVEQuantumFAX.logger.warn("Hot update failed, continue current version");
        return false;
    } catch (error) {
        logw("[Update] check failed: " + error);
        EVEQuantumFAX.logger.warn("Hot update check failed: " + error);
        return false;
    }
}

function main() {
    var hasPermission;

    logd("========== EVEQuantumFAX start ==========");

    EVEQuantumFAX.utils.initScreen();
    EVEQuantumFAX.configManager.load();
    EVEQuantumFAX.ui.closeAll();

    EVEQuantumFAX.logger.info("EVEQuantumFAX boot complete");
    EVEQuantumFAX.logger.info("Screen: " + EVEQuantumFAX.screen.width + "x" + EVEQuantumFAX.screen.height);

    if (runHotUpdateCheck()) {
        return;
    }

    hasPermission = floaty.requestFloatViewPermission(10000);
    logd("[Permission] floaty=" + hasPermission);

    if (!hasPermission) {
        EVEQuantumFAX.logger.error("Float window permission was not granted");
        toast("Allow float window permission and retry");
        sleep(1500);
        return;
    }

    EVEQuantumFAX.ui.showMiniFloat();
    EVEQuantumFAX.logger.success("Mini float is ready");
    toast(EVEQuantumFAX.config.projectTitle + " ready");

    while (!isScriptExit()) {
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
            EVEQuantumFAX.ui.closeAll();
        } catch (cleanupError) {
            logw("Cleanup failed: " + cleanupError);
        }

        toast("EVEQuantumFAX crashed: " + error);
    }
}

safeMain();
