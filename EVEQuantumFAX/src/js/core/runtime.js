var floaty = {
    requestFloatViewPermission: function (timeout) {
        if (utilsWrapper == null) {
            return false;
        }
        return utilsWrapper.requestFloatViewPermission(timeout);
    },
    hasFloatViewPermission: function () {
        if (utilsWrapper == null) {
            return false;
        }
        return utilsWrapper.hasFloatViewPermission();
    },
    showFloatXml: function (tag, xml, x, y) {
        if (utilsWrapper == null) {
            return null;
        }
        return utilsWrapper.showFloatXml_floaty(tag, xml, x, y);
    },
    getX: function (tag) {
        return utilsWrapper == null ? -1 : utilsWrapper.getX_floaty(tag);
    },
    getY: function (tag) {
        return utilsWrapper == null ? -1 : utilsWrapper.getY_floaty(tag);
    },
    updateX: function (tag, x) {
        return utilsWrapper == null ? false : utilsWrapper.updateX_floaty(tag, x);
    },
    updateY: function (tag, y) {
        return utilsWrapper == null ? false : utilsWrapper.updateY_floaty(tag, y);
    },
    updateSize: function (tag, width, height) {
        return utilsWrapper == null ? false : utilsWrapper.updateSize_floaty(tag, width, height);
    },
    close: function (tag) {
        return utilsWrapper == null ? false : utilsWrapper.closeFloatView_floaty(tag);
    },
    focusable: function (tag, focusable) {
        return utilsWrapper == null ? false : utilsWrapper.focusable_floaty(tag, focusable);
    },
    touchable: function (tag, touchable) {
        return utilsWrapper == null ? false : utilsWrapper.touchable_floaty(tag, touchable);
    }
};

var device = {
    getScreenWidth: function () {
        return deviceWrapper == null ? 0 : deviceWrapper.getScreenWidth();
    },
    getScreenHeight: function () {
        return deviceWrapper == null ? 0 : deviceWrapper.getScreenHeight();
    }
};

var thread = {
    execAsync: function (runnable) {
        if (threadWrapper == null) {
            return null;
        }
        return threadWrapper.execAsyncRh(runnable);
    },
    cancelThread: function (taskId) {
        if (threadWrapper == null || taskId == null) {
            return true;
        }
        threadWrapper.cancelThread(taskId);
        return true;
    }
};

function StorageApiWrapper(name) {
    this.name = name;
}

StorageApiWrapper.prototype.clear = function () {
    return storageWrapper == null ? false : storageWrapper.clear(this.name);
};

StorageApiWrapper.prototype.contains = function (key) {
    return storageWrapper == null ? false : storageWrapper.contains(this.name, key);
};

StorageApiWrapper.prototype.remove = function (key) {
    return storageWrapper == null ? false : storageWrapper.remove(this.name, key);
};

StorageApiWrapper.prototype.putString = function (key, value) {
    return storageWrapper == null ? false : storageWrapper.putString(this.name, key, value);
};

StorageApiWrapper.prototype.putInt = function (key, value) {
    return storageWrapper == null ? false : storageWrapper.putInt(this.name, key, value);
};

StorageApiWrapper.prototype.putBoolean = function (key, value) {
    return storageWrapper == null ? false : storageWrapper.putBoolean(this.name, key, value);
};

StorageApiWrapper.prototype.getString = function (key, defaultValue) {
    var value;
    if (storageWrapper == null) {
        return defaultValue;
    }
    value = storageWrapper.getString(this.name, key, defaultValue);
    if (value == null || value == undefined) {
        return defaultValue;
    }
    return "" + value;
};

StorageApiWrapper.prototype.getInt = function (key, defaultValue) {
    return storageWrapper == null ? defaultValue : storageWrapper.getInt(this.name, key, defaultValue);
};

StorageApiWrapper.prototype.getBoolean = function (key, defaultValue) {
    return storageWrapper == null ? defaultValue : storageWrapper.getBoolean(this.name, key, defaultValue);
};

var storages = {
    create: function (name) {
        return new StorageApiWrapper(name);
    }
};
