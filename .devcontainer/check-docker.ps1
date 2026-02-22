# Runs on the HOST (Windows) before the dev container starts.
# Checks Docker is installed and the daemon is reachable.
# Offers to install via winget or open the download page if absent.

# ── Check if Docker is installed ────────────────────────
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Write-Host ""
    Write-Host "ERROR: Docker is not installed." -ForegroundColor Red

    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        $answer = Read-Host "   Install Docker Desktop via winget? [y/N]"
        if ($answer -eq "y" -or $answer -eq "Y") {
            Write-Host ""
            Write-Host "   Installing Docker Desktop..." -ForegroundColor Cyan
            winget install --id Docker.DockerDesktop -e --accept-source-agreements --accept-package-agreements
            Write-Host ""
            Write-Host "   Installed. Open Docker Desktop, wait for it to start, then reopen VS Code." -ForegroundColor Green
            exit 0
        }
    } else {
        Write-Host "   (winget not available — install it via the Microsoft Store as 'App Installer')" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "   Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Start-Process "https://www.docker.com/products/docker-desktop/"
    Write-Host ""
    exit 1
}

# ── Check if the daemon is running ──────────────────────
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Docker is installed but not running." -ForegroundColor Red
    Write-Host "   Attempting to start Docker Desktop..." -ForegroundColor Cyan
    $dockerDesktop = "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerDesktop) {
        Start-Process $dockerDesktop
        Write-Host "   Docker Desktop is starting — wait for the system tray icon, then try again." -ForegroundColor Yellow
    } else {
        Write-Host "   Open Docker Desktop from the Start menu and wait for it to start." -ForegroundColor Yellow
    }
    Write-Host ""
    exit 1
}

Write-Host "Docker is running." -ForegroundColor Green
