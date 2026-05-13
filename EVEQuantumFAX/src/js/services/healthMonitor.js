var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.healthMonitor = {
    COLOR_TOLERANCE: EVEQuantumFAX.healthMonitorColors.COLOR_TOLERANCE,
    DAMAGE_CONTROL_ICON: "sunkong.png",
    DAMAGE_CONTROL_REGION: { x: 1200, y: 631, ex: 1263, ey: 692 },
    DAMAGE_CONTROL_WEAK_THRESHOLD: 0.7,
    DAMAGE_CONTROL_THRESHOLD: 0.9,
    DAMAGE_CONTROL_MATCH_LIMIT: 1,
    DAMAGE_CONTROL_MATCH_METHOD: 5,
    DAMAGE_CONTROL_ACTIVE_POINT: { x: 1232, y: 633 },

    EQUIPMENT_ACTIVE_COLORS: EVEQuantumFAX.healthMonitorColors.EQUIPMENT_ACTIVE_COLORS,
    TARGET_COLORS: EVEQuantumFAX.healthMonitorColors.TARGET_COLORS,

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
    _openCvReady: false,
    _targetRgbList: null,
    _equipmentActiveRgbList: null,

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

    canActivateDamageControl: function () {
        var screenImage = null;
        var templateImage = null;
        var matches;
        var region = this.DAMAGE_CONTROL_REGION;

        if (!this.ensureScreenCapture() || !this._ensureOpenCV()) {
            return false;
        }

        try {
            templateImage = readResAutoImage(this.DAMAGE_CONTROL_ICON);
            if (templateImage == null) {
                logw("damage control template missing: " + this.DAMAGE_CONTROL_ICON);
                return false;
            }

            screenImage = this._captureScreen();
            if (screenImage == null) {
                return false;
            }

            matches = image.findImage(
                screenImage,
                templateImage,
                region.x,
                region.y,
                region.ex,
                region.ey,
                this.DAMAGE_CONTROL_WEAK_THRESHOLD,
                this.DAMAGE_CONTROL_THRESHOLD,
                this.DAMAGE_CONTROL_MATCH_LIMIT,
                this.DAMAGE_CONTROL_MATCH_METHOD
            );

            if (!(matches && matches.length > 0)) {
                return false;
            }

            if (this._isDamageControlActiveByColor(screenImage)) {
                return false;
            }

            return true;
        } catch (error) {
            logw("damage control detection failed: " + error);
            return false;
        } finally {
            this._recycleImage(screenImage);
            this._recycleImage(templateImage);
        }
    },

    showHealthToast: function () {
        var result = this.detect();
        var message;

        if (!result.ok) {
            message = "血量检测失败：" + result.error;
            EVEQuantumFAX.toast(message);
            if (EVEQuantumFAX.logger) {
                EVEQuantumFAX.logger.warn(message);
            }
            return result;
        }

        message = "护盾: " + result.shield + " | 装甲: " + result.armor;
        EVEQuantumFAX.toast(message);
        return result;
    },

    _getHealthToastExtra: function () {
        return EVEQuantumFAX.utils.getToastExtra();
    },

    _captureScreen: function () {
        if (image.captureFullScreenEx) {
            return image.captureFullScreenEx();
        }

        return image.captureFullScreen();
    },

    _ensureOpenCV: function () {
        if (this._openCvReady) {
            return true;
        }

        try {
            this._openCvReady = image.initOpenCV();
        } catch (error) {
            logw("init OpenCV failed: " + error);
            this._openCvReady = false;
        }

        return this._openCvReady;
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
        return this._matchesAnyColor(colorValue, this._getTargetRgbList(), this.COLOR_TOLERANCE);
    },

    _isDamageControlActiveByColor: function (screenImage) {
        var point = this.DAMAGE_CONTROL_ACTIVE_POINT;
        var colorValue;

        if (screenImage == null) {
            return false;
        }

        colorValue = image.pixelInImage(screenImage, point.x, point.y);
        return this._matchesAnyColor(colorValue, this._getEquipmentActiveRgbList(), this.COLOR_TOLERANCE);
    },

    _matchesAnyColor: function (colorValue, targets, tolerance) {
        var rgb;
        var i;
        var target;

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

    _getEquipmentActiveRgbList: function () {
        var i;

        if (this._equipmentActiveRgbList) {
            return this._equipmentActiveRgbList;
        }

        this._equipmentActiveRgbList = [];
        for (i = 0; i < this.EQUIPMENT_ACTIVE_COLORS.length; i++) {
            this._equipmentActiveRgbList.push(this._hexToRgb(this.EQUIPMENT_ACTIVE_COLORS[i]));
        }

        return this._equipmentActiveRgbList;
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
