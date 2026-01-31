# 🔧 CORS Configuration - Step by Step Guide

**Status**: Frontend ✅ Complete | Backend ⏳ Pending

---

## 📋 What Happened

Your frontend (http://localhost:3001) tried to access the backend API (http://localhost:8080), but the browser blocked it due to CORS (Cross-Origin Resource Sharing) restrictions.

---

## ✅ Frontend - WHAT I DID FOR YOU

### 1. Updated api.js (src/services/api.js)

**Added:**
- `withCredentials: true` - Allow cookies and credentials
- CORS headers - Indicate support for cross-origin
- Request interceptor - Attaches auth token automatically
- Response interceptor - Handles auth failures

**Code Added:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    },
});

// Automatically add Bearer token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

### 2. Created .env File

**Location:** `real-estate-frontend/.env`

**Content:**
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0
```

**This allows:**
- Easy switching between dev, staging, prod URLs
- No hardcoded backend URLs
- Environment-specific configuration

---

## ⏳ Backend - WHAT YOU NEED TO DO

### Add CORS Configuration to Spring Boot

**Step 1: Create File**
```
Location: src/main/java/com/realestate/config/CorsConfig.java
```

**Step 2: Add This Code**
```java
package com.realestate.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://localhost:5173",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:3001"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD")
                .allowedHeaders(
                    "Origin",
                    "X-Requested-With",
                    "Content-Type",
                    "Accept",
                    "Authorization",
                    "Access-Control-Request-Method",
                    "Access-Control-Request-Headers"
                )
                .exposedHeaders(
                    "Access-Control-Allow-Origin",
                    "Access-Control-Allow-Credentials",
                    "Authorization"
                )
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

**Step 3: Restart Backend**
```bash
mvn spring-boot:run
# or restart your IDE
```

---

## 🧪 Testing

### Test 1: Check Network Requests
1. Open Frontend: http://localhost:3001
2. Open DevTools: F12
3. Go to Network tab
4. Make a request (e.g., load properties)
5. Click the request → Response headers
6. **Should see:**
   ```
   Access-Control-Allow-Origin: http://localhost:3001
   Access-Control-Allow-Credentials: true
   ```

### Test 2: Check Console
1. DevTools → Console tab
2. Should NOT see CORS errors
3. Should see successful API responses

### Test 3: Use curl (Optional)
```bash
curl -H "Origin: http://localhost:3001" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:8080/api/properties/available
```

---

## 📍 Alternative: Use @CrossOrigin on Controllers

If you don't want a separate config class, add this to each controller:

```java
@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"},
             allowCredentials = "true")
public class PropertyController {
    // ... endpoints
}
```

---

## 🌐 Production Configuration

For production, update allowed origins:

```java
.allowedOrigins(
    "https://yourdomain.com",
    "https://www.yourdomain.com",
    "https://app.yourdomain.com"
)
```

Update .env:
```
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_ENV=production
```

**Remove** localhost origins in production!

---

## 🐛 Debugging CORS Errors

### Error: "No 'Access-Control-Allow-Origin' header"
- ✅ Backend CorsConfig.java not added/deployed
- Solution: Add the CorsConfig.java file (see above)

### Error: "Access-Control-Allow-Credentials"
- ✅ `allowCredentials(true)` missing on backend
- Solution: Ensure `.allowCredentials(true)` is set

### Error: "Method not allowed"
- ✅ Method not in allowedMethods list
- Solution: Add the method (GET, POST, etc.) to backend config

---

## ✅ Checklist

**Frontend:**
- [x] api.js updated with interceptors
- [x] .env file created
- [x] API_BASE_URL uses env variable
- [x] Auth token interceptor added
- [x] Error handler for 401 added

**Backend (YOU NEED TO DO):**
- [ ] CorsConfig.java created
- [ ] File in correct package
- [ ] @Configuration annotation added
- [ ] addCorsMappings method implemented
- [ ] Backend restarted
- [ ] Allowed origins include frontend URL
- [ ] allowedMethods include your HTTP methods
- [ ] allowCredentials = true

**Testing:**
- [ ] Frontend loads without CORS error
- [ ] API requests complete successfully
- [ ] Network tab shows correct headers
- [ ] All features work (properties, favorites, etc.)

---

## 🎯 Summary

**Frontend**: ✅ Ready to go
**Backend**: ⏳ Needs CorsConfig.java

**Once you add the backend configuration:**
1. Copy CorsConfig.java from above
2. Save to: `src/main/java/com/realestate/config/CorsConfig.java`
3. Restart Spring Boot
4. Test from frontend
5. ✅ Error will be resolved!

---

**Need Help?** Check CORS_CONFIGURATION_GUIDE.md for more details.
