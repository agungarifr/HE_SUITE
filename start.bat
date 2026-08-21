@echo off
echo Starting HE_SUITE...

echo Cleaning up any old background services...
taskkill /F /IM node.exe >nul 2>&1

echo ==================================================
echo All services are starting in the background!
echo Wait about 3 seconds, then access the web app at http://localhost:7777
echo To safely stop the servers later, run stop.bat
echo ==================================================

start /B npm run dev
