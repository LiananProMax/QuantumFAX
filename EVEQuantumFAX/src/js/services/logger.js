var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.logger = {
    LEVEL: {
        INFO: "INFO",
        WARN: "WARN",
        ERROR: "ERROR",
        SUCCESS: "SUCCESS"
    },

    THEME: {
        BORDER: {
            INFO: "#6B7280",
            WARN: "#F59E0B",
            ERROR: "#EF4444",
            SUCCESS: "#10B981"
        },
        TEXT: {
            INFO: "#D1D5DB",
            WARN: "#FCD34D",
            ERROR: "#FCA5A5",
            SUCCESS: "#6EE7B7"
        },
        BG: {
            PRIMARY: "#0D0D12",
            CARD: "#16161E"
        },
        PROMPT: {
            INFO: ">",
            WARN: "!",
            ERROR: "x",
            SUCCESS: "+"
        }
    },

    _lastRemoteInfoAt: 0,

    add: function (message, level) {
        var constants = EVEQuantumFAX.constants;
        var state = EVEQuantumFAX.state;
        var now = new Date();
        var entry = {
            time: EVEQuantumFAX.utils.formatTime(now),
            timestamp: now.getTime(),
            level: level || this.LEVEL.INFO,
            message: String(message)
        };

        state.logs.unshift(entry);

        if (state.logs.length > constants.MAX_LOG_ENTRIES) {
            state.logs = state.logs.slice(0, constants.MAX_LOG_ENTRIES);
        }

        logd("[" + entry.level + "] " + entry.message);

        if (this._shouldEnqueueRemote(entry) &&
            EVEQuantumFAX.clientLogReporter && EVEQuantumFAX.clientLogReporter.enqueue) {
            try {
                EVEQuantumFAX.clientLogReporter.enqueue(entry);
            } catch (error) {
                logw("clientLogReporter.enqueue failed: " + error);
            }
        }
    },

    _shouldEnqueueRemote: function (entry) {
        var now;
        var intervalMs;

        if (!entry || entry.level !== this.LEVEL.INFO) {
            return true;
        }

        now = new Date().getTime();
        intervalMs = EVEQuantumFAX.configManager.getClientInfoLogSampleIntervalMs();
        if (now - this._lastRemoteInfoAt >= intervalMs) {
            this._lastRemoteInfoAt = now;
            return true;
        }

        return false;
    },

    info: function (message) {
        this.add(message, this.LEVEL.INFO);
    },

    warn: function (message) {
        this.add(message, this.LEVEL.WARN);
    },

    error: function (message) {
        this.add(message, this.LEVEL.ERROR);
    },

    success: function (message) {
        this.add(message, this.LEVEL.SUCCESS);
    },

    clear: function () {
        EVEQuantumFAX.state.logs = [];
    },

    createLogItemXml: function (entry, isLast) {
        var escapeXml = EVEQuantumFAX.utils.escapeXml;
        var theme = this.THEME;
        var borderColor = theme.BORDER[entry.level] || theme.BORDER.INFO;
        var textColor = theme.TEXT[entry.level] || theme.TEXT.INFO;
        var prompt = theme.PROMPT[entry.level] || theme.PROMPT.INFO;
        var marginBottom = isLast ? "0dp" : "2dp";
        var parts = [];

        parts.push('<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:orientation="horizontal" android:layout_marginBottom="' + marginBottom + '">');
        parts.push('<View android:layout_width="2dp" android:layout_height="match_parent" ');
        parts.push('android:background="' + borderColor + '"/>');
        parts.push('<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:orientation="horizontal" android:background="' + theme.BG.CARD + '" ');
        parts.push('android:paddingLeft="4dp" android:paddingRight="4dp" android:paddingTop="3dp" android:paddingBottom="3dp" ');
        parts.push('android:gravity="center_vertical">');
        parts.push('<TextView android:layout_width="wrap_content" android:layout_height="wrap_content" ');
        parts.push('android:text="' + prompt + '" android:textColor="' + borderColor + '" android:textSize="8sp" android:textStyle="bold"/>');
        parts.push('<TextView android:layout_width="wrap_content" android:layout_height="wrap_content" ');
        parts.push('android:text=" ' + escapeXml(entry.time) + ' " android:textColor="#4B5563" android:textSize="7sp" ');
        parts.push('android:fontFamily="monospace"/>');
        parts.push('<TextView android:layout_width="0dp" android:layout_height="wrap_content" android:layout_weight="1" ');
        parts.push('android:text="' + escapeXml(entry.message) + '" android:textColor="' + textColor + '" ');
        parts.push('android:textSize="8sp" android:fontFamily="monospace" android:maxLines="3"/>');
        parts.push('</LinearLayout></LinearLayout>');

        return parts.join("");
    },

    createLogListXml: function () {
        var logs = EVEQuantumFAX.state.logs;
        var theme = this.THEME;
        var parts = [];
        var i;

        if (logs.length === 0) {
            parts.push('<LinearLayout android:layout_width="match_parent" android:layout_height="match_parent" ');
            parts.push('android:gravity="center" android:orientation="vertical" android:background="' + theme.BG.PRIMARY + '" ');
            parts.push('android:padding="12dp">');
            parts.push('<TextView android:layout_width="wrap_content" android:layout_height="wrap_content" ');
            parts.push('android:text="暂无日志" android:textColor="#6B7280" android:textSize="10sp"/>');
            parts.push('<TextView android:layout_width="wrap_content" android:layout_height="wrap_content" ');
            parts.push('android:text="启动主循环后会在这里显示日志" android:textColor="#4B5563" android:textSize="8sp" ');
            parts.push('android:layout_marginTop="4dp"/>');
            parts.push('</LinearLayout>');
            return parts.join("");
        }

        parts.push('<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" ');
        parts.push('android:orientation="vertical" android:background="' + theme.BG.PRIMARY + '" android:padding="2dp">');

        for (i = 0; i < logs.length; i++) {
            parts.push(this.createLogItemXml(logs[i], i === logs.length - 1));
        }

        parts.push('</LinearLayout>');
        return parts.join("");
    }
};
