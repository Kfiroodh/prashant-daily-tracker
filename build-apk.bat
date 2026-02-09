@echo off
REM PRASHANT APK Build - Double click to run
REM यह file को double-click करो, फिर any key दबाओ

setlocal enabledelayedexpansion

REM Check if PowerShell exists
powershell -Command "exit" >nul 2>&1
if errorlevel 1 (
    echo ERROR: PowerShell not found
    pause
    exit /b 1
)

REM Run PowerShell script
echo Running PRASHANT APK Builder...
powershell -ExecutionPolicy Bypass -File "%~dp0build-apk.ps1"
pause

REM GitHub Repository URL
set REPO_URL=https://github.com/YOUR_USERNAME/prashant-daily-tracker
echo Repository URL: %REPO_URL%
