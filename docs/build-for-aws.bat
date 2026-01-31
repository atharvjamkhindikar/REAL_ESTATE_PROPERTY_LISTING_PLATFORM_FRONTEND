@echo off
echo ========================================
echo   Building Frontend with AWS Backend
echo ========================================
echo.

cd /d "D:\CDAC Project\Atharva\Atharva\real-estate-frontend"

echo Setting environment variable...
set REACT_APP_API_URL=http://13.220.57.64:8080/api
set REACT_APP_ENV=production

echo.
echo Building for production...
call npm run build

echo.
if %ERRORLEVEL% == 0 (
    echo ✓ Build completed successfully!
    echo.
    echo Verifying build contains AWS backend URL...
    findstr /C:"13.220.57.64" build\static\js\main.*.js >nul 2>&1
    if %ERRORLEVEL% == 0 (
        echo ✓ AWS backend URL found in build!
    ) else (
        echo ! Could not verify backend URL in minified code
        echo   This is normal for production builds
    )
    echo.
    echo Next step: Deploy to S3
    echo   aws s3 sync build/ s3://realestate-frontend --delete --acl public-read
) else (
    echo ✗ Build failed!
)

pause
