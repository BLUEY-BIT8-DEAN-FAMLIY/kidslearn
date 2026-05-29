@echo off
title KidsLearn

set "NODE=C:\Program Files\nodejs\node.exe"
set "NPM=C:\Program Files\nodejs\npm.cmd"
set "APP=C:\Users\97252\GAME3"

echo.
echo  === KidsLearn ===
echo.

if not exist "%NODE%" (
    echo ERROR: Node.js not found
    pause
    exit /b 1
)

echo [1/3] Starting server...
start "KidsLearn-Server" /min "%NODE%" "%APP%\server\index.js"

echo [2/3] Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo [3/3] Starting Vite client...
cd /d "%APP%\client"
"%NPM%" run dev

echo Shutting down server...
taskkill /F /FI "WindowTitle eq KidsLearn-Server" >nul 2>&1