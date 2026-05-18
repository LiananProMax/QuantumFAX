var EVEQuantumFAX = EVEQuantumFAX || {};

EVEQuantumFAX.healthMonitor = {
    COLOR_TOLERANCE: EVEQuantumFAX.healthMonitorColors.COLOR_TOLERANCE,
    DAMAGE_CONTROL_ICON: "sunkong.png",
    DAMAGE_CONTROL_REGION: { x: 1212, y: 640, ex: 1252, ey: 686 },
    DAMAGE_CONTROL_WEAK_THRESHOLD: 0.7,
    DAMAGE_CONTROL_THRESHOLD: 0.9,
    DAMAGE_CONTROL_MATCH_LIMIT: 1,
    DAMAGE_CONTROL_MATCH_METHOD: 5,
    DAMAGE_CONTROL_ACTIVE_POINT: { x: 1232, y: 633 },
    DAMAGE_CONTROL_SHIELD_DROP_RATE_THRESHOLD: 40,
    DAMAGE_CONTROL_ARMOR_DROP_THRESHOLD: 10,
    ARMOR_SUPPORT_SKILL_ICON: "armor01.png",
    REMOTE_DAMAGE_CONTROL_SKILL_ICON: "armor02.png",
    SUPPORT_SKILL_REGION: { x: 755, y: 642, ex: 779, ey: 674 },
    ARMOR_SUPPORT_SKILL_ACTIVE_POINT: { x: 762, y: 567 },
    REMOTE_DAMAGE_CONTROL_SKILL_ACTIVE_POINT: { x: 762, y: 634 },
    REMOTE_DAMAGE_CONTROL_SKILL_CLICK_REGION: { x: 744, y: 638, ex: 776, ey: 673 },
    SUPPORT_SKILL_WEAK_THRESHOLD: 0.7,
    SUPPORT_SKILL_THRESHOLD: 0.9,
    SUPPORT_SKILL_MATCH_LIMIT: 1,
    SUPPORT_SKILL_MATCH_METHOD: 5,
    LOGISTICS_SUPPORT_MODULE_ACTIVE_POINT: { x: 1087, y: 557 },
    LOGISTICS_SUPPORT_MODULE_REGION: { x: 1063, y: 563, ex: 1107, ey: 606 },
    ARMOR_REPAIR_1_REGION: { x: 847, y: 560, ex: 891, ey: 609 },
    ARMOR_REPAIR_2_REGION: { x: 920, y: 561, ex: 962, ey: 607 },
    ARMOR_REPAIR_3_REGION: { x: 991, y: 563, ex: 1036, ey: 611 },
    BATTERY_1_REGION: { x: 1137, y: 561, ex: 1180, ey: 609 },
    BATTERY_2_REGION: { x: 1209, y: 562, ex: 1253, ey: 610 },
    MICRO_WARP_DRIVE_REGION: { x: 845, y: 640, ex: 890, ey: 685 },
    DRONE_1_REGION: { x: 919, y: 639, ex: 961, ey: 686 },
    DRONE_2_REGION: { x: 990, y: 639, ex: 1034, ey: 685 },
    DRONE_3_REGION: { x: 1065, y: 640, ex: 1108, ey: 685 },
    DRONE_4_REGION: { x: 1136, y: 638, ex: 1180, ey: 685 },
    SHIP_IN_SPACE_ICON: "check_space.png",
    SHIP_IN_SPACE_REGION: { x: 498, y: 645, ex: 531, ey: 669 },
    SHIP_IN_SPACE_WEAK_THRESHOLD: 0.7,
    SHIP_IN_SPACE_THRESHOLD: 0.9,
    SHIP_IN_SPACE_MATCH_LIMIT: 1,
    SHIP_IN_SPACE_MATCH_METHOD: 5,
    HEALTH_RANGE_STEP: 5,

    EQUIPMENT_ACTIVE_COLORS: EVEQuantumFAX.healthMonitorColors.EQUIPMENT_ACTIVE_COLORS,
    TARGET_COLORS: EVEQuantumFAX.healthMonitorColors.TARGET_COLORS,

    SHIELD_POINTS: [
        { percent: 0, x: 598, y: 671 },
        { percent: 5, x: 592, y: 664 },
        { percent: 10, x: 586, y: 658 },
        { percent: 15, x: 582, y: 648 },
        { percent: 20, x: 579, y: 639 },
        { percent: 25, x: 578, y: 630 },
        { percent: 30, x: 577, y: 620 },
        { percent: 35, x: 579, y: 611 },
        { percent: 40, x: 582, y: 602 },
        { percent: 45, x: 587, y: 593 },
        { percent: 50, x: 592, y: 586 },
        { percent: 55, x: 599, y: 579 },
        { percent: 60, x: 606, y: 573 },
        { percent: 65, x: 614, y: 570 },
        { percent: 70, x: 624, y: 567 },
        { percent: 75, x: 634, y: 565 },
        { percent: 80, x: 643, y: 565 },
        { percent: 85, x: 652, y: 566 },
        { percent: 90, x: 661, y: 569 },
        { percent: 95, x: 669, y: 573 }
    ],

    ARMOR_POINTS: [
        { percent: 0, x: 602, y: 665 },
        { percent: 5, x: 597, y: 659 },
        { percent: 10, x: 592, y: 652 },
        { percent: 15, x: 589, y: 645 },
        { percent: 20, x: 586, y: 637 },
        { percent: 25, x: 585, y: 629 },
        { percent: 30, x: 585, y: 620 },
        { percent: 35, x: 586, y: 613 },
        { percent: 40, x: 589, y: 605 },
        { percent: 45, x: 592, y: 598 },
        { percent: 50, x: 598, y: 591 },
        { percent: 55, x: 604, y: 585 },
        { percent: 60, x: 610, y: 580 },
        { percent: 65, x: 618, y: 575 },
        { percent: 70, x: 626, y: 574 },
        { percent: 75, x: 634, y: 572 },
        { percent: 80, x: 642, y: 572 },
        { percent: 85, x: 651, y: 574 },
        { percent: 90, x: 659, y: 577 },
        { percent: 95, x: 666, y: 580 }
    ],

    STRUCTURE_POINTS: [
        { percent: 80, x: 642, y: 580 },
        { percent: 90, x: 655, y: 583 },
        { percent: 95, x: 661, y: 586 }
    ],

    _screenCaptureReady: false,
    _openCvReady: false,
    _targetRgbList: null,
    _equipmentActiveRgbList: null,
    _templateCache: {},
    _lastShipEmergencySnapshot: null,

    ensureScreenCapture: function () {
        var requested;
        var waitStart;

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
        waitStart = EVEQuantumFAX.perfStats ? EVEQuantumFAX.perfStats.now() : 0;
        sleep(1000);
        if (EVEQuantumFAX.perfStats && waitStart) {
            EVEQuantumFAX.perfStats.excludeFrom("screenCapture.initWait", waitStart);
        }
        return true;
    },

    detect: function () {
        var screenImage;

        if (!this.ensureScreenCapture()) {
            return this._createDetectionResult("截图权限申请失败");
        }

        screenImage = this._captureScreenTimed("health.capture");
        if (screenImage == null) {
            return this._createDetectionResult("截图失败");
        }

        try {
            return this._detectFromScreen(screenImage);
        } catch (error) {
            return this._createDetectionResult("" + error);
        } finally {
            this._recycleImage(screenImage);
        }
    },

    handleShipEmergency: function () {
        var screenImage;
        var detection;
        var now = new Date().getTime();

        if (!this.ensureScreenCapture()) {
            return this._createEmergencyResult(this._createDetectionResult("截图权限申请失败"));
        }

        screenImage = this._captureScreenTimed("health.capture");
        if (screenImage == null) {
            return this._createEmergencyResult(this._createDetectionResult("截图失败"));
        }

        try {
            detection = this._detectFromScreen(screenImage);
            return this._handleShipEmergencyWithDetection(detection, now, screenImage);
        } catch (error) {
            return this._createEmergencyResult(this._createDetectionResult("" + error));
        } finally {
            this._recycleImage(screenImage);
        }
    },

    _handleShipEmergencyWithDetection: function (detection, now, screenImage) {
        var rates;
        var result = this._createEmergencyResult(detection);

        if (!detection.ok) {
            result.reason = "血量检测失败";
            return result;
        }

        result.remoteDamageControlSkill = this.detectRemoteDamageControlSkillStatus(screenImage, now);

        rates = this._calculateHealthDrops(detection, now);
        this._lastShipEmergencySnapshot = {
            timestamp: now,
            shieldPercent: detection.shieldPercent,
            armorPercent: detection.armorPercent
        };

        if (!rates.ok) {
            result.reason = "等待血量基线";
            return result;
        }

        result.shieldDropRate = rates.shieldDropRate;
        result.armorDropRate = rates.armorDropRate;
        result.armorDropPercent = rates.armorDropPercent;

        if (result.shieldDropRate >= this.DAMAGE_CONTROL_SHIELD_DROP_RATE_THRESHOLD) {
            result.triggered = true;
            result.reason = "护盾下降 " + this._formatDropRate(result.shieldDropRate);
        }

        if (result.armorDropPercent >= this.DAMAGE_CONTROL_ARMOR_DROP_THRESHOLD) {
            result.triggered = true;
            result.reason = result.reason ?
                result.reason + "，装甲下降 " + this._formatDropPercent(result.armorDropPercent) :
                "装甲下降 " + this._formatDropPercent(result.armorDropPercent);
        }

        if (!result.triggered) {
            result.reason = "血量下降未达阈值";
            return result;
        }

        result.activated = this.activateDamageControl(screenImage);
        if (!result.activated) {
            result.reason += "，损控不可开启";
        }

        return result;
    },

    _createDetectionResult: function (error) {
        return {
            ok: false,
            shield: "",
            armor: "",
            shieldPercent: null,
            armorPercent: null,
            error: error || ""
        };
    },

    _createEmergencyResult: function (detection) {
        detection = detection || this._createDetectionResult("");
        return {
            ok: detection.ok,
            triggered: false,
            activated: false,
            shield: detection.shield,
            armor: detection.armor,
            shieldPercent: detection.shieldPercent,
            armorPercent: detection.armorPercent,
            shieldDropRate: 0,
            armorDropRate: 0,
            armorDropPercent: 0,
            remoteDamageControlSkill: null,
            reason: "",
            error: detection.error || ""
        };
    },

    _createSupportSkillStatus: function () {
        return {
            ok: false,
            available: false,
            active: false,
            canActivate: false,
            reason: "",
            error: ""
        };
    },

    _detectFromScreen: function (screenImage) {
        var start = EVEQuantumFAX.perfStats ? EVEQuantumFAX.perfStats.now() : 0;
        var shieldPercent;
        var armorPercent;
        var result = this._createDetectionResult("");

        shieldPercent = this._detectPercentByPoints(screenImage, this.SHIELD_POINTS);
        armorPercent = this._detectPercentByPoints(screenImage, this.ARMOR_POINTS);

        result.shieldPercent = shieldPercent;
        result.armorPercent = armorPercent;
        result.shield = this._formatHealthRange(shieldPercent);
        result.armor = this._formatHealthRange(armorPercent);
        result.ok = true;

        if (EVEQuantumFAX.perfStats && start) {
            EVEQuantumFAX.perfStats.recordFrom("health.pixel", start);
        }

        return result;
    },

    canActivateDamageControl: function (screenImage) {
        var ownsScreenImage = screenImage == null;
        var templateImage = null;
        var matches;
        var region = this.DAMAGE_CONTROL_REGION;
        var matchStart;

        if (!this.ensureScreenCapture() || !this._ensureOpenCV()) {
            return false;
        }

        try {
            templateImage = this._getTemplateImage(this.DAMAGE_CONTROL_ICON);
            if (templateImage == null) {
                logw("damage control template missing: " + this.DAMAGE_CONTROL_ICON);
                return false;
            }

            if (ownsScreenImage) {
                screenImage = this._captureScreenTimed("health.capture");
            }
            if (screenImage == null) {
                return false;
            }

            matchStart = EVEQuantumFAX.perfStats ? EVEQuantumFAX.perfStats.now() : 0;
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
            if (EVEQuantumFAX.perfStats && matchStart) {
                EVEQuantumFAX.perfStats.recordFrom("health.damageTemplate", matchStart);
            }

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
            if (ownsScreenImage) {
                this._recycleImage(screenImage);
            }
        }
    },

    activateDamageControl: function (screenImage) {
        var point;

        if (!this.canActivateDamageControl(screenImage)) {
            return false;
        }

        point = this._randomPointInRegion(this.DAMAGE_CONTROL_REGION);
        try {
            clickPoint(point.x, point.y);
            return true;
        } catch (error) {
            logw("activate damage control failed: " + error);
            return false;
        }
    },

    getArmorSupportSkillStatus: function (screenImage) {
        return this._detectSupportSkillStatus(
            screenImage,
            this.ARMOR_SUPPORT_SKILL_ICON,
            this.ARMOR_SUPPORT_SKILL_ACTIVE_POINT,
            "armorSupportSkill",
            "armor support skill"
        );
    },

    canActivateArmorSupportSkill: function (screenImage) {
        return this.getArmorSupportSkillStatus(screenImage).canActivate;
    },

    isArmorSupportSkillActive: function (screenImage) {
        return this._isSupportSkillActiveByColor(screenImage, this.ARMOR_SUPPORT_SKILL_ACTIVE_POINT);
    },

    getRemoteDamageControlSkillStatus: function (screenImage) {
        return this._detectSupportSkillStatus(
            screenImage,
            this.REMOTE_DAMAGE_CONTROL_SKILL_ICON,
            this.REMOTE_DAMAGE_CONTROL_SKILL_ACTIVE_POINT,
            "remoteDamageControlSkill",
            "remote damage control skill",
            this.REMOTE_DAMAGE_CONTROL_SKILL_CLICK_REGION
        );
    },

    canActivateRemoteDamageControlSkill: function (screenImage) {
        return this.getRemoteDamageControlSkillStatus(screenImage).canActivate;
    },

    isRemoteDamageControlSkillActive: function (screenImage) {
        return this._isSupportSkillActiveByColor(screenImage, this.REMOTE_DAMAGE_CONTROL_SKILL_ACTIVE_POINT);
    },

    detectRemoteDamageControlSkillStatus: function (screenImage, now) {
        var status;

        if (!this._shouldDetectRemoteDamageControlSkill()) {
            return null;
        }

        status = this.getRemoteDamageControlSkillStatus(screenImage);
        return this._createRemoteDamageControlSkillSnapshot(status, now);
    },

    activateRemoteDamageControlSkill: function (screenImage) {
        return this._activateSupportSkill(
            screenImage,
            this.REMOTE_DAMAGE_CONTROL_SKILL_ICON,
            this.REMOTE_DAMAGE_CONTROL_SKILL_ACTIVE_POINT,
            "remoteDamageControlSkill",
            "remote damage control skill"
        );
    },

    isShipInSpace: function () {
        var screenImage = null;
        var templateImage = null;
        var matches;
        var region = this.SHIP_IN_SPACE_REGION;
        var matchStart;

        if (!this.ensureScreenCapture() || !this._ensureOpenCV()) {
            return false;
        }

        try {
            templateImage = this._getTemplateImage(this.SHIP_IN_SPACE_ICON);
            if (templateImage == null) {
                logw("ship in space template missing: " + this.SHIP_IN_SPACE_ICON);
                return false;
            }

            screenImage = this._captureScreenTimed("health.capture");
            if (screenImage == null) {
                return false;
            }

            matchStart = EVEQuantumFAX.perfStats ? EVEQuantumFAX.perfStats.now() : 0;
            matches = image.findImage(
                screenImage,
                templateImage,
                region.x,
                region.y,
                region.ex,
                region.ey,
                this.SHIP_IN_SPACE_WEAK_THRESHOLD,
                this.SHIP_IN_SPACE_THRESHOLD,
                this.SHIP_IN_SPACE_MATCH_LIMIT,
                this.SHIP_IN_SPACE_MATCH_METHOD
            );
            if (EVEQuantumFAX.perfStats && matchStart) {
                EVEQuantumFAX.perfStats.recordFrom("health.spaceTemplate", matchStart);
            }

            return !!(matches && matches.length > 0);
        } catch (error) {
            logw("ship in space detection failed: " + error);
            return false;
        } finally {
            this._recycleImage(screenImage);
        }
    },

    isLogisticsSupportModuleActive: function () {
        var screenImage = null;

        if (!this.ensureScreenCapture()) {
            return false;
        }

        try {
            screenImage = this._captureScreenTimed("health.capture");
            if (screenImage == null) {
                return false;
            }

            return this._matchesEquipmentActiveColorAtPoint(
                screenImage,
                this.LOGISTICS_SUPPORT_MODULE_ACTIVE_POINT
            );
        } catch (error) {
            logw("logistics support module detection failed: " + error);
            return false;
        } finally {
            this._recycleImage(screenImage);
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

    _captureScreenTimed: function (metricName) {
        var start = EVEQuantumFAX.perfStats ? EVEQuantumFAX.perfStats.now() : 0;
        var screenImage = this._captureScreen();

        if (EVEQuantumFAX.perfStats && start) {
            EVEQuantumFAX.perfStats.recordFrom(metricName || "health.capture", start);
        }

        return screenImage;
    },

    _getTemplateImage: function (resourceName) {
        var start;

        if (this._templateCache[resourceName]) {
            return this._templateCache[resourceName];
        }

        start = EVEQuantumFAX.perfStats ? EVEQuantumFAX.perfStats.now() : 0;
        this._templateCache[resourceName] = readResAutoImage(resourceName);
        if (EVEQuantumFAX.perfStats && start) {
            EVEQuantumFAX.perfStats.recordFrom("health.templateLoad", start, resourceName);
        }

        return this._templateCache[resourceName];
    },

    releaseResources: function () {
        var name;

        for (name in this._templateCache) {
            if (this._templateCache.hasOwnProperty(name)) {
                this._recycleImage(this._templateCache[name]);
            }
        }

        this._templateCache = {};
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
        return this._formatHealthRange(this._detectPercentByPoints(screenImage, points));
    },

    _detectPercentByPoints: function (screenImage, points) {
        var i;
        var point;
        var colorValue;

        for (i = 0; i < points.length; i++) {
            point = points[i];
            colorValue = image.pixelInImage(screenImage, point.x, point.y);
            if (this._matchesAnyTargetColor(colorValue)) {
                return point.percent;
            }
        }

        return 100;
    },

    _formatHealthRange: function (percent) {
        if (percent <= 0) {
            return "0%";
        }

        if (percent >= 100) {
            return "100%";
        }

        return (percent - this.HEALTH_RANGE_STEP) + "%-" + percent + "%";
    },

    _calculateHealthDrops: function (detection, now) {
        var previous = this._lastShipEmergencySnapshot;
        var elapsedSec;

        if (!previous) {
            return {
                ok: false,
                shieldDropRate: 0,
                armorDropRate: 0,
                armorDropPercent: 0
            };
        }

        elapsedSec = (now - previous.timestamp) / 1000;
        if (elapsedSec <= 0) {
            return {
                ok: false,
                shieldDropRate: 0,
                armorDropRate: 0,
                armorDropPercent: 0
            };
        }

        return {
            ok: true,
            shieldDropRate: Math.max(0, (previous.shieldPercent - detection.shieldPercent) / elapsedSec),
            armorDropRate: Math.max(0, (previous.armorPercent - detection.armorPercent) / elapsedSec),
            armorDropPercent: Math.max(0, previous.armorPercent - detection.armorPercent)
        };
    },

    _formatDropRate: function (rate) {
        return (Math.round(rate * 10) / 10) + "%/s";
    },

    _formatDropPercent: function (percent) {
        return (Math.round(percent * 10) / 10) + "%";
    },

    _randomPointInRegion: function (region) {
        return {
            x: this._randomInt(region.x, region.ex),
            y: this._randomInt(region.y, region.ey)
        };
    },

    _randomInt: function (minValue, maxValue) {
        return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    },

    _matchesAnyTargetColor: function (colorValue) {
        return this._matchesAnyColor(colorValue, this._getTargetRgbList(), this.COLOR_TOLERANCE);
    },

    _isDamageControlActiveByColor: function (screenImage) {
        var point = this.DAMAGE_CONTROL_ACTIVE_POINT;
        return this._matchesEquipmentActiveColorAtPoint(screenImage, point);
    },

    _isSupportSkillActiveByColor: function (screenImage, activePoint) {
        var ownsScreenImage = screenImage == null;

        if (!this.ensureScreenCapture()) {
            return false;
        }

        try {
            if (ownsScreenImage) {
                screenImage = this._captureScreenTimed("health.capture");
            }
            if (screenImage == null) {
                return false;
            }

            return this._matchesEquipmentActiveColorAtPoint(screenImage, activePoint);
        } catch (error) {
            logw("support skill active color detection failed: " + error);
            return false;
        } finally {
            if (ownsScreenImage) {
                this._recycleImage(screenImage);
            }
        }
    },

    _detectSupportSkillStatus: function (screenImage, iconName, activePoint, metricName, logName) {
        var ownsScreenImage = screenImage == null;
        var templateImage = null;
        var matches;
        var region = this.SUPPORT_SKILL_REGION;
        var matchStart;
        var status = this._createSupportSkillStatus();

        if (!this.ensureScreenCapture() || !this._ensureOpenCV()) {
            status.error = "截图权限或OpenCV初始化失败";
            return status;
        }

        try {
            templateImage = this._getTemplateImage(iconName);
            if (templateImage == null) {
                status.error = "模板缺失：" + iconName;
                logw(logName + " template missing: " + iconName);
                return status;
            }

            if (ownsScreenImage) {
                screenImage = this._captureScreenTimed("health.capture");
            }
            if (screenImage == null) {
                status.error = "截图失败";
                return status;
            }

            status.ok = true;
            matchStart = EVEQuantumFAX.perfStats ? EVEQuantumFAX.perfStats.now() : 0;
            matches = image.findImage(
                screenImage,
                templateImage,
                region.x,
                region.y,
                region.ex,
                region.ey,
                this.SUPPORT_SKILL_WEAK_THRESHOLD,
                this.SUPPORT_SKILL_THRESHOLD,
                this.SUPPORT_SKILL_MATCH_LIMIT,
                this.SUPPORT_SKILL_MATCH_METHOD
            );
            if (EVEQuantumFAX.perfStats && matchStart) {
                EVEQuantumFAX.perfStats.recordFrom("health." + metricName, matchStart);
            }

            if (!(matches && matches.length > 0)) {
                status.reason = "冷却中";
                return status;
            }

            status.available = true;
            status.active = this._matchesEquipmentActiveColorAtPoint(screenImage, activePoint);
            status.canActivate = !status.active;
            status.reason = status.active ? "激活中" : "可开启";
            return status;
        } catch (error) {
            status.ok = false;
            status.error = "" + error;
            logw(logName + " detection failed: " + error);
            return status;
        } finally {
            if (ownsScreenImage) {
                this._recycleImage(screenImage);
            }
        }
    },

    _shouldDetectRemoteDamageControlSkill: function () {
        var shipType;

        if (!EVEQuantumFAX.configManager || !EVEQuantumFAX.config) {
            return false;
        }

        shipType = EVEQuantumFAX.configManager.normalizeShipType(EVEQuantumFAX.config.shipType);
        return shipType === "apostle" || shipType === "telemachus";
    },

    _createRemoteDamageControlSkillSnapshot: function (status, now) {
        var state = "unknown";

        status = status || this._createSupportSkillStatus();
        if (status.active) {
            state = "active";
        } else if (status.canActivate) {
            state = "available";
        } else if (status.reason === "冷却中") {
            state = "cooldown";
        }

        return {
            ok: status.ok === true,
            state: state,
            active: status.active === true,
            available: status.canActivate === true,
            canActivate: status.canActivate === true,
            reason: status.reason || "",
            error: status.error || "",
            observedAt: now || new Date().getTime()
        };
    },

    _activateSupportSkill: function (screenImage, iconName, activePoint, metricName, logName, clickRegion) {
        var status = this._detectSupportSkillStatus(screenImage, iconName, activePoint, metricName, logName);
        var point;

        if (status.active) {
            status.activated = true;
            status.reason = "已激活";
            return status;
        }

        if (!status.ok || !status.canActivate) {
            status.activated = false;
            return status;
        }

        try {
            point = clickRegion ? this._randomPointInRegion(clickRegion) : activePoint;
            clickPoint(point.x, point.y);
            status.activated = true;
            status.reason = "已点击";
            return status;
        } catch (error) {
            status.ok = false;
            status.activated = false;
            status.error = "" + error;
            logw(logName + " activation failed: " + error);
            return status;
        }
    },

    _matchesEquipmentActiveColorAtPoint: function (screenImage, point) {
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
