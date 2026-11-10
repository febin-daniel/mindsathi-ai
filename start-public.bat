@echo off
cd /d "%~dp0"
start "MindSathi Server" cmd /k "venv\Scripts\activate && python app.py"
timeout /t 5 >nul
start "MindSathi Tunnel" cmd /k ".\cloudflared.exe tunnel --url http://127.0.0.1:5000"
