param(
    [ValidateSet("help", "env", "install", "build", "start", "server", "dev", "dashboard-dev", "deploy", "upload-iec", "clean")]
    [string]$Action = "help"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Show-Help {
    Write-Host "QuantumFAX deployment commands:"
    Write-Host "  .\deploy.ps1 deploy        Prepare env, install dependencies, build dashboard, start server"
    Write-Host "  .\deploy.ps1 install       Install server and dashboard dependencies"
    Write-Host "  .\deploy.ps1 build         Build dashboard for production"
    Write-Host "  .\deploy.ps1 start         Start backend and dashboard dev server together"
    Write-Host "  .\deploy.ps1 server        Start the Node server only"
    Write-Host "  .\deploy.ps1 dev           Start the Node server in watch mode"
    Write-Host "  .\deploy.ps1 dashboard-dev Start the Vite dashboard dev server"
    Write-Host "  .\deploy.ps1 upload-iec    Upload the EasyClick IEC package"
    Write-Host "  .\deploy.ps1 clean         Remove generated dashboard build output"
}

function Ensure-Env {
    $source = Join-Path $Root "server\.env.example"
    $target = Join-Path $Root "server\.env"

    if ((Test-Path $target) -or !(Test-Path $source)) {
        if (Test-Path $target) {
            Write-Host "server/.env exists"
        } else {
            Write-Host "server/.env.example not found"
        }
        return
    }

    Copy-Item $source $target
    Write-Host "created server/.env"
}

function Install-Dependencies {
    & npm --prefix (Join-Path $Root "server") install
    & npm --prefix (Join-Path $Root "server\dashboard") install
}

function Build-Dashboard {
    & npm --prefix (Join-Path $Root "server") run build
}

function Start-Server {
    & npm --prefix (Join-Path $Root "server") start
}

function Start-DevServer {
    & npm --prefix (Join-Path $Root "server") run dev
}

function Start-DashboardDev {
    & npm --prefix (Join-Path $Root "server") run dashboard:dev
}

function Start-ManagedProcess {
    param(
        [string]$Name,
        [string]$WorkingDirectory,
        [string]$Command
    )

    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "cmd.exe"
    $startInfo.Arguments = "/d /c $Command"
    $startInfo.WorkingDirectory = $WorkingDirectory
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    $process.EnableRaisingEvents = $true

    $outId = "quantumfax-$Name-out-$([guid]::NewGuid())"
    $errId = "quantumfax-$Name-err-$([guid]::NewGuid())"
    $outEvent = Register-ObjectEvent -InputObject $process -EventName OutputDataReceived -SourceIdentifier $outId -MessageData $Name -Action {
        if ($EventArgs.Data) {
            Write-Host "[$($Event.MessageData)] $($EventArgs.Data)"
        }
    }
    $errEvent = Register-ObjectEvent -InputObject $process -EventName ErrorDataReceived -SourceIdentifier $errId -MessageData $Name -Action {
        if ($EventArgs.Data) {
            Write-Host "[$($Event.MessageData)] $($EventArgs.Data)"
        }
    }

    [void]$process.Start()
    $process.BeginOutputReadLine()
    $process.BeginErrorReadLine()

    [pscustomobject]@{
        Name = $Name
        Process = $process
        Events = @($outEvent, $errEvent)
    }
}

function Stop-ManagedProcess {
    param($Item)

    if ($Item.Process -and !$Item.Process.HasExited) {
        & taskkill.exe /PID $Item.Process.Id /T /F | Out-Null
    }
    foreach ($event in $Item.Events) {
        Unregister-Event -SourceIdentifier $event.Name -ErrorAction SilentlyContinue
        Remove-Job -Id $event.Id -Force -ErrorAction SilentlyContinue
    }
}

function Start-DevStack {
    $serverDir = Join-Path $Root "server"
    $processes = @(
        (Start-ManagedProcess -Name "backend" -WorkingDirectory $serverDir -Command "npm start"),
        (Start-ManagedProcess -Name "dashboard" -WorkingDirectory $serverDir -Command "npm run dashboard:dev")
    )

    Write-Host "Started backend and dashboard dev server. Press Ctrl+C to stop both."

    try {
        while ($true) {
            $finished = $processes | Where-Object { $_.Process.HasExited }
            if ($finished) {
                Start-Sleep -Milliseconds 300
                $failed = $finished | Where-Object { $_.Process.ExitCode -ne 0 }
                if ($failed) {
                    throw "One or more dev services stopped unexpectedly: $($failed.Name -join ', ')"
                }
                return
            }

            Start-Sleep -Milliseconds 500
        }
    } finally {
        foreach ($item in $processes) {
            Stop-ManagedProcess -Item $item
        }
    }
}

function Upload-Iec {
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root "upload-iec.ps1")
}

function Clean-Build {
    $dist = Join-Path $Root "server\dashboard\dist"
    Remove-Item $dist -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "removed server/dashboard/dist"
}

switch ($Action) {
    "help" { Show-Help }
    "env" { Ensure-Env }
    "install" { Install-Dependencies }
    "build" { Build-Dashboard }
    "start" { Start-DevStack }
    "server" { Start-Server }
    "dev" { Start-DevServer }
    "dashboard-dev" { Start-DashboardDev }
    "deploy" {
        Ensure-Env
        Install-Dependencies
        Build-Dashboard
        Start-Server
    }
    "upload-iec" { Upload-Iec }
    "clean" { Clean-Build }
}
