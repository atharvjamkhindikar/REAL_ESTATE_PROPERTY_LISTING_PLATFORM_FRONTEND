# CORS Configuration Guide

## Problem
CORS Error: `Access to XMLHttpRequest at 'http://localhost:8080/api/properties/available' from origin 'http://localhost:3001' has been blocked by CORS policy`

## Solution
The frontend and backend are running on different ports/origins, which triggers CORS restrictions.

---

## Frontend Configuration

### 1. API Service (api.js) ✅ UPDATED
- Added `withCredentials: true` for cookie support
- Added CORS headers
- Added request interceptor for auth tokens
- Added response interceptor for error handling

### 2. Environment Variables
Create a `.env` file in the frontend root directory:

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

For production:
```env
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_ENV=production
```

---

## Backend Configuration Required

### For Spring Boot Application

Add this configuration class to your backend:

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
                    "https://yourdomain.com"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

OR use `@CrossOrigin` annotation on each controller:

```java
@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, 
             allowCredentials = "true")
public class PropertyController {
    // ...
}
```

---

## Frontend Ports

Your frontend can run on any port, but update accordingly:

```bash
# Option 1: Run on port 3000 (default)
npm start

# Option 2: Run on port 3001
PORT=3001 npm start

# Option 3: Run on specific port
set PORT=3001 && npm start  (Windows)
```

---

## Debugging CORS Issues

### Check in Browser DevTools:

1. Open Browser → F12 (DevTools)
2. Go to Network tab
3. Look for failed request
4. Check "Response Headers" for:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`

### Common CORS Headers:
```
Access-Control-Allow-Origin: http://localhost:3001
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## Testing CORS

### Option 1: Using curl
```bash
curl -H "Origin: http://localhost:3001" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8080/api/properties/available
```

### Option 2: Check with Frontend Request
```javascript
// In browser console
fetch('http://localhost:8080/api/properties/available', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(r => r.json())
.catch(e => console.error('CORS Error:', e));
```

---

## Summary

✅ **Frontend Updated** - CORS headers and interceptors added  
⏳ **Backend Needs Update** - Add CORS configuration (see above)  
✅ **Environment Ready** - Create .env file with correct API URL  

Once you add the CORS configuration to your Spring Boot backend, the error will be resolved!

---

## Quick Checklist

- [x] Frontend api.js updated with CORS config
- [ ] Backend Spring Boot CORS config added
- [ ] .env file created with API_URL
- [ ] Frontend and backend ports verified
- [ ] Test request works without CORS error

---

**Status**: Frontend is ready. Backend CORS configuration needed.
