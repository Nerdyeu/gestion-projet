@echo off
echo ========================================
echo  SAMSARA REPORTS - LANCEMENT
echo ========================================
echo.

echo [1/2] Demarrage du Backend...
start "Backend" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul

echo [2/2] Demarrage du Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  APPLICATION EN COURS DE DEMARRAGE
echo ========================================
echo.
echo Ouvrez : http://localhost:4000
echo.
pause >nul
