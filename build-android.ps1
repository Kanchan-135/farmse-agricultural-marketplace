# FarmSe Android APK Automated Build Script
Write-Host "===============================================" -ForegroundColor Green
Write-Host "   FarmSe - Building Native Android APK        " -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# 1. Environment Setup
if (-not $env:JAVA_HOME) {
    if (Test-Path "C:\Program Files\Java\jdk-21.0.10") {
        $env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
    } elseif (Test-Path "C:\Program Files\Android\Android Studio\jbr") {
        $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
    }
}
Write-Host "[1/5] Using JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Cyan

if (-not $env:ANDROID_HOME) {
    $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
}
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
Write-Host "[2/5] Using ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Cyan

# 2. Build Frontend
Write-Host "`n[3/5] Building React Web Assets..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend compilation failed."
    exit 1
}

# 3. Sync with Capacitor Android Project
Write-Host "`n[4/5] Syncing Capacitor Android Project..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Error "Capacitor sync failed."
    exit 1
}

# 4. Assemble Android APK with Gradle
Write-Host "`n[5/5] Compiling and Signing Android APK..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend\android"
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gradle build failed."
    exit 1
}

# 5. Copy Output APK to Root
$sourceApk = "$PSScriptRoot\frontend\android\app\build\outputs\apk\debug\app-debug.apk"
$destApk = "$PSScriptRoot\FarmSe.apk"
Copy-Item $sourceApk -Destination $destApk -Force

Write-Host "`n===============================================" -ForegroundColor Green
Write-Host "   BUILD SUCCESSFUL!                          " -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Generated APK Location:" -ForegroundColor White
Write-Host "$destApk" -ForegroundColor Green
$apkSize = (Get-Item $destApk).Length / 1MB
Write-Host ("Size: {0:N2} MB" -f $apkSize) -ForegroundColor Cyan
Write-Host "`nYou can copy FarmSe.apk directly to your Android device to install!" -ForegroundColor Yellow

Set-Location "$PSScriptRoot"
