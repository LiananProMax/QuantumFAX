# EVEQuantumFAX - 上传 release.iec 到服务端并自动递增版本
# 使用前请修改下方配置区，或通过环境变量覆盖（见 README）

param(
    [string]$Message = "",
    [switch]$Force,
    [switch]$NoDialog
)

# ==================== 配置（请修改）====================
$ServerUrl = if ($env:EC_UPDATE_SERVER_URL) { $env:EC_UPDATE_SERVER_URL } else { "http://127.0.0.1:3000" }
$ApiToken = if ($env:EC_UPDATE_API_TOKEN) { $env:EC_UPDATE_API_TOKEN } else { "" }
$IecPath = if ($env:EC_IEC_PATH) { $env:EC_IEC_PATH } else { Join-Path $PSScriptRoot "EVEQuantumFAX\build\release.iec" }

# ==================== 检查文件 ====================
if (-not (Test-Path $IecPath)) {
    Write-Host "[ERROR] 未找到 IEC: $IecPath" -ForegroundColor Red
    Write-Host "请在 EasyClick 中先编译生成 release.iec" -ForegroundColor Yellow
    exit 1
}

$fileInfo = Get-Item $IecPath
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "EVEQuantumFAX 热更新 - IEC 上传" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "文件: $IecPath"
Write-Host "大小: $([math]::Round($fileInfo.Length / 1024, 2)) KB"
Write-Host "服务: $ServerUrl"
if (-not $ApiToken) {
    Write-Host "提示: 未设置 ApiToken；若服务端 ENABLE_AUTH=true 且已配置 API_TOKEN，上传将失败" -ForegroundColor Yellow
}
Write-Host "================================================" -ForegroundColor Cyan

$uploadUrl = "$ServerUrl/api/update/upload"
$queryParams = @()
if ($Message) {
    Add-Type -AssemblyName System.Web -ErrorAction SilentlyContinue
    if ([System.Web.HttpUtility]) {
        $queryParams += "msg=$([System.Web.HttpUtility]::UrlEncode($Message))"
    } else {
        $queryParams += "msg=$([uri]::EscapeDataString($Message))"
    }
}
if ($Force) { $queryParams += "force=true" }
if ($NoDialog) { $queryParams += "dialog=false" }
if ($queryParams.Count -gt 0) {
    $uploadUrl += "?" + ($queryParams -join "&")
}

Write-Host "上传中..." -ForegroundColor Yellow

try {
    Add-Type -AssemblyName System.Net.Http

    $httpClient = New-Object System.Net.Http.HttpClient
    if ($ApiToken) {
        $httpClient.DefaultRequestHeaders.Add("X-API-Token", $ApiToken)
    }

    $fileStream = [System.IO.File]::OpenRead($IecPath)
    $fileContent = New-Object System.Net.Http.StreamContent($fileStream)
    $fileContent.Headers.ContentType = New-Object System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream")

    $formData = New-Object System.Net.Http.MultipartFormDataContent
    $formData.Add($fileContent, "file", "release.iec")

    $response = $httpClient.PostAsync($uploadUrl, $formData).Result
    $responseBody = $response.Content.ReadAsStringAsync().Result

    $fileStream.Close()
    $httpClient.Dispose()

    if ($response.IsSuccessStatusCode) {
        $result = $responseBody | ConvertFrom-Json
        Write-Host "[SUCCESS] 上传完成 version=$($result.version) file=$($result.fileName)" -ForegroundColor Green
    } else {
        Write-Host "[FAILED] HTTP $($response.StatusCode) $responseBody" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] $_" -ForegroundColor Red
    exit 1
}
