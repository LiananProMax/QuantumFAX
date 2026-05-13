/**
 * EVEQuantumFAX hot update server entry.
 */
require("dotenv").config();

const app = require("./src/app");
const security = require("./src/config/security");

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("=========================================");
    console.log("  EVEQuantumFAX 热更新服务已启动");
    console.log(`  http://0.0.0.0:${PORT}`);
    console.log("=========================================");
    console.log(`  管理员上传认证: ${security.enableAuth ? "启用" : "关闭"} (ENABLE_AUTH)`);
    console.log(`  API_TOKEN: ${security.apiToken ? "已配置" : "未配置（上传接口将放行）"}`);
    console.log("");
    console.log("  GET  /api/update/check");
    console.log("  GET  /api/update/download?file=...");
    console.log("  GET  /api/update/version");
    console.log("  POST /api/update/upload  (multipart file, Header: X-API-Token)");
    console.log("");
});
