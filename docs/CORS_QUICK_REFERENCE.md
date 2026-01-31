# CORS Fix - Quick Reference Card

## 🔴 The Problem
```
CORS Error: Access blocked
Frontend: http://localhost:3001
Backend: http://localhost:8080
```

## 🟢 The Solution

### Frontend ✅ DONE
```javascript
// src/services/api.js - UPDATED
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
    headers: { 'Access-Control-Allow-Origin': '*' }
});

// Interceptors added for auth & errors
```

### Backend ⏳ TO DO
```java
// Add: src/main/java/com/realestate/config/CorsConfig.java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3001")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                .allowCredentials(true);
    }
}
```

## 📋 Backend Setup (Copy-Paste Ready)

1. **Create File:**
   ```
   src/main/java/com/realestate/config/CorsConfig.java
   ```

2. **Add Code:**
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
                       "http://localhost:5173"
                   )
                   .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                   .allowedHeaders("*")
                   .allowCredentials(true)
                   .maxAge(3600);
       }
   }
   ```

3. **Restart Backend**
   ```
   mvn spring-boot:run
   ```

## ✅ Files Created

✅ `.env` - Frontend configuration  
✅ `src/services/api.js` - Updated with CORS  
✅ `CORS_CONFIGURATION_GUIDE.md` - Complete guide  
✅ `CORS_FIX_SETUP_GUIDE.md` - Step-by-step  
✅ This quick card!  

## 🧪 Quick Test

Open DevTools (F12) → Network tab → Check response headers:
```
Access-Control-Allow-Origin: http://localhost:3001 ✅
```

## 📊 Status
- Frontend: ✅ Ready
- Backend: ⏳ Add CorsConfig.java
- When done: ✅ Error fixed!
