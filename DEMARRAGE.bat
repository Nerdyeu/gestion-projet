@echo off
echo ========================================
echo  LANCEMENT DE L'APPLICATION
echo ========================================
echo.

echo [1/2] Demarrage du Backend...
start "Backend Server" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul

echo [2/2] Demarrage du Frontend...
start "Frontend App" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  APPLICATION EN COURS DE DEMARRAGE
echo ========================================
echo.
echo Backend : http://localhost:4001
echo Frontend : http://localhost:4000
echo.
echo Deux fenetres vont s'ouvrir :
echo - Backend Server (serveur API)
echo - Frontend App (interface React)
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul
