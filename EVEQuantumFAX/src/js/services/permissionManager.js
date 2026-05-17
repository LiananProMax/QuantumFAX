var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.permissions = {
    FLOAT_PERMISSION_TIMEOUT_MS: 10000,
    ACCESSIBILITY_PERMISSION_TIMEOUT_MS: 60000,
    PERMISSION_POLL_INTERVAL_MS: 500,

    hasFloatPermission: function () {
        return floaty.hasFloatViewPermission();
    },

    hasAccessibilityPermission: function () {
        return isServiceOk();
    },

    getStatus: function () {
        var floatReady = this.hasFloatPermission();
        var accessibilityReady = this.hasAccessibilityPermission();
        var missingLabels = [];

        if (!floatReady) {
            missingLabels.push("悬浮窗权限");
        }
        if (!accessibilityReady) {
            missingLabels.push("无障碍服务");
        }

        return {
            floatReady: floatReady,
            accessibilityReady: accessibilityReady,
            allReady: floatReady && accessibilityReady,
            missingLabels: missingLabels
        };
    },

    ensureAll: function (stageName) {
        var floatReady = this.ensureFloatPermission(stageName);
        var accessibilityReady = this.ensureAccessibilityPermission(stageName);

        if (floatReady && accessibilityReady) {
            EVEQuantumFAX.logger.success("权限检查通过：" + stageName);
            return true;
        }

        EVEQuantumFAX.logger.error("权限检查未通过：" + stageName);
        return false;
    },

    ensureFloatPermission: function (stageName) {
        var hasPermission = this.hasFloatPermission();

        logd("[Permission][" + stageName + "] floaty=" + hasPermission);
        if (hasPermission) {
            return true;
        }

        EVEQuantumFAX.logger.warn("未授予悬浮窗权限，正在请求权限");
        EVEQuantumFAX.toast("请授予悬浮窗权限");
        hasPermission = floaty.requestFloatViewPermission(this.FLOAT_PERMISSION_TIMEOUT_MS);

        logd("[Permission][" + stageName + "] floatyAfterRequest=" + hasPermission);
        if (!hasPermission) {
            EVEQuantumFAX.logger.error("未授予悬浮窗权限");
            EVEQuantumFAX.toast("请授予悬浮窗权限后重试");
            return false;
        }

        EVEQuantumFAX.logger.success("悬浮窗权限已就绪");
        return true;
    },

    ensureAccessibilityPermission: function (stageName) {
        var hasPermission = this.hasAccessibilityPermission();
        var waitedMs = 0;

        logd("[Permission][" + stageName + "] accessibility=" + hasPermission);
        if (hasPermission) {
            return true;
        }

        EVEQuantumFAX.logger.warn("未开启无障碍服务，正在请求权限");
        EVEQuantumFAX.toast("请开启无障碍服务权限");
        startEnv();

        while (!hasPermission && waitedMs < this.ACCESSIBILITY_PERMISSION_TIMEOUT_MS && !isScriptExit()) {
            sleep(this.PERMISSION_POLL_INTERVAL_MS);
            waitedMs += this.PERMISSION_POLL_INTERVAL_MS;
            hasPermission = this.hasAccessibilityPermission();
        }

        logd("[Permission][" + stageName + "] accessibilityAfterRequest=" + hasPermission);
        if (!hasPermission) {
            EVEQuantumFAX.logger.error("未授予无障碍权限");
            EVEQuantumFAX.toast("请授予无障碍权限后重试");
            return false;
        }

        EVEQuantumFAX.logger.success("无障碍权限已就绪");
        return true;
    }
};
