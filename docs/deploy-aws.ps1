# AWS Full Stack Deployment Script (PowerShell)
# Real Estate Platform - Frontend + Backend + Database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AWS Full Stack Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration Variables - UPDATE THESE!
$AWS_REGION = "us-east-1"
$S3_BUCKET_NAME = "realestate-frontend"
$EC2_IP = "13.220.57.64"
$EC2_USER = "ec2-user"
$EC2_KEY_PATH = "path\to\your-key.pem"
$BACKEND_JAR = "target\real-estate-backend-0.0.1-SNAPSHOT.jar"

# Functions
function Print-Success {
    param($message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Print-Error {
    param($message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Print-Info {
    param($message)
    Write-Host "ℹ $message" -ForegroundColor Yellow
}

# Check prerequisites
function Check-Prerequisites {
    Print-Info "Checking prerequisites..."

    # Check AWS CLI
    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
        Print-Error "AWS CLI not found. Install from https://aws.amazon.com/cli/"
        exit 1
    }

    # Check npm
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Print-Error "npm not found. Install Node.js from https://nodejs.org/"
        exit 1
    }

    Print-Success "Prerequisites check passed"
}

# Build frontend
function Build-Frontend {
    Print-Info "Building frontend for production..."

    # Install dependencies
    npm install

    # Build with production environment
    npm run build

    if ($LASTEXITCODE -eq 0) {
        Print-Success "Frontend build completed"
    } else {
        Print-Error "Frontend build failed"
        exit 1
    }
}

# Deploy frontend to S3
function Deploy-Frontend {
    Print-Info "Deploying frontend to S3..."

    # Sync build folder to S3
    aws s3 sync build/ "s3://$S3_BUCKET_NAME/" `
        --delete `
        --acl public-read `
        --region $AWS_REGION

    if ($LASTEXITCODE -eq 0) {
        Print-Success "Frontend deployed to S3"
        Print-Info "Frontend URL: http://$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
    } else {
        Print-Error "Frontend deployment failed"
        exit 1
    }
}

# Build backend
function Build-Backend {
    Print-Info "Building backend..."

    $backendPath = "..\real-estate-backend"
    if (Test-Path $backendPath) {
        Push-Location $backendPath

        # Clean and package
        mvn clean package -DskipTests

        if ($LASTEXITCODE -eq 0) {
            Print-Success "Backend build completed"
            Pop-Location
        } else {
            Print-Error "Backend build failed"
            exit 1
        }
    } else {
        Print-Error "Backend directory not found at $backendPath"
        exit 1
    }
}

# Deploy backend to EC2
function Deploy-Backend {
    Print-Info "Deploying backend to EC2..."

    $backendJarPath = "..\real-estate-backend\$BACKEND_JAR"

    # Check if JAR exists
    if (-not (Test-Path $backendJarPath)) {
        Print-Error "Backend JAR not found. Build the backend first."
        exit 1
    }

    # Copy JAR to EC2
    Print-Info "Uploading backend to EC2..."
    scp -i $EC2_KEY_PATH $backendJarPath "${EC2_USER}@${EC2_IP}:~/backend.jar"

    if ($LASTEXITCODE -eq 0) {
        Print-Success "Backend uploaded to EC2"
    } else {
        Print-Error "Backend upload failed"
        exit 1
    }

    # SSH and restart backend
    Print-Info "Restarting backend on EC2..."

    $sshCommands = @"
pkill -f backend.jar || true
nohup java -jar ~/backend.jar > ~/backend.log 2>&1 &
sleep 5
if pgrep -f backend.jar > /dev/null; then
    echo 'Backend started successfully'
else
    echo 'Backend failed to start. Check ~/backend.log'
    exit 1
fi
"@

    $sshCommands | ssh -i $EC2_KEY_PATH "${EC2_USER}@${EC2_IP}" 'bash -s'

    if ($LASTEXITCODE -eq 0) {
        Print-Success "Backend deployed and running on EC2"
    } else {
        Print-Error "Backend deployment failed"
        exit 1
    }
}

# Test deployment
function Test-Deployment {
    Print-Info "Testing deployment..."

    # Test backend
    Print-Info "Testing backend API..."
    $backendUrl = "http://${EC2_IP}:8080/api/properties/available"

    try {
        $response = Invoke-WebRequest -Uri $backendUrl -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Print-Success "Backend API is responding (HTTP $($response.StatusCode))"
        }
    } catch {
        Print-Error "Backend API test failed: $($_.Exception.Message)"
        Print-Info "Check backend logs: ssh -i $EC2_KEY_PATH ${EC2_USER}@${EC2_IP} 'tail -f ~/backend.log'"
    }

    # Test frontend
    Print-Info "Testing frontend..."
    $frontendUrl = "http://$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"

    try {
        $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Print-Success "Frontend is accessible (HTTP $($response.StatusCode))"
        }
    } catch {
        Print-Error "Frontend test failed: $($_.Exception.Message)"
    }
}

# Main menu
function Show-Menu {
    Write-Host ""
    Write-Host "What would you like to deploy?"
    Write-Host "1) Frontend only"
    Write-Host "2) Backend only"
    Write-Host "3) Full stack (Frontend + Backend)"
    Write-Host "4) Test deployment"
    Write-Host "5) Exit"
    Write-Host ""

    $choice = Read-Host "Enter choice [1-5]"

    switch ($choice) {
        "1" {
            Check-Prerequisites
            Build-Frontend
            Deploy-Frontend
            Test-Deployment
        }
        "2" {
            Check-Prerequisites
            Build-Backend
            Deploy-Backend
            Test-Deployment
        }
        "3" {
            Check-Prerequisites
            Build-Frontend
            Deploy-Frontend
            Build-Backend
            Deploy-Backend
            Test-Deployment
        }
        "4" {
            Test-Deployment
        }
        "5" {
            Write-Host "Exiting..."
            exit 0
        }
        default {
            Print-Error "Invalid choice"
            Show-Menu
        }
    }
}

# Main execution
Write-Host ""
Print-Info "Current Configuration:"
Write-Host "  AWS Region: $AWS_REGION"
Write-Host "  S3 Bucket: $S3_BUCKET_NAME"
Write-Host "  EC2 IP: $EC2_IP"
Write-Host "  EC2 User: $EC2_USER"
Write-Host ""

$confirm = Read-Host "Is this configuration correct? (y/n)"

if ($confirm -ne "y") {
    Print-Info "Edit this script and update the configuration variables at the top"
    exit 0
}

Show-Menu

Write-Host ""
Print-Success "Deployment completed!"
Write-Host ""
Print-Info "Access your application:"
Write-Host "  Frontend: http://$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
Write-Host "  Backend API: http://${EC2_IP}:8080/api"
Write-Host ""
Print-Info "To check backend logs:"
Write-Host "  ssh -i $EC2_KEY_PATH ${EC2_USER}@${EC2_IP} 'tail -f ~/backend.log'"
