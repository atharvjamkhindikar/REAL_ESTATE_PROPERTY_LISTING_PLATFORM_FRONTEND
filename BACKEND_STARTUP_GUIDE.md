# 🚀 Backend Server Setup & Startup Guide

**Problem**: Network Error - Backend not accessible  
**Solution**: Start the Spring Boot backend server  
**Status**: This guide will help you get it running

---

## 📋 Prerequisites

Before starting the backend, ensure you have:

✅ Java Development Kit (JDK) 11 or higher installed  
✅ Maven installed and in PATH  
✅ Database (MySQL/PostgreSQL) running and accessible  
✅ Backend project at: `D:\CDAC Project\Atharva\Atharva\real-estate-backend`

---

## 🔍 Check If Backend Is Running

### Method 1: Terminal Check
Open terminal and run:
```bash
curl http://localhost:8080/api/properties/available
```

If you get a response: Backend is running ✅  
If you get "connection refused": Backend is NOT running ❌

### Method 2: Browser Check
Open browser and go to:
```
http://localhost:8080/api/properties/available
```

Expected: JSON response or error page (not "connection refused")

---

## 🚀 Start Backend Server

### Option 1: Using Maven (Terminal)

**Step 1**: Open PowerShell/Command Prompt

**Step 2**: Navigate to backend project
```bash
cd "D:\CDAC Project\Atharva\Atharva\real-estate-backend"
```

**Step 3**: Build and run
```bash
mvn clean install
mvn spring-boot:run
```

**Step 4**: Wait for startup message
```
Started Application in X seconds
Tomcat initialized with port(s): 8080
```

**Step 5**: Verify it's running
- Go to http://localhost:8080/api/properties/available in browser
- Should see a response (not network error)

---

### Option 2: Using IDE (IntelliJ / Eclipse)

**IntelliJ IDEA**:
1. Open the backend project in IntelliJ
2. Right-click on the main Application class (e.g., `RealEstateApplication.java`)
3. Select "Run 'RealEstateApplication.main()'"
4. Wait for startup to complete

**Eclipse**:
1. Right-click on backend project
2. Select "Run As" → "Spring Boot App"
3. Wait for startup to complete

---

### Option 3: Using Spring Boot Maven Plugin

```bash
cd "D:\CDAC Project\Atharva\Atharva\real-estate-backend"
mvn spring-boot:run
```

---

## ✅ Verify Backend Is Running

Look for these indicators:

**Terminal Output**:
```
Started Application in 5.123 seconds
Tomcat initialized with port(s): 8080 (http)
```

**No errors** in the terminal output

**Database** shows successful connection logs

---

## 🔧 Backend Configuration Check

Verify backend is configured correctly:

### File: application.properties or application.yml

**Database Configuration**:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/real_estate
spring.datasource.username=root
spring.datasource.password=your_password
```

**Server Port**:
```properties
server.port=8080
```

**CORS Configuration** (should allow localhost:3001):
```properties
# Should be in CorsConfig.java or similar
```

---

## 🐛 Troubleshooting

### Error: "Port 8080 is already in use"

**Solution**: Kill the process using port 8080

Windows PowerShell:
```powershell
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```

Windows Command Prompt:
```cmd
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```

### Error: "Cannot connect to database"

**Check**:
1. Is MySQL/PostgreSQL running?
2. Are credentials correct in application.properties?
3. Does database exist?
4. Is firewall blocking database port?

### Error: "Maven not found"

**Solution**:
1. Install Maven from https://maven.apache.org/download.cgi
2. Add Maven bin folder to PATH
3. Restart terminal

### Error: "Cannot find main class"

**Solution**:
1. Ensure you're in backend project directory
2. Check pom.xml exists
3. Check for syntax errors in pom.xml

---

## 🔄 Frontend-Backend Connection

### After Backend Starts

1. **Backend running**: http://localhost:8080 ✅
2. **Frontend running**: http://localhost:3001 ✅
3. **Frontend can call backend**: ✅

### If Still Getting Network Error

**Step 1**: Verify backend is running
```bash
curl http://localhost:8080/api/properties/available
```

**Step 2**: Check frontend .env file
- Verify: `REACT_APP_API_URL=http://localhost:8080/api`

**Step 3**: Restart frontend
```bash
# Stop frontend (Ctrl+C)
# Then restart
npm start
```

---

## 📊 Startup Sequence

```
1. Start Database (MySQL/PostgreSQL)
   ✅ Database running on its port (3306, 5432, etc.)

2. Start Backend (Spring Boot)
   ✅ Backend running on http://localhost:8080
   ✅ Database connected
   ✅ Logs show successful startup

3. Start Frontend (React)
   ✅ Frontend running on http://localhost:3001
   ✅ Can connect to backend

4. Verify Connection
   ✅ Open http://localhost:3001 in browser
   ✅ No network errors
   ✅ Data loads from backend
```

---

## ✅ Success Indicators

You'll know the backend is running when:

✅ Terminal shows "Started Application in X seconds"  
✅ Can access http://localhost:8080/api/... in browser  
✅ Frontend stops showing "Network Error"  
✅ Frontend loads data and pages work  
✅ No CORS errors in frontend console  

---

## 🎯 Next Steps

1. **Start Backend**: Use one of the methods above
2. **Verify**: Check http://localhost:8080/api/properties/available
3. **Refresh Frontend**: Go to http://localhost:3001
4. **Test**: Try to register or view properties
5. **Verify**: No network errors should appear

---

**Once backend is running, the network error will be resolved!** 🚀
