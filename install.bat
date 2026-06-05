@echo off
title KidsLearn - Installer
chcp 65001 >nul
echo.
echo  ========================================
echo   KidsLearn - Installation
echo  ========================================
echo.

set "NODE=C:\Program Files\nodejs\node.exe"
set "NPM=C:\Program Files\nodejs\npm.cmd"

if not exist "%NODE%" (
    echo [X] Node.js not found.
    echo     Please install Node.js 20+ from https://nodejs.org/
    echo     and run this installer again.
    pause
    exit /b 1
)

echo [1/4] Installing client dependencies...
cd /d "%~dp0client"
call "%NPM%" install --no-audit --no-fund
if errorlevel 1 (echo [X] client install failed & pause & exit /b 1)

echo.
echo [2/4] Installing server dependencies...
cd /d "%~dp0server"
call "%NPM%" install --no-audit --no-fund
if errorlevel 1 (echo [X] server install failed & pause & exit /b 1)

echo.
echo [3/4] Building client...
cd /d "%~dp0client"
call "%NPM%" run build
if errorlevel 1 (echo [X] client build failed & pause & exit /b 1)

echo.
echo [4/4] Seeding default config...
cd /d "%~dp0server\data"
if not exist "config.json" (
    copy /Y "config.sample.json" "config.json" >nul
    echo     created config.json (edit it from the app's "Email Settings" screen)
) else (
    echo     config.json already exists - keeping it
)

echo.
echo  ========================================
echo   Installation complete!
echo.
echo   To run KidsLearn:
echo     - Double-click launch.vbs
echo   Or create a desktop shortcut to it.
echo  ========================================
echo.
pause
