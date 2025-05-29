@echo off
echo Starting RSA-Based Secure Messaging App...
echo.
echo Starting Flask backend server...
start cmd /k "cd /d %~dp0 && python app.py"
echo.
echo Starting React frontend development server...
start cmd /k "cd /d %~dp0client && npm run dev"
echo.
echo Both servers are now running.
echo Flask backend: http://localhost:5000
echo React frontend: http://localhost:5173
echo.
echo Press any key to stop both servers.
pause
taskkill /f /im python.exe /t
taskkill /f /im node.exe /t
