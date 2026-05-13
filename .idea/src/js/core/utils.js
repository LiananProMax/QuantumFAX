var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.utils = {
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
    }
};
