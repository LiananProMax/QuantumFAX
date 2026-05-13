/**
 * EasyClick IEC 热更新 API（最小集）
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const updateStore = require("../store/updateStore");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, updateStore.getUpdatesDir());
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, `${baseName}_${timestamp}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() === ".iec") {
            cb(null, true);
        } else {
            cb(new Error("只允许上传 .iec 文件"));
        }
    }
});

router.get("/check", (req, res) => {
    const clientVersion = req.query.version || 0;
    const licenseKey = req.query.licenseKey || req.headers["x-license-key"] || "";
    const deviceId = req.query.deviceId || "";
    const pkgName = req.query.pkgName || "";

    console.log(
        `[Update] check version=${clientVersion} license=${licenseKey ? licenseKey.substring(0, 4) + "***" : "无"} device=${deviceId} pkg=${pkgName}`
    );

    const updateInfo = updateStore.checkUpdate(clientVersion);
    if (!updateInfo) {
        return res.send("");
    }

    const config = updateStore.getVersionConfig();
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    let downloadUrl = `${baseUrl}/api/update/download?file=${encodeURIComponent(config.fileName)}`;
    if (licenseKey) {
        downloadUrl += `&licenseKey=${encodeURIComponent(licenseKey)}`;
    }

    res.json({
        download_url: downloadUrl,
        version: String(updateInfo.version),
        msg: updateInfo.msg || "发现新版本",
        dialog: updateInfo.dialog !== false,
        force: updateInfo.force === true,
        md5: updateInfo.md5 || "",
        download_timeout: updateInfo.download_timeout || 60
    });
});

router.get("/download", (req, res) => {
    const fileName = req.query.file;
    if (!fileName) {
        return res.status(400).json({ success: false, error: "缺少文件名参数 file" });
    }
    const sanitizedFileName = path.basename(fileName);
    if (sanitizedFileName !== fileName || !fileName.endsWith(".iec")) {
        return res.status(400).json({ success: false, error: "无效的文件名" });
    }
    const filePath = updateStore.getIECFilePath(sanitizedFileName);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: "文件不存在" });
    }
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${sanitizedFileName}"`);
    res.sendFile(filePath, (err) => {
        if (err && !res.headersSent) {
            res.status(500).json({ success: false, error: "文件发送失败" });
        }
    });
});

router.get("/version", (req, res) => {
    const config = updateStore.getVersionConfig();
    res.json({
        success: true,
        version: config.version,
        versionName: config.versionName,
        msg: config.msg,
        updatedAt: config.updatedAt
    });
});

router.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "未上传文件" });
        }
        const uploadedFile = req.file;
        const { msg = "", force = "false", dialog = "true" } = req.query;

        const currentConfig = updateStore.getVersionConfig();
        const newVersion = (parseInt(currentConfig.version) || 0) + 1;
        const versionStr = String(newVersion);
        let versionName = versionStr;
        if (versionStr.length >= 3) {
            const major = versionStr.slice(0, -2);
            const minor = versionStr.slice(-2, -1);
            const patch = versionStr.slice(-1);
            versionName = `${major}.${minor}.${patch}`;
        }

        const newConfig = {
            version: newVersion,
            versionName,
            fileName: uploadedFile.filename,
            msg: msg || `版本 ${versionName} 更新`,
            dialog: dialog !== "false",
            force: force === "true",
            downloadTimeout: 60
        };

        const updated = updateStore.updateVersion(newConfig);
        if (!updated) {
            fs.unlinkSync(uploadedFile.path);
            return res.status(500).json({ success: false, error: "更新版本配置失败" });
        }

        res.json({
            success: true,
            version: newVersion,
            versionName,
            fileName: uploadedFile.filename,
            md5: updated.md5,
            msg: newConfig.msg,
            force: newConfig.force,
            dialog: newConfig.dialog
        });
    } catch (error) {
        console.error("[Update] upload:", error);
        res.status(500).json({ success: false, error: error.message || "服务器错误" });
    }
});

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ success: false, error: "文件过大，最大 50MB" });
        }
        return res.status(400).json({ success: false, error: err.message });
    }
    if (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
    next();
});

module.exports = router;
