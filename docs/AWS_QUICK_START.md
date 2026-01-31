# 🚀 AWS Deployment - Quick Start Guide

## ⏱️ Total Time: ~2-3 hours

---

## 📋 Step-by-Step Quick Checklist

### STEP 1: Setup RDS MySQL (30 mins)
```
1. AWS Console → RDS → Create Database
2. MySQL 8.0, Free Tier (db.t3.micro)
3. Database name: realestate_db
4. Username: admin
5. Password: [Create strong password]
6. Public access: Yes (temporarily)
7. Create Database → Wait 10 minutes
8. Copy Endpoint URL
9. Security Group → Allow port 3306 from anywhere
10. Test connection with MySQL Workbench
```

### STEP 2: Deploy Backend to EC2 (45 mins)
```
1. AWS Console → EC2 → Launch Instance
2. Name: realestate-backend
3. AMI: Amazon Linux 2023
4. Instance type: t2.micro (free tier)
5. Create key pair → Download .pem file
6. Security group: Allow SSH (22), Custom TCP (8080)
7. Launch Instance
8. SSH connect:
   chmod 400 key.pem
   ssh -i key.pem ec2-user@[EC2-IP]
9. Install Java & Maven:
   sudo yum update -y
   sudo yum install java-17-amazon-corretto-devel maven git -y
10. Clone/Upload backend code
11. Update application.properties with RDS endpoint
12. Build: mvn clean package -DskipTests
13. Run: java -jar target/*.jar
14. Test: curl http://localhost:8080/api/properties
15. Setup as service (systemd)
```

### STEP 3: Deploy Frontend to S3 (30 mins)
```
1. Local: Update frontend API URL to EC2 IP
2. Build: npm run build
3. AWS Console → S3 → Create Bucket
4. Name: realestate-frontend-[unique]
5. Uncheck "Block all public access"
6. Create bucket
7. Upload all files from build/ folder
8. Properties → Static website hosting → Enable
9. Index document: index.html
10. Error document: index.html
11. Permissions → Bucket Policy → Add public read policy
12. Test: Open S3 website URL
```

### STEP 4: Setup CloudFront (20 mins)
```
1. AWS Console → CloudFront → Create Distribution
2. Origin: Select S3 bucket
3. Viewer protocol: Redirect HTTP to HTTPS
4. Default root object: index.html
5. Create distribution → Wait 15 mins
6. Error pages: Add 403 & 404 → /index.html (200)
7. Test: Open CloudFront URL
```

### STEP 5: Configure Domain (Optional - 30 mins)
```
1. Route 53 → Register domain OR add existing
2. Create hosted zone
3. Add A record for frontend → CloudFront
4. Add A record for api → EC2 IP
5. Request SSL certificate in ACM
6. Add certificate to CloudFront
7. Wait for DNS propagation (10-60 mins)
```

---

## 💰 Cost (First Year)

**Free Tier Eligible**:
- ✅ EC2 t2.micro: FREE (750 hours/month)
- ✅ RDS db.t3.micro: FREE (750 hours/month)
- ✅ S3: FREE (5GB storage)
- ✅ CloudFront: FREE (50GB transfer)
- 💵 Route 53: $0.50/month (if using domain)

**After Free Tier**: ~$47/month

---

## 🎯 Final URLs

```
Frontend: https://[cloudfront-id].cloudfront.net
Backend:  http://[ec2-ip]:8080/api
Database: [rds-endpoint]:3306

OR with custom domain:
Frontend: https://www.yourdomain.com
Backend:  https://api.yourdomain.com
```

---

## 🔑 Important Files to Update

### Backend: application.properties
```properties
spring.datasource.url=jdbc:mysql://[RDS-ENDPOINT]:3306/realestate_db
spring.datasource.username=admin
spring.datasource.password=[YOUR-PASSWORD]
server.port=8080
```

### Frontend: src/services/api.js
```javascript
const API_BASE_URL = 'http://[EC2-IP]:8080/api';
```

---

## ⚠️ Security Reminders

1. **RDS**: Change to private after testing
2. **EC2**: Restrict SSH to your IP only
3. **Passwords**: Use strong passwords
4. **HTTPS**: Enable SSL certificates
5. **Backups**: Enable RDS automated backups

---

## 🆘 Quick Troubleshooting

### Backend not starting?
```bash
sudo journalctl -u realestate-backend -f
```

### Frontend blank page?
- Check browser console
- Verify API URL in frontend
- Check CORS in backend

### Can't connect to database?
- Check RDS security group
- Verify endpoint in application.properties
- Test: `mysql -h [endpoint] -u admin -p`

### CloudFront not updating?
```bash
aws cloudfront create-invalidation --distribution-id [ID] --paths "/*"
```

---

## 📞 Need Help?

Full detailed guide: `AWS_DEPLOYMENT_GUIDE.md`

---

## ✅ Deployment Complete?

Test these:
- [ ] Frontend loads in browser
- [ ] Backend API responds
- [ ] Can create property
- [ ] Can view properties
- [ ] Can edit property
- [ ] Can delete property
- [ ] Images display correctly
- [ ] Login/Registration works

**🎉 Congratulations! Your app is live on AWS!**
