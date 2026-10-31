@echo off
echo Starting PATCHPILOT...
echo.
echo Starting backend on port 8000...
start "PatchPilot Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting frontend on port 3000...
start "PatchPilot Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo PATCHPILOT is starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Close the terminal windows to stop the servers.
