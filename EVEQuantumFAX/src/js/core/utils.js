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
        var width = this.TOAST_WIDTH;
        var height = this.TOAST_HEIGHT;
        var screenWidth = screen.width || device.getScreenWidth() || 1080;
        var screenHeight = screen.height || device.getScreenHeight() || 1920;
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

    toast: function (message, extra) {
        return toast(message, this.getToastExtra(extra));
    }
};

EVEQuantumFAX.toast = function (message, extra) {
    return EVEQuantumFAX.utils.toast(message, extra);
};
