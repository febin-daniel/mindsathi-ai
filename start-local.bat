@echo off
cd /d "%~dp0"
start "MindSathi Server" cmd /k "venv\Scripts\activate && python app.py"
