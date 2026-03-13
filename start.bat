@echo off
setlocal

:: Load environment variables if .env exists
if exist .env (
    for /f "tokens=*" %%a in ('findstr /v /c:"#" .env') do set %%a
)

:: Set default port if not already set
if "%PORT%"=="" set PORT=8000

:: Verify if frontend/dist exists, and build if missing
if not exist frontend\dist (
    echo Warning: frontend/dist not found.
    echo Building frontend...
    cd frontend
    call npm install
    call npm run build
    cd ..
)

:: Start Backend
echo Starting DataFlow-WebUI on port %PORT%...
cd backend
python run_server.py
cd ..

endlocal
