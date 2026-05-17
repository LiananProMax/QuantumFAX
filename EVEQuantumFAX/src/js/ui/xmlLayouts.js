var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.xmlLayouts = {
    THEME: {
        BG_PRIMARY: "#0D0D12",
        BG_SECONDARY: "#16161E",
        BG_CARD: "#1C1C26",
        BG_INPUT: "#252532",
        BORDER: "#2D2D3A",
        TEXT_PRIMARY: "#E5E7EB",
        TEXT_SECONDARY: "#9CA3AF",
        TEXT_MUTED: "#6B7280",
        ACCENT_GREEN: "#10B981",
        ACCENT_YELLOW: "#F59E0B",
        ACCENT_RED: "#EF4444",
        ACCENT_BLUE: "#3B82F6"
    },

    getMiniMetrics: function (isLandscape) {
        if (isLandscape) {
            return {
                widthDp: "48dp",
                heightDp: "48dp",
                innerWidthDp: "44dp",
                innerHeightDp: "44dp",
                width: 48,
                height: 48
            };
        }

        return {
            widthDp: "48dp",
            heightDp: "48dp",
            innerWidthDp: "44dp",
            innerHeightDp: "44dp",
            width: 48,
            height: 48
        };
    },

    getPanelMetrics: function (isLandscape, tabName) {
        if (isLandscape) {
            return {
                widthDp: "680px",
                heightDp: "1000px",
                width: 680,
                height: 1000,
                logHeightDp: "720px"
            };
        }

        return {
            widthDp: "680px",
            heightDp: "1000px",
            width: 680,
            height: 1000,
            logHeightDp: "720px"
        };
    },

    createMiniXml: function (isLandscape) {
        var theme = this.THEME;
        var metrics = this.getMiniMetrics(isLandscape);
        var parts = [];

        parts.push('<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android" ');
        parts.push('android:tag="miniBg" android:layout_width="' + metrics.widthDp + '" android:layout_height="' + metrics.heightDp + '" android:gravity="center">');
        parts.push('<LinearLayout android:tag="miniContent" android:layout_width="' + metrics.innerWidthDp + '" android:layout_height="' + metrics.innerHeightDp + '" ');
        parts.push('android:orientation="vertical" android:gravity="center" android:layout_gravity="center">');
        parts.push('<TextView android:layout_width="wrap_content" android:layout_height="wrap_content" ');
        parts.push('android:text="QF" android:textColor="' + theme.ACCENT_GREEN + '" android:textSize="13sp" android:textStyle="bold"/>');
        parts.push('<TextView android:tag="statusMini" android:layout_width="wrap_content" android:layout_height="wrap_content" ');
        parts.push('android:text="就绪" android:textColor="' + theme.TEXT_MUTED + '" android:textSize="8sp"/>');
        parts.push('</LinearLayout></FrameLayout>');

        return parts.join("");
    },

    createEntryXml: function (model) {
        var theme = this.THEME;
        var escapeXml = EVEQuantumFAX.utils.escapeXml;
        var data = model || {};
        var parts = [];

        parts.push('<ScrollView xmlns:android="http://schemas.android.com/apk/res/android" ');
        parts.push('android:layout_width="match_parent" android:layout_height="match_parent" ');
        parts.push('android:tag="entryRoot" android:background="' + theme.BG_PRIMARY + '" android:fillViewport="true">');
        parts.push('<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:orientation="vertical" android:padding="18dp">');

        parts.push('<TextView android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:text="QuantumFAX" android:textColor="' + theme.TEXT_PRIMARY + '" ');
        parts.push('android:textSize="24sp" android:textStyle="bold" android:fontFamily="monospace"/>');
        parts.push('<TextView android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:text="启动前检查权限、服务器和版本状态" android:textColor="' + theme.TEXT_MUTED + '" ');
        parts.push('android:textSize="12sp" android:layout_marginTop="4dp" android:layout_marginBottom="14dp"/>');

        parts.push(this._createEntrySectionTitle("权限信息"));
        parts.push(this._createEntryCardStart());
        parts.push('<TextView android:tag="tvPermissionSummary" android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:text="' + escapeXml(data.permissionSummary || "") + '" android:textColor="' + theme.TEXT_SECONDARY + '" ');
        parts.push('android:textSize="13sp" android:layout_marginBottom="10dp"/>');
        parts.push(this._createEntryInfoRow("悬浮窗权限", "tvFloatPermission", data.floatPermission));
        parts.push(this._createEntryInfoRow("无障碍服务", "tvAccessibilityPermission", data.accessibilityPermission));
        parts.push('<TextView android:tag="tvPermissionFlowStatus" android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:text="' + escapeXml(data.permissionFlowStatus || "") + '" android:textColor="' + theme.TEXT_MUTED + '" ');
        parts.push('android:textSize="11sp" android:layout_marginTop="10dp" android:layout_marginBottom="8dp"/>');
        parts.push('<Button android:tag="btnGrantPermissions" android:layout_width="match_parent" android:layout_height="42dp" ');
        parts.push('android:text="' + escapeXml(data.grantButtonText || "授予/检查权限") + '" android:background="' + theme.ACCENT_BLUE + '" ');
        parts.push('android:textColor="#FFFFFF" android:textSize="14sp"/>');
        parts.push('</LinearLayout>');

        parts.push(this._createEntrySectionTitle("程序信息"));
        parts.push(this._createEntryCardStart());
        parts.push(this._createEntryInfoRow("当前版本", "tvCurrentVersion", data.currentVersion));
        parts.push(this._createEntryInfoRow("最新版本", "tvLatestVersion", data.latestVersion));
        parts.push('<Button android:tag="btnRefreshVersion" android:layout_width="match_parent" android:layout_height="38dp" ');
        parts.push('android:text="刷新版本信息" android:background="' + theme.BG_INPUT + '" ');
        parts.push('android:textColor="' + theme.ACCENT_GREEN + '" android:textSize="13sp" android:layout_marginTop="10dp"/>');
        parts.push('</LinearLayout>');

        parts.push(this._createEntrySectionTitle("服务器地址"));
        parts.push(this._createEntryCardStart());
        parts.push(this._createEntryInfoRow("热更新服务器", "tvUpdateServer", data.updateServer));
        parts.push(this._createEntryInfoRow("舰队后端", "tvFleetServer", data.fleetServer));
        parts.push('</LinearLayout>');

        parts.push('</LinearLayout></ScrollView>');
        return parts.join("");
    },

    createPortraitPanelXml: function () {
        return this._createPanelXml(false);
    },

    createLandscapePanelXml: function () {
        return this._createPanelXml(true);
    },

    _createPanelXml: function (isLandscape) {
        var state = EVEQuantumFAX.state;
        var escapeXml = EVEQuantumFAX.utils.escapeXml;
        var theme = this.THEME;
        var isConfigTab = state.currentTab === "config";
        var appInfo = EVEQuantumFAX.appInfo;
        var metrics = this.getPanelMetrics(isLandscape, state.currentTab);
        var parts = [];

        parts.push('<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" ');
        parts.push('android:layout_width="' + metrics.widthDp + '" android:layout_height="' + metrics.heightDp + '" ');
        parts.push('android:orientation="vertical" android:background="#F0' + theme.BG_PRIMARY.substring(1) + '" android:padding="10dp">');

        parts.push('<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:orientation="horizontal" android:gravity="center_vertical" android:paddingBottom="6dp">');
        parts.push('<TextView android:layout_width="wrap_content" android:layout_height="wrap_content" ');
        parts.push('android:text=">" android:textColor="' + theme.ACCENT_GREEN + '" android:textSize="13sp" android:textStyle="bold"/>');
        parts.push('<LinearLayout android:layout_width="0dp" android:layout_height="wrap_content" android:layout_weight="1" ');
        parts.push('android:orientation="vertical" android:layout_marginLeft="4dp">');
        parts.push('<TextView android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:text="' + escapeXml(appInfo.title) + '" android:textColor="' + theme.TEXT_PRIMARY + '" ');
        parts.push('android:textSize="12sp" android:fontFamily="monospace" android:singleLine="true"/>');
        parts.push('<TextView android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:text="' + escapeXml(appInfo.subtitle) + '" android:textColor="' + theme.TEXT_MUTED + '" ');
        parts.push('android:textSize="8sp" android:singleLine="true"/>');
        parts.push('</LinearLayout>');
        parts.push('<TextView android:tag="tvStatus" android:layout_width="wrap_content" android:layout_height="wrap_content" ');
        parts.push('android:text="' + this._getStatusText() + '" android:textColor="' + this._getStatusColor() + '" ');
        parts.push('android:textSize="8sp" android:fontFamily="monospace" android:background="' + theme.BG_CARD + '" ');
        parts.push('android:paddingLeft="5dp" android:paddingRight="5dp" android:paddingTop="2dp" android:paddingBottom="2dp"/>');
        parts.push('</LinearLayout>');

        parts.push('<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:orientation="horizontal" android:background="' + theme.BG_PRIMARY + '" android:layout_marginBottom="6dp">');
        parts.push(this._createTabButton("tabConfig", "配置", isConfigTab));
        parts.push(this._createTabButton("tabLog", "日志", !isConfigTab));
        parts.push('</LinearLayout>');

        if (isConfigTab) {
            parts.push(this._createConfigTabXml(isLandscape));
        } else {
            parts.push(this._createLogTabXml(isLandscape));
        }

        parts.push('<Button android:tag="btnExit" android:text="退出" android:layout_width="match_parent" ');
        parts.push('android:layout_height="28dp" android:background="' + theme.BG_CARD + '" ');
        parts.push('android:textColor="' + theme.ACCENT_RED + '" android:textSize="9sp" ');
        parts.push('android:layout_marginTop="4dp" android:paddingTop="2dp" android:paddingBottom="2dp"/>');
        parts.push('</LinearLayout>');

        return parts.join("");
    },

    _createTabButton: function (tag, title, active) {
        var theme = this.THEME;
        var background = active ? theme.BG_CARD : theme.BG_PRIMARY;
        var color = active ? theme.ACCENT_GREEN : theme.TEXT_MUTED;
        var parts = [];

        parts.push('<LinearLayout android:layout_width="0dp" android:layout_height="wrap_content" ');
        parts.push('android:layout_weight="1" android:orientation="vertical" ');
        parts.push(tag === "tabConfig" ? 'android:layout_marginRight="3dp">' : 'android:layout_marginLeft="3dp">');
        parts.push('<Button android:tag="' + tag + '" android:text="' + title + '" android:layout_width="match_parent" ');
        parts.push('android:layout_height="28dp" android:background="' + background + '" android:textColor="' + color + '" ');
        parts.push('android:textSize="10sp" android:paddingTop="2dp" android:paddingBottom="2dp"/>');
        if (active) {
            parts.push('<View android:layout_width="match_parent" android:layout_height="2dp" ');
            parts.push('android:background="' + theme.ACCENT_GREEN + '"/>');
        }
        parts.push('</LinearLayout>');

        return parts.join("");
    },

    _createConfigTabXml: function (isLandscape) {
        var config = EVEQuantumFAX.config;
        var configManager = EVEQuantumFAX.configManager;
        var escapeXml = EVEQuantumFAX.utils.escapeXml;
        var theme = this.THEME;
        var parts = [];
        var buttonHeight = isLandscape ? "28dp" : "32dp";

        parts.push('<ScrollView android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:background="' + theme.BG_PRIMARY + '">');
        parts.push('<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:orientation="vertical" android:padding="2dp">');

        parts.push(this._createFieldLabel("主循环间隔（秒）"));
        parts.push('<EditText android:tag="etTickInterval" android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:hint="3" android:text="' + escapeXml(config.tickIntervalSec) + '" ');
        parts.push('android:textColor="' + theme.TEXT_PRIMARY + '" android:textColorHint="' + theme.TEXT_MUTED + '" ');
        parts.push('android:background="' + theme.BG_INPUT + '" android:padding="6dp" android:textSize="11sp" ');
        parts.push('android:singleLine="true" android:inputType="number" android:layout_marginTop="2dp" android:layout_marginBottom="6dp"/>');

        parts.push(this._createFieldLabel("舰队后端地址"));
        parts.push('<EditText android:tag="etFleetServerUrl" android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:hint="http://服务器IP:3000" android:text="' + escapeXml(config.fleetServerUrl) + '" ');
        parts.push('android:textColor="' + theme.TEXT_PRIMARY + '" android:textColorHint="' + theme.TEXT_MUTED + '" ');
        parts.push('android:background="' + theme.BG_INPUT + '" android:padding="6dp" android:textSize="11sp" ');
        parts.push('android:singleLine="true" android:layout_marginTop="2dp" android:layout_marginBottom="6dp"/>');

        parts.push(this._createFieldLabel("客户端 ID"));
        parts.push('<TextView android:tag="tvClientId" android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:text="' + escapeXml(config.clientId) + '" android:textColor="' + theme.TEXT_PRIMARY + '" ');
        parts.push('android:background="' + theme.BG_INPUT + '" android:padding="6dp" android:textSize="11sp" ');
        parts.push('android:singleLine="true" android:layout_marginTop="2dp"/>');
        parts.push('<TextView android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:text="客户端 ID 首次运行自动随机生成，用于舰队后端识别本设备。" ');
        parts.push('android:textColor="' + theme.TEXT_MUTED + '" android:textSize="8sp" android:layout_marginBottom="6dp"/>');

        parts.push(this._createFieldLabel("舰船类型"));
        parts.push('<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:orientation="horizontal" android:layout_marginTop="2dp" android:layout_marginBottom="6dp">');
        parts.push(this._createShipTypeButton("btnShipTypeApostle", "使徒", config.shipType === "apostle", true));
        parts.push(this._createShipTypeButton("btnShipTypeTelemachus", "特勒马科斯", config.shipType === "telemachus", false));
        parts.push(this._createShipTypeButton("btnShipTypeSeaArchon", "海执政官", config.shipType === "sea_archon", false));
        parts.push('</LinearLayout>');

        parts.push('<TextView android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:text="当前舰船：' + escapeXml(configManager.getShipTypeLabel(config.shipType)) + '。血量会随主循环上报到舰队后端。" ');
        parts.push('android:textColor="' + theme.TEXT_MUTED + '" android:textSize="8sp" android:layout_marginBottom="6dp"/>');

        parts.push('<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:orientation="horizontal">');
        parts.push('<Button android:tag="btnStartPause" android:text="' + this._getStartPauseLabel() + '" ');
        parts.push('android:layout_width="0dp" android:layout_height="' + buttonHeight + '" android:layout_weight="1" ');
        parts.push('android:background="' + theme.BG_CARD + '" android:textColor="' + this._getStartPauseColor() + '" ');
        parts.push('android:textSize="10sp" android:paddingTop="2dp" android:paddingBottom="2dp"/>');
        parts.push('<Button android:tag="btnStop" android:text="停止" android:layout_width="0dp" ');
        parts.push('android:layout_height="' + buttonHeight + '" android:layout_weight="1" android:background="' + theme.BG_CARD + '" ');
        parts.push('android:textColor="' + theme.ACCENT_RED + '" android:textSize="10sp" android:layout_marginLeft="3dp" ');
        parts.push('android:paddingTop="2dp" android:paddingBottom="2dp"/>');
        parts.push('</LinearLayout>');

        parts.push('</LinearLayout></ScrollView>');
        return parts.join("");
    },

    _createShipTypeButton: function (tag, title, active, first) {
        var theme = this.THEME;
        var parts = [];
        var background = active ? theme.ACCENT_BLUE : theme.BG_CARD;
        var color = active ? "#FFFFFF" : theme.TEXT_SECONDARY;

        parts.push('<Button android:tag="' + tag + '" android:text="' + title + '" ');
        parts.push('android:layout_width="0dp" android:layout_height="30dp" android:layout_weight="1" ');
        parts.push('android:background="' + background + '" android:textColor="' + color + '" ');
        parts.push('android:textSize="9sp" android:paddingTop="2dp" android:paddingBottom="2dp" ');
        if (!first) {
            parts.push('android:layout_marginLeft="3dp" ');
        }
        parts.push('/>');
        return parts.join("");
    },

    _createFieldLabel: function (text) {
        var theme = this.THEME;
        return '<TextView android:layout_width="wrap_content" android:layout_height="wrap_content" ' +
            'android:text="' + text + '" android:textColor="' + theme.TEXT_MUTED + '" android:textSize="9sp"/>';
    },

    _createEntrySectionTitle: function (text) {
        var theme = this.THEME;
        return '<TextView android:layout_width="match_parent" android:layout_height="wrap_content" ' +
            'android:text="' + text + '" android:textColor="' + theme.ACCENT_GREEN + '" android:textSize="13sp" ' +
            'android:textStyle="bold" android:layout_marginTop="4dp" android:layout_marginBottom="6dp"/>';
    },

    _createEntryCardStart: function () {
        var theme = this.THEME;
        return '<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" ' +
            'android:orientation="vertical" android:background="' + theme.BG_CARD + '" android:padding="12dp" ' +
            'android:layout_marginBottom="14dp">';
    },

    _createEntryInfoRow: function (label, tag, value) {
        var theme = this.THEME;
        var escapeXml = EVEQuantumFAX.utils.escapeXml;
        return '<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" ' +
            'android:orientation="horizontal" android:gravity="top" android:layout_marginBottom="6dp">' +
            '<TextView android:layout_width="110dp" android:layout_height="wrap_content" android:text="' + escapeXml(label) + '" ' +
            'android:textColor="' + theme.TEXT_MUTED + '" android:textSize="12sp"/>' +
            '<TextView android:tag="' + tag + '" android:layout_width="0dp" android:layout_height="wrap_content" ' +
            'android:layout_weight="1" android:text="' + escapeXml(value || "") + '" android:textColor="' + theme.TEXT_PRIMARY + '" ' +
            'android:textSize="12sp"/>' +
            '</LinearLayout>';
    },

    _createLogTabXml: function (isLandscape) {
        var theme = this.THEME;
        var logListXml = EVEQuantumFAX.logger.createLogListXml();
        var logCount = EVEQuantumFAX.state.logs.length;
        var scrollHeight = this.getPanelMetrics(isLandscape, "log").logHeightDp;
        var parts = [];

        parts.push('<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:orientation="horizontal" android:gravity="center_vertical" android:background="' + theme.BG_PRIMARY + '" ');
        parts.push('android:paddingLeft="4dp" android:paddingRight="4dp" android:paddingTop="3dp" android:paddingBottom="3dp">');
        parts.push('<TextView android:layout_width="0dp" android:layout_height="wrap_content" android:layout_weight="1" ');
        parts.push('android:text="日志条数：' + logCount + '" android:textColor="' + theme.TEXT_MUTED + '" android:textSize="8sp"/>');
        parts.push('<TextView android:layout_width="wrap_content" android:layout_height="wrap_content" ');
        parts.push('android:text="滑动查看" android:textColor="' + theme.TEXT_MUTED + '" android:textSize="8sp"/>');
        parts.push('</LinearLayout>');

        parts.push('<ScrollView android:tag="logScrollView" android:layout_width="match_parent" android:layout_height="' + scrollHeight + '" ');
        parts.push('android:background="' + theme.BG_PRIMARY + '" android:fadeScrollbars="false" android:scrollbarStyle="insideOverlay" ');
        parts.push('android:scrollbarThumbVertical="@android:color/darker_gray" android:overScrollMode="always" android:fillViewport="true">');
        parts.push(logListXml);
        parts.push('</ScrollView>');

        parts.push('<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:orientation="horizontal" android:layout_marginTop="3dp" android:background="' + theme.BG_PRIMARY + '">');
        parts.push('<Button android:tag="btnClearLog" android:text="清空" android:layout_width="0dp" android:layout_height="26dp" ');
        parts.push('android:layout_weight="1" android:background="' + theme.BG_CARD + '" android:textColor="' + theme.ACCENT_RED + '" ');
        parts.push('android:textSize="9sp" android:layout_marginRight="2dp" android:paddingTop="1dp" android:paddingBottom="1dp"/>');
        parts.push('<Button android:tag="btnRefreshLog" android:text="刷新" android:layout_width="0dp" android:layout_height="26dp" ');
        parts.push('android:layout_weight="1" android:background="' + theme.BG_CARD + '" android:textColor="' + theme.ACCENT_GREEN + '" ');
        parts.push('android:textSize="9sp" android:layout_marginLeft="2dp" android:paddingTop="1dp" android:paddingBottom="1dp"/>');
        parts.push('</LinearLayout>');

        return parts.join("");
    },

    _getStatusText: function () {
        var state = EVEQuantumFAX.state;
        if (!state.isRunning) {
            return "未运行";
        }
        if (state.isPaused) {
            return "已暂停";
        }
        return "运行中";
    },

    _getStatusColor: function () {
        var theme = this.THEME;
        var state = EVEQuantumFAX.state;
        if (!state.isRunning) {
            return theme.TEXT_MUTED;
        }
        if (state.isPaused) {
            return theme.ACCENT_YELLOW;
        }
        return theme.ACCENT_GREEN;
    },

    _getStartPauseLabel: function () {
        var state = EVEQuantumFAX.state;
        if (!state.isRunning) {
            return "启动";
        }
        if (state.isPaused) {
            return "继续";
        }
        return "暂停";
    },

    _getStartPauseColor: function () {
        var theme = this.THEME;
        var state = EVEQuantumFAX.state;
        if (!state.isRunning || state.isPaused) {
            return theme.ACCENT_GREEN;
        }
        return theme.ACCENT_YELLOW;
    }
};
