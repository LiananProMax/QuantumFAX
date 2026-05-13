/**
 * 热更新版本与 IEC 文件存储
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "../../data");
const VERSION_FILE = path.join(DATA_DIR, "appVersion.json");
const UPDATES_DIR = path.join(DATA_DIR, "updates");

if (!fs.existsSync(UPDATES_DIR)) {
    fs.mkdirSync(UPDATES_DIR, { recursive: true });
}

const DEFAULT_VERSION = {
    version: 1,
    versionName: "1.0.0",
    downloadUrl: "",
    fileName: "",
    md5: "",
    msg: "",
    dialog: true,
    force: false,
    downloadTimeout: 60,
    updatedAt: null
};

function ensureVersionFile() {
    if (!fs.existsSync(VERSION_FILE)) {
        saveVersionConfig(DEFAULT_VERSION);
    }
}

function loadVersionConfig() {
    ensureVersionFile();
    let config = { ...DEFAULT_VERSION };
    try {
        if (fs.existsSync(VERSION_FILE)) {
            const data = fs.readFileSync(VERSION_FILE, "utf8");
            config = { ...config, ...JSON.parse(data) };
        }
    } catch (err) {
        console.error("[UpdateStore] 加载失败:", err.message);
    }
    if (config.fileName && iecFileExists(config.fileName)) {
        config.md5 = calculateMD5(getIECFilePath(config.fileName));
    }
    return config;
}

function saveVersionConfig(config) {
    try {
        config.updatedAt = new Date().toISOString();
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(VERSION_FILE, JSON.stringify(config, null, 2), "utf8");
        return true;
    } catch (err) {
        console.error("[UpdateStore] 保存失败:", err.message);
        return false;
    }
}

function calculateMD5(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const hash = crypto.createHash("md5");
        hash.update(fileBuffer);
        return hash.digest("hex");
    } catch (err) {
        console.error("[UpdateStore] MD5:", err.message);
        return "";
    }
}

function getIECFilePath(fileName) {
    return path.join(UPDATES_DIR, fileName);
}

function iecFileExists(fileName) {
    if (!fileName) return false;
    return fs.existsSync(getIECFilePath(fileName));
}

function updateVersion(config) {
    const current = loadVersionConfig();
    const updated = { ...current, ...config };
    if (config.fileName && iecFileExists(config.fileName)) {
        updated.md5 = calculateMD5(getIECFilePath(config.fileName));
    }
    return saveVersionConfig(updated) ? updated : null;
}

function checkUpdate(clientVersion) {
    const config = loadVersionConfig();
    const clientVer = parseInt(clientVersion) || 0;
    const serverVer = parseInt(config.version) || 0;
    if (clientVer >= serverVer) {
        return null;
    }
    if (!config.fileName || !iecFileExists(config.fileName)) {
        console.warn("[UpdateStore] IEC 不存在:", config.fileName);
        return null;
    }
    return {
        version: config.version,
        versionName: config.versionName,
        msg: config.msg,
        dialog: config.dialog,
        force: config.force,
        download_timeout: config.downloadTimeout,
        md5: config.md5
    };
}

function getVersionConfig() {
    return loadVersionConfig();
}

function getUpdatesDir() {
    return UPDATES_DIR;
}

module.exports = {
    loadVersionConfig,
    saveVersionConfig,
    updateVersion,
    checkUpdate,
    getVersionConfig,
    calculateMD5,
    getIECFilePath,
    iecFileExists,
    getUpdatesDir
};
