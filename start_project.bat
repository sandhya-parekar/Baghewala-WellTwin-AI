@echo off
title Baghewala WellTwin AI - Startup Launcher
color 0A

echo ===================================================================
echo   BAGHEWALA WELLTWIN AI - DIGITAL TWIN SYSTEM LAUNCHER
echo   Smart India Hackathon 2026 - Problem Statement: SIH26120
echo   Oil India Limited (Heavy Oil CSS ^& SRP Asset Optimization)
echo ===================================================================
echo.

cd /d "%~dp0"

:: 1. Check Python
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10+ and re-run this script.
    pause
    exit /b 1
)
python --version

:: 2. Check Node
echo [2/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js v18+ and re-run this script.
    pause
    exit /b 1
)
node --version

:: 3. Database Check
echo [3/6] Verifying SQLite database...
if not exist "database\welltwin.db" (
    echo Database not found. Initializing and generating physical seed dataset...
    python database\init_db.py
    python data\generate_demo_data.py
) else (
    echo Database verified at database\welltwin.db
)

:: 4. ML Models Check
echo [4/6] Verifying AI/ML models...
if exist "ml\saved_models\production_model.joblib" goto MODELS_OK

echo Training AI models - Production, Thermal Cooling, Equipment Risk...
python ml\train_models.py
goto MODELS_DONE

:MODELS_OK
echo Pre-trained models verified in ml\saved_models\

:MODELS_DONE

:: 5. Launch Backend
echo [5/6] Starting FastAPI REST API backend on port 8000...
start "Baghewala WellTwin AI - Backend API" cmd /k "title Backend API (Port 8000) && cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: 6. Launch Frontend
echo [6/6] Starting Vite React Frontend on port 5173...
start "Baghewala WellTwin AI - Frontend UI" cmd /k "title Frontend UI (Port 5173) && cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================================
echo   SERVICES INITIALIZED!
echo   Backend REST API:  http://127.0.0.1:8000  (Docs: /docs)
echo   Frontend UI:       http://localhost:5173
echo ===================================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Demo Accounts (Documented in README):
echo   Admin:    admin    / admin123
echo   Engineer: engineer / eng123
echo   Operator: operator / op123
echo   Viewer:   viewer   / guest123
echo.
echo To terminate all services, run stop_project.bat or close the console windows.
echo.
pause
