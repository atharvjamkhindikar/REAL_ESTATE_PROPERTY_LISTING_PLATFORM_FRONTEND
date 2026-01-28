# 🚀 AWS Deployment Guide - Real Estate Management System

## 📋 Complete Deployment Guide for Full-Stack Application

**Stack**: Spring Boot Backend + React Frontend + MySQL Database

**Date**: January 28, 2026

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   AWS Cloud                      │
│                                                  │
│  ┌──────────────┐      ┌──────────────┐        │
│  │   Route 53   │      │  CloudFront  │        │
│  │    (DNS)     │      │    (CDN)     │        │
│  └──────────────┘      └──────────────┘        │
│         │                      │                 │
│         ▼                      ▼                 │
│  ┌──────────────┐      ┌──────────────┐        │
│  │  EC2 (Backend)│      │  S3 (Frontend)│       │
│  │ Spring Boot   │◄────►│    React     │        │
│  │   Port 8080   │      │              │        │
│  └──────────────┘      └──────────────┘        │
│         │                                        │
│         ▼                                        │
│  ┌──────────────┐                               │
│  │   RDS MySQL  │                               │
│  │   Database   │                               │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
```

---

## 📝 Prerequisites

### What You Need:
- ✅ AWS Account (free tier eligible)
- ✅ Credit/Debit card for AWS verification
- ✅ Domain name (optional but recommended)
- ✅ Your Spring Boot backend code
- ✅ Your React frontend code
- ✅ Basic terminal/command line knowledge

---

## 🎯 Deployment Steps Overview

1. **Setup AWS RDS MySQL Database**
2. **Deploy Spring Boot Backend to EC2**
3. **Deploy React Frontend to S3 + CloudFront**
4. **Configure Domain & SSL (Optional)**
5. **Setup Monitoring & Backups**

---

# Part 1: 🗄️ Setup AWS RDS MySQL Database

## Step 1.1: Create RDS MySQL Instance

### 1. Login to AWS Console
```
https://console.aws.amazon.com
```

### 2. Navigate to RDS
- Search for "RDS" in AWS services
- Click "Create database"

### 3. Database Configuration

**Choose Creation Method**: Standard Create

**Engine Options**:
- Engine type: MySQL
- Version: MySQL 8.0.35 (or latest)
- Edition: MySQL Community

**Templates**:
- Choose: **Free tier** (for testing)
- OR **Production** (for live deployment)

**Settings**:
```
DB Instance Identifier: realestate-db
Master Username: admin
Master Password: YourSecurePassword123!
```
⚠️ **IMPORTANT**: Save these credentials securely!

**DB Instance Class**:
- Free Tier: `db.t3.micro` (1 vCPU, 1 GB RAM)
- Production: `db.t3.small` or higher

**Storage**:
- Allocated Storage: 20 GB (Free tier)
- Storage type: General Purpose SSD (gp3)
- ✅ Enable storage autoscaling (Max: 100 GB)

**Connectivity**:
- VPC: Default VPC
- Publicly accessible: **Yes** (for initial setup)
- VPC Security Group: Create new → `realestate-db-sg`
- Availability Zone: No preference

**Database Authentication**:
- Password authentication

**Additional Configuration**:
- Initial database name: `realestate_db`
- Backup retention: 7 days
- Enable automated backups: Yes
- Monitoring: ✅ Enable Enhanced Monitoring

### 4. Create Database
- Click "Create database"
- Wait 5-10 minutes for creation

### 5. Get Database Endpoint
After creation:
1. Click on your database instance
2. Copy the **Endpoint** (looks like: `realestate-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`)
3. Note the **Port**: 3306

### 6. Configure Security Group
1. Click on the VPC security group
2. Edit Inbound Rules
3. Add Rule:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: My IP (for testing)
   - Source: Your EC2 Security Group (for production)

---

## Step 1.2: Initialize Database Schema

### Option 1: Using MySQL Workbench

1. **Download MySQL Workbench** (if not installed)
   ```
   https://dev.mysql.com/downloads/workbench/
   ```

2. **Connect to RDS**
   - Connection Name: Real Estate AWS DB
   - Hostname: `your-rds-endpoint.rds.amazonaws.com`
   - Port: 3306
   - Username: admin
   - Password: [Your password]

3. **Run Your Schema SQL**
   ```sql
   CREATE DATABASE IF NOT EXISTS realestate_db;
   USE realestate_db;
   
   -- Your backend will auto-create tables if using JPA
   -- Or run your schema.sql file here
   ```

### Option 2: Using Command Line

```bash
# Install MySQL client
# Windows: Download from mysql.com
# Mac: brew install mysql-client
# Linux: sudo apt-get install mysql-client

# Connect to RDS
mysql -h your-rds-endpoint.rds.amazonaws.com -P 3306 -u admin -p

# Enter password when prompted
# Then run your schema scripts
```

---

# Part 2: 🖥️ Deploy Spring Boot Backend to EC2

## Step 2.1: Create EC2 Instance

### 1. Navigate to EC2
- AWS Console → EC2 → Launch Instance

### 2. Configure Instance

**Name**: `realestate-backend-server`

**Application and OS Images**:
- Amazon Linux 2023 AMI (Free tier eligible)
- OR Ubuntu Server 22.04 LTS

**Instance Type**:
- Free Tier: `t2.micro` (1 vCPU, 1 GB RAM)
- Production: `t3.small` (2 vCPU, 2 GB RAM) or higher

**Key Pair**:
- Click "Create new key pair"
- Name: `realestate-backend-key`
- Type: RSA
- Format: `.pem` (Mac/Linux) or `.ppk` (Windows/PuTTY)
- **Download and save securely!**

**Network Settings**:
- VPC: Default
- Auto-assign public IP: Enable
- Create security group: `realestate-backend-sg`

**Security Group Rules**:
```
SSH (22)         → My IP           (for SSH access)
Custom TCP (8080) → Anywhere (0.0.0.0/0) (for API access)
HTTP (80)        → Anywhere        (optional)
HTTPS (443)      → Anywhere        (optional)
```

**Storage**:
- 20 GB gp3 (Free tier: 30 GB)

### 3. Launch Instance
- Click "Launch Instance"
- Wait for instance to start (Status: Running)

---

## Step 2.2: Connect to EC2 Instance

### For Windows (using PuTTY):

1. **Convert .pem to .ppk**:
   - Download PuTTYgen
   - Load `.pem` file
   - Save private key as `.ppk`

2. **Connect**:
   - Open PuTTY
   - Host: `ec2-user@your-ec2-public-ip`
   - SSH → Auth → Browse to `.ppk` file
   - Open

### For Mac/Linux:

```bash
# Set permissions
chmod 400 realestate-backend-key.pem

# Connect
ssh -i "realestate-backend-key.pem" ec2-user@your-ec2-public-ip
```

---

## Step 2.3: Setup Backend Environment

### 1. Update System & Install Java

```bash
# Update system
sudo yum update -y  # Amazon Linux
# OR
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Install Java 17
sudo yum install java-17-amazon-corretto-devel -y  # Amazon Linux
# OR
sudo apt install openjdk-17-jdk -y  # Ubuntu

# Verify Java installation
java -version
```

### 2. Install Maven

```bash
# Amazon Linux
sudo yum install maven -y

# Ubuntu
sudo apt install maven -y

# Verify
mvn -version
```

### 3. Install MySQL Client (optional, for testing)

```bash
# Amazon Linux
sudo yum install mysql -y

# Ubuntu
sudo apt install mysql-client -y
```

---

## Step 2.4: Deploy Spring Boot Application

### 1. Upload Your Backend Code

**Option A: Using Git (Recommended)**

```bash
# Install git
sudo yum install git -y  # Amazon Linux
sudo apt install git -y  # Ubuntu

# Clone your repository
git clone https://github.com/your-username/your-backend-repo.git
cd your-backend-repo
```

**Option B: Using SCP (from your local machine)**

```bash
# Windows (use WinSCP)
# Mac/Linux:
scp -i realestate-backend-key.pem -r /path/to/backend ec2-user@your-ec2-ip:/home/ec2-user/
```

### 2. Configure application.properties

```bash
cd your-backend-project
nano src/main/resources/application.properties
```

Update with AWS RDS details:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://your-rds-endpoint.rds.amazonaws.com:3306/realestate_db
spring.datasource.username=admin
spring.datasource.password=YourSecurePassword123!
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Server Configuration
server.port=8080

# CORS Configuration (Update with your frontend URL)
cors.allowed.origins=http://your-frontend-domain.com,https://your-cloudfront-url.cloudfront.net

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### 3. Build the Application

```bash
# Build with Maven
mvn clean package -DskipTests

# The JAR file will be in target/ folder
ls -l target/*.jar
```

### 4. Run the Application

**Option A: Run Directly**

```bash
# Run the JAR
java -jar target/realestate-backend-0.0.1-SNAPSHOT.jar

# Test if running
curl http://localhost:8080/api/properties
```

**Option B: Run as Service (Recommended)**

Create systemd service file:

```bash
sudo nano /etc/systemd/system/realestate-backend.service
```

Add content:

```ini
[Unit]
Description=Real Estate Backend Service
After=syslog.target network.target

[Service]
User=ec2-user
ExecStart=/usr/bin/java -jar /home/ec2-user/your-backend-project/target/realestate-backend-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start service:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable realestate-backend

# Start service
sudo systemctl start realestate-backend

# Check status
sudo systemctl status realestate-backend

# View logs
sudo journalctl -u realestate-backend -f
```

### 5. Test Backend API

```bash
# From EC2 instance
curl http://localhost:8080/api/properties

# From your computer
curl http://your-ec2-public-ip:8080/api/properties
```

✅ If you get a response, backend is working!

---

## Step 2.5: Setup Nginx Reverse Proxy (Optional but Recommended)

### 1. Install Nginx

```bash
sudo yum install nginx -y  # Amazon Linux
# OR
sudo apt install nginx -y  # Ubuntu
```

### 2. Configure Nginx

```bash
sudo nano /etc/nginx/nginx.conf
```

Add server block:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Or use EC2 public IP

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Start Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

Now backend is accessible at: `http://your-ec2-public-ip/api/properties`

---

# Part 3: ☁️ Deploy React Frontend to S3 + CloudFront

## Step 3.1: Build React Application

### 1. Update API Base URL

On your local machine, update frontend:

```bash
cd real-estate-frontend
```

Update `src/services/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://your-ec2-public-ip:8080/api';
// OR if using Nginx on port 80:
// const API_BASE_URL = 'http://your-domain.com/api';
```

Create `.env.production` file:

```bash
REACT_APP_API_URL=http://your-ec2-public-ip:8080/api
```

### 2. Build Production Bundle

```bash
npm run build
```

This creates optimized `build/` folder.

---

## Step 3.2: Create S3 Bucket

### 1. Navigate to S3
- AWS Console → S3 → Create bucket

### 2. Bucket Configuration

**Bucket Name**: `realestate-frontend-app` (must be globally unique)

**AWS Region**: Same as your EC2 (e.g., us-east-1)

**Object Ownership**: ACLs disabled

**Block Public Access**: ❌ Uncheck "Block all public access"
- ⚠️ Acknowledge warning

**Bucket Versioning**: Enable (optional)

**Encryption**: Server-side encryption (default)

### 3. Create Bucket

---

## Step 3.3: Upload Frontend Files

### 1. Upload Build Files

- Open your S3 bucket
- Click "Upload"
- Select ALL files from your `build/` folder
- Click "Upload"

### 2. Configure Bucket for Static Website

- Go to bucket → Properties tab
- Scroll to "Static website hosting"
- Click "Edit"
- Enable static website hosting
- Index document: `index.html`
- Error document: `index.html` (for React Router)
- Save changes

### 3. Set Bucket Policy (Make Public)

- Go to Permissions tab
- Bucket Policy → Edit
- Add policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::realestate-frontend-app/*"
        }
    ]
}
```

### 4. Test S3 Website

- Go to Properties → Static website hosting
- Copy the **Bucket website endpoint**
- Open in browser: `http://realestate-frontend-app.s3-website-us-east-1.amazonaws.com`

✅ Frontend should now be accessible!

---

## Step 3.4: Setup CloudFront CDN (Recommended)

### 1. Create CloudFront Distribution

- AWS Console → CloudFront → Create Distribution

**Origin**:
- Origin Domain: Select your S3 bucket
- Origin Path: Leave empty
- Name: S3-realestate-frontend

**Default Cache Behavior**:
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Allowed HTTP Methods: GET, HEAD, OPTIONS
- Cache Policy: CachingOptimized

**Settings**:
- Price Class: Use all edge locations (or choose region)
- Alternate Domain Names (CNAME): `www.yourdomain.com` (if you have domain)
- Custom SSL Certificate: Request certificate (if using custom domain)
- Default Root Object: `index.html`

### 2. Create Distribution
- Click "Create Distribution"
- Wait 5-15 minutes for deployment

### 3. Note CloudFront URL
- Copy Distribution Domain Name: `d111111abcdef8.cloudfront.net`

### 4. Test CloudFront
- Open: `https://your-cloudfront-domain.cloudfront.net`

---

## Step 3.5: Handle React Router (SPA)

### Create Error Pages for CloudFront

1. Go to CloudFront distribution
2. Error Pages tab → Create Custom Error Response

**For 403 Error**:
- HTTP Error Code: 403
- Response Page Path: `/index.html`
- HTTP Response Code: 200

**For 404 Error**:
- HTTP Error Code: 404
- Response Page Path: `/index.html`
- HTTP Response Code: 200

This ensures React Router works properly!

---

# Part 4: 🌐 Configure Custom Domain (Optional)

## Step 4.1: Register Domain (if needed)

### Option 1: AWS Route 53
- Route 53 → Register Domain
- Search for domain → Purchase

### Option 2: External (GoDaddy, Namecheap, etc.)
- Purchase domain from any registrar

---

## Step 4.2: Setup Route 53

### 1. Create Hosted Zone

- Route 53 → Hosted Zones → Create
- Domain name: `yourdomain.com`
- Create

### 2. Update Nameservers (if external domain)

Copy the 4 NS records from Route 53, update in your domain registrar.

### 3. Create DNS Records

**For Frontend (CloudFront)**:
- Record name: `www` (or leave empty for root domain)
- Type: A
- Alias: Yes
- Route traffic to: CloudFront distribution
- Select your distribution

**For Backend API**:
- Record name: `api`
- Type: A
- Value: Your EC2 public IP
- TTL: 300

---

## Step 4.3: Setup SSL Certificate (HTTPS)

### 1. Request Certificate in ACM

- AWS Certificate Manager → Request Certificate
- Domain names: `yourdomain.com`, `*.yourdomain.com`
- Validation: DNS validation
- Request

### 2. Add CNAME Records

- Copy CNAME name and value
- Add to Route 53 (usually auto-created)
- Wait for validation (5-30 minutes)

### 3. Add Certificate to CloudFront

- CloudFront → Distribution → Edit
- Custom SSL Certificate → Select your certificate
- Save

### 4. Update Backend for HTTPS (if needed)

On EC2, use Let's Encrypt with Nginx:

```bash
sudo yum install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

---

# Part 5: 🔒 Security & Production Checklist

## Security Best Practices

### 1. RDS Security

```bash
# Update RDS Security Group
# Remove public access after setup
# Only allow EC2 security group
```

### 2. EC2 Security

```bash
# Update EC2 security group
# Remove SSH from 0.0.0.0/0
# Only allow your IP for SSH
```

### 3. Environment Variables

Store sensitive data in AWS Secrets Manager or Parameter Store:

```bash
# Create secret in AWS Secrets Manager
aws secretsmanager create-secret \
    --name realestate/db/credentials \
    --secret-string '{"username":"admin","password":"YourPassword"}'

# Update Spring Boot to read from Secrets Manager
```

### 4. IAM Roles

Create IAM role for EC2 with minimal permissions.

---

## Production Configuration

### application.properties (Production)

```properties
# Production Profile
spring.profiles.active=production

# Database
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5

# Logging
logging.level.root=INFO
logging.level.com.realestate=INFO
logging.file.name=/var/log/realestate-backend.log

# Security
server.ssl.enabled=false  # Nginx handles SSL
```

---

# Part 6: 📊 Monitoring & Maintenance

## Setup CloudWatch Monitoring

### 1. EC2 Monitoring
- CloudWatch → Alarms → Create Alarm
- Metric: EC2 → CPU Utilization
- Threshold: > 80%
- Action: Send email notification

### 2. RDS Monitoring
- Monitor database connections
- Storage space
- CPU utilization

### 3. Application Logs

```bash
# View backend logs
sudo journalctl -u realestate-backend -f

# Or if using log file
tail -f /var/log/realestate-backend.log
```

---

## Backup Strategy

### 1. RDS Automated Backups
- Already enabled (7 days retention)
- Can restore to any point in time

### 2. Manual Snapshots
- RDS → Snapshots → Create Snapshot
- Do before major updates

### 3. S3 Versioning
- Already enabled
- Can restore previous versions

---

# Part 7: 🚀 Deployment Commands Quick Reference

## Backend Deployment

```bash
# Connect to EC2
ssh -i key.pem ec2-user@ec2-ip

# Pull latest code
cd backend-project
git pull origin main

# Build
mvn clean package -DskipTests

# Restart service
sudo systemctl restart realestate-backend

# Check status
sudo systemctl status realestate-backend

# View logs
sudo journalctl -u realestate-backend -f
```

## Frontend Deployment

```bash
# Local machine
cd real-estate-frontend
npm run build

# Upload to S3
aws s3 sync build/ s3://realestate-frontend-app --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id YOUR_DISTRIBUTION_ID \
    --paths "/*"
```

---

# 📝 Cost Estimation (Monthly)

## Free Tier (12 months)
- **EC2 t2.micro**: $0 (750 hours/month)
- **RDS db.t3.micro**: $0 (750 hours/month)
- **S3**: $0 (5 GB storage)
- **CloudFront**: $0 (50 GB data transfer)
- **Route 53**: $0.50 (hosted zone)

**Total**: ~$0.50/month (first year)

## After Free Tier
- **EC2 t3.small**: ~$15/month
- **RDS db.t3.small**: ~$30/month
- **S3**: ~$0.50/month
- **CloudFront**: ~$1/month (for light traffic)
- **Route 53**: ~$0.50/month

**Total**: ~$47/month

---

# 🎯 Final URLs

After complete deployment:

```
Frontend: https://www.yourdomain.com
Backend API: https://api.yourdomain.com
Database: your-rds-endpoint.rds.amazonaws.com:3306

OR (without custom domain):

Frontend: https://d111111abcdef8.cloudfront.net
Backend API: http://ec2-xx-xx-xx-xx.compute.amazonaws.com:8080
```

---

# ✅ Deployment Checklist

## Pre-Deployment
- [ ] AWS account created and verified
- [ ] Credit card added
- [ ] Backend code tested locally
- [ ] Frontend code tested locally
- [ ] Database schema ready

## RDS Setup
- [ ] RDS MySQL instance created
- [ ] Security group configured
- [ ] Database accessible
- [ ] Schema initialized
- [ ] Test connection successful

## EC2 Backend
- [ ] EC2 instance launched
- [ ] Security group configured
- [ ] SSH connection working
- [ ] Java & Maven installed
- [ ] Backend deployed
- [ ] API endpoints responding
- [ ] Service running on boot

## S3 Frontend
- [ ] S3 bucket created
- [ ] Static website hosting enabled
- [ ] Files uploaded
- [ ] Bucket policy set
- [ ] Website accessible

## CloudFront
- [ ] Distribution created
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate added
- [ ] Error pages configured
- [ ] Cache working

## Domain & SSL
- [ ] Domain purchased/configured
- [ ] Route 53 hosted zone created
- [ ] DNS records added
- [ ] SSL certificate issued
- [ ] HTTPS working

## Security
- [ ] RDS not publicly accessible (except during setup)
- [ ] EC2 security group restricted
- [ ] Secrets stored securely
- [ ] CORS configured properly
- [ ] SSL/HTTPS enabled

## Monitoring
- [ ] CloudWatch alarms set
- [ ] Log monitoring configured
- [ ] Backup strategy in place
- [ ] Email notifications working

---

# 🆘 Troubleshooting Common Issues

## Issue 1: Can't Connect to RDS
**Solution**:
- Check security group inbound rules
- Verify endpoint and port
- Check VPC settings
- Ensure publicly accessible (temporarily)

## Issue 2: Backend API Returns 502
**Solution**:
- Check if Spring Boot is running: `sudo systemctl status realestate-backend`
- Check logs: `sudo journalctl -u realestate-backend`
- Verify port 8080 is listening: `sudo netstat -tlnp | grep 8080`

## Issue 3: Frontend Shows Blank Page
**Solution**:
- Check browser console for errors
- Verify API URL in frontend code
- Check CORS configuration in backend
- Clear CloudFront cache

## Issue 4: Database Connection Refused
**Solution**:
- Verify RDS endpoint in application.properties
- Check database credentials
- Test connection: `mysql -h endpoint -u admin -p`
- Check RDS status in AWS console

## Issue 5: CloudFront Not Updating
**Solution**:
```bash
# Create cache invalidation
aws cloudfront create-invalidation \
    --distribution-id YOUR_ID \
    --paths "/*"
```

---

# 📚 Additional Resources

## AWS Documentation
- [EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [RDS User Guide](https://docs.aws.amazon.com/rds/)
- [S3 User Guide](https://docs.aws.amazon.com/s3/)
- [CloudFront User Guide](https://docs.aws.amazon.com/cloudfront/)

## Tutorials
- [Spring Boot on AWS](https://spring.io/guides/gs/spring-boot-aws/)
- [Deploy React to S3](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-a-react-based-single-page-application-to-amazon-s3-and-cloudfront.html)

---

# 🎉 Congratulations!

Your Real Estate Management System is now deployed on AWS with:
- ✅ Scalable backend on EC2
- ✅ Fast frontend on S3/CloudFront
- ✅ Managed MySQL database on RDS
- ✅ HTTPS security
- ✅ Custom domain (optional)
- ✅ Automated backups
- ✅ Monitoring & alerts

**Your application is production-ready!** 🚀

---

**Deployment Guide Created**: January 28, 2026  
**Last Updated**: January 28, 2026  
**Version**: 1.0
