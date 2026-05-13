var EVEQuantumFAX = EVEQuantumFAX || {};

var EVE_QUANTUM_FAX_STORAGE = "EVEQuantumFAX";

EVEQuantumFAX.storage = storages.create(EVE_QUANTUM_FAX_STORAGE);

EVEQuantumFAX.appInfo = {
    title: "QuantumFAX 控制台",
    subtitle: "热更新与主循环控制",
    tickMessage: "主循环执行"
};

EVEQuantumFAX.config = {
    tickIntervalSec: 3
};

EVEQuantumFAX.configManager = {
    load: function () {
        var config = EVEQuantumFAX.config;
        var storage = EVEQuantumFAX.storage;

        config.tickIntervalSec = storage.getInt("tickIntervalSec", config.tickIntervalSec);
        storage.remove("projectTitle");
        storage.remove("projectSubtitle");
        storage.remove("demoMessage");

        logd("[Config] interval=" + config.tickIntervalSec);
    },

    save: function () {
        var config = EVEQuantumFAX.config;
        var storage = EVEQuantumFAX.storage;

        storage.putInt("tickIntervalSec", config.tickIntervalSec);
    },

    getTickIntervalMs: function () {
        var config = EVEQuantumFAX.config;
        return EVEQuantumFAX.utils.parsePositiveInt(config.tickIntervalSec, 3) * 1000;
    }
};
