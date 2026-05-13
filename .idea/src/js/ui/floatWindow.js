var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.ui = {
    showMiniFloat: function () {
        var screen = EVEQuantumFAX.screen;
        var constants = EVEQuantumFAX.constants;
        var state = EVEQuantumFAX.state;
        var miniXml = EVEQuantumFAX.xmlLayouts.createMiniXml();
        var initialX = 0;
        var initialY = screen.isLandscape ? Math.floor(screen.height / 2 - 30) : 200;

        state.miniView = floaty.showFloatXml(constants.FLOAT_TAG_MINI, miniXml, initialX, initialY);

        if (!state.miniView) {
            loge("Mini float creation failed");
            return;
        }

        this._setCircleBackground(state.miniView);

        state.miniView.post(new java.lang.Runnable({
            run: function () {
                try {
                    state.miniView.setOnClickListener(new android.view.View.OnClickListener({
                        onClick: function () {
                            EVEQuantumFAX.ui.togglePanel();
                        }
                    }));
                } catch (error) {
                    loge("Mini click bind failed: " + error);
                }
            }
        }));
    },

    _parseColor: function (colorText) {
        try {
            return android.graphics.Color.parseColor(colorText);
        } catch (error) {
            return android.graphics.Color.BLACK;
        }
    },

    _setCircleBackground: function (view) {
        var self = this;
        var state = EVEQuantumFAX.state;

        view.post(new java.lang.Runnable({
            run: function () {
                var borderColor;
                var outerDrawable;
                var innerDrawable;
                var miniBg;
                var miniContent;

                try {
                    borderColor = state.isRunning ? (state.isPaused ? "#F59E0B" : "#10B981") : "#374151";

                    outerDrawable = new android.graphics.drawable.GradientDrawable();
                    outerDrawable.setShape(android.graphics.drawable.GradientDrawable.OVAL);
                    outerDrawable.setColor(self._parseColor("#0D0D12"));
                    outerDrawable.setStroke(2, self._parseColor(borderColor));
                    outerDrawable.setAlpha(240);

                    innerDrawable = new android.graphics.drawable.GradientDrawable();
                    innerDrawable.setShape(android.graphics.drawable.GradientDrawable.OVAL);
                    innerDrawable.setColor(self._parseColor("#16161E"));
                    innerDrawable.setAlpha(240);

                    miniBg = view.findViewWithTag("miniBg");
                    miniContent = view.findViewWithTag("miniContent");

                    if (miniBg) {
                        miniBg.setBackground(outerDrawable);
                    }

                    if (miniContent) {
                        miniContent.setBackground(innerDrawable);
                    }
                } catch (error) {
                    loge("Mini background failed: " + error);
                }
            }
        }));
    },

    updateMiniBorderColor: function () {
        var state = EVEQuantumFAX.state;
        if (!state.miniView) {
            return;
        }
        this._setCircleBackground(state.miniView);
    },

    updateMiniStatus: function (text) {
        var state = EVEQuantumFAX.state;
        if (!state.miniView) {
            return;
        }

        state.miniView.post(new java.lang.Runnable({
            run: function () {
                var statusView;
                var safeText;

                try {
                    statusView = state.miniView.findViewWithTag("statusMini");
                    if (!statusView) {
                        return;
                    }

                    safeText = String(text || "READY");
                    if (safeText.length > 6) {
                        safeText = safeText.substring(0, 6);
                    }
                    statusView.setText(safeText);
                } catch (error) {
                    logw("Mini status update failed: " + error);
                }
            }
        }));
    },

    togglePanel: function () {
        if (EVEQuantumFAX.state.isExpanded) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    },

    openPanel: function () {
        var constants = EVEQuantumFAX.constants;
        var screen = EVEQuantumFAX.screen;
        var state = EVEQuantumFAX.state;
        var miniX;
        var miniY;
        var panelXml;
        var panelWidth;
        var panelHeight;
        var panelX;
        var panelY;

        if (state.isExpanded) {
            return;
        }

        miniX = floaty.getX(constants.FLOAT_TAG_MINI);
        miniY = floaty.getY(constants.FLOAT_TAG_MINI);

        if (screen.isLandscape) {
            panelWidth = 420;
            panelHeight = state.currentTab === "log" ? 220 : 270;
            panelXml = EVEQuantumFAX.xmlLayouts.createLandscapePanelXml();
        } else {
            panelWidth = 280;
            panelHeight = state.currentTab === "log" ? 280 : 360;
            panelXml = EVEQuantumFAX.xmlLayouts.createPortraitPanelXml();
        }

        panelX = miniX + 55;
        if (panelX + panelWidth > screen.width) {
            panelX = miniX - panelWidth - 5;
        }
        panelX = EVEQuantumFAX.utils.clamp(panelX, 5, Math.max(5, screen.width - panelWidth - 5));

        panelY = EVEQuantumFAX.utils.clamp(miniY, 10, Math.max(10, screen.height - panelHeight - 10));

        this._showOverlay();

        state.panelView = floaty.showFloatXml(constants.FLOAT_TAG_PANEL, panelXml, panelX, panelY);
        if (!state.panelView) {
            this._closeOverlay();
            return;
        }

        state.isExpanded = true;
        floaty.focusable(constants.FLOAT_TAG_PANEL, true);
        this.updatePanelStatus();
        this.bindPanelEvents();
    },

    _showOverlay: function () {
        var constants = EVEQuantumFAX.constants;
        var screen = EVEQuantumFAX.screen;
        var state = EVEQuantumFAX.state;
        var self = this;
        var overlayXml;

        overlayXml = '<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android" ' +
            'android:layout_width="match_parent" android:layout_height="match_parent" ' +
            'android:background="#01000000"/>';

        state.overlayView = floaty.showFloatXml(constants.FLOAT_TAG_OVERLAY, overlayXml, 0, 0);

        if (!state.overlayView) {
            return;
        }

        floaty.updateSize(constants.FLOAT_TAG_OVERLAY, screen.width, screen.height);

        state.overlayView.post(new java.lang.Runnable({
            run: function () {
                try {
                    state.overlayView.setOnClickListener(new android.view.View.OnClickListener({
                        onClick: function () {
                            self.closePanel();
                        }
                    }));
                } catch (error) {
                    loge("Overlay click bind failed: " + error);
                }
            }
        }));
    },

    _closeOverlay: function () {
        var constants = EVEQuantumFAX.constants;
        floaty.close(constants.FLOAT_TAG_OVERLAY);
        EVEQuantumFAX.state.overlayView = null;
    },

    closePanel: function () {
        var constants = EVEQuantumFAX.constants;
        var state = EVEQuantumFAX.state;

        if (!state.isExpanded) {
            this._closeOverlay();
            return;
        }

        this.savePanelConfig();
        this._closeOverlay();
        floaty.close(constants.FLOAT_TAG_PANEL);
        state.panelView = null;
        state.isExpanded = false;
    },

    bindPanelEvents: function () {
        var state = EVEQuantumFAX.state;

        if (!state.panelView) {
            return;
        }

        state.panelView.post(new java.lang.Runnable({
            run: function () {
                function bind(tag, callback) {
                    var view = state.panelView.findViewWithTag(tag);
                    if (!view) {
                        return;
                    }

                    view.setOnClickListener(new android.view.View.OnClickListener({
                        onClick: callback
                    }));
                }

                try {
                    bind("tabConfig", function () {
                        EVEQuantumFAX.ui.switchTab("config");
                    });
                    bind("tabLog", function () {
                        EVEQuantumFAX.ui.switchTab("log");
                    });
                    bind("btnStartPause", function () {
                        EVEQuantumFAX.controller.onStartPauseClick();
                    });
                    bind("btnStop", function () {
                        EVEQuantumFAX.controller.onStopClick();
                    });
                    bind("btnClearLog", function () {
                        EVEQuantumFAX.logger.clear();
                        EVEQuantumFAX.ui.refreshLogPanel();
                        toast("Logs cleared");
                    });
                    bind("btnRefreshLog", function () {
                        EVEQuantumFAX.ui.refreshLogPanel();
                        toast("Logs refreshed");
                    });
                    bind("btnExit", function () {
                        EVEQuantumFAX.controller.exitApp();
                    });
                } catch (error) {
                    loge("Panel bind failed: " + error);
                }
            }
        }));
    },

    refreshLogPanel: function () {
        var state = EVEQuantumFAX.state;
        if (state.isExpanded && state.currentTab === "log") {
            this.closePanel();
            this.openPanel();
        }
    },

    refreshPanel: function () {
        if (EVEQuantumFAX.state.isExpanded) {
            this.closePanel();
            this.openPanel();
        }
    },

    switchTab: function (tabName) {
        var state = EVEQuantumFAX.state;
        if (state.currentTab === tabName) {
            return;
        }

        if (state.currentTab === "config") {
            this.savePanelConfig();
        }

        state.currentTab = tabName;
        this.closePanel();
        this.openPanel();
    },

    _readEditText: function (tag) {
        var state = EVEQuantumFAX.state;
        var editText;

        if (!state.panelView) {
            return "";
        }

        editText = state.panelView.findViewWithTag(tag);
        if (!editText) {
            return "";
        }

        return String(editText.getText()).trim();
    },

    savePanelConfig: function () {
        var config = EVEQuantumFAX.config;
        var configManager = EVEQuantumFAX.configManager;
        var state = EVEQuantumFAX.state;
        var utils = EVEQuantumFAX.utils;
        var projectTitle;
        var projectSubtitle;
        var demoMessage;
        var tickInterval;

        if (!state.panelView || state.currentTab !== "config") {
            return;
        }

        try {
            projectTitle = this._readEditText("etProjectTitle");
            projectSubtitle = this._readEditText("etProjectSubtitle");
            demoMessage = this._readEditText("etDemoMessage");
            tickInterval = utils.parsePositiveInt(this._readEditText("etTickInterval"), config.tickIntervalSec);

            config.projectTitle = projectTitle || "EVEQuantumFAX";
            config.projectSubtitle = projectSubtitle || "Float control panel with hot update";
            config.demoMessage = demoMessage || "Replace demoTask.js with EVEQuantumFAX logic";

            config.tickIntervalSec = tickInterval;
            configManager.save();
        } catch (error) {
            loge("Config save failed: " + error);
        }
    },

    updatePanelStatus: function () {
        var state = EVEQuantumFAX.state;
        if (!state.panelView) {
            this.updateMiniBorderColor();
            return;
        }

        state.panelView.post(new java.lang.Runnable({
            run: function () {
                var statusView;
                try {
                    statusView = state.panelView.findViewWithTag("tvStatus");
                    if (!statusView) {
                        return;
                    }
                    statusView.setText(EVEQuantumFAX.xmlLayouts._getStatusText());
                    statusView.setTextColor(EVEQuantumFAX.ui._parseColor(EVEQuantumFAX.xmlLayouts._getStatusColor()));
                } catch (error) {
                    logw("Panel status update failed: " + error);
                }
            }
        }));

        this.updateMiniBorderColor();
    },

    closeAll: function () {
        var constants = EVEQuantumFAX.constants;
        var state = EVEQuantumFAX.state;

        floaty.close(constants.FLOAT_TAG_OVERLAY);
        floaty.close(constants.FLOAT_TAG_PANEL);
        floaty.close(constants.FLOAT_TAG_MINI);

        state.overlayView = null;
        state.panelView = null;
        state.miniView = null;
        state.isExpanded = false;
    }
};
