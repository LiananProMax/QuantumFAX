var EVEQuantumFAX = EVEQuantumFAX || {};

var EVE_QUANTUM_FAX_STORAGE = "EVEQuantumFAX";

EVEQuantumFAX.storage = storages.create(EVE_QUANTUM_FAX_STORAGE);

EVEQuantumFAX.config = {
    projectTitle: "EVEQuantumFAX",
    projectSubtitle: "Float control panel with hot update",
    demoMessage: "Replace demoTask.js with EVEQuantumFAX logic",
    tickIntervalSec: 3
};

EVEQuantumFAX.configManager = {
    load: function () {
        var config = EVEQuantumFAX.config;
        var storage = EVEQuantumFAX.storage;

        config.projectTitle = storage.getString("projectTitle", config.projectTitle);
        config.projectSubtitle = storage.getString("projectSubtitle", config.projectSubtitle);
        config.demoMessage = storage.getString("demoMessage", config.demoMessage);
        config.tickIntervalSec = storage.getInt("tickIntervalSec", config.tickIntervalSec);

        logd("[Config] title=" + config.projectTitle + ", interval=" + config.tickIntervalSec);
    },

    save: function () {
        var config = EVEQuantumFAX.config;
        var storage = EVEQuantumFAX.storage;

        storage.putString("projectTitle", config.projectTitle);
        storage.putString("projectSubtitle", config.projectSubtitle);
        storage.putString("demoMessage", config.demoMessage);
        storage.putInt("tickIntervalSec", config.tickIntervalSec);
    },

    getTickIntervalMs: function () {
        var config = EVEQuantumFAX.config;
        return EVEQuantumFAX.utils.parsePositiveInt(config.tickIntervalSec, 3) * 1000;
    }
};
