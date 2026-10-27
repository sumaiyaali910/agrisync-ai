@echo off
title AgriSync AI - Sindh Smart Agriculture Platform
echo ===================================================================
echo Starting AgriSync AI Full-Stack Server (http://localhost:8000)
echo ===================================================================
cd /d "%~dp0backend"
python -m uvicorn app:app --reload --port 8000
pause
