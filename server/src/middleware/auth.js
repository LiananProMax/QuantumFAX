const security = require("../config/security");

function authMiddleware(req, res, next) {
    if (!security.enableAuth) {
        return next();
    }
    if (!security.apiToken) {
        console.warn("[安全] 已启用 ENABLE_AUTH 但未配置 API_TOKEN，上传接口放行");
        return next();
    }
    const token = req.headers["x-api-token"] || req.query.token;
    if (!token) {
        return res.status(401).json({ success: false, error: "缺少认证令牌 X-API-Token" });
    }
    if (token !== security.apiToken) {
        return res.status(401).json({ success: false, error: "认证令牌无效" });
    }
    next();
}

module.exports = authMiddleware;
