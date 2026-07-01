#!/bin/bash

echo "========================================"
echo "Habit Hawk Installation Script"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Step 1: Installing Backend Dependencies"
echo "----------------------------------------"
cd habit_hawk_backend

# Create virtual environment if it doesn't exist
if [ ! -d "env" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv env
fi

# Activate virtual environment and install dependencies
echo "Activating virtual environment..."
source env/bin/activate

echo "Installing Python packages from requirements.txt..."
pip install --upgrade pip
pip install -r ../requirements.txt

cd ..

echo ""
echo "Step 2: Installing Frontend Dependencies"
echo "----------------------------------------"

# Check if frontend directory exists
if [ ! -d "habit_hawk_frontend" ]; then
    echo "Creating Expo app with SDK 54..."
    npx create-expo-app@latest habit_hawk_frontend --template default@sdk-54
else
    echo "Frontend directory exists, installing dependencies..."
    cd habit_hawk_frontend
    npm install
    cd ..
fi

echo ""
echo "========================================"
echo "Installation Complete!"
echo "========================================"
echo ""
echo "To start the application, run:"
echo "  - Mac/Linux: ./start.sh"
echo "  - Or use VS Code debugger (F5)"
echo ""
