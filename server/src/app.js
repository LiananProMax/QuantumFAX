const express = require("express");
const fs = require("fs");
const path = require("path");
const fleetRouter = require("./routes/fleet");
const updateRouter = require("./routes/update");

const app = express();
const dashboardDist = path.join(__dirname, "../dashboard/dist");
const dashboardIndex = path.join(dashboardDist, "index.html");

app.set("trust proxy", 1);
app.use(express.json());

app.get("/", (req, res) => {
    if (fs.existsSync(dashboardIndex)) {
        return res.sendFile(dashboardIndex);
    }

    res.json({
        name: "eve-quantum-fax-update-server",
        endpoints: {
            "GET /api/update/check": "检查更新（无更新返回空 body）",
            "GET /api/update/download": "下载 .iec",
            "GET /api/update/version": "当前版本信息",
            "POST /api/update/upload": "上传 .iec 并递增版本（需 Token，见 ENABLE_AUTH）",
            "POST /api/fleet/report": "上报舰船血量",
            "GET /api/fleet/ships": "查询舰队舰船状态",
            "GET /api/fleet/summary": "查询舰队汇总"
        }
    });
});

app.use("/api/update", updateRouter);
app.use("/api/fleet", fleetRouter);

if (fs.existsSync(dashboardDist)) {
    app.use(express.static(dashboardDist));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/")) {
            return next();
        }
        res.sendFile(dashboardIndex);
    });
}

app.use((req, res) => {
    res.status(404).json({ success: false, error: "Not found" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, error: "服务器内部错误" });
});

module.exports = app;
