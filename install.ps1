# KidsLearn - PowerShell one-line installer
# Usage:  irm https://raw.githubusercontent.com/deanavraham-bit/kidslearn/main/install.ps1 | iex

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host "   KidsLearn - Installer" -ForegroundColor Cyan
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""

$repo    = "deanavraham-bit/kidslearn"
$exeName = "KidsLearn.Setup.1.0.0.exe"
$url     = "https://github.com/$repo/releases/latest/download/$exeName"
$dest    = Join-Path $env:TEMP $exeName

Write-Host "[1/2] Downloading KidsLearn (~98 MB)..." -ForegroundColor Yellow
Write-Host "      from: $url" -ForegroundColor DarkGray
try {
    # Show progress while downloading
    $ProgressPreference = 'Continue'
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
} catch {
    Write-Host "[X] Download failed: $_" -ForegroundColor Red
    Write-Host "    Check your internet connection and try again." -ForegroundColor Red
    return
}

$sizeMB = [math]::Round((Get-Item $dest).Length / 1MB, 1)
Write-Host "      Downloaded $sizeMB MB OK" -ForegroundColor Green
Write-Host ""

Write-Host "[2/2] Launching installer..." -ForegroundColor Yellow
Write-Host "      (If Windows shows a SmartScreen warning, click 'More info' -> 'Run anyway')" -ForegroundColor DarkGray
Start-Process -FilePath $dest

Write-Host ""
Write-Host "  ========================================" -ForegroundColor Green
Write-Host "   Installer started!" -ForegroundColor Green
Write-Host "   Follow the on-screen steps to finish." -ForegroundColor Green
Write-Host "  ========================================" -ForegroundColor Green
Write-Host ""
