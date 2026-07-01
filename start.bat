@echo off
echo ========================================
echo Starting Habit Hawk Application
echo ========================================
echo.

REM Check if backend virtual environment exists
if not exist "habit_hawk_backend\env" (
    echo ERROR: Backend environment not found
    echo Please run install.bat first
    exit /b 1
)

REM Check if frontend node_modules exists
if not exist "habit_hawk_frontend\node_modules" (
    echo ERROR: Frontend dependencies not found
    echo Please run install.bat first
    exit /b 1
)

echo Starting Backend (Port 8000) and Frontend...
echo.
echo Backend: http://localhost:8000
echo Frontend: Will open in Expo
echo.
echo Press Ctrl+C to stop both services
echo.

REM Start backend in a new window
start "Habit Hawk Backend" cmd /k "cd habit_hawk_backend && call env\Scripts\activate.bat && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend in current window
cd habit_hawk_frontend
call npm start
