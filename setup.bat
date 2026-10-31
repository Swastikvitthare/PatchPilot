@echo off
echo ============================================
echo   PATCHPILOT - Automated Setup
echo   Find the flaw. Fix the code. Prove the patch.
echo ============================================
echo.

REM Check prerequisites
where python >nul 2>&1 || (echo ERROR: Python not found. Install Python 3.11+ && exit /b 1)
where node >nul 2>&1 || (echo ERROR: Node.js not found. Install Node.js 20+ && exit /b 1)
where git >nul 2>&1 || (echo ERROR: Git not found. Install Git && exit /b 1)

echo [1/8] Setting up Python virtual environment...
cd backend
python -m venv venv
call venv\Scripts\activate.bat

echo [2/8] Installing Python dependencies...
pip install -r requirements.txt --quiet

echo [3/8] Running backend tests...
python -m pytest tests/ -v --tb=short
if errorlevel 1 (
    echo WARNING: Some backend tests failed. Check output above.
) else (
    echo All backend tests passed!
)

cd ..

echo [4/8] Installing frontend dependencies...
cd frontend
call npm install

echo [5/8] Building frontend...
call npm run build
if errorlevel 1 (
    echo WARNING: Frontend build failed. Check output above.
) else (
    echo Frontend built successfully!
)

cd ..

echo [6/8] Setting up environment...
if not exist .env (
    copy .env.example .env
    echo Created .env from .env.example - Please edit with your API keys
) else (
    echo .env already exists
)

echo [7/8] Initializing Git repository...
if not exist .git (
    git init
    git add .
    git commit -m "Initial PATCHPILOT release"
    git branch -M main
    echo Git repository initialized
) else (
    echo Git repository already exists
)

echo [8/8] Setup complete!
echo.
echo ============================================
echo   To start the application:
echo   
echo   Backend:  cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo   Frontend: cd frontend ^&^& npm run dev
echo   
echo   Then open http://localhost:3000
echo ============================================
