@echo off
title YUGOLEARN — Local Intelligence & Persistent Memory Server
echo ============================================================
echo   YUGOLEARN — Serbian Cyrillic & Language Learning Engine
echo   Persistent SQLite Memory WAL + Local Ollama AI Intelligence
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Ensuring Ollama local service is active...
start /b ollama serve >nul 2>&1

echo [2/3] Starting Yugolearn Python Backend Server on port 8000...
cd backend
start "" "http://127.0.0.1:8000"
python -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload

pause
