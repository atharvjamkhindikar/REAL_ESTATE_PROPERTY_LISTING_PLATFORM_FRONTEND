# 🚀 Quick Start Guide - Real Estate Platform

## ⚠️ CURRENT ISSUE: Backend Not Running

Your frontend is showing a connection error because the **backend server is not running**.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] ☕ **Java 17+** installed
- [ ] 🐬 **MySQL 8.0+** installed and running
- [ ] 📦 **Node.js 16+** and npm installed
- [ ] 🔧 **Maven** or Gradle installed
- [ ] 💾 **MySQL database** created: `realestate_db`

---

## 🎯 Step-by-Step Startup

### Step 1: Start MySQL Database

```powershell
# Check if MySQL is running
Get-Service MySQL*

# If not running, start it
Start-Service MySQL80  # Or your MySQL service name
```

**Or use MySQL Workbench:**
- Open MySQL Workbench
- Connect to your local instance
- Create database if not exists: `CREATE DATABASE realestate_db;`

---

### Step 2: Start Backend Server

**Option A: Using IntelliJ IDEA (Recommended)**
1. Open backend project in IntelliJ
2. Find `RealEstateApplication.java` (or similar main class)
3. Click the green ▶️ play button
4. Wait for "Started Application in X seconds"

**Option B: Using Command Line**
```powershell
# Navigate to backend directory
cd "D:\CDAC Project\Atharva\Atharva\real-estate-backend"

# Run with Maven
mvn spring-boot:run

# OR run with Maven Wrapper
./mvnw spring-boot:run

# OR if you have a JAR file
java -jar target/real-estate-backend-0.0.1-SNAPSHOT.jar
```

**Option C: Use the startup script**
```powershell
# From frontend directory
.\start-backend.bat
```

---

### Step 3: Verify Backend is Running

**Test in Browser:**
Open: http://localhost:8080/api/properties/available

✅ **Success:** You see JSON data  
❌ **Failed:** You see an error page or connection refused

**Test in PowerShell:**
```powershell
curl http://localhost:8080/api/properties/available
```

---

### Step 4: Start Frontend

```powershell
# Make sure you're in the frontend directory
cd "D:\CDAC Project\Atharva\Atharva\real-estate-frontend"

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

The browser should automatically open to http://localhost:3000

---

## 🔧 Common Issues & Solutions

### Issue 1: Port 8080 Already in Use

```powershell
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill the process (replace <PID> with the actual PID)
taskkill /PID <PID> /F
```

### Issue 2: MySQL Connection Failed

**Check MySQL is running:**
```powershell
Get-Service MySQL*
```

**Check credentials in application.properties:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/realestate_db
spring.datasource.username=root
spring.datasource.password=your_password
```

### Issue 3: "mvn" command not found

Install Maven:
```powershell
# Using Chocolatey
choco install maven

# Or download from: https://maven.apache.org/download.cgi
```

### Issue 4: Database Schema Not Created

Add this to application.properties:
```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### Issue 5: Frontend Shows CORS Error

Make sure your backend has CORS configuration:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

---

## 📱 Accessing the Application

Once both servers are running:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | User Interface |
| **Backend API** | http://localhost:8080/api | REST API |
| **Properties** | http://localhost:8080/api/properties/available | Test endpoint |

---

## 🎨 Using the Application

### Default Users (if seeded)

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | admin123 | ADMIN |
| agent@test.com | agent123 | AGENT |
| user@test.com | user123 | BUYER |

### Features to Test

1. **Register** a new user → http://localhost:3000/register
2. **Login** → http://localhost:3000/login
3. **Browse properties** → http://localhost:3000/properties
4. **Add to favorites** → Click ❤️ on any property
5. **Admin dashboard** → http://localhost:3000/admin (admin only)

---

## 🐛 Debugging Tips

### Backend Logs
Watch the console where backend is running for:
- SQL queries
- Error messages
- API request logs

### Frontend Logs
Open browser DevTools (F12):
- **Console** tab: JavaScript errors
- **Network** tab: API calls

### Database Inspection
```sql
USE realestate_db;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM properties;
```

---

## 🌐 Deploying to AWS

If you want to use your AWS deployment instead of localhost:

1. **Update .env:**
```
REACT_APP_API_URL=http://13.220.57.64:8080/api
```

2. **Restart frontend:**
```powershell
npm start
```

---

## 📞 Still Having Issues?

1. Check all services are running:
   - MySQL ✅
   - Backend ✅
   - Frontend ✅

2. Verify ports:
   - MySQL: 3306
   - Backend: 8080
   - Frontend: 3000

3. Check firewall isn't blocking ports

4. Review logs for specific error messages

---

## 🎯 Quick Commands Reference

```powershell
# Start MySQL
Start-Service MySQL80

# Navigate to backend
cd "D:\CDAC Project\Atharva\Atharva\real-estate-backend"

# Start backend
mvn spring-boot:run

# Navigate to frontend
cd "D:\CDAC Project\Atharva\Atharva\real-estate-frontend"

# Start frontend
npm start

# Test backend
curl http://localhost:8080/api/properties/available

# Kill port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

---

## ✅ Success Indicators

You'll know everything is working when:

- ✅ Backend console shows "Started Application"
- ✅ MySQL service is running
- ✅ http://localhost:8080/api/properties/available returns JSON
- ✅ Frontend loads without "connection refused" errors
- ✅ You can see properties on the homepage

---

**Good luck! 🚀**
