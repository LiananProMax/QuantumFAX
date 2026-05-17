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
    shipType: "apostle"
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
    },

    getTickIntervalMs: function () {
        var config = EVEQuantumFAX.config;
        return EVEQuantumFAX.utils.parsePositiveInt(config.tickIntervalSec, 3) * 1000;
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
