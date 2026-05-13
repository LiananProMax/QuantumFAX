# EVEQuantumFAX

EVEQuantumFAX is an EasyClick template project that combines a floating control panel with a self-hosted IEC hot update flow.

## Project Layout

- `.idea/src/js/main.js` starts the app, checks for hot updates, and then shows the floating control panel.
- `.idea/src/js/core` contains shared runtime, state, panel config, hooks, and hot update config.
- `.idea/src/js/services/updater.js` handles update check, download, version persistence, and script restart.
- `.idea/src/js/services/demoTask.js` is the placeholder task loop. Replace it with your real EVEQuantumFAX logic.
- `server` is the Node update server used by the client hot update flow.
- `upload-iec.ps1` and `upload-iec.bat` upload `.idea/build/release.iec` to the update server.

## EasyClick Client

1. Open this root directory as the EasyClick project.
2. For local debugging, `.idea/src/js/core/hotupdateConfig.js` points to `http://192.168.31.141:3000`. If your LAN IP changes, update `EVE_QUANTUM_FAX_UPDATE_SERVER_URL`.
3. Keep `.idea/src/update.json` `update_url` empty. The client uses the self-hosted server URL from `hotupdateConfig.js`.
4. Build and run the project. On first launch, grant floating window permission when prompted.

Startup order:

1. Load panel/runtime modules.
2. Check hot update through `/api/update/check`.
3. If a new IEC is downloaded, call `restartScript` and stop the current startup.
4. If no update is available or update fails, show the mini floating control ball.

## Update Server

```powershell
cd server
npm install
npm start
```

The server listens on `PORT` from `server/.env`, or `3000` by default. The local debug config is initialized as:

```env
PORT=3000
ENABLE_AUTH=false
API_TOKEN=
```

## Upload IEC

After EasyClick builds `.idea/build/release.iec`, upload it with:

```powershell
$env:EC_UPDATE_SERVER_URL="http://127.0.0.1:3000"
$env:EC_UPDATE_API_TOKEN="change-me"
.\upload-iec.ps1 -Message "release notes"
```

If auth is disabled on the server, `EC_UPDATE_API_TOKEN` can be omitted. The upload endpoint increments the server version automatically and writes `server/data/appVersion.json`.

## Runtime Notes

- Floating window storage namespace: `EVEQuantumFAX`.
- Hot update storage namespace: `EVEQuantumFAXHotupdate`.
- Floating tags: `eve_quantum_fax_mini`, `eve_quantum_fax_panel`, `eve_quantum_fax_overlay`.
- Replace `demoTask.js` and `hooks.js` with your real automation logic while keeping `setStopCallback` cleanup intact.
