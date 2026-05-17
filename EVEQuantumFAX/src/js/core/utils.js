var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.utils = {
    TOAST_WIDTH: 520,
    TOAST_HEIGHT: 72,
    TOAST_Y_RATIO: 0.18,

    initScreen: function () {
        var screen = EVEQuantumFAX.screen;
        var width = device.getScreenWidth();
        var height = device.getScreenHeight();

        if (!width || !height) {
            width = 1080;
            height = 1920;
        }

        screen.width = width;
        screen.height = height;
        screen.isLandscape = width >= height;

        logd("[Screen] " + screen.width + "x" + screen.height + " landscape=" + screen.isLandscape);
    },

    escapeXml: function (value) {
        if (value == null || value == undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    },

    formatTime: function (date) {
        function pad(number) {
            return number < 10 ? "0" + number : "" + number;
        }

        return [
            pad(date.getHours()),
            pad(date.getMinutes()),
            pad(date.getSeconds())
        ].join(":");
    },

    clamp: function (value, minValue, maxValue) {
        return Math.max(minValue, Math.min(maxValue, value));
    },

    parsePositiveInt: function (value, fallbackValue) {
        var parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed <= 0) {
            return fallbackValue;
        }
        return parsed;
    },

    getToastExtra: function (extra) {
        var screen = EVEQuantumFAX.screen || {};
        var screenWidth = screen.width || device.getScreenWidth() || 1080;
        var screenHeight = screen.height || device.getScreenHeight() || 1920;
        var width = Math.min(this.TOAST_WIDTH, Math.max(240, screenWidth - 80));
        var height = this.TOAST_HEIGHT;
        var options = {
            x: Math.max(0, Math.round((screenWidth - width) / 2)),
            y: Math.max(40, Math.round(screenHeight * this.TOAST_Y_RATIO)),
            duration: 1000,
            textColor: "#FFFFFF",
            width: width,
            height: height,
            draggable: false
        };
        var key;

        if (extra) {
            for (key in extra) {
                if (extra.hasOwnProperty(key)) {
                    options[key] = extra[key];
                }
            }
        }

        return options;
    },

    createToastXml: function (message, options) {
        var safeMessage = this.escapeXml(message);

        return '<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android" ' +
            'android:layout_width="' + options.width + 'px" android:layout_height="' + options.height + 'px" ' +
            'android:tag="toastContainer" android:paddingLeft="16px" android:paddingRight="16px" ' +
            'android:background="#CC111827" android:gravity="center">' +
            '<TextView android:layout_width="match_parent" android:layout_height="match_parent" ' +
            'android:gravity="center" android:text="' + safeMessage + '" ' +
            'android:textColor="' + options.textColor + '" android:textSize="16sp" ' +
            'android:maxLines="2" android:ellipsize="end"/>' +
            '</FrameLayout>';
    },

    _applyToastBackground: function (view) {
        var self = this;

        if (!view || !view.post) {
            return;
        }

        view.post(new java.lang.Runnable({
            run: function () {
                var container;
                var drawable;

                try {
                    container = view.findViewWithTag("toastContainer");
                    if (!container) {
                        return;
                    }

                    drawable = new android.graphics.drawable.GradientDrawable();
                    drawable.setColor(self._parseToastColor("#CC111827"));
                    drawable.setCornerRadius(28);
                    drawable.setStroke(1, self._parseToastColor("#6634D399"));
                    container.setBackground(drawable);
                } catch (error) {
                    logw("Toast background failed: " + error);
                }
            }
        }));
    },

    _parseToastColor: function (colorText) {
        try {
            return android.graphics.Color.parseColor(colorText);
        } catch (error) {
            return android.graphics.Color.DKGRAY;
        }
    },

    closeToast: function (token) {
        var state = EVEQuantumFAX.state;
        var constants = EVEQuantumFAX.constants;

        if (token != null && token !== state.toastToken) {
            return;
        }

        floaty.close(constants.FLOAT_TAG_TOAST);
        state.toastView = null;
    },

    toast: function (message, extra) {
        var state = EVEQuantumFAX.state;
        var constants = EVEQuantumFAX.constants;
        var options;
        var text;
        var view;
        var token;

        text = String(message == null ? "" : message);

        if (!floaty.hasFloatViewPermission()) {
            return toast(text);
        }

        EVEQuantumFAX.utils.initScreen();
        options = this.getToastExtra(extra);
        token = (state.toastToken || 0) + 1;
        state.toastToken = token;

        floaty.close(constants.FLOAT_TAG_TOAST);
        view = floaty.showFloatXml(constants.FLOAT_TAG_TOAST, this.createToastXml(text, options), options.x, options.y);
        if (!view) {
            return toast(text);
        }

        state.toastView = view;
        floaty.updateSize(constants.FLOAT_TAG_TOAST, options.width, options.height);
        floaty.touchable(constants.FLOAT_TAG_TOAST, !!options.draggable);
        this._applyToastBackground(view);

        setTimeout(function () {
            EVEQuantumFAX.utils.closeToast(token);
        }, options.duration);

        return true;
    }
};

EVEQuantumFAX.toast = function (message, extra) {
    return EVEQuantumFAX.utils.toast(message, extra);
};
