@echo off
echo ========================================
echo   Real Estate Backend Startup Script
echo ========================================
echo.

REM Check if backend directory exists
if not exist "..\real-estate-backend" (
    echo ERROR: Backend directory not found!
    echo Expected location: ..\real-estate-backend
    echo.
    echo Please update this script with the correct path to your backend.
    pause
    exit /b 1
)

echo Starting backend server...
echo.

cd ..\real-estate-backend

REM Check if Maven wrapper exists
if exist "mvnw.cmd" (
    echo Using Maven Wrapper...
    call mvnw.cmd spring-boot:run
) else if exist "pom.xml" (
    echo Using system Maven...
    call mvn spring-boot:run
) else (
    echo ERROR: Maven project not found!
    echo Make sure pom.xml exists in the backend directory.
    pause
    exit /b 1
)

pause
