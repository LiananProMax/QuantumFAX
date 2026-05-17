/**
 * EVEQuantumFAX hot update configuration.
 * Keep update_url in update.json empty; this module points to the self-hosted server.
 */

var EVEQuantumFAX = EVEQuantumFAX || {};
EVEQuantumFAX.hotupdate = EVEQuantumFAX.hotupdate || {};

/** Local debug server address. Use the host LAN IP so Android devices/emulators can reach it. */
var EVE_QUANTUM_FAX_UPDATE_SERVER_URL = "http://10.0.0.77:3000";

EVEQuantumFAX.hotupdate.config = {
    serverUrl: EVE_QUANTUM_FAX_UPDATE_SERVER_URL,
    /** Optional: sent as query param licenseKey and header X-License-Key. */
    licenseKey: "",
    /** Local EasyClick debug runs should not restart into server IEC packages. */
    allowDebugAutoUpdate: false
};

EVEQuantumFAX.hotupdate.logger = {
    _writePanel: function (level, message) {
        if (EVEQuantumFAX.logger && typeof EVEQuantumFAX.logger[level] === "function") {
            EVEQuantumFAX.logger[level]("[Update] " + message);
            return true;
        }
        return false;
    },

    info: function (message) {
        if (!this._writePanel("info", message)) {
            logi("[EVEQuantumFAX Update] " + message);
        }
    },

    warn: function (message) {
        if (!this._writePanel("warn", message)) {
            logw("[EVEQuantumFAX Update] " + message);
        }
    },

    error: function (message) {
        if (!this._writePanel("error", message)) {
            loge("[EVEQuantumFAX Update] " + message);
        }
    },

    success: function (message) {
        if (!this._writePanel("success", message)) {
            logi("[EVEQuantumFAX Update] " + message);
        }
    }
};

EVEQuantumFAX.hotupdate.configManager = {
    load: function () {
        var cfg = EVEQuantumFAX.hotupdate.config;
        try {
            var serverUrl = readConfigString("serverUrl");
            if (serverUrl) {
                cfg.serverUrl = serverUrl;
            }
        } catch (e1) {}

        try {
            var key = readConfigString("licenseKey");
            if (key) {
                cfg.licenseKey = key;
                logd("[Config] loaded licenseKey from EC config");
            }
        } catch (e2) {}

        logd("[Config] update serverUrl=" + cfg.serverUrl);
    }
};
