# Script PowerShell de demarrage complet de TalentSync AI
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "         TalentSync AI - Lancement des services         " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "`n[1/3] Demarrage du service IA FastAPI (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass", "-NoExit", "-Command", "cd '$root\ai-service-fastapi'; .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

Write-Host "[2/3] Demarrage du Backend Laravel (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass", "-NoExit", "-Command", "cd '$root\backend-laravel'; php -S 127.0.0.1:8080 -t public"

Write-Host "[3/3] Demarrage du Frontend React (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass", "-NoExit", "-Command", "cd '$root\frontend-react'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "`nTous les services sont en cours d'execution :" -ForegroundColor Green
Write-Host " - Frontend : http://localhost:5173" -ForegroundColor White
Write-Host " - Backend  : http://127.0.0.1:8080" -ForegroundColor White
Write-Host " - FastAPI  : http://127.0.0.1:8000/docs" -ForegroundColor White

Start-Process "http://localhost:5173"
