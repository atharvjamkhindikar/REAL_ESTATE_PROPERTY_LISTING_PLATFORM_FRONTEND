# 🐛 AxiosError 400 - Bad Request Fix Guide

## Problem
When trying to use features like user registration, agent registration, favorites, or schedule viewing, you're getting:
```
AxiosError: Request failed with status code 400
```

## Root Cause
The **mismatch between how the frontend sends data and what the backend expects**.

The backend uses **query parameters** for certain endpoints instead of JSON request body.

---

## ✅ Fixed Issues

### 1. Favorites Service - FIXED ✓
**Problem**: Sending JSON body like `{ userId, propertyId, notes }`  
**Solution**: Now uses query parameters:
```javascript
// BEFORE (❌ Wrong)
api.post('/favorites', { userId, propertyId, notes })

// AFTER (✅ Correct)
api.post(`/favorites?userId=${userId}&propertyId=${propertyId}&notes=${encodeURIComponent(notes)}`)
```

**Affected Methods**:
- `addFavorite(userId, propertyId, notes)`
- `removeFavorite(userId, propertyId)` 
- `toggleFavorite(userId, propertyId)`
- `updateFavoriteNotes(id, notes)`

---

## 📋 Still Need to Verify

### Endpoints That May Need Similar Fixes

#### 1. **User Registration** (`POST /auth/register`)
Check if backend expects:
```javascript
// Option A: JSON Body (Current Implementation)
{
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "password123",
  phone: "+1234567890",
  role: "USER"
}

// Option B: Query Parameters
/auth/register?firstName=John&lastName=Doe&email=john@example.com&password=password123&phone=+1234567890
```

#### 2. **Agent Registration** (`POST /auth/agent-register`)
Check if backend expects query parameters:
```
/auth/agent-register?firstName=...&lastName=...&email=...&password=...&phone=...&agencyName=...&licenseNumber=...&specialization=...
```

#### 3. **Schedule Viewing** (`POST /schedule-viewings`)
Current implementation sends JSON body. Check if backend expects:
```javascript
// Current (May be wrong)
api.post('/schedule-viewings', viewingData)

// Might need
api.post(`/schedule-viewings?userId=${userId}&propertyId=${propertyId}&viewingDate=...&viewingTime=...`)
```

#### 4. **Property Images** (Multipart Form Data)
Already correctly implemented with `FormData`:
```javascript
const formData = new FormData();
formData.append('file', selectedFile);
api.post(`/properties/${propertyId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
})
```
✓ This should be correct.

---

## 🔍 How to Debug

### Step 1: Check Browser Console
1. Open Browser DevTools (F12)
2. Go to **Console** tab
3. Try the failing action
4. Look for error message like:
```
Error scheduling viewing: {
  error: "Invalid request: missing required field 'xyz'",
  message: "...",
  timestamp: "...",
  status: 400
}
```

### Step 2: Check Network Tab
1. Open **Network** tab
2. Try the failing action
3. Find the failed request (marked in red)
4. Click it and check:
   - **Request Headers** - what content-type is being sent
   - **Request Body** - what data format is used
   - **Response** - what error message backend returns

### Step 3: Backend Logs
Check your backend terminal for the exact validation error from Spring Boot.

---

## 🛠️ How to Fix Each Endpoint

### For Registration Endpoints
If you get 400 error on `/auth/register`:

**Option 1: Use Query Parameters** (if backend expects)
```javascript
export const authService = {
    register: (userData) => {
        const params = new URLSearchParams();
        params.append('firstName', userData.firstName);
        params.append('lastName', userData.lastName);
        params.append('email', userData.email);
        params.append('password', userData.password);
        params.append('phone', userData.phone);
        params.append('role', userData.role || 'USER');
        return api.post('/auth/register', undefined, { params });
    },
    // ... other methods
};
```

**Option 2: Use axios with params object** (cleaner)
```javascript
export const authService = {
    register: (userData) => 
        api.post('/auth/register', null, {
            params: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                role: userData.role || 'USER'
            }
        }),
};
```

### For ScheduleViewing
If you get 400 error on `/schedule-viewings`:

**Update the service**:
```javascript
export const scheduleViewingService = {
    scheduleViewing: (viewingData) =>
        api.post('/schedule-viewings', null, {
            params: {
                userId: viewingData.userId,
                propertyId: viewingData.propertyId,
                viewingDate: viewingData.viewingDate,
                viewingTime: viewingData.viewingTime,
                preferredContactMethod: viewingData.preferredContactMethod,
                notes: viewingData.notes
            }
        }),
    // ... other methods
};
```

---

## 📝 Complete Fixed API Service Template

If your backend consistently uses query parameters, use this template:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ========== AUTHENTICATION SERVICES ==========
export const authService = {
    register: (userData) =>
        api.post('/auth/register', null, {
            params: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                role: userData.role || 'USER',
            }
        }),

    login: (email, password) =>
        api.post('/auth/login', null, {
            params: { email, password }
        }),

    agentRegister: (agentData) =>
        api.post('/auth/agent-register', null, {
            params: {
                firstName: agentData.firstName,
                lastName: agentData.lastName,
                email: agentData.email,
                password: agentData.password,
                phone: agentData.phone,
                agencyName: agentData.agencyName,
                licenseNumber: agentData.licenseNumber,
                specialization: agentData.specialization,
                role: 'AGENT',
            }
        }),

    agentLogin: (email, password) =>
        api.post('/auth/agent-login', null, {
            params: { email, password }
        }),

    getCurrentUser: (id) =>
        api.get(`/auth/me/${id}`),
};

// ... rest of services
```

---

## ✨ What We've Fixed

✅ **Favorites Service** - All methods now use query parameters  
✅ **Error Handling** - Better error messages from backend  
✅ **Console Logging** - More detailed debugging info  

---

## 🚀 Next Steps

1. **Try the app again** after these changes
2. **Check browser console** for detailed error messages
3. **Share the backend error message** if you still get 400
4. **Apply fixes** based on your backend's actual API format

---

## 📌 Important Notes

- Always match the backend API specification
- Query parameters for filter/search endpoints
- JSON body for complex data structures  
- Multipart/form-data for file uploads
- Test each endpoint individually

---

**Last Updated**: January 27, 2026
