require("js/core/state.js");
require("js/core/runtime.js");
require("js/core/utils.js");
require("js/core/config.js");
require("js/services/logger.js");
require("js/core/hotupdateConfig.js");
require("js/services/updater.js");
require("js/constants/healthMonitorColors.js");
require("js/services/healthMonitor.js");
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
            EVEQuantumFAX.logger.info("暂无可用热更新");
            return false;
        }

        newVersion = updateResult.version;
        currentVersion = debugInfo.currentVersion;
        logd("[Update] server version: " + newVersion + ", current version: " + currentVersion);
        if (newVersion <= currentVersion) {
            EVEQuantumFAX.logger.info("服务端版本未更新，跳过热更新");
            return false;
        }

        EVEQuantumFAX.logger.info("发现热更新：v" + newVersion);
        EVEQuantumFAX.toast("发现更新 v" + newVersion);
        if (EVEQuantumFAX.hotupdate.updater.performUpdate(newVersion)) {
            return true;
        }

        EVEQuantumFAX.logger.warn("热更新失败，继续使用当前版本");
        return false;
    } catch (error) {
        logw("[Update] check failed: " + error);
        EVEQuantumFAX.logger.warn("热更新检查失败：" + error);
        return false;
    }
}

function main() {
    var hasPermission;

    logd("========== EVEQuantumFAX start ==========");

    EVEQuantumFAX.utils.initScreen();
    EVEQuantumFAX.configManager.load();
    EVEQuantumFAX.ui.closeAll();

    EVEQuantumFAX.logger.info("QuantumFAX 启动完成");
    EVEQuantumFAX.logger.info("屏幕尺寸：" + EVEQuantumFAX.screen.width + "x" + EVEQuantumFAX.screen.height);

    if (runHotUpdateCheck()) {
        return;
    }

    hasPermission = floaty.requestFloatViewPermission(10000);
    logd("[Permission] floaty=" + hasPermission);

    if (!hasPermission) {
        EVEQuantumFAX.logger.error("未授予悬浮窗权限");
        EVEQuantumFAX.toast("请授予悬浮窗权限后重试");
        sleep(1500);
        return;
    }

    EVEQuantumFAX.ui.showMiniFloat();
    EVEQuantumFAX.logger.success("迷你悬浮窗已就绪");
    EVEQuantumFAX.toast(EVEQuantumFAX.appInfo.title + "已就绪");

    while (!isScriptExit()) {
        EVEQuantumFAX.ui.syncOrientation();
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

        EVEQuantumFAX.toast("QuantumFAX 发生异常：" + error);
    }
}

safeMain();
