@echo off
title TalentSync AI - Startup
echo ========================================================
echo          TalentSync AI - Lancement des services
echo ========================================================
echo.

set ROOT=%~dp0

echo [1/3] Demarrage du service IA FastAPI (Port 8000)...
start "TalentSync AI - FastAPI Service" cmd /k "cd /d %ROOT%ai-service-fastapi && call venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo [2/3] Demarrage du Backend Laravel (Port 8080)...
start "TalentSync AI - Laravel Backend" cmd /k "cd /d %ROOT%backend-laravel && call php -S 127.0.0.1:8080 -t public"

echo [3/3] Demarrage du Frontend React (Port 5173)...
start "TalentSync AI - Frontend React" cmd /k "cd /d %ROOT%frontend-react && call npm run dev"

ping 127.0.0.1 -n 4 >nul
echo.
echo ========================================================
echo Tous les services sont lances !
echo - Frontend : http://localhost:5173
echo - Backend  : http://127.0.0.1:8080
echo - IA Fast  : http://127.0.0.1:8000/docs
echo ========================================================
echo.
start http://localhost:5173
