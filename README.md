# EVEQuantumFAX

## 启动说明

### 1. 启动热更新服务（本地调试时需先开启）

在项目根目录下执行：

```powershell
cd server
npm install
npm start
```

首次启动前，若没有 `server/.env`，可复制 `server/.env.example` 为 `server/.env` 并按需修改。端口默认 `3000`，由 `.env` 中的 `PORT` 控制。

### 2. 启动 EasyClick 客户端

1. 用 EasyClick 打开本项目根目录作为工程目录。
2. 本地调试时，若本机局域网 IP 与配置不一致，请修改 `EVEQuantumFAX/src/js/core/hotupdateConfig.js` 中的 `EVE_QUANTUM_FAX_UPDATE_SERVER_URL`，使其指向当前运行中的更新服务地址（例如 `http://你的IP:端口`）。
3. 保持 `EVEQuantumFAX/src/update.json` 里的 `update_url` 为空；客户端会使用 `hotupdateConfig.js` 中的自建服务地址进行检查。
4. 在 EasyClick 中构建并运行工程。首次运行若提示悬浮窗权限，请按系统提示授予。

建议在调试时：**先启动 `server`**，再在 EasyClick 中运行客户端。

### 3. 上传 IEC 热更新包

EasyClick 构建完成后，默认产物路径为 `EVEQuantumFAX/build/release.iec`。可在项目根目录执行：

```powershell
.\upload-iec.ps1 -Message "release notes"
```

如果产物路径不同，可通过环境变量 `EC_IEC_PATH` 覆盖。
