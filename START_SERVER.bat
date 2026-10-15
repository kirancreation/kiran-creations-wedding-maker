@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ================================================
echo   KIRAN CREATIONS - Wedding Video Maker
echo ================================================
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js install kora nei. README-bangla file-e instruction dekhen.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Prothom bar setup hocche. Internet lagbe, kichukhon opekkha korun...
  call npm install
  if errorlevel 1 (echo Setup failed. Internet connection check korun. & pause & exit /b 1)
)
start "Kiran Creations" http://localhost:3000
npm start
pause
