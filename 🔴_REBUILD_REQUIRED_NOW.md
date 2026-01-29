# 🚨 IMMEDIATE FIX: Frontend Still Calling Localhost

## The Problem

Your frontend on AWS S3 is still calling `localhost:8080` which causes:
```
ERR_CONNECTION_REFUSED
```

This happens because the app wasn't rebuilt after creating `.env.production`.

---

## ✅ SOLUTION - Rebuild and Redeploy (5 minutes)

### Step 1: Stop Any Running Development Server

If you have `npm start` running, stop it (Ctrl+C).

### Step 2: Rebuild Frontend for Production

```powershell
# Make sure you're in the frontend directory
cd "D:\CDAC Project\Atharva\Atharva\real-estate-frontend"

# Clean old build
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue

# Rebuild with production config (.env.production)
npm run build
```

This will use `.env.production` which points to `http://13.220.57.64:8080/api`

### Step 3: Verify Build Used Correct URL

Check the built files to confirm:

```powershell
# Search for the API URL in built files
Select-String -Path "build\static\js\*.js" -Pattern "13.220.57.64" | Select-Object -First 1
```

You should see `13.220.57.64` in the output. If you see `localhost`, the build didn't use `.env.production`.

### Step 4: Deploy to S3

```powershell
# Deploy new build to S3
aws s3 sync build/ s3://realestate-frontend --delete --acl public-read
```

### Step 5: Clear Browser Cache and Test

1. Open your S3 URL: `http://realestate-frontend.s3-website-us-east-1.amazonaws.com`
2. Press **Ctrl+Shift+R** (hard refresh to clear cache)
3. Check browser console (F12) - should see calls to `13.220.57.64:8080`, NOT `localhost`

---

## 🔍 Verify Configuration

### Check .env.production exists and is correct:

```powershell
Get-Content .env.production
```

Should show:
```
REACT_APP_API_URL=http://13.220.57.64:8080/api
```

### Check .env (for local dev):

```powershell
Get-Content .env
```

Should show:
```
REACT_APP_API_URL=http://localhost:8080/api
```

---

## ⚠️ Common Mistakes

### Mistake 1: Using npm start instead of npm run build

```powershell
# ❌ WRONG - Uses .env (localhost)
npm start

# ✅ CORRECT - Uses .env.production (AWS IP)
npm run build
```

### Mistake 2: Not Redeploying After Build

After running `npm run build`, you MUST upload to S3:
```powershell
aws s3 sync build/ s3://realestate-frontend --delete --acl public-read
```

### Mistake 3: Browser Cache

Always hard refresh: **Ctrl+Shift+R** or clear browser cache

---

## 🚀 Alternative: Test Locally First

If AWS backend isn't ready yet, test everything locally:

```powershell
# Terminal 1: Start Backend
cd ..\real-estate-backend
mvn spring-boot:run

# Terminal 2: Start Frontend
cd ..\real-estate-frontend
npm start

# Open: http://localhost:3000
```

---

## 📋 Quick Checklist

- [ ] `.env.production` exists with AWS backend URL
- [ ] Ran `npm run build` (NOT `npm start`)
- [ ] Verified build contains `13.220.57.64` in JS files
- [ ] Deployed to S3: `aws s3 sync build/ s3://bucket-name`
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Checked Network tab shows calls to `13.220.57.64`, not `localhost`
- [ ] Backend at `13.220.57.64:8080` is running and accessible

---

## 🐛 Still Not Working?

### Check 1: Is backend running on EC2?

```bash
curl http://13.220.57.64:8080/api/properties/available
```

Expected: JSON response

If you get connection error, backend is not running or port 8080 is blocked.

### Check 2: Is EC2 security group open?

AWS Console → EC2 → Security Groups → Check Inbound Rules:
- Type: Custom TCP
- Port: 8080
- Source: 0.0.0.0/0

### Check 3: What URL is frontend calling?

Open browser (F12) → Network tab → Reload page → Check API calls

Should call: `http://13.220.57.64:8080/api/...`  
NOT: `http://localhost:8080/api/...`

---

## 💡 Understanding the Issue

### Development vs Production:

```
npm start → Uses .env → localhost:8080
npm run build → Uses .env.production → 13.220.57.64:8080
```

### Your Files:
- `.env` - For local development (localhost)
- `.env.production` - For AWS deployment (EC2 IP)

### The Build Process:
React embeds environment variables during build, not runtime. So you must:
1. Have correct `.env.production`
2. Run `npm run build`
3. Deploy the `build/` folder

---

## 🎯 ONE COMMAND FIX (If Everything is Set Up)

```powershell
# Rebuild and redeploy in one go
npm run build; aws s3 sync build/ s3://realestate-frontend --delete --acl public-read; Write-Host "✓ Deployed! Hard refresh your browser (Ctrl+Shift+R)" -ForegroundColor Green
```

---

## 📞 Next Steps

1. **Run the commands above** to rebuild and redeploy
2. **Hard refresh browser** (Ctrl+Shift+R)
3. **Check Network tab** to confirm it calls AWS IP
4. **If still localhost**, verify `.env.production` exists and rebuild

---

**The fix is simple: REBUILD with `npm run build` and REDEPLOY!**

The `.env.production` file is already correct, you just need to use it! 🚀
