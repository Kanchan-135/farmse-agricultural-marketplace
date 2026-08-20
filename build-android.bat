@echo off
echo ===============================================
echo    FarmSe - Building Native Android APK
echo ===============================================

powershell -ExecutionPolicy Bypass -File "%~dp0build-android.ps1"
