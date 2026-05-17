var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.entryScreen = {
    LAYOUT_NAME: "QuantumFAX",
    permissionFlowRunning: false,
    versionCheckRunning: false,
    model: {
        permissionSummary: "正在检查权限...",
        floatPermission: "未知",
        accessibilityPermission: "未知",
        permissionFlowStatus: "点击按钮开始授权流程",
        grantButtonText: "授予/检查权限",
        currentVersion: "未知",
        latestVersion: "等待检查",
        updateServer: "",
        fleetServer: ""
    },

    show: function () {
        var self = this;

        if (!this._hasNativeUi()) {
            logw("[Entry] UI 环境不可用，跳过入口界面");
            return false;
        }

        this._syncModel();

        this._runOnUi(function () {
            try {
                if (self._hasEntryLayout()) {
                    logd("[Entry] 复用已存在的入口界面");
                    self.bindEvents();
                    self._updatePermissionViews();
                    self._updateVersionViews();
                    return;
                }

                if (!ui.layout(self.LAYOUT_NAME, EVEQuantumFAX.xmlLayouts.createEntryXml(self.model))) {
                    logw("[Entry] 渲染入口界面失败");
                    return;
                }
                self.bindEvents();
            } catch (error) {
                logw("[Entry] 渲染入口界面异常: " + error);
            }
        });

        return true;
    },

    bindEvents: function () {
        var self = this;
        var grantButton;
        var refreshButton;

        if (!this._hasNativeUi()) {
            return;
        }

        try {
            grantButton = this._findEntryViewByTag("btnGrantPermissions") || "btnGrantPermissions";
            refreshButton = this._findEntryViewByTag("btnRefreshVersion") || "btnRefreshVersion";

            ui.setEvent(grantButton, "click", function () {
                self.startPermissionFlow();
            });
            ui.setEvent(refreshButton, "click", function () {
                self.refreshVersionInfoAsync();
            });
        } catch (error) {
            logw("[Entry] 绑定入口界面事件失败: " + error);
        }
    },

    refreshPermissionInfo: function () {
        var status = EVEQuantumFAX.permissions.getStatus();

        this.model.floatPermission = status.floatReady ? "已授权" : "未授权";
        this.model.accessibilityPermission = status.accessibilityReady ? "已开启" : "未开启";
        this.model.permissionSummary = status.allReady ?
            "权限已就绪，可以启动主循环" :
            "仍需授权：" + status.missingLabels.join("、");
        this.model.grantButtonText = status.allReady ? "重新检查权限" : "授予/检查权限";

        this._updatePermissionViews();
        return status;
    },

    refreshServerInfo: function () {
        var hotupdateConfig = EVEQuantumFAX.hotupdate && EVEQuantumFAX.hotupdate.config;

        this.model.updateServer = hotupdateConfig && hotupdateConfig.serverUrl ?
            hotupdateConfig.serverUrl :
            "未配置";
        this.model.fleetServer = EVEQuantumFAX.config && EVEQuantumFAX.config.fleetServerUrl ?
            EVEQuantumFAX.config.fleetServerUrl :
            "未配置";

        this._setTextOnUi("tvUpdateServer", this.model.updateServer);
        this._setTextOnUi("tvFleetServer", this.model.fleetServer);
    },

    refreshVersionInfoAsync: function () {
        var self = this;
        var task;

        if (this.versionCheckRunning) {
            return;
        }

        this.versionCheckRunning = true;
        this._syncCurrentVersion();
        this.model.latestVersion = "检查中...";
        this._updateVersionViews();

        task = thread.execAsync(function () {
            var latestInfo;
            var text;

            try {
                latestInfo = EVEQuantumFAX.hotupdate.updater.fetchLatestVersionInfo();
                text = self._formatLatestVersion(latestInfo);
            } catch (error) {
                text = "检查失败：" + error;
            }

            self.versionCheckRunning = false;
            self._runOnUi(function () {
                self.model.latestVersion = text;
                self.refreshServerInfo();
                self._updateVersionViews();
            });
        });

        if (!task) {
            this.versionCheckRunning = false;
            try {
                this.model.latestVersion = this._formatLatestVersion(EVEQuantumFAX.hotupdate.updater.fetchLatestVersionInfo());
            } catch (error2) {
                this.model.latestVersion = "检查失败：" + error2;
            }
            this._updateVersionViews();
        }
    },

    startPermissionFlow: function () {
        var self = this;
        var task;

        if (this.permissionFlowRunning) {
            this._setFlowStatus("权限流程正在进行中...");
            return;
        }

        this.permissionFlowRunning = true;
        this._setFlowStatus("正在打开授权流程，请按系统提示操作");

        task = thread.execAsync(function () {
            var floatReady = false;
            var accessibilityReady = false;
            var errorText = "";

            try {
                self._setFlowStatus("正在请求悬浮窗权限...");
                floatReady = EVEQuantumFAX.permissions.ensureFloatPermission("入口界面");
                self._setFlowStatus("正在检查无障碍服务权限...");
                accessibilityReady = EVEQuantumFAX.permissions.ensureAccessibilityPermission("入口界面");
            } catch (error) {
                errorText = String(error);
                logw("[Entry] 权限流程异常: " + errorText);
            }

            self.permissionFlowRunning = false;
            self._runOnUi(function () {
                self._finishPermissionFlow(floatReady, accessibilityReady, errorText);
            });
        });

        if (!task) {
            this.permissionFlowRunning = false;
            this._setFlowStatus("启动授权线程失败，请重试");
        }
    },

    startFloatingControls: function (stageName) {
        if (!floaty.hasFloatViewPermission()) {
            this._setFlowStatus("悬浮窗权限未授权，无法显示悬浮控制台");
            return false;
        }

        if (!EVEQuantumFAX.state.miniView) {
            EVEQuantumFAX.ui.showMiniFloat();
            EVEQuantumFAX.logger.success("迷你悬浮窗已就绪：" + (stageName || "入口界面"));
            EVEQuantumFAX.toast(EVEQuantumFAX.appInfo.title + "已就绪");
        }

        return true;
    },

    _finishPermissionFlow: function (floatReady, accessibilityReady, errorText) {
        this.refreshPermissionInfo();

        if (errorText) {
            this._setFlowStatus("授权流程异常：" + errorText);
            return;
        }

        if (floatReady) {
            this.startFloatingControls("入口界面");
        }

        if (floatReady && accessibilityReady) {
            this._setFlowStatus("权限已就绪，悬浮控制台可用");
            return;
        }

        if (floatReady) {
            this._setFlowStatus("悬浮窗已就绪；无障碍未开启，启动主循环前仍需开启");
            return;
        }

        this._setFlowStatus("权限未完成，请按提示授权后重试");
    },

    _syncModel: function () {
        this.refreshPermissionInfo();
        this.refreshServerInfo();
        this._syncCurrentVersion();
    },

    _syncCurrentVersion: function () {
        var debugInfo;
        var suffix = "";

        try {
            debugInfo = EVEQuantumFAX.hotupdate.updater.getDebugInfo();
            if (debugInfo.isLocalDebug) {
                suffix = "（本地调试）";
            }
            this.model.currentVersion = "v" + debugInfo.currentVersion + suffix;
        } catch (error) {
            this.model.currentVersion = "未知";
        }

        this._setTextOnUi("tvCurrentVersion", this.model.currentVersion);
    },

    _formatLatestVersion: function (info) {
        var currentVersion;
        var latestVersion;
        var text;

        if (!info || !info.success) {
            return info && info.error ? "无法获取：" + info.error : "无法获取";
        }

        currentVersion = EVEQuantumFAX.hotupdate.updater.getCurrentVersion();
        latestVersion = parseInt(info.version, 10) || 0;
        text = "v" + (info.versionName || info.version || "未知");

        if (latestVersion > 0) {
            text += "（版本号 " + latestVersion + "）";
        }
        if (latestVersion > currentVersion) {
            text += "，可更新";
        } else if (latestVersion > 0) {
            text += "，当前已是最新";
        }
        if (info.msg) {
            text += "\n" + info.msg;
        }
        if (info.updatedAt) {
            text += "\n更新时间：" + this._formatDateTime(info.updatedAt);
        }

        return text;
    },

    _formatDateTime: function (value) {
        var date = new Date(value);

        if (isNaN(date.getTime())) {
            return String(value || "");
        }

        function pad(number) {
            return number < 10 ? "0" + number : "" + number;
        }

        return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + " " +
            pad(date.getHours()) + ":" + pad(date.getMinutes());
    },

    _updatePermissionViews: function () {
        this._setTextOnUi("tvPermissionSummary", this.model.permissionSummary);
        this._setTextOnUi("tvFloatPermission", this.model.floatPermission);
        this._setTextOnUi("tvAccessibilityPermission", this.model.accessibilityPermission);
        this._setTextOnUi("btnGrantPermissions", this.model.grantButtonText);
    },

    _updateVersionViews: function () {
        this._setTextOnUi("tvCurrentVersion", this.model.currentVersion);
        this._setTextOnUi("tvLatestVersion", this.model.latestVersion);
        this._setTextOnUi("tvUpdateServer", this.model.updateServer);
        this._setTextOnUi("tvFleetServer", this.model.fleetServer);
    },

    _setFlowStatus: function (text) {
        this.model.permissionFlowStatus = text;
        this._setTextOnUi("tvPermissionFlowStatus", text);
    },

    _setTextOnUi: function (tag, text) {
        var self = this;
        var value = String(text == null ? "" : text);

        if (!this._hasNativeUi()) {
            return;
        }

        this._runOnUi(function () {
            var view;
            var updated = false;

            try {
                if (typeof ui.setViewValue === "function") {
                    updated = ui.setViewValue(tag, value) === true;
                    if (updated) {
                        return;
                    }
                }

                view = ui.findViewByTag(tag);
                if (!view) {
                    view = self._findEntryViewByTag(tag);
                }
                if (view && view.setText) {
                    view.setText(value);
                }
            } catch (error) {
                logw("[Entry] 更新视图失败 " + tag + ": " + error);
            }
        });
    },

    _runOnUi: function (callback) {
        if (!this._hasNativeUi()) {
            callback();
            return;
        }

        try {
            if (typeof ui.run === "function") {
                ui.run(0, callback);
                return;
            }
        } catch (error) {
            logw("[Entry] 切换 UI 线程失败: " + error);
        }

        callback();
    },

    _hasEntryLayout: function () {
        if (!this._hasNativeUi()) {
            return false;
        }

        try {
            return !!(this._findEntryViewByTag("entryRoot") || this._findEntryViewByTag("tvPermissionSummary"));
        } catch (error) {
            logw("[Entry] 检查入口界面失败: " + error);
            return false;
        }
    },

    _findEntryViewByTag: function (tag) {
        var view;
        var roots;
        var i;

        if (!this._hasNativeUi()) {
            return null;
        }

        try {
            view = ui.findViewByTag(tag);
            if (view) {
                return view;
            }
        } catch (error1) {}

        try {
            if (typeof ui.getRootView !== "function") {
                return null;
            }

            roots = ui.getRootView();
            if (!roots || roots.length === 0) {
                return null;
            }

            for (i = 0; i < roots.length; i++) {
                view = this._findViewInTree(roots[i], tag);
                if (view) {
                    return view;
                }
            }
        } catch (error2) {
            logw("[Entry] 扫描入口界面失败 " + tag + ": " + error2);
        }

        return null;
    },

    _findViewInTree: function (root, tag) {
        var childCount;
        var i;
        var child;
        var found;
        var currentTag;

        if (!root) {
            return null;
        }

        try {
            if (root.findViewWithTag) {
                found = root.findViewWithTag(tag);
                if (found) {
                    return found;
                }
            }
        } catch (error1) {}

        try {
            if (root.getTag) {
                currentTag = root.getTag();
                if (currentTag != null && String(currentTag) === tag) {
                    return root;
                }
            }
        } catch (error2) {}

        try {
            if (!root.getChildCount || !root.getChildAt) {
                return null;
            }

            childCount = root.getChildCount();
            for (i = 0; i < childCount; i++) {
                child = root.getChildAt(i);
                found = this._findViewInTree(child, tag);
                if (found) {
                    return found;
                }
            }
        } catch (error3) {}

        return null;
    },

    _hasNativeUi: function () {
        return typeof ui !== "undefined" && ui && typeof ui.layout === "function";
    }
};
