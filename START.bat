@echo off
chcp 65001 >nul
title PostgreSQL Transactions - Presentation Launcher
cd /d "%~dp0"

echo ==================================================
echo   PostgreSQL Transactions // Presentation Launch
echo ==================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [INFO] Node.js not detected. Opening standalone offline build...
    start "" "%~dp0dist\index.html"
    exit /b 0
)

if not exist "node_modules" (
    echo [1/2] First launch: installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [WARN] npm install failed. Opening standalone build instead...
        start "" "%~dp0dist\index.html"
        pause
        exit /b 1
    )
)

echo [OK] Launching Vite server and opening browser...
echo      Press Ctrl+C in this window when the lesson is finished.
echo.
call npm run dev
pause
