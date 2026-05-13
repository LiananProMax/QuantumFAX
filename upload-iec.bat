@echo off
REM 调用 upload-iec.ps1；可在同目录设置环境变量 EC_UPDATE_SERVER_URL / EC_UPDATE_API_TOKEN
powershell -ExecutionPolicy Bypass -File "%~dp0upload-iec.ps1" %*
