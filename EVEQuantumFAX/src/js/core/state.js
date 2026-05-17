var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.constants = {
    FLOAT_TAG_MINI: "eve_quantum_fax_mini",
    FLOAT_TAG_PANEL: "eve_quantum_fax_panel",
    FLOAT_TAG_OVERLAY: "eve_quantum_fax_overlay",
    FLOAT_TAG_TOAST: "eve_quantum_fax_toast",
    MAX_LOG_ENTRIES: 120
};

EVEQuantumFAX.screen = {
    width: 0,
    height: 0,
    isLandscape: false
};

EVEQuantumFAX.state = {
    isRunning: false,
    isPaused: false,
    isStarting: false,
    workerThread: null,
    runToken: 0,
    miniView: null,
    panelView: null,
    overlayView: null,
    toastView: null,
    toastToken: 0,
    floatLandscape: null,
    isExpanded: false,
    currentTab: "config",
    logs: []
};
