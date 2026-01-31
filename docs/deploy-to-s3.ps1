# Quick AWS S3 Deployment Script
# Usage: .\deploy-to-s3.ps1

# ========================================
# CONFIGURATION - UPDATE THESE VALUES
# ========================================

$S3_BUCKET = "realestate-frontend-yourname"  # Change this to your bucket name
$AWS_REGION = "us-east-1"
$BACKEND_URL = "http://YOUR_EC2_IP:8080/api"  # Change to your EC2 IP

# ========================================
# DEPLOYMENT SCRIPT
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AWS S3 Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "✗ AWS CLI not found!" -ForegroundColor Red
    Write-Host "  Install from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check AWS credentials
try {
    aws sts get-caller-identity | Out-Null
    Write-Host "✓ AWS credentials configured" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS credentials not configured!" -ForegroundColor Red
    Write-Host "  Run: aws configure" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  S3 Bucket: $S3_BUCKET"
Write-Host "  AWS Region: $AWS_REGION"
Write-Host "  Backend URL: $BACKEND_URL"
Write-Host ""

$confirm = Read-Host "Is this configuration correct? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Please edit this script and update the configuration values." -ForegroundColor Yellow
    exit 0
}

# Navigate to frontend directory
$FRONTEND_DIR = Split-Path -Parent $PSScriptRoot
Set-Location $FRONTEND_DIR

Write-Host ""
Write-Host "[Step 1/5] Building frontend for production..." -ForegroundColor Cyan
Write-Host "---------------------------------------------" -ForegroundColor Gray

# Set environment variable and build
$env:REACT_APP_API_URL = $BACKEND_URL
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build completed successfully!" -ForegroundColor Green

# Check if build folder exists
if (-not (Test-Path "build")) {
    Write-Host "✗ Build folder not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[Step 2/5] Checking if S3 bucket exists..." -ForegroundColor Cyan
Write-Host "---------------------------------------------" -ForegroundColor Gray

# Check if bucket exists
$bucketExists = $false
try {
    aws s3api head-bucket --bucket $S3_BUCKET 2>&1 | Out-Null
    $bucketExists = $true
    Write-Host "✓ Bucket exists: $S3_BUCKET" -ForegroundColor Green
} catch {
    Write-Host "! Bucket does not exist: $S3_BUCKET" -ForegroundColor Yellow
}

if (-not $bucketExists) {
    Write-Host ""
    $createBucket = Read-Host "Do you want to create the bucket? (y/n)"

    if ($createBucket -eq "y") {
        Write-Host "Creating S3 bucket..." -ForegroundColor Cyan

        aws s3 mb s3://$S3_BUCKET --region $AWS_REGION

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Bucket created successfully!" -ForegroundColor Green

            # Disable block public access
            Write-Host "Configuring public access..." -ForegroundColor Cyan
            aws s3api put-public-access-block `
                --bucket $S3_BUCKET `
                --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

            # Enable static website hosting
            Write-Host "Enabling static website hosting..." -ForegroundColor Cyan
            aws s3 website s3://$S3_BUCKET/ `
                --index-document index.html `
                --error-document index.html

            # Apply bucket policy
            Write-Host "Applying bucket policy..." -ForegroundColor Cyan
            $policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$S3_BUCKET/*"
    }
  ]
}
"@
            $policy | Out-File -FilePath "temp-policy.json" -Encoding utf8
            aws s3api put-bucket-policy --bucket $S3_BUCKET --policy file://temp-policy.json
            Remove-Item "temp-policy.json"

            Write-Host "✓ Bucket configured for static website hosting!" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to create bucket!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Deployment cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "[Step 3/5] Uploading files to S3..." -ForegroundColor Cyan
Write-Host "---------------------------------------------" -ForegroundColor Gray

# Upload files with proper cache headers
Write-Host "Uploading static assets with long-term caching..." -ForegroundColor Gray
aws s3 sync build/static/ s3://$S3_BUCKET/static/ `
    --delete `
    --acl public-read `
    --cache-control "public,max-age=31536000,immutable"

Write-Host "Uploading other files..." -ForegroundColor Gray
aws s3 sync build/ s3://$S3_BUCKET/ `
    --delete `
    --acl public-read `
    --exclude "static/*" `
    --exclude "index.html"

Write-Host "Uploading index.html without caching..." -ForegroundColor Gray
aws s3 cp build/index.html s3://$S3_BUCKET/ `
    --acl public-read `
    --cache-control "no-cache,no-store,must-revalidate"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Files uploaded successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[Step 4/5] Getting website URL..." -ForegroundColor Cyan
Write-Host "---------------------------------------------" -ForegroundColor Gray

$websiteUrl = "http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
Write-Host "✓ Website URL: $websiteUrl" -ForegroundColor Green

Write-Host ""
Write-Host "[Step 5/5] Testing deployment..." -ForegroundColor Cyan
Write-Host "---------------------------------------------" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $websiteUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Website is accessible!" -ForegroundColor Green
    }
} catch {
    Write-Host "! Could not test website accessibility" -ForegroundColor Yellow
    Write-Host "  This is normal if the website was just deployed" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your website is now live at:" -ForegroundColor White
Write-Host "  $websiteUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open the URL in your browser" -ForegroundColor Gray
Write-Host "  2. Hard refresh (Ctrl+Shift+R) to clear cache" -ForegroundColor Gray
Write-Host "  3. Check browser console (F12) for any errors" -ForegroundColor Gray
Write-Host "  4. Verify API calls go to: $BACKEND_URL" -ForegroundColor Gray
Write-Host ""
Write-Host "To redeploy after changes:" -ForegroundColor Yellow
Write-Host "  .\deploy-to-s3.ps1" -ForegroundColor Gray
Write-Host ""

# Open in browser
$openBrowser = Read-Host "Open website in browser now? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process $websiteUrl
}

Write-Host "Done!" -ForegroundColor Green
