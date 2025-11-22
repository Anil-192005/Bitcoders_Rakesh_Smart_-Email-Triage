@echo off
REM Production startup script for Windows
REM Starts both backend and frontend servers

echo Starting Smart Email Triage Tool in Production Mode...
echo.

REM Start Backend
echo Starting Backend Server...
cd backend
start "Email Triage Backend" cmd /k "python run_production.py"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend (if built)
if exist "frontend\dist" (
    echo Starting Frontend Server...
    cd frontend
    start "Email Triage Frontend" cmd /k "npm run preview"
    cd ..
) else (
    echo Frontend not built. Run 'npm run build' in frontend directory first.
    echo Starting development server instead...
    cd frontend
    start "Email Triage Frontend" cmd /k "npm run dev"
    cd ..
)

echo.
echo Servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul

