
@echo off
REM Abre VS Code y corre la app COLAB ED automáticamente

cd /d "%~dp0"
start code .
timeout /t 2 >nul
start cmd /k "npm run dev"
