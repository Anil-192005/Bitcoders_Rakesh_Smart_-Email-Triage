@echo off
echo ========================================
echo   AI Quiz System - Starting Servers
echo ========================================
echo.

echo Installing Python dependencies...
pip install -r requirements.txt
echo.

echo Starting AI Analysis API Server (Port 5000)...
start "AI API Server" cmd /k python api_server.py
timeout /t 3

echo Starting Web Server (Port 8000)...
start "Web Server" cmd /k python -m http.server 8000

echo.
echo ========================================
echo   Servers Started Successfully!
echo ========================================
echo.
echo Web Application: http://localhost:8000/STUDENTHOME.html
echo AI API Server:   http://localhost:5000/api/health
echo.
echo Press any key to stop all servers...
pause >nul

taskkill /FI "WindowTitle eq AI API Server*" /T /F
taskkill /FI "WindowTitle eq Web Server*" /T /F
