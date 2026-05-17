/**
 * EVEQuantumFAX hot update module.
 * Uses storages to remember updated versions and avoid update loops.
 */

var EVEQuantumFAX = EVEQuantumFAX || {};
EVEQuantumFAX.hotupdate = EVEQuantumFAX.hotupdate || {};

var STORAGE_NAMESPACE = "EVEQuantumFAXHotupdate";

EVEQuantumFAX.hotupdate.updater = {
    _cachedLocalVersion: null,

    isReleaseRuntime: function () {
        try {
            if (typeof isReleaseIec === "function") {
                return isReleaseIec() === true;
            }
        } catch (e) {
            logd("[Updater] 判断运行模式失败: " + e);
        }
        return true;
    },

    resolveCurrentVersion: function (iecVersion, localVersion) {
        var isRelease = this.isReleaseRuntime();
        var currentVersion = isRelease ? Math.max(iecVersion, localVersion) : iecVersion;
        logd("[Updater] 运行模式=" + (isRelease ? "release" : "debug") + ", IEC版本=" + iecVersion + ", 本地版本=" + localVersion + ", 当前版本=" + currentVersion);
        return {
            currentVersion: currentVersion,
            isRelease: isRelease,
            isLocalDebug: !isRelease
        };
    },

    getIecVersion: function () {
        try {
            var updateJson = readIECFileAsString("update.json");
            if (updateJson) {
                var config = JSON.parse(updateJson);
                return parseInt(config.version) || 0;
            }
        } catch (e) {
            logd("[Updater] 读取IEC版本号失败: " + e);
        }
        return 0;
    },

    getLocalSavedVersion: function () {
        if (this._cachedLocalVersion !== null) {
            return this._cachedLocalVersion;
        }
        try {
            var storage = storages.create(STORAGE_NAMESPACE);
            var ver = storage.getInt("updated_version", 0);
            if (ver > 0) {
                logd("[Updater] 读取本地版本: " + ver);
                this._cachedLocalVersion = ver;
                return ver;
            }
            logd("[Updater] 无本地版本记录");
            return 0;
        } catch (e) {
            logd("[Updater] 读取本地版本失败: " + e);
            return 0;
        }
    },

    getCurrentVersion: function () {
        var iecVersion = this.getIecVersion();
        var localVersion = this.getLocalSavedVersion();
        return this.resolveCurrentVersion(iecVersion, localVersion).currentVersion;
    },

    shouldApplyUpdate: function (debugInfo) {
        var cfg = EVEQuantumFAX.hotupdate.config || {};

        if (debugInfo && debugInfo.isLocalDebug && cfg.allowDebugAutoUpdate !== true) {
            logd("[Updater] 本地调试模式跳过自动应用热更新");
            if (EVEQuantumFAX.logger) {
                EVEQuantumFAX.logger.info("本地调试模式已跳过自动热更新");
            }
            return false;
        }

        return true;
    },

    saveUpdatedVersion: function (version) {
        try {
            var storage = storages.create(STORAGE_NAMESPACE);
            var result = storage.putInt("updated_version", version);
            logd("[Updater] 保存版本号结果: " + result);
            this._cachedLocalVersion = version;
            logd("[Updater] 版本号已保存: " + version);
            return result;
        } catch (e) {
            loge("[Updater] 保存版本号失败: " + e);
            return false;
        }
    },

    getUpdateUrl: function () {
        var cfg = EVEQuantumFAX.hotupdate.config;
        if (cfg && cfg.serverUrl) {
            return cfg.serverUrl.replace(/\/$/, "") + "/api/update/check";
        }
        return "http://127.0.0.1:3000/api/update/check";
    },

    getVersionUrl: function () {
        var cfg = EVEQuantumFAX.hotupdate.config;
        if (cfg && cfg.serverUrl) {
            return cfg.serverUrl.replace(/\/$/, "") + "/api/update/version";
        }
        return "http://127.0.0.1:3000/api/update/version";
    },

    _doHttpCheck: function (checkUrl) {
        try {
            var cfg = EVEQuantumFAX.hotupdate.config;
            var params = {
                "url": checkUrl,
                "method": "GET",
                "timeout": 15000,
                "header": {
                    "Content-Type": "application/json",
                    "X-License-Key": cfg.licenseKey || ""
                },
                "ignoreContentType": true,
                "ignoreHttpErrors": true
            };
            var response = http.request(params);
            if (!response) {
                logd("[Updater] HTTP请求返回null，可能是网络错误");
                return null;
            }
            logd("[Updater] 响应状态码: " + response.statusCode);
            logd("[Updater] 响应内容: " + response.body);
            if (response.statusCode !== 200 && response.statusCode !== 204) {
                logd("[Updater] HTTP状态码异常: " + response.statusCode);
                return null;
            }
            var respStr = response.body || "";
            if (respStr.trim() === "" || response.statusCode === 204) {
                logd("[Updater] 服务器返回空，无需更新");
                return { noUpdate: true };
            }
            if (respStr === "null" || respStr === "undefined") {
                logd("[Updater] 服务器返回null字符串，无需更新");
                return { noUpdate: true };
            }
            try {
                return JSON.parse(respStr);
            } catch (e) {
                logd("[Updater] 解析响应失败: " + e + ", 内容: " + respStr);
                return null;
            }
        } catch (e) {
            logd("[Updater] HTTP请求异常: " + e);
            return null;
        }
    },

    checkUpdate: function (silent) {
        var logger = EVEQuantumFAX.hotupdate.logger;
        var cfg = EVEQuantumFAX.hotupdate.config;
        var MAX_RETRIES = 3;
        var RETRY_DELAY = 1000;
        try {
            var currentVersion = this.getCurrentVersion();
            var updateUrl = this.getUpdateUrl();
            logd("===== 检查热更新 =====");
            logd("[Updater] 当前版本: " + currentVersion);
            logd("[Updater] 更新URL: " + updateUrl);
            if (!updateUrl) {
                logd("[Updater] 未配置更新URL，跳过检查");
                return { hasUpdate: false };
            }
            var checkUrl = updateUrl + "?version=" + currentVersion;
            if (cfg && cfg.licenseKey) {
                checkUrl += "&licenseKey=" + cfg.licenseKey;
            }
            logd("[Updater] 请求: " + checkUrl);
            var resp = null;
            for (var retry = 0; retry < MAX_RETRIES; retry++) {
                if (retry > 0) {
                    logd("[Updater] 第 " + (retry + 1) + " 次重试...");
                    sleep(RETRY_DELAY);
                }
                resp = this._doHttpCheck(checkUrl);
                if (resp !== null) {
                    break;
                }
            }
            if (resp === null) {
                logd("[Updater] 网络请求失败，已重试 " + MAX_RETRIES + " 次");
                if (logger) logger.warn("检查更新失败：网络错误");
                return { hasUpdate: false, error: "网络请求失败" };
            }
            if (resp.noUpdate) {
                logd("[Updater] 服务器确认无需更新");
                return { hasUpdate: false };
            }
            var serverVersion = parseInt(resp.version) || 0;
            logd("[Updater] 服务器版本: " + serverVersion);
            if (serverVersion <= currentVersion) {
                logd("[Updater] 服务器版本(" + serverVersion + ") <= 当前版本(" + currentVersion + ")，无需更新");
                return { hasUpdate: false };
            }
            var hasUpdate = hotupdater.updateReq(checkUrl, currentVersion, true, 15000);
            logd("[Updater] hotupdater.updateReq 结果: " + hasUpdate);
            var result = {
                hasUpdate: true,
                version: serverVersion,
                versionName: resp.versionName || resp.version,
                msg: resp.msg || "发现新版本",
                dialog: resp.dialog !== false,
                force: resp.force === true,
                md5: resp.md5 || "",
                downloadUrl: resp.download_url || ""
            };
            if (!silent && logger) {
                logger.info("发现新版本: v" + result.versionName);
            }
            logd("[Updater] 需要更新: " + serverVersion);
            return result;
        } catch (e) {
            loge("[Updater] 检查更新异常: " + e);
            return { hasUpdate: false, error: e.toString() };
        }
    },

    fetchLatestVersionInfo: function () {
        var versionUrl;
        var resp;

        try {
            EVEQuantumFAX.hotupdate.configManager.load();
            versionUrl = this.getVersionUrl();
            logd("[Updater] 最新版本信息URL: " + versionUrl);
            resp = this._doHttpCheck(versionUrl);
            if (!resp || resp.noUpdate) {
                return {
                    success: false,
                    error: "服务器无响应"
                };
            }
            if (resp.success === false) {
                return {
                    success: false,
                    error: resp.error || "服务器返回失败"
                };
            }
            return {
                success: true,
                version: resp.version,
                versionName: resp.versionName || resp.version,
                msg: resp.msg || "",
                updatedAt: resp.updatedAt || ""
            };
        } catch (error) {
            logw("[Updater] 获取最新版本信息失败: " + error);
            return {
                success: false,
                error: String(error)
            };
        }
    },

    performUpdate: function (newVersion) {
        var logger = EVEQuantumFAX.hotupdate.logger;
        var versionSaved = false;
        try {
            logd("[Updater] ===== 开始更新流程 =====");
            logd("[Updater] 目标版本: " + newVersion);
            if (logger) logger.info("开始下载更新...");
            EVEQuantumFAX.toast("正在下载更新...");
            var iecPath = hotupdater.updateDownload();
            logd("[Updater] 下载路径: " + iecPath);
            if (!iecPath || iecPath.length === 0) {
                var errMsg = hotupdater.getErrorMsg();
                logd("[Updater] 下载失败: " + errMsg);
                if (logger) logger.error("下载更新失败: " + errMsg);
                EVEQuantumFAX.toast("下载失败: " + errMsg);
                return false;
            }
            logd("[Updater] 下载成功，准备重启");
            if (logger) logger.success("更新下载完成");

            if (newVersion) {
                logd("[Updater] 重启前保存版本号: " + newVersion);
                versionSaved = this.saveUpdatedVersion(newVersion);
                if (!versionSaved) {
                    logd("[Updater] 保存版本号失败，取消重启以避免更新循环");
                    if (logger) logger.error("保存更新版本失败，已取消自动重启");
                    EVEQuantumFAX.toast("保存版本失败，请检查存储权限");
                    return false;
                }
            }

            if (logger) logger.info("正在重启以应用更新...");
            EVEQuantumFAX.toast("更新完成，正在重启...");
            sleep(1000);
            try {
                EVEQuantumFAX.ui.closeAll();
            } catch (closeError) {
                logw("[Updater] 重启前关闭悬浮窗失败: " + closeError);
            }
            var success = restartScript(iecPath, true, 2);
            if (!success) {
                logd("[Updater] 重启脚本失败");
                if (logger) logger.error("重启脚本失败");
                if (versionSaved) {
                    this.clearLocalVersion();
                }
                EVEQuantumFAX.toast("重启失败，请手动重启");
                return false;
            }
            logd("[Updater] 重启指令已发送");
            return true;
        } catch (e) {
            loge("[Updater] 执行更新异常: " + e);
            if (logger) logger.error("更新异常: " + e);
            EVEQuantumFAX.toast("更新异常: " + e);
            return false;
        }
    },

    checkAndApplyUpdate: function (stageName) {
        var debugInfo;
        var updateResult;
        var newVersion;
        var currentVersion;
        var stage = stageName || "启动前";

        EVEQuantumFAX.hotupdate.configManager.load();

        try {
            debugInfo = this.getDebugInfo();
            logd("[Update][" + stage + "] runtime: " + (debugInfo.isRelease ? "release" : "debug"));
            logd("[Update][" + stage + "] IEC version: " + debugInfo.iecVersion);
            logd("[Update][" + stage + "] local version: " + debugInfo.localVersion);
            logd("[Update][" + stage + "] current version: " + debugInfo.currentVersion);

            if (!this.shouldApplyUpdate(debugInfo)) {
                return false;
            }

            updateResult = this.checkUpdate(true);
            if (!updateResult.hasUpdate) {
                EVEQuantumFAX.logger.info("暂无可用热更新");
                return false;
            }

            newVersion = updateResult.version;
            currentVersion = debugInfo.currentVersion;
            logd("[Update][" + stage + "] server version: " + newVersion + ", current version: " + currentVersion);
            if (newVersion <= currentVersion) {
                EVEQuantumFAX.logger.info("服务端版本未更新，跳过热更新");
                return false;
            }

            EVEQuantumFAX.logger.info("发现热更新：v" + newVersion);
            EVEQuantumFAX.toast("发现更新 v" + newVersion);
            if (this.performUpdate(newVersion)) {
                return true;
            }

            EVEQuantumFAX.logger.warn("热更新失败，继续使用当前版本");
            return false;
        } catch (error) {
            logw("[Update][" + stage + "] check failed: " + error);
            EVEQuantumFAX.logger.warn("热更新检查失败：" + error);
            return false;
        }
    },

    autoUpdate: function (forceCheck) {
        var logger = EVEQuantumFAX.hotupdate.logger;
        try {
            logd("[Updater] ===== 自动更新检查开始 =====");
            var result = this.checkUpdate(true);
            if (!result.hasUpdate) {
                logd("[Updater] 无需更新，继续启动");
                return false;
            }
            var newVersion = result.version;
            var currentVersion = this.getCurrentVersion();
            logd("[Updater] 当前=" + currentVersion + ", 新版=" + newVersion);
            if (newVersion <= currentVersion) {
                logd("[Updater] 版本比较: " + newVersion + " <= " + currentVersion + ", 跳过更新");
                return false;
            }
            if (result.force) {
                logd("[Updater] 强制更新模式");
                if (logger) logger.warn("强制更新: v" + result.versionName);
                EVEQuantumFAX.toast("发现重要更新，正在更新...");
                return this.performUpdate(newVersion);
            }
            if (result.dialog) {
                var msg = "发现新版本 v" + result.versionName;
                if (result.msg) {
                    msg += "\n" + result.msg;
                }
                EVEQuantumFAX.toast(msg);
                sleep(2000);
                return this.performUpdate(newVersion);
            }
            logd("[Updater] 静默更新模式");
            return this.performUpdate(newVersion);
        } catch (e) {
            loge("[Updater] 自动更新异常: " + e);
            return false;
        }
    },

    getVersionInfo: function () {
        var version = this.getCurrentVersion();
        return "v" + version;
    },

    clearLocalVersion: function () {
        try {
            var storage = storages.create(STORAGE_NAMESPACE);
            storage.remove("updated_version");
            this._cachedLocalVersion = null;
            logd("[Updater] 已清除本地版本记录");
            return true;
        } catch (e) {
            loge("[Updater] 清除本地版本失败: " + e);
            return false;
        }
    },

    getDebugInfo: function () {
        var iecVer = 0;
        var localVer = 0;
        var resolved;
        try {
            var updateJson = readIECFileAsString("update.json");
            if (updateJson) {
                var config = JSON.parse(updateJson);
                iecVer = parseInt(config.version) || 0;
            }
        } catch (e) {}
        try {
            var storage = storages.create(STORAGE_NAMESPACE);
            localVer = storage.getInt("updated_version", 0);
        } catch (e) {}
        resolved = this.resolveCurrentVersion(iecVer, localVer);
        return {
            iecVersion: iecVer,
            localVersion: localVer,
            currentVersion: resolved.currentVersion,
            isRelease: resolved.isRelease,
            isLocalDebug: resolved.isLocalDebug,
            updateUrl: this.getUpdateUrl(),
            storageKey: STORAGE_NAMESPACE + "/updated_version"
        };
    }
};
