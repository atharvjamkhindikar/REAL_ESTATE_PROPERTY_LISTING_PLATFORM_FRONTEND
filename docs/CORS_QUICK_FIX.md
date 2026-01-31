# 🔧 CORS Fix - Quick Implementation

**Issue**: CORS error blocking API requests  
**Solution**: Add CORS configuration to backend  
**Time**: 5 minutes

---

## ⚡ Quick Fix

### STEP 1: Create CorsConfig.java

Location: `src/main/java/com/realestate/config/CorsConfig.java`

Copy this code:

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
                .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### STEP 2: Rebuild Backend

```bash
cd "D:\CDAC Project\Atharva\Atharva\real-estate-backend"
mvn clean install
```

### STEP 3: Run Backend

```bash
mvn spring-boot:run
```

### STEP 4: Refresh Frontend

Go to any page that makes API calls. Should work now! ✅

---

## ✅ That's It!

The CORS configuration file will:
- ✅ Allow requests from localhost:3001
- ✅ Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
- ✅ Allow all headers
- ✅ Fix all CORS errors

---

## 🔍 Verify It Works

Open browser → Developer Tools → Network tab

Check any API response headers:
```
Access-Control-Allow-Origin: http://localhost:3001 ✅
```

If present, CORS is working!

---

**Create the file, rebuild, restart, and you're done!** 🚀
