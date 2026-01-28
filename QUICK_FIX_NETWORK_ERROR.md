# ⚡ Quick Fix - Network Error

**Issue**: `AxiosError: Network Error (ERR_NETWORK)`  
**Cause**: Backend server not running or not accessible  
**Fix Time**: 2 minutes

---

## 🚀 Quick Start Backend

### Fastest Way (3 Steps)

**Step 1**: Open PowerShell

**Step 2**: Navigate to backend
```powershell
cd "D:\CDAC Project\Atharva\Atharva\real-estate-backend"
```

**Step 3**: Start backend
```powershell
mvn spring-boot:run
```

**Wait** for:
```
Started Application in X seconds
```

---

## ✅ Verify It's Working

Open browser:
```
http://localhost:8080/api/properties/available
```

**Should see**: JSON response or error page  
**NOT**: "Connection refused" or "ERR_NETWORK"

---

## 🔄 Refresh Frontend

Once backend is running:
1. Go to http://localhost:3001
2. Refresh browser (F5 or Ctrl+R)
3. Network error should be gone ✅

---

## 🆘 Still Not Working?

### Check 1: Is port 8080 in use?
```powershell
netstat -ano | findstr :8080
```

If yes, kill it:
```powershell
taskkill /PID <PID_NUMBER> /F
```

### Check 2: Check .env file
Verify frontend has:
```
REACT_APP_API_URL=http://localhost:8080/api
```

### Check 3: Restart frontend
```bash
# Stop (Ctrl+C)
npm start
```

---

## 📊 Expected Ports

- **Frontend**: http://localhost:3001 ✅
- **Backend**: http://localhost:8080 ✅
- **Database**: localhost:3306 (MySQL) ✅

---

**That's it! Backend should be running now.** 🎉
