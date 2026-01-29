# 🚨 URGENT: Fix AWS CORS Error NOW

## The Problem in Simple Terms

Your website on AWS S3 cannot talk to `localhost:8080` because:
- AWS S3 is on the internet
- `localhost` is your personal computer
- They can't communicate

## ✅ SOLUTION (Choose One)

---

### OPTION 1: Quick Fix - Test Locally (5 minutes)

**Stop using AWS S3 for now, run everything locally:**

```powershell
# 1. Start MySQL
Start-Service MySQL80

# 2. Start Backend (in backend folder)
cd ..\real-estate-backend
mvn spring-boot:run

# 3. Start Frontend (in new terminal, in frontend folder)
cd ..\real-estate-frontend
npm start

# 4. Open: http://localhost:3000
```

**Result:** Everything works locally, but not on AWS.

---

### OPTION 2: Proper Fix - Deploy Backend to AWS (30 minutes)

**Your backend must be on AWS too, not just frontend!**

#### Step 1: Rebuild Frontend with AWS Backend URL

```powershell
# Make sure .env.production has:
# REACT_APP_API_URL=http://13.220.57.64:8080/api

# Rebuild frontend
npm run build
```

#### Step 2: Deploy Frontend to S3

```powershell
# Upload new build to S3
aws s3 sync build/ s3://realestate-frontend --delete --acl public-read
```

#### Step 3: Deploy Backend to EC2 (at 13.220.57.64)

**On your AWS EC2 instance:**

```bash
# SSH to EC2
ssh -i your-key.pem ec2-user@13.220.57.64

# Upload backend JAR (from local machine)
scp -i your-key.pem target/backend.jar ec2-user@13.220.57.64:~/

# On EC2, start backend
java -jar backend.jar
```

#### Step 4: Update Backend CORS

**In your backend, add/update:** `src/main/java/com/realestate/config/CorsConfig.java`

(See `BACKEND_CORS_CONFIG.java` file in this folder)

Key part:
```java
.allowedOrigins(
    "http://localhost:3000",
    "http://realestate-frontend.s3-website-us-east-1.amazonaws.com"
)
```

#### Step 5: Open EC2 Port 8080

**In AWS Console:**
1. Go to EC2 → Security Groups
2. Find your instance's security group
3. Add Inbound Rule:
   - Type: Custom TCP
   - Port: 8080
   - Source: 0.0.0.0/0 (or your IP)

#### Step 6: Test

```bash
# Test backend from command line
curl http://13.220.57.64:8080/api/properties/available

# Test frontend in browser
# Open: http://realestate-frontend.s3-website-us-east-1.amazonaws.com
```

---

## 🔍 Check Current Status

### Is Backend Running on EC2?

```bash
ssh -i your-key.pem ec2-user@13.220.57.64
ps aux | grep java
```

If you see a Java process, backend is running.
If not, start it: `java -jar backend.jar`

### Is Backend Accessible?

Open in browser: http://13.220.57.64:8080/api/properties/available

- ✅ See JSON? Backend works!
- ❌ Connection error? Backend not running or port blocked

### Is Frontend Using Correct URL?

Check your deployed frontend's network tab (F12 in browser):
- Should call: http://13.220.57.64:8080/api/...
- NOT: http://localhost:8080/api/...

---

## 📋 Complete Deployment Checklist

- [ ] MySQL database accessible (can be local or AWS RDS)
- [ ] Backend deployed to EC2 at 13.220.57.64
- [ ] EC2 Security Group allows port 8080
- [ ] Backend has CORS configured for S3 URL
- [ ] `.env.production` has correct backend URL
- [ ] Frontend rebuilt: `npm run build`
- [ ] Frontend deployed to S3
- [ ] Test backend: `curl http://13.220.57.64:8080/api/properties/available`
- [ ] Test frontend: Open S3 URL in browser

---

## 🆘 Quick Troubleshooting

### "Cannot connect to backend"

```bash
# Check if backend is running
ssh -i key.pem ec2-user@13.220.57.64 "ps aux | grep java"

# Check port 8080
ssh -i key.pem ec2-user@13.220.57.64 "netstat -tulpn | grep 8080"

# View backend logs
ssh -i key.pem ec2-user@13.220.57.64 "tail -f backend.log"
```

### "Still CORS error"

1. Backend must allow S3 URL in CORS
2. Backend must be rebuilt after CORS change
3. EC2 security group must allow port 8080

### "Frontend shows old version"

Clear S3 cache:
```powershell
aws s3 sync build/ s3://realestate-frontend --delete --acl public-read --cache-control "max-age=0"
```

---

## 🎯 Recommended: Use Scripts

We created deployment scripts for you:

### Windows:
```powershell
.\deploy-aws.ps1
```

### Mac/Linux:
```bash
chmod +x deploy-aws.sh
./deploy-aws.sh
```

These scripts handle everything automatically!

---

## 📞 Files to Read

1. **AWS_CORS_ERROR_FIXED.md** - Complete explanation
2. **BACKEND_CORS_CONFIG.java** - Copy this to backend
3. **deploy-aws.ps1** - Windows deployment script
4. **deploy-aws.sh** - Mac/Linux deployment script

---

## ⚡ FASTEST FIX (If Backend Already on EC2)

If your backend is already running on EC2:

```powershell
# Just rebuild and redeploy frontend
npm run build
aws s3 sync build/ s3://realestate-frontend --delete --acl public-read
```

Then open your S3 URL and test!

---

## 🎓 Why This Happens

```
┌─────────────────┐
│   AWS S3        │  ← Frontend (on internet)
│   (Frontend)    │
└────────┬────────┘
         │
         │ ❌ CANNOT ACCESS
         │
         v
┌─────────────────┐
│   localhost     │  ← Backend (your computer)
│   (Backend)     │
└─────────────────┘
```

**Solution:** Put backend on internet too!

```
┌─────────────────┐
│   AWS S3        │  ← Frontend (on internet)
│   (Frontend)    │
└────────┬────────┘
         │
         │ ✅ CAN ACCESS
         │
         v
┌─────────────────┐
│   AWS EC2       │  ← Backend (on internet)
│   (Backend)     │
└─────────────────┘
```

---

## 🚀 Bottom Line

**You have 2 choices:**

1. **Test locally:** Stop using AWS, run on localhost
2. **Deploy properly:** Put backend on AWS EC2

The error will disappear once both frontend and backend are in the same "world" (both on internet, or both local).

**Choose your path and follow the steps above!**
