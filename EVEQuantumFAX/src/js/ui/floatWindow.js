var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.ui = {
    showMiniFloat: function () {
        EVEQuantumFAX.utils.initScreen();

        var screen = EVEQuantumFAX.screen;
        var constants = EVEQuantumFAX.constants;
        var state = EVEQuantumFAX.state;
        var metrics = EVEQuantumFAX.xmlLayouts.getMiniMetrics(screen.isLandscape);
        var miniXml = EVEQuantumFAX.xmlLayouts.createMiniXml(screen.isLandscape);
        var initialX = 0;
        var initialY = screen.isLandscape ? Math.floor(screen.height / 2 - metrics.height / 2) : 200;

        state.floatLandscape = screen.isLandscape;

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

                    safeText = String(text || "就绪");
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
        EVEQuantumFAX.utils.initScreen();

        var constants = EVEQuantumFAX.constants;
        var screen = EVEQuantumFAX.screen;
        var state = EVEQuantumFAX.state;
        var panelXml;
        var panelWidth;
        var panelHeight;
        var panelMetrics;
        var panelX;
        var panelY;

        if (state.isExpanded) {
            return;
        }

        panelMetrics = EVEQuantumFAX.xmlLayouts.getPanelMetrics(screen.isLandscape, state.currentTab);
        panelWidth = panelMetrics.width;
        panelHeight = panelMetrics.height;

        if (screen.isLandscape) {
            panelXml = EVEQuantumFAX.xmlLayouts.createLandscapePanelXml();
        } else {
            panelXml = EVEQuantumFAX.xmlLayouts.createPortraitPanelXml();
        }

        panelX = this._getCenteredOffset(screen.width, panelWidth, 5);
        panelY = this._getCenteredOffset(screen.height, panelHeight, 10);

        this._showOverlay();

        state.panelView = floaty.showFloatXml(constants.FLOAT_TAG_PANEL, panelXml, panelX, panelY);
        if (!state.panelView) {
            this._closeOverlay();
            return;
        }

        state.isExpanded = true;
        floaty.updateSize(constants.FLOAT_TAG_PANEL, panelMetrics.width, panelMetrics.height);
        floaty.focusable(constants.FLOAT_TAG_PANEL, true);
        this._centerPanelAfterLayout(panelMetrics);
        this.updatePanelStatus();
        this.bindPanelEvents();
    },

    _getCenteredOffset: function (screenSize, windowSize, margin) {
        var offset = Math.floor((screenSize - windowSize) / 2);

        if (windowSize + margin * 2 >= screenSize) {
            return offset;
        }

        return EVEQuantumFAX.utils.clamp(offset, margin, Math.max(margin, screenSize - windowSize - margin));
    },

    _centerPanelAfterLayout: function (panelMetrics) {
        var constants = EVEQuantumFAX.constants;
        var state = EVEQuantumFAX.state;
        var self = this;

        if (!state.panelView) {
            return;
        }

        state.panelView.post(new java.lang.Runnable({
            run: function () {
                var screen;
                var measuredWidth;
                var measuredHeight;
                var panelX;
                var panelY;

                try {
                    if (!state.panelView) {
                        return;
                    }

                    EVEQuantumFAX.utils.initScreen();
                    screen = EVEQuantumFAX.screen;

                    measuredWidth = state.panelView.getWidth ? state.panelView.getWidth() : 0;
                    measuredHeight = state.panelView.getHeight ? state.panelView.getHeight() : 0;

                    panelX = self._getCenteredOffset(screen.width, measuredWidth || panelMetrics.width, 5);
                    panelY = self._getCenteredOffset(screen.height, measuredHeight || panelMetrics.height, 10);

                    floaty.updateX(constants.FLOAT_TAG_PANEL, panelX);
                    floaty.updateY(constants.FLOAT_TAG_PANEL, panelY);
                } catch (error) {
                    logw("Panel center update failed: " + error);
                }
            }
        }));
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
                    bind("btnShipTypeApostle", function () {
                        EVEQuantumFAX.ui.selectShipType("apostle");
                    });
                    bind("btnShipTypeTelemachus", function () {
                        EVEQuantumFAX.ui.selectShipType("telemachus");
                    });
                    bind("btnShipTypeSeaArchon", function () {
                        EVEQuantumFAX.ui.selectShipType("sea_archon");
                    });
                    bind("btnClearLog", function () {
                        EVEQuantumFAX.logger.clear();
                        EVEQuantumFAX.ui.refreshLogPanel();
                        EVEQuantumFAX.toast("日志已清空");
                    });
                    bind("btnRefreshLog", function () {
                        EVEQuantumFAX.ui.refreshLogPanel();
                        EVEQuantumFAX.toast("日志已刷新");
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

    selectShipType: function (shipType) {
        if (!EVEQuantumFAX.state.panelView || EVEQuantumFAX.state.currentTab !== "config") {
            return;
        }

        this.savePanelConfig();
        EVEQuantumFAX.config.shipType = EVEQuantumFAX.configManager.normalizeShipType(shipType);
        EVEQuantumFAX.configManager.save();
        this.refreshPanel();
    },

    savePanelConfig: function () {
        var config = EVEQuantumFAX.config;
        var configManager = EVEQuantumFAX.configManager;
        var state = EVEQuantumFAX.state;
        var utils = EVEQuantumFAX.utils;
        var tickInterval;
        var fleetServerUrl;

        if (!state.panelView || state.currentTab !== "config") {
            return;
        }

        try {
            tickInterval = utils.parsePositiveInt(this._readEditText("etTickInterval"), config.tickIntervalSec);
            fleetServerUrl = this._readEditText("etFleetServerUrl");

            config.tickIntervalSec = tickInterval;
            config.fleetServerUrl = fleetServerUrl || config.fleetServerUrl;
            config.clientId = configManager.ensureClientId();
            config.shipType = configManager.normalizeShipType(config.shipType);
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

    syncOrientation: function () {
        var state = EVEQuantumFAX.state;
        var wasExpanded;

        EVEQuantumFAX.utils.initScreen();

        if (!state.miniView || state.floatLandscape === EVEQuantumFAX.screen.isLandscape) {
            return;
        }

        wasExpanded = state.isExpanded;
        this.savePanelConfig();
        this.closeAll();
        this.showMiniFloat();

        if (wasExpanded) {
            this.openPanel();
        }

        EVEQuantumFAX.logger.info("屏幕方向已切换为" + (EVEQuantumFAX.screen.isLandscape ? "横屏" : "竖屏"));
    },

    closeAll: function () {
        var constants = EVEQuantumFAX.constants;
        var state = EVEQuantumFAX.state;

        floaty.close(constants.FLOAT_TAG_TOAST);
        floaty.close(constants.FLOAT_TAG_OVERLAY);
        floaty.close(constants.FLOAT_TAG_PANEL);
        floaty.close(constants.FLOAT_TAG_MINI);

        state.toastView = null;
        state.overlayView = null;
        state.panelView = null;
        state.miniView = null;
        state.isExpanded = false;
        state.floatLandscape = null;
    }
};
