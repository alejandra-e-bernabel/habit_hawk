#!/bin/bash

echo "========================================"
echo "Starting Habit Hawk Application"
echo "========================================"
echo ""

# Check if backend virtual environment exists
if [ ! -d "habit_hawk_backend/env" ]; then
    echo "ERROR: Backend environment not found"
    echo "Please run ./install.sh first"
    exit 1
fi

# Check if frontend node_modules exists
if [ ! -d "habit_hawk_frontend/node_modules" ]; then
    echo "ERROR: Frontend dependencies not found"
    echo "Please run ./install.sh first"
    exit 1
fi

echo "Starting Backend (Port 8000) and Frontend..."
echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: Will open in Expo"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Trap Ctrl+C to kill both processes
trap 'kill $(jobs -p) 2>/dev/null; exit' INT TERM

# Start backend in background
cd habit_hawk_backend
source env/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Return to root directory
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend (this will run in foreground)
cd habit_hawk_frontend
npm start

# If frontend exits, kill backend
kill $BACKEND_PID 2>/dev/null
