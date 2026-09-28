@echo off
title Baghewala WellTwin AI - Shutdown Script
color 0C

echo ===================================================================
echo   BAGHEWALA WELLTWIN AI - STOPPING ALL RUNNING SERVICES
echo   Smart India Hackathon 2026 - Problem Statement: SIH26120
echo ===================================================================
echo.

echo [1/3] Terminating Backend process on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Terminating backend PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/3] Terminating Frontend process on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Terminating frontend PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo [3/3] Closing launched terminal windows...
taskkill /FI "WINDOWTITLE eq Backend API (Port 8000)*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend UI (Port 5173)*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Baghewala WellTwin AI - Backend API*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Baghewala WellTwin AI - Frontend UI*" /T /F >nul 2>&1

echo.
echo ===================================================================
echo   ALL BAGHEWALA WELLTWIN AI SERVICES HAVE BEEN STOPPED CLEANLY.
echo ===================================================================
echo.
pause
