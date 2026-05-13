var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.healthMonitor = {
    COLOR_TOLERANCE: 16,
    HEALTH_TOAST_WIDTH: 520,
    HEALTH_TOAST_HEIGHT: 72,
    HEALTH_TOAST_Y_RATIO: 0.18,

    TARGET_COLORS: [
        "#741C1B",
        "#6A1C1C",
        "#731718",
        "#651111",
        "#751B1B",
        "#5F1313",
        "#681716",
        "#680E0E",
        "#641415",
        "#68100F",
        "#692526",
        "#771D1D",
        "#761B1A",
        "#C51D1C",
        "#CC1E1F",
        "#CA2020",
        "#C41C1C",
        "#C81E1E",
        "#C71A1C",
        "#B32121",
        "#AE2628",
        "#C8201F",
        "#D42625"
    ],

    SHIELD_POINTS: [
        { percent: 0, x: 597, y: 670 },
        { percent: 10, x: 586, y: 657 },
        { percent: 20, x: 579, y: 640 },
        { percent: 30, x: 576, y: 621 },
        { percent: 40, x: 582, y: 600 },
        { percent: 50, x: 593, y: 585 },
        { percent: 60, x: 605, y: 575 },
        { percent: 70, x: 627, y: 565 },
        { percent: 80, x: 645, y: 564 },
        { percent: 90, x: 661, y: 569 }
    ],

    ARMOR_POINTS: [
        { percent: 0, x: 602, y: 665 },
        { percent: 10, x: 593, y: 654 },
        { percent: 20, x: 588, y: 639 },
        { percent: 30, x: 584, y: 621 },
        { percent: 40, x: 588, y: 605 },
        { percent: 50, x: 597, y: 590 },
        { percent: 60, x: 611, y: 579 },
        { percent: 70, x: 627, y: 573 },
        { percent: 80, x: 643, y: 572 },
        { percent: 90, x: 658, y: 575 }
    ],

    _screenCaptureReady: false,
    _targetRgbList: null,

    ensureScreenCapture: function () {
        var requested;

        if (this._screenCaptureReady) {
            return true;
        }

        requested = image.requestScreenCapture(10000, 0);
        if (!requested) {
            requested = image.requestScreenCapture(10000, 0);
        }

        if (!requested) {
            return false;
        }

        this._screenCaptureReady = true;
        sleep(1000);
        return true;
    },

    detect: function () {
        var screenImage;
        var result = {
            ok: false,
            shield: "",
            armor: "",
            error: ""
        };

        if (!this.ensureScreenCapture()) {
            result.error = "截图权限申请失败";
            return result;
        }

        screenImage = this._captureScreen();
        if (screenImage == null) {
            result.error = "截图失败";
            return result;
        }

        try {
            result.shield = this._detectByPoints(screenImage, this.SHIELD_POINTS);
            result.armor = this._detectByPoints(screenImage, this.ARMOR_POINTS);
            result.ok = true;
            return result;
        } catch (error) {
            result.error = "" + error;
            return result;
        } finally {
            this._recycleImage(screenImage);
        }
    },

    showHealthToast: function () {
        var result = this.detect();
        var message;
        var toastExtra = this._getHealthToastExtra();

        if (!result.ok) {
            message = "血量检测失败：" + result.error;
            toast(message, toastExtra);
            if (EVEQuantumFAX.logger) {
                EVEQuantumFAX.logger.warn(message);
            }
            return result;
        }

        message = "护盾: " + result.shield + " | 装甲: " + result.armor;
        toast(message, toastExtra);
        return result;
    },

    _getHealthToastExtra: function () {
        var screen = EVEQuantumFAX.screen || {};
        var width = this.HEALTH_TOAST_WIDTH;
        var height = this.HEALTH_TOAST_HEIGHT;
        var screenWidth = screen.width || device.getScreenWidth() || 1080;
        var screenHeight = screen.height || device.getScreenHeight() || 1920;

        return {
            x: Math.max(0, Math.round((screenWidth - width) / 2)),
            y: Math.max(40, Math.round(screenHeight * this.HEALTH_TOAST_Y_RATIO)),
            duration: 1000,
            textColor: "#FFFFFF",
            width: width,
            height: height,
            draggable: false
        };
    },

    _captureScreen: function () {
        if (image.captureFullScreenEx) {
            return image.captureFullScreenEx();
        }

        return image.captureFullScreen();
    },

    _detectByPoints: function (screenImage, points) {
        var i;
        var point;
        var colorValue;

        for (i = 0; i < points.length; i++) {
            point = points[i];
            colorValue = image.pixelInImage(screenImage, point.x, point.y);
            if (this._matchesAnyTargetColor(colorValue)) {
                return this._formatHealthRange(point.percent);
            }
        }

        return this._formatHealthRange(100);
    },

    _formatHealthRange: function (percent) {
        if (percent <= 0) {
            return "0%";
        }

        if (percent >= 100) {
            return "100%";
        }

        return (percent - 10) + "%-" + percent + "%";
    },

    _matchesAnyTargetColor: function (colorValue) {
        var rgb;
        var targets = this._getTargetRgbList();
        var i;
        var target;
        var tolerance = this.COLOR_TOLERANCE;

        if (colorValue == null || colorValue == undefined) {
            return false;
        }

        rgb = this._colorValueToRgb(colorValue);

        for (i = 0; i < targets.length; i++) {
            target = targets[i];
            if (Math.abs(rgb.r - target.r) <= tolerance &&
                Math.abs(rgb.g - target.g) <= tolerance &&
                Math.abs(rgb.b - target.b) <= tolerance) {
                return true;
            }
        }

        return false;
    },

    _getTargetRgbList: function () {
        var i;

        if (this._targetRgbList) {
            return this._targetRgbList;
        }

        this._targetRgbList = [];
        for (i = 0; i < this.TARGET_COLORS.length; i++) {
            this._targetRgbList.push(this._hexToRgb(this.TARGET_COLORS[i]));
        }

        return this._targetRgbList;
    },

    _hexToRgb: function (hexColor) {
        var value = parseInt(String(hexColor).replace("#", ""), 16);

        return {
            r: (value >> 16) & 0xff,
            g: (value >> 8) & 0xff,
            b: value & 0xff
        };
    },

    _colorValueToRgb: function (colorValue) {
        return {
            r: (colorValue >> 16) & 0xff,
            g: (colorValue >> 8) & 0xff,
            b: colorValue & 0xff
        };
    },

    _recycleImage: function (screenImage) {
        if (screenImage == null || !image.recycle) {
            return;
        }

        try {
            image.recycle(screenImage);
        } catch (error) {
            logw("healthMonitor recycle failed: " + error);
        }
    }
};
