# 🚀 Quick AWS Deployment - 5 Minutes

## What You'll Deploy

- **Frontend** → AWS S3 (Static Website)
- **Backend** → AWS EC2 (Java Server)
- **Database** → MySQL on EC2 or AWS RDS

---

## ⚡ FASTEST METHOD - Use Our Scripts

### Step 1: Install Prerequisites (5 minutes)

```powershell
# Install AWS CLI
choco install awscli

# Configure AWS (you need AWS account first)
aws configure
# Enter: Access Key, Secret Key, Region: us-east-1, Format: json
```

### Step 2: Deploy Frontend to S3 (2 minutes)

```powershell
cd "D:\CDAC Project\Atharva\Atharva\real-estate-frontend"

# Edit deploy-to-s3.ps1 - Update these 3 lines:
# $S3_BUCKET = "realestate-yourname"  # Choose unique name
# $BACKEND_URL = "http://YOUR_EC2_IP:8080/api"  # Your backend IP

# Run deployment
.\deploy-to-s3.ps1
```

The script will:
- ✅ Build your frontend
- ✅ Create S3 bucket
- ✅ Configure static website hosting
- ✅ Upload files
- ✅ Give you the live URL

### Step 3: Deploy Backend to EC2 (10 minutes)

#### A. Launch EC2 Instance:

1. Go to **AWS Console → EC2 → Launch Instance**
2. **Name:** `realestate-backend`
3. **AMI:** Amazon Linux 2023
4. **Instance Type:** t2.micro (free tier)
5. **Key pair:** Create new → Download `.pem` file
6. **Security Group:** Allow SSH (22), HTTP (80), Custom TCP (8080)
7. **Launch**

#### B. Connect and Setup:

```powershell
# Connect to EC2
ssh -i "your-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP

# On EC2, run these commands:
sudo yum install java-17-amazon-corretto-devel mysql-server -y
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Create database
sudo mysql
```

In MySQL:
```sql
CREATE DATABASE realestate_db;
CREATE USER 'realestate'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON realestate_db.* TO 'realestate'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### C. Upload and Start Backend:

```powershell
# On your local machine
cd "D:\CDAC Project\Atharva\Atharva\real-estate-backend"
mvn clean package -DskipTests

# Upload to EC2
scp -i "your-key.pem" target/*.jar ec2-user@YOUR_EC2_IP:~/backend.jar

# SSH back to EC2
ssh -i "your-key.pem" ec2-user@YOUR_EC2_IP

# Start backend
nohup java -jar backend.jar > backend.log 2>&1 &

# Check if running
ps aux | grep java
tail -f backend.log
```

#### D. Test Backend:

```bash
curl http://localhost:8080/api/properties/available
```

Should see JSON response.

---

## ✅ Verify Everything Works

### 1. Test Backend:
```powershell
curl http://YOUR_EC2_IP:8080/api/properties/available
```

### 2. Test Frontend:
Open your S3 URL in browser:
```
http://realestate-yourname.s3-website-us-east-1.amazonaws.com
```

### 3. Check Browser Console (F12):
- Network tab should show API calls to `YOUR_EC2_IP:8080`
- No CORS errors
- Properties should load

---

## 🔧 Update Backend CORS

Your backend needs to allow requests from S3. Edit `CorsConfig.java`:

```java
.allowedOrigins(
    "http://localhost:3000",
    "http://realestate-yourname.s3-website-us-east-1.amazonaws.com"
)
```

Rebuild and redeploy backend:
```powershell
mvn clean package -DskipTests
scp -i "your-key.pem" target/*.jar ec2-user@YOUR_EC2_IP:~/backend.jar

# On EC2:
pkill -f backend.jar
nohup java -jar backend.jar > backend.log 2>&1 &
```

---

## 🎯 Quick Commands Reference

```powershell
# Deploy Frontend
.\deploy-to-s3.ps1

# Build Backend
mvn clean package -DskipTests

# Upload Backend
scp -i key.pem target/*.jar ec2-user@IP:~/backend.jar

# Connect to EC2
ssh -i key.pem ec2-user@IP

# Start Backend (on EC2)
nohup java -jar backend.jar > backend.log 2>&1 &

# Stop Backend (on EC2)
pkill -f backend.jar

# View Logs (on EC2)
tail -f backend.log

# Test Backend
curl http://YOUR_EC2_IP:8080/api/properties/available
```

---

## 📋 Checklist

### Before Deployment:
- [ ] AWS account created
- [ ] AWS CLI installed: `aws --version`
- [ ] AWS configured: `aws configure`
- [ ] Frontend builds: `npm run build`
- [ ] Backend builds: `mvn clean package`

### Frontend (S3):
- [ ] `deploy-to-s3.ps1` configured with bucket name
- [ ] Script executed successfully
- [ ] S3 URL accessible in browser

### Backend (EC2):
- [ ] EC2 instance launched
- [ ] Security group allows ports 22, 8080
- [ ] Java installed on EC2
- [ ] MySQL installed on EC2
- [ ] Database created
- [ ] Backend JAR uploaded
- [ ] Backend running: `ps aux | grep java`
- [ ] Backend accessible: `curl http://EC2_IP:8080/api/...`

### Integration:
- [ ] Backend CORS configured for S3 URL
- [ ] Frontend rebuilt with correct backend URL
- [ ] Frontend calls backend successfully
- [ ] No CORS errors
- [ ] All features working

---

## 💰 Cost

### AWS Free Tier (First 12 Months):
- **S3:** 5 GB storage, 20,000 requests - FREE
- **EC2:** t2.micro, 750 hours/month - FREE
- **Data Transfer:** 15 GB/month - FREE

### After Free Tier:
- ~$10-20/month for basic setup
- Can optimize costs with reserved instances

---

## 🆘 Common Issues

### "AWS CLI not found"
```powershell
choco install awscli
# Or download: https://aws.amazon.com/cli/
```

### "Access Denied" on S3
- Check bucket policy allows public access
- Run: `.\deploy-to-s3.ps1` (handles this automatically)

### "Connection Refused" to Backend
- Check EC2 security group allows port 8080
- Check backend is running: `ps aux | grep java`
- Check logs: `tail -f backend.log`

### "CORS Error"
- Update backend CORS with S3 URL
- Rebuild and redeploy backend

### "Can't connect to EC2"
- Check security group allows SSH (port 22) from your IP
- Use correct key file: `ssh -i your-key.pem ec2-user@IP`

---

## 📚 Full Documentation

For detailed instructions, see:
- **🌐_COMPLETE_AWS_DEPLOYMENT_GUIDE.md** - Complete step-by-step guide
- **deploy-to-s3.ps1** - Automated frontend deployment
- **BACKEND_CORS_CONFIG.java** - Backend CORS configuration

---

## 🎉 That's It!

Your real estate platform is now live on AWS!

**Frontend:** http://your-bucket.s3-website-us-east-1.amazonaws.com  
**Backend:** http://your-ec2-ip:8080/api

---

## 🚀 Next Steps

1. **Add HTTPS:** Use CloudFront + AWS Certificate Manager
2. **Custom Domain:** Use Route 53 for DNS
3. **Database:** Move to AWS RDS for better reliability
4. **Monitoring:** Set up CloudWatch alerts
5. **Backups:** Configure automated backups

**Need help? Check the complete guide: 🌐_COMPLETE_AWS_DEPLOYMENT_GUIDE.md**
