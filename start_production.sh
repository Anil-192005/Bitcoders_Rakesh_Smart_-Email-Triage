#!/bin/bash
# Production startup script for Linux/Mac
# Starts both backend and frontend servers

echo "Starting Smart Email Triage Tool in Production Mode..."
echo ""

# Start Backend
echo "Starting Backend Server..."
cd backend
python3 run_production.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start Frontend
if [ -d "frontend/dist" ]; then
    echo "Starting Frontend Server (Production Build)..."
    cd frontend
    npm run preview &
    FRONTEND_PID=$!
    cd ..
else
    echo "Frontend not built. Building now..."
    cd frontend
    npm run build
    npm run preview &
    FRONTEND_PID=$!
    cd ..
fi

echo ""
echo "Servers started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

