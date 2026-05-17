var EVEQuantumFAX = EVEQuantumFAX || {};

var EVE_QUANTUM_FAX_STORAGE = "EVEQuantumFAX";

EVEQuantumFAX.storage = storages.create(EVE_QUANTUM_FAX_STORAGE);

EVEQuantumFAX.appInfo = {
    title: "QuantumFAX 控制台",
    subtitle: "热更新与主循环控制",
    tickMessage: "主循环执行"
};

EVEQuantumFAX.config = {
    tickIntervalSec: 3,
    fleetServerUrl: "http://10.0.0.77:3000",
    clientId: "",
    shipType: "apostle",
    perfLogEnabled: true,
    slowTickThresholdMs: 1500,
    slowOperationThresholdMs: 800,
    perfSummaryIntervalSec: 60,
    normalStatusLogIntervalSec: 30,
    clientInfoLogSampleIntervalSec: 30,
    fleetReportIntervalSec: 3,
    fleetReportTimeoutMs: 5000,
    clientLogReportIntervalSec: 5,
    clientLogReportTimeoutMs: 5000,
    perfReportTimeoutMs: 5000
};

EVEQuantumFAX.configManager = {
    SHIP_TYPES: [
        { id: "apostle", label: "使徒" },
        { id: "telemachus", label: "特勒马科斯" },
        { id: "sea_archon", label: "海执政官" }
    ],

    load: function () {
        var config = EVEQuantumFAX.config;
        var storage = EVEQuantumFAX.storage;

        config.tickIntervalSec = storage.getInt("tickIntervalSec", config.tickIntervalSec);
        config.fleetServerUrl = storage.getString("fleetServerUrl", config.fleetServerUrl);
        config.clientId = storage.getString("clientId", config.clientId);
        config.shipType = this.normalizeShipType(storage.getString("shipType", config.shipType));
        config.perfLogEnabled = storage.getString("perfLogEnabled", config.perfLogEnabled ? "true" : "false") !== "false";
        config.slowTickThresholdMs = storage.getInt("slowTickThresholdMs", config.slowTickThresholdMs);
        config.slowOperationThresholdMs = storage.getInt("slowOperationThresholdMs", config.slowOperationThresholdMs);
        config.perfSummaryIntervalSec = storage.getInt("perfSummaryIntervalSec", config.perfSummaryIntervalSec);
        config.normalStatusLogIntervalSec = storage.getInt("normalStatusLogIntervalSec", config.normalStatusLogIntervalSec);
        config.clientInfoLogSampleIntervalSec = storage.getInt("clientInfoLogSampleIntervalSec", config.clientInfoLogSampleIntervalSec);
        config.fleetReportIntervalSec = storage.getInt("fleetReportIntervalSec", config.fleetReportIntervalSec);
        config.fleetReportTimeoutMs = storage.getInt("fleetReportTimeoutMs", config.fleetReportTimeoutMs);
        config.clientLogReportIntervalSec = storage.getInt("clientLogReportIntervalSec", config.clientLogReportIntervalSec);
        config.clientLogReportTimeoutMs = storage.getInt("clientLogReportTimeoutMs", config.clientLogReportTimeoutMs);
        config.perfReportTimeoutMs = storage.getInt("perfReportTimeoutMs", config.perfReportTimeoutMs);
        this.ensureClientId();
        storage.remove("projectTitle");
        storage.remove("projectSubtitle");
        storage.remove("demoMessage");

        logd("[Config] interval=" + config.tickIntervalSec + ", clientId=" + config.clientId + ", shipType=" + config.shipType);
    },

    save: function () {
        var config = EVEQuantumFAX.config;
        var storage = EVEQuantumFAX.storage;
        var clientId = this.ensureClientId();

        storage.putInt("tickIntervalSec", config.tickIntervalSec);
        storage.putString("fleetServerUrl", config.fleetServerUrl || "");
        storage.putString("clientId", clientId);
        storage.putString("shipType", this.normalizeShipType(config.shipType));
        storage.putString("perfLogEnabled", config.perfLogEnabled === false ? "false" : "true");
        storage.putInt("slowTickThresholdMs", config.slowTickThresholdMs);
        storage.putInt("slowOperationThresholdMs", config.slowOperationThresholdMs);
        storage.putInt("perfSummaryIntervalSec", config.perfSummaryIntervalSec);
        storage.putInt("normalStatusLogIntervalSec", config.normalStatusLogIntervalSec);
        storage.putInt("clientInfoLogSampleIntervalSec", config.clientInfoLogSampleIntervalSec);
        storage.putInt("fleetReportIntervalSec", config.fleetReportIntervalSec);
        storage.putInt("fleetReportTimeoutMs", config.fleetReportTimeoutMs);
        storage.putInt("clientLogReportIntervalSec", config.clientLogReportIntervalSec);
        storage.putInt("clientLogReportTimeoutMs", config.clientLogReportTimeoutMs);
        storage.putInt("perfReportTimeoutMs", config.perfReportTimeoutMs);
    },

    getTickIntervalMs: function () {
        var config = EVEQuantumFAX.config;
        return EVEQuantumFAX.utils.parsePositiveInt(config.tickIntervalSec, 3) * 1000;
    },

    getNormalStatusLogIntervalMs: function () {
        var config = EVEQuantumFAX.config;
        return EVEQuantumFAX.utils.parsePositiveInt(config.normalStatusLogIntervalSec, 30) * 1000;
    },

    getClientInfoLogSampleIntervalMs: function () {
        var config = EVEQuantumFAX.config;
        return EVEQuantumFAX.utils.parsePositiveInt(config.clientInfoLogSampleIntervalSec, 30) * 1000;
    },

    getFleetReportIntervalMs: function () {
        var config = EVEQuantumFAX.config;
        return EVEQuantumFAX.utils.parsePositiveInt(config.fleetReportIntervalSec, 3) * 1000;
    },

    getFleetReportTimeoutMs: function () {
        var config = EVEQuantumFAX.config;
        return EVEQuantumFAX.utils.parsePositiveInt(config.fleetReportTimeoutMs, 5000);
    },

    getClientLogReportIntervalMs: function () {
        var config = EVEQuantumFAX.config;
        return EVEQuantumFAX.utils.parsePositiveInt(config.clientLogReportIntervalSec, 5) * 1000;
    },

    getClientLogReportTimeoutMs: function () {
        var config = EVEQuantumFAX.config;
        return EVEQuantumFAX.utils.parsePositiveInt(config.clientLogReportTimeoutMs, 5000);
    },

    getPerfReportTimeoutMs: function () {
        var config = EVEQuantumFAX.config;
        return EVEQuantumFAX.utils.parsePositiveInt(config.perfReportTimeoutMs, 5000);
    },

    normalizeShipType: function (shipType) {
        var value = String(shipType || "").trim();
        var i;

        for (i = 0; i < this.SHIP_TYPES.length; i++) {
            if (this.SHIP_TYPES[i].id === value || this.SHIP_TYPES[i].label === value) {
                return this.SHIP_TYPES[i].id;
            }
        }
        return "apostle";
    },

    getShipTypeLabel: function (shipType) {
        var value = this.normalizeShipType(shipType);
        var i;

        for (i = 0; i < this.SHIP_TYPES.length; i++) {
            if (this.SHIP_TYPES[i].id === value) {
                return this.SHIP_TYPES[i].label;
            }
        }
        return "使徒";
    },

    createClientId: function () {
        var timePart = new Date().getTime().toString(36);
        var randomPart = Math.floor(Math.random() * 2176782336).toString(36);

        while (randomPart.length < 6) {
            randomPart = "0" + randomPart;
        }
        return "qf-" + timePart + "-" + randomPart;
    },

    ensureClientId: function () {
        var config = EVEQuantumFAX.config;
        var storage = EVEQuantumFAX.storage;
        var clientId = String(config.clientId || "").trim();

        if (!clientId) {
            clientId = this.createClientId();
        }

        config.clientId = clientId;
        storage.putString("clientId", clientId);
        return clientId;
    }
};
