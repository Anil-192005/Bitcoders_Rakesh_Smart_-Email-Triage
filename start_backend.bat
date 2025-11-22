@echo off
echo Starting Smart Email Triage Backend...
echo.

echo Starting backend server on http://localhost:8001
echo API Documentation: http://localhost:8001/docs
echo Press Ctrl+C to stop the server
echo.

cd backend
python run_production.py

pause
