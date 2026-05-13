const express = require("express");
const updateRouter = require("./routes/update");

const app = express();

app.set("trust proxy", 1);
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        name: "eve-quantum-fax-update-server",
        endpoints: {
            "GET /api/update/check": "检查更新（无更新返回空 body）",
            "GET /api/update/download": "下载 .iec",
            "GET /api/update/version": "当前版本信息",
            "POST /api/update/upload": "上传 .iec 并递增版本（需 Token，见 ENABLE_AUTH）"
        }
    });
});

app.use("/api/update", updateRouter);

app.use((req, res) => {
    res.status(404).json({ success: false, error: "Not found" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, error: "服务器内部错误" });
});

module.exports = app;
