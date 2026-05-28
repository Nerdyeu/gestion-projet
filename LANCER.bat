@echo off
title Samsara Reports
echo.
echo  ========================================
echo   Samsara Reports
echo  ========================================
echo.
echo  Demarrage du serveur local...
echo.
echo  Ouvrez : http://localhost:3000
echo.
echo  (Fermez cette fenetre pour arreter)
echo.
start http://localhost:3000
node server.js
pause
