# 🚀 Complete AWS Deployment Guide - Real Estate Platform

## Overview

This guide will help you deploy:
- **Frontend (React)** → AWS S3 + CloudFront
- **Backend (Spring Boot)** → AWS EC2
- **Database (MySQL)** → AWS RDS (or EC2)

---

## 📋 Prerequisites

### Required Tools:
- [ ] AWS Account (free tier available)
- [ ] AWS CLI installed and configured
- [ ] Node.js and npm installed
- [ ] Java 17+ and Maven installed

### Install AWS CLI:
```powershell
# Windows (using Chocolatey)
choco install awscli

# Or download from: https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
```

---

## 🎯 PART 1: Deploy Frontend to S3

### Step 1: Build Frontend for Production

```powershell
cd "D:\CDAC Project\Atharva\Atharva\real-estate-frontend"

# Build with AWS backend URL
npm run build:aws

# Or if that doesn't work:
$env:REACT_APP_API_URL="http://YOUR_EC2_IP:8080/api"
npm run build
```

**Verify build folder exists:**
```powershell
ls build/
# Should see: index.html, static/, etc.
```

---

### Step 2: Create S3 Bucket

#### Option A: Using AWS Console

1. **Go to AWS Console** → S3 → Create bucket
2. **Bucket name:** `realestate-frontend-yourname` (must be globally unique)
3. **Region:** US East (N. Virginia) - `us-east-1`
4. **Uncheck** "Block all public access" (we need public access for website)
5. **Acknowledge** the warning
6. Click **Create bucket**

#### Option B: Using AWS CLI

```powershell
# Create bucket
aws s3 mb s3://realestate-frontend-yourname --region us-east-1

# Enable public access
aws s3api put-public-access-block `
  --bucket realestate-frontend-yourname `
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

---

### Step 3: Configure S3 for Static Website Hosting

#### Using AWS Console:

1. Go to your bucket → **Properties** tab
2. Scroll to **Static website hosting**
3. Click **Edit**
4. **Enable** static website hosting
5. **Index document:** `index.html`
6. **Error document:** `index.html` (for React Router)
7. Click **Save changes**

#### Using AWS CLI:

```powershell
aws s3 website s3://realestate-frontend-yourname/ `
  --index-document index.html `
  --error-document index.html
```

---

### Step 4: Set Bucket Policy (Make Public)

Create a file `s3-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::realestate-frontend-yourname/*"
    }
  ]
}
```

Apply the policy:

```powershell
# Replace bucket name in the JSON first!
aws s3api put-bucket-policy `
  --bucket realestate-frontend-yourname `
  --policy file://s3-policy.json
```

Or using AWS Console:
1. Go to bucket → **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit**
4. Paste the policy (replace bucket name)
5. Click **Save changes**

---

### Step 5: Upload Frontend to S3

```powershell
# Upload all files from build folder
aws s3 sync build/ s3://realestate-frontend-yourname/ --delete --acl public-read

# With cache control for better performance
aws s3 sync build/ s3://realestate-frontend-yourname/ `
  --delete `
  --acl public-read `
  --cache-control "public,max-age=31536000,immutable" `
  --exclude "index.html" `
  --exclude "service-worker.js"

# Upload index.html without caching
aws s3 cp build/index.html s3://realestate-frontend-yourname/ `
  --acl public-read `
  --cache-control "no-cache,no-store,must-revalidate"
```

---

### Step 6: Access Your Frontend

Your website URL will be:
```
http://realestate-frontend-yourname.s3-website-us-east-1.amazonaws.com
```

To find the exact URL:
```powershell
aws s3api get-bucket-website --bucket realestate-frontend-yourname
```

Or check in AWS Console: Bucket → Properties → Static website hosting

---

## 🖥️ PART 2: Deploy Backend to EC2

### Step 1: Launch EC2 Instance

#### Using AWS Console:

1. **Go to EC2 Console** → Launch Instance
2. **Name:** `realestate-backend`
3. **AMI:** Amazon Linux 2023 or Ubuntu 22.04
4. **Instance Type:** t2.micro (free tier) or t2.small
5. **Key pair:** Create new or use existing (download .pem file)
6. **Network settings:**
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere
   - Allow Custom TCP (port 8080) from anywhere
7. **Storage:** 20 GB gp3
8. Click **Launch instance**

---

### Step 2: Connect to EC2

```powershell
# Set correct permissions on key file (Windows)
icacls "your-key.pem" /inheritance:r
icacls "your-key.pem" /grant:r "%USERNAME%:R"

# Connect via SSH
ssh -i "your-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP

# For Ubuntu, use:
ssh -i "your-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

---

### Step 3: Install Java on EC2

```bash
# Amazon Linux 2023
sudo yum install java-17-amazon-corretto-devel -y

# Ubuntu
sudo apt update
sudo apt install openjdk-17-jdk -y

# Verify
java -version
```

---

### Step 4: Install MySQL on EC2 (or use RDS)

#### Option A: Install MySQL on Same EC2

```bash
# Amazon Linux
sudo yum install mysql-server -y
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Ubuntu
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL
sudo mysql_secure_installation

# Create database
sudo mysql -u root -p
```

In MySQL console:
```sql
CREATE DATABASE realestate_db;
CREATE USER 'realestate'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON realestate_db.* TO 'realestate'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Option B: Use AWS RDS (Recommended for Production)

1. Go to RDS Console → Create database
2. Choose MySQL
3. Templates: Free tier
4. DB instance identifier: `realestate-db`
5. Master username: `admin`
6. Master password: (set strong password)
7. Make publicly accessible: Yes (only for testing)
8. Create database

Get endpoint from RDS Console and use in application.properties.

---

### Step 5: Upload Backend JAR

On your local machine:

```powershell
# Build backend JAR
cd "D:\CDAC Project\Atharva\Atharva\real-estate-backend"
mvn clean package -DskipTests

# Upload to EC2
scp -i "your-key.pem" target/real-estate-backend-0.0.1-SNAPSHOT.jar ec2-user@YOUR_EC2_IP:~/backend.jar
```

---

### Step 6: Configure Backend application.properties

Create `application-prod.properties` on EC2:

```bash
# On EC2
nano ~/application-prod.properties
```

Add:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/realestate_db
spring.datasource.username=realestate
spring.datasource.password=YourStrongPassword123!
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Server Configuration
server.port=8080

# CORS Configuration - Allow S3 frontend
cors.allowed-origins=http://realestate-frontend-yourname.s3-website-us-east-1.amazonaws.com,http://localhost:3000

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Logging
logging.level.com.realestate=INFO
logging.level.org.springframework.web=INFO
```

---

### Step 7: Run Backend on EC2

```bash
# Test run (foreground)
java -jar backend.jar --spring.config.location=file:./application-prod.properties

# If it works, run in background
nohup java -jar backend.jar --spring.config.location=file:./application-prod.properties > backend.log 2>&1 &

# Check if running
ps aux | grep java

# View logs
tail -f backend.log

# Get process ID
pgrep -f backend.jar

# Stop backend
pkill -f backend.jar
```

---

### Step 8: Create Startup Script

```bash
# Create script
nano ~/start-backend.sh
```

Add:
```bash
#!/bin/bash
cd ~
nohup java -jar backend.jar --spring.config.location=file:./application-prod.properties > backend.log 2>&1 &
echo "Backend started with PID: $!"
```

Make executable:
```bash
chmod +x start-backend.sh

# Run
./start-backend.sh
```

---

### Step 9: Configure EC2 Security Group

In AWS Console → EC2 → Security Groups → Your instance's security group:

**Inbound Rules:**
| Type | Port | Source | Description |
|------|------|--------|-------------|
| SSH | 22 | Your IP | SSH access |
| Custom TCP | 8080 | 0.0.0.0/0 | Backend API |
| MySQL/Aurora | 3306 | EC2 security group | Database (if needed) |

---

### Step 10: Test Backend

```bash
# From EC2
curl http://localhost:8080/api/properties/available

# From your computer
curl http://YOUR_EC2_IP:8080/api/properties/available
```

Should return JSON response.

---

## 🔗 PART 3: Connect Frontend to Backend

### Step 1: Update Frontend Backend URL

Edit `.env.production`:
```env
REACT_APP_API_URL=http://YOUR_EC2_PUBLIC_IP:8080/api
```

Or use the build:aws script in package.json:
```json
"build:aws": "cross-env REACT_APP_API_URL=http://YOUR_EC2_IP:8080/api react-scripts build"
```

---

### Step 2: Rebuild and Redeploy Frontend

```powershell
# Rebuild
npm run build:aws

# Redeploy to S3
aws s3 sync build/ s3://realestate-frontend-yourname/ --delete --acl public-read --cache-control "no-cache"
```

---

### Step 3: Update Backend CORS

Make sure backend allows S3 origin. Edit `CorsConfig.java`:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:3000",
                        "http://realestate-frontend-yourname.s3-website-us-east-1.amazonaws.com"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

Rebuild backend and redeploy to EC2.

---

## 🌐 PART 4: Optional - Add CloudFront (CDN)

### Why CloudFront?
- HTTPS support
- Better performance (caching)
- Custom domain support
- Global content delivery

### Steps:

1. **Go to CloudFront Console** → Create distribution
2. **Origin domain:** Select your S3 bucket
3. **Origin access:** Public
4. **Viewer protocol policy:** Redirect HTTP to HTTPS
5. **Allowed HTTP methods:** GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
6. **Default root object:** `index.html`
7. **Create distribution**

Wait 10-15 minutes for deployment.

Your new URL: `https://d1234567890.cloudfront.net`

---

## 🔒 PART 5: Add HTTPS (Optional but Recommended)

### For S3 + CloudFront:

1. **Request SSL Certificate** in AWS Certificate Manager (ACM)
   - Region: US East (N. Virginia) for CloudFront
   - Domain: yourdomain.com
   - Validation: DNS or Email

2. **Add certificate to CloudFront distribution**
   - Edit distribution → Settings
   - Alternate domain names (CNAMEs): yourdomain.com
   - Custom SSL certificate: Select your certificate

3. **Update Route 53** (if using custom domain)
   - Create A record → Alias to CloudFront distribution

### For EC2 Backend:

Option 1: Use Application Load Balancer with ACM certificate
Option 2: Use Nginx reverse proxy with Let's Encrypt

---

## 📊 PART 6: Deployment Automation Scripts

### Complete Deployment Script (PowerShell)

Create `deploy-full-stack.ps1`:

```powershell
# Configuration
$S3_BUCKET = "realestate-frontend-yourname"
$EC2_IP = "YOUR_EC2_IP"
$EC2_KEY = "path\to\your-key.pem"
$EC2_USER = "ec2-user"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Full Stack AWS Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Build Frontend
Write-Host "`n[1/5] Building Frontend..." -ForegroundColor Yellow
cd "D:\CDAC Project\Atharva\Atharva\real-estate-frontend"
npm run build:aws

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend built" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend build failed" -ForegroundColor Red
    exit 1
}

# 2. Deploy Frontend to S3
Write-Host "`n[2/5] Deploying Frontend to S3..." -ForegroundColor Yellow
aws s3 sync build/ s3://$S3_BUCKET/ --delete --acl public-read

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend deployed to S3" -ForegroundColor Green
} else {
    Write-Host "✗ S3 deployment failed" -ForegroundColor Red
    exit 1
}

# 3. Build Backend
Write-Host "`n[3/5] Building Backend..." -ForegroundColor Yellow
cd "..\real-estate-backend"
mvn clean package -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend built" -ForegroundColor Green
} else {
    Write-Host "✗ Backend build failed" -ForegroundColor Red
    exit 1
}

# 4. Upload Backend to EC2
Write-Host "`n[4/5] Uploading Backend to EC2..." -ForegroundColor Yellow
scp -i $EC2_KEY target/*.jar ${EC2_USER}@${EC2_IP}:~/backend.jar

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend uploaded" -ForegroundColor Green
} else {
    Write-Host "✗ Backend upload failed" -ForegroundColor Red
    exit 1
}

# 5. Restart Backend on EC2
Write-Host "`n[5/5] Restarting Backend on EC2..." -ForegroundColor Yellow
$commands = @"
pkill -f backend.jar
sleep 2
nohup java -jar ~/backend.jar > ~/backend.log 2>&1 &
sleep 5
if pgrep -f backend.jar > /dev/null; then
    echo 'Backend started successfully'
else
    echo 'Backend failed to start'
    exit 1
fi
"@

$commands | ssh -i $EC2_KEY ${EC2_USER}@${EC2_IP} 'bash -s'

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend restarted" -ForegroundColor Green
} else {
    Write-Host "✗ Backend restart failed" -ForegroundColor Red
    exit 1
}

# Done
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nFrontend: http://$S3_BUCKET.s3-website-us-east-1.amazonaws.com"
Write-Host "Backend: http://${EC2_IP}:8080/api"
Write-Host "`nTest backend: curl http://${EC2_IP}:8080/api/properties/available"
```

Run it:
```powershell
.\deploy-full-stack.ps1
```

---

## ✅ Deployment Checklist

### Pre-Deployment:
- [ ] AWS account created
- [ ] AWS CLI installed and configured
- [ ] Frontend builds successfully locally
- [ ] Backend builds successfully locally
- [ ] MySQL database schema ready

### Frontend Deployment:
- [ ] S3 bucket created
- [ ] Static website hosting enabled
- [ ] Bucket policy set (public access)
- [ ] Frontend built with correct backend URL
- [ ] Files uploaded to S3
- [ ] S3 website URL accessible

### Backend Deployment:
- [ ] EC2 instance launched
- [ ] Security group configured (ports 22, 8080, 3306)
- [ ] Java installed on EC2
- [ ] MySQL installed/configured
- [ ] Backend JAR uploaded
- [ ] application-prod.properties configured
- [ ] Backend running and accessible
- [ ] CORS configured for S3 origin

### Testing:
- [ ] Backend responds: `curl http://EC2_IP:8080/api/properties/available`
- [ ] Frontend loads from S3 URL
- [ ] Frontend calls backend (check Network tab)
- [ ] No CORS errors
- [ ] Login works
- [ ] Properties display
- [ ] All CRUD operations work

### Optional:
- [ ] CloudFront distribution created
- [ ] HTTPS certificate obtained
- [ ] Custom domain configured
- [ ] Database backups configured
- [ ] Monitoring/logging set up

---

## 🐛 Common Issues & Solutions

### Issue: S3 Access Denied

**Solution:**
```powershell
# Make bucket public
aws s3api put-public-access-block `
  --bucket your-bucket-name `
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Apply bucket policy
aws s3api put-bucket-policy --bucket your-bucket-name --policy file://s3-policy.json
```

### Issue: EC2 Connection Timeout

**Solutions:**
- Check security group allows your IP on port 22
- Use correct key pair
- Check EC2 instance is running
- Verify public IP is correct

### Issue: Backend Not Accessible

**Solutions:**
```bash
# Check if running
ps aux | grep java

# Check logs
tail -f ~/backend.log

# Check port 8080
netstat -tulpn | grep 8080

# Restart backend
pkill -f backend.jar
./start-backend.sh
```

### Issue: CORS Error

**Solutions:**
1. Update backend CORS config with S3 URL
2. Rebuild backend
3. Redeploy backend to EC2
4. Restart backend

### Issue: Database Connection Error

**Solutions:**
- Verify MySQL is running: `sudo systemctl status mysqld`
- Check credentials in application-prod.properties
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- Check security group allows port 3306 (if using RDS)

---

## 💰 Cost Estimation (AWS Free Tier)

### Free Tier Includes:
- **S3:** 5 GB storage, 20,000 GET requests
- **EC2:** t2.micro instance, 750 hours/month for 12 months
- **RDS:** db.t2.micro instance, 750 hours/month for 12 months
- **Data Transfer:** 15 GB/month

### Estimated Monthly Cost (after free tier):
- **S3:** $0.023/GB (~$0.50 for small site)
- **EC2 t2.micro:** ~$8.50/month
- **EC2 t2.small:** ~$17/month
- **RDS t2.micro:** ~$15/month
- **Data Transfer:** $0.09/GB after 15GB

**Total:** ~$10-40/month depending on usage

---

## 🎯 Production Checklist

### Security:
- [ ] Use HTTPS (CloudFront + ACM)
- [ ] Restrict EC2 SSH to your IP only
- [ ] Use strong database passwords
- [ ] Enable AWS WAF for DDoS protection
- [ ] Store secrets in AWS Secrets Manager
- [ ] Enable MFA on AWS account

### Performance:
- [ ] Use CloudFront CDN
- [ ] Enable S3 versioning
- [ ] Configure CloudFront caching rules
- [ ] Use RDS instead of EC2 MySQL
- [ ] Enable RDS automatic backups
- [ ] Use Application Load Balancer

### Monitoring:
- [ ] Enable CloudWatch logs
- [ ] Set up CloudWatch alarms
- [ ] Configure SNS notifications
- [ ] Monitor costs with AWS Budgets
- [ ] Set up error tracking (Sentry/Rollbar)

### Backup:
- [ ] Enable S3 versioning
- [ ] Configure RDS automated backups
- [ ] Take EC2 AMI snapshots
- [ ] Store backups in separate region

---

## 📞 Quick Commands Reference

```powershell
# Build Frontend
npm run build:aws

# Deploy Frontend
aws s3 sync build/ s3://bucket-name --delete --acl public-read

# Build Backend
mvn clean package -DskipTests

# Upload Backend
scp -i key.pem target/*.jar ec2-user@IP:~/backend.jar

# SSH to EC2
ssh -i key.pem ec2-user@IP

# Restart Backend (on EC2)
pkill -f backend.jar && nohup java -jar backend.jar > backend.log 2>&1 &

# View Backend Logs (on EC2)
tail -f backend.log

# Test Backend
curl http://EC2_IP:8080/api/properties/available
```

---

## 🎉 Success!

Your Real Estate Platform is now deployed on AWS!

**Frontend:** http://your-bucket.s3-website-us-east-1.amazonaws.com
**Backend:** http://your-ec2-ip:8080/api

---

## 📚 Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

---

**Ready to deploy? Follow the steps above!** 🚀
