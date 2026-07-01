@echo off
echo ========================================
echo Habit Hawk Installation Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

echo Step 1: Installing Backend Dependencies
echo ----------------------------------------
cd habit_hawk_backend

REM Create virtual environment if it doesn't exist
if not exist "env" (
    echo Creating Python virtual environment...
    python -m venv env
)

REM Activate virtual environment and install dependencies
echo Activating virtual environment...
call env\Scripts\activate.bat

echo Installing Python packages from requirements.txt...
pip install --upgrade pip
pip install -r ..\requirements.txt

cd ..

echo.
echo Step 2: Installing Frontend Dependencies
echo ----------------------------------------

REM Check if frontend directory exists
if not exist "habit_hawk_frontend" (
    echo Creating Expo app with SDK 54...
    npx create-expo-app@latest habit_hawk_frontend --template default@sdk-54
) else (
    echo Frontend directory exists, installing dependencies...
    cd habit_hawk_frontend
    call npm install
    cd ..
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To start the application, run:
echo   - Windows: start.bat
echo   - Or use VS Code debugger (F5)
echo.
pause
