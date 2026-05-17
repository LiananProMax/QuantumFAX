# EVEQuantumFAX

## 运行项目

### 1. 安装后端依赖

Node 后端位于 `server`，同时负责热更新 API、舰队血量 API，以及托管构建后的前端看板。

```powershell
cd server
npm install
```

首次启动前，若没有 `server/.env`，可复制 `server/.env.example` 为 `server/.env` 并按需修改。端口默认 `3000`，由 `.env` 中的 `PORT` 控制。

### 2. 启动后端服务

```powershell
cd server
npm start
```

后端启动后：

- 热更新接口：`http://127.0.0.1:3000/api/update/*`
- 舰队血量接口：`http://127.0.0.1:3000/api/fleet/*`
- 已构建的前端看板：`http://127.0.0.1:3000/`

### 3. 启动前端看板

开发模式：

```powershell
cd server
npm --prefix dashboard install
npm run dashboard:dev
```

开发服务器默认由 Vite 启动，前端请求 `/api` 会代理到 `http://127.0.0.1:3000`，因此需要同时保持后端服务运行。

生产模式：

```powershell
cd server
npm --prefix dashboard install
npm run build
npm start
```

构建产物会输出到 `server/dashboard/dist`，随后由 Node 后端在根路径 `/` 托管。

### 4. 启动 EasyClick 客户端

1. 用 EasyClick 打开本项目根目录作为工程目录。
2. 本地调试时，若本机局域网 IP 与配置不一致，请修改 `EVEQuantumFAX/src/js/core/hotupdateConfig.js` 中的 `EVE_QUANTUM_FAX_UPDATE_SERVER_URL`，使其指向当前运行中的更新服务地址（例如 `http://你的IP:端口`）。
3. 保持 `EVEQuantumFAX/src/update.json` 里的 `update_url` 为空；客户端会使用 `hotupdateConfig.js` 中的自建服务地址进行检查。本地调试运行只展示版本信息，不会自动下载并重启到服务端 IEC。需要在本地调试中强制测试热更新时，可临时将 `hotupdateConfig.js` 的 `allowDebugAutoUpdate` 改为 `true`。
4. 在客户端悬浮窗配置页填写舰队后端地址，并选择舰船类型（使徒、特勒马科斯、海执政官）；客户端 ID 会首次运行时自动随机生成。
5. 在 EasyClick 中构建并运行工程。首次运行若提示悬浮窗权限，请按系统提示授予。

建议在调试时：**先启动 `server`**，再启动前端看板和 EasyClick 客户端。

### 5. 上传 IEC 热更新包

EasyClick 构建完成后，默认产物路径为 `EVEQuantumFAX/build/release.iec`。可在项目根目录执行：

```powershell
.\upload-iec.ps1 -Message "release notes"
```

如果产物路径不同，可通过环境变量 `EC_IEC_PATH` 覆盖。
