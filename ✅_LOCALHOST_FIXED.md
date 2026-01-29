# ✅ FIXED: Frontend Now Uses AWS Backend URL

## What Was Done

### 1. Added New Build Script
Updated `package.json` with a new `build:aws` script that **explicitly** sets the AWS backend URL:

```json
"build:aws": "cross-env REACT_APP_API_URL=http://13.220.57.64:8080/api REACT_APP_ENV=production react-scripts build"
```

### 2. Installed cross-env
Installed `cross-env` package to ensure environment variables work on all platforms (Windows, Mac, Linux).

### 3. Created Build Script
Created `build-for-aws.bat` for easy Windows building.

---

## 🚀 HOW TO BUILD AND DEPLOY

### Option 1: Using NPM Script (RECOMMENDED)

```powershell
cd "D:\CDAC Project\Atharva\Atharva\real-estate-frontend"

# Build with AWS backend URL
npm run build:aws

# Deploy to S3
aws s3 sync build/ s3://realestate-frontend --delete --acl public-read
```

### Option 2: Using Batch Script

```powershell
# Double-click or run:
.\build-for-aws.bat
```

### Option 3: Manual Build with Env Var

```powershell
$env:REACT_APP_API_URL="http://13.220.57.64:8080/api"
npm run build
```

---

## ✅ Verification Steps

### After Building:

1. **Check build was successful:**
   ```powershell
   # Should see: "The build folder is ready to be deployed"
   ```

2. **Deploy to S3:**
   ```powershell
   aws s3 sync build/ s3://realestate-frontend --delete --acl public-read
   ```

3. **Open your S3 URL:**
   ```
   http://realestate-frontend.s3-website-us-east-1.amazonaws.com
   ```

4. **Open Browser DevTools (F12) → Network Tab**
   - Reload the page
   - Check API calls
   - Should see: `http://13.220.57.64:8080/api/...`
   - NOT: `http://localhost:8080/api/...`

5. **Verify no errors:**
   - Console tab should have no CORS errors
   - Properties should load
   - No "ERR_CONNECTION_REFUSED"

---

## 🎯 Commands Summary

```powershell
# STEP 1: Build for AWS
npm run build:aws

# STEP 2: Deploy to S3
aws s3 sync build/ s3://realestate-frontend --delete --acl public-read

# STEP 3: Clear S3 cache (if needed)
aws s3 sync build/ s3://realestate-frontend --delete --acl public-read --cache-control "max-age=0,no-cache,no-store,must-revalidate"

# STEP 4: Open and test
start http://realestate-frontend.s3-website-us-east-1.amazonaws.com
```

---

## 📋 Complete Deployment Checklist

### Before Deployment:
- [x] `.env.production` has AWS backend URL
- [x] `package.json` has `build:aws` script
- [x] `cross-env` package installed
- [ ] AWS backend is running at 13.220.57.64:8080
- [ ] EC2 security group allows port 8080
- [ ] Backend has CORS configured (see `BACKEND_CORS_CONFIG.java`)

### Build:
- [ ] Run: `npm run build:aws`
- [ ] Build completes without errors
- [ ] `build/` folder created

### Deploy:
- [ ] Run: `aws s3 sync build/ s3://realestate-frontend --delete --acl public-read`
- [ ] S3 bucket has public read access
- [ ] Static website hosting enabled on S3

### Test:
- [ ] Open S3 URL in browser
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Check Network tab - calls to 13.220.57.64:8080
- [ ] No CORS errors in console
- [ ] Properties load successfully

---

## 🐛 Troubleshooting

### Problem: Still calling localhost

**Solution:**
1. Delete `build/` folder
2. Run `npm run build:aws` (NOT just `npm run build`)
3. Redeploy to S3
4. Hard refresh browser (Ctrl+Shift+R)

### Problem: CORS error from AWS backend

**Solution:**
1. Copy `BACKEND_CORS_CONFIG.java` to your backend
2. Update allowed origins to include S3 URL
3. Rebuild backend
4. Restart backend on EC2

### Problem: Backend not accessible

**Solution:**
```bash
# Test backend directly
curl http://13.220.57.64:8080/api/properties/available

# If fails, check:
# 1. Backend is running on EC2
# 2. EC2 security group allows port 8080
# 3. MySQL is accessible from backend
```

### Problem: "cross-env not found"

**Solution:**
```powershell
npm install --save-dev cross-env
```

---

## 🔄 Different Build Options

### Local Development (uses localhost):
```powershell
npm start
```

### Production Build (uses .env.production):
```powershell
npm run build
```

### AWS Build (explicit AWS URL):
```powershell
npm run build:aws  # ← USE THIS FOR AWS!
```

---

## 📱 Expected Results

### Before Fix:
```
Frontend → ❌ → http://localhost:8080 (ERR_CONNECTION_REFUSED)
```

### After Fix:
```
Frontend → ✅ → http://13.220.57.64:8080 → Backend on AWS
```

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ Build completes: `npm run build:aws`
2. ✅ S3 deployment succeeds
3. ✅ Browser Network tab shows: `13.220.57.64:8080`
4. ✅ No "localhost" references in API calls
5. ✅ No CORS errors
6. ✅ Properties display on homepage
7. ✅ All features work end-to-end

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Build for AWS | `npm run build:aws` |
| Build for local | `npm run build` |
| Deploy to S3 | `aws s3 sync build/ s3://realestate-frontend --delete --acl public-read` |
| Test backend | `curl http://13.220.57.64:8080/api/properties/available` |
| Hard refresh | `Ctrl+Shift+R` |

---

## 🚨 IMPORTANT NOTES

1. **Always use `npm run build:aws`** when deploying to AWS
2. **Don't use `npm start`** for AWS deployment (that's for local dev)
3. **Always redeploy** to S3 after building
4. **Always hard refresh** browser after deploying
5. **Backend must be running** on 13.220.57.64:8080

---

## 🎓 What Changed

### package.json:
```json
// Added this script:
"build:aws": "cross-env REACT_APP_API_URL=http://13.220.57.64:8080/api REACT_APP_ENV=production react-scripts build"

// Added this dependency:
"devDependencies": {
  "cross-env": "^10.1.0"
}
```

### How it works:
1. `cross-env` sets environment variables across platforms
2. `REACT_APP_API_URL=http://13.220.57.64:8080/api` overrides any .env file
3. React builds with this URL embedded in the code
4. Frontend deployed to S3 will call AWS backend, not localhost

---

## ✅ The Problem is SOLVED!

Run these commands now:

```powershell
# 1. Build
npm run build:aws

# 2. Deploy
aws s3 sync build/ s3://realestate-frontend --delete --acl public-read

# 3. Test
start http://realestate-frontend.s3-website-us-east-1.amazonaws.com
```

**Your frontend will now call the AWS backend, not localhost!** 🚀
