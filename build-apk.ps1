# PRASHANT APK Build Script
# Automatic setup with Java and Android SDK detection

Write-Host "================================================"
Write-Host "PRASHANT APK Builder - Automatic Setup"
Write-Host "================================================"
Write-Host ""

$projectDir = "C:\Users\skris\Desktop\prashant"
cd $projectDir

# Step 0: Auto-detect Java and Android SDK
Write-Host "[0/6] Detecting Java and Android SDK..."

# Find Java
if (-not $env:JAVA_HOME) {
    $javaPath = "C:\Program Files\Android\Android Studio\jbr"
    if (Test-Path $javaPath) {
        $env:JAVA_HOME = $javaPath
        Write-Host "  Found Java at Android Studio"
    } else {
        $jdkPath = "C:\Program Files\Java\jdk-17"
        if (Test-Path $jdkPath) {
            $env:JAVA_HOME = $jdkPath
            Write-Host "  Found Java at $jdkPath"
        } else {
            Write-Host "ERROR: Java not found. Install Java 17 or Android Studio."
            exit 1
        }
    }
}

# Find Android SDK
if (-not $env:ANDROID_SDK_ROOT) {
    $androidPath = "$env:USERPROFILE\AppData\Local\Android\Sdk"
    if (Test-Path $androidPath) {
        $env:ANDROID_SDK_ROOT = $androidPath
        Write-Host "  Found Android SDK"
    }
}

# Step 1: Install npm deps
Write-Host "[1/6] Installing npm dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed"
    exit 1
}

# Step 2: Prepare www
Write-Host "[2/6] Preparing www folder..."
npm run prepare-www
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: prepare-www failed"
    exit 1
}

# Step 3: Install Capacitor
Write-Host "[3/6] Installing Capacitor packages..."
npm install @capacitor/cli @capacitor/core @capacitor/android
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Capacitor install failed"
    exit 1
}

# Step 4: Init Capacitor
Write-Host "[4/6] Initializing Capacitor..."
if (-not (Test-Path "$projectDir\capacitor.config.json")) {
    npx @capacitor/cli init prashant-app com.example.prashant --web-dir=www
} else {
    Write-Host "  Capacitor already initialized"
}

# Step 5: Add Android
Write-Host "[5/6] Adding Android platform..."
if (-not (Test-Path "$projectDir\android")) {
    npx @capacitor/cli add android
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Android add failed"
        exit 1
    }
} else {
    Write-Host "  Android platform exists, syncing..."
    npx @capacitor/cli sync android
}

# Step 6: Build APK
Write-Host "[6/6] Building APK (this takes 10-15 minutes)..."
cd "$projectDir\android"
.\gradlew assembleDebug --no-daemon
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Build failed"
    Write-Host "Java location: $env:JAVA_HOME"
    exit 1
}

# Success
Write-Host ""
Write-Host "================================================"
Write-Host "SUCCESS! APK Built"
Write-Host "================================================"
Write-Host ""
Write-Host "APK: $projectDir\android\app\build\outputs\apk\debug\app-debug.apk"
Write-Host ""
Write-Host "Next: Copy to phone and install"
Write-Host ""

explorer "$projectDir\android\app\build\outputs\apk\debug"
cd $projectDir
