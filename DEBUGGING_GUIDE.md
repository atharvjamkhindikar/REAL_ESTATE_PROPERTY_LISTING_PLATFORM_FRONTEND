# 🔧 AxiosError 400 - Complete Troubleshooting Guide

## What is Error 400?
**HTTP 400 Bad Request** means your frontend is sending data in the wrong format that the backend cannot understand.

---

## 🎯 Most Common Causes & Solutions

### Cause 1: JSON Body vs Query Parameters Mismatch

**Symptom**: Getting 400 when trying to register, login, add favorites, or schedule viewing

**Root Cause**: Backend might expect **query parameters** but frontend sends **JSON body** (or vice versa)

#### Example - Favorites (ALREADY FIXED ✅)
```javascript
// ❌ WRONG - Sending JSON body
const response = await api.post('/favorites', {
    userId: 1,
    propertyId: 5,
    notes: "Nice property"
});

// ✅ CORRECT - Using query parameters
const response = await api.post('/favorites?userId=1&propertyId=5&notes=Nice+property');
```

#### If Registration Still Fails (Need to Try This)
```javascript
// Current implementation (might be wrong):
authService.register({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "pass123",
    phone: "+1234567890",
    role: "USER"
})

// Try this instead in api.js:
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
    })
```

---

### Cause 2: Missing or Invalid Fields

**Symptom**: Getting 400 with message like "field 'xyz' is required" or "Invalid format"

**Solution**: Check backend validation rules

Common field issues:
- ❌ Missing required fields
- ❌ Wrong field names (firstName vs first_name)
- ❌ Wrong data types (string instead of number)
- ❌ Invalid email format
- ❌ Password too short
- ❌ Phone number format

**Debug**: Look at backend error response in Network tab

---

### Cause 3: Content-Type Header Issues

**Symptom**: Getting 400 on file uploads or multipart requests

**Solution**: Ensure correct Content-Type
```javascript
// ✅ CORRECT for file uploads
const formData = new FormData();
formData.append('file', file);
api.post('/properties/:id/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// ❌ WRONG - Don't set Content-Type for form data
// Axios will automatically set it with correct boundary
```

---

### Cause 4: Path Parameter Issues

**Symptom**: Getting 400 when path param might be null/undefined

**Solution**: Always validate parameters before API call
```javascript
// ❌ WRONG
const propertyId = null;
api.get(`/properties/${propertyId}`); // GET /properties/null

// ✅ CORRECT
const propertyId = 5;
if (propertyId) {
    api.get(`/properties/${propertyId}`); // GET /properties/5
}
```

---

## 🔍 Step-by-Step Debugging

### Step 1: Open Browser DevTools
Press **F12** → Go to **Network** tab

### Step 2: Reproduce the Error
Perform the action that causes 400 error

### Step 3: Find the Failed Request
Look for red (failed) request in Network tab

### Step 4: Click the Request
Examine these sections:

#### Request Details
- **Method**: POST, GET, PUT, DELETE?
- **URL**: Is path correct? `/auth/register` or `/auth/register?param=value`?
- **Headers**: Is Content-Type correct?
- **Body**: What data is being sent?

#### Response
- **Status**: Should be 400
- **Response Body**: Will contain error message

### Step 5: Copy Error Details
Look for a message like:
```json
{
  "error": "Field 'firstName' is required",
  "message": "Invalid request",
  "timestamp": "2026-01-27T18:30:00Z",
  "status": 400
}
```

### Step 6: Check Backend Endpoint
Open backend code to see:
- What parameters does endpoint expect?
- Are they in query string or request body?
- What validation rules apply?

---

## 🛠️ API Endpoint Format Checker

### Check Your Backend's Endpoint

#### Pattern 1: Query Parameters Endpoint
```
Backend: POST /api/auth/register?firstName=John&lastName=Doe&email=test@test.com...
Frontend Fix:
register: (userData) =>
    api.post('/auth/register', null, {
        params: userData
    })
```

#### Pattern 2: JSON Body Endpoint  
```
Backend: POST /api/auth/register
         Content-Type: application/json
         { "firstName": "John", "lastName": "Doe", ... }
Frontend Implementation (Current):
register: (userData) =>
    api.post('/auth/register', userData)
```

#### Pattern 3: Path Parameter Endpoint
```
Backend: PUT /api/favorites/:id/notes?notes=value
Frontend Fix:
updateFavoriteNotes: (id, notes) =>
    api.put(`/favorites/${id}/notes`, null, {
        params: { notes }
    })
```

---

## 📋 Quick Test Checklist

Before reporting an error:

- [ ] Is backend running on `http://localhost:8080`?
- [ ] Are all required fields filled in the form?
- [ ] Does error message appear in console?
- [ ] Have you checked Network tab for request/response?
- [ ] Is the request URL correct?
- [ ] Is the HTTP method correct (POST, GET, PUT, DELETE)?
- [ ] Is the Content-Type header correct?
- [ ] Are query parameters properly encoded?
- [ ] Are field names matching backend expectations?

---

## 🚀 How to Fix Different Endpoints

### If Registration (POST /auth/register) Returns 400

**Test 1: Check field names**
Backend might expect: `firstName`, `lastName`, `email`, `password`, `phone`, `role`
Frontend must send same field names (case-sensitive!)

**Test 2: Check format**
Try both formats:
```javascript
// Format A: JSON Body
api.post('/auth/register', {
    firstName: "John",
    lastName: "Doe",
    email: "john@test.com",
    password: "pass123",
    phone: "+1234567890"
})

// Format B: Query Parameters
api.post('/auth/register', null, {
    params: {
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        password: "pass123",
        phone: "+1234567890"
    }
})
```

**Test 3: Check field validation**
- Email format: must be valid email
- Password: minimum length (usually 6+)
- Phone: might need specific format
- Names: might not allow special characters

### If Schedule Viewing Returns 400

**Check these fields**:
```javascript
{
    userId: number,           // Required
    propertyId: number,       // Required
    viewingDate: "YYYY-MM-DD", // Required, must be future date
    viewingTime: "HH:MM",     // Required, 24-hour format
    preferredContactMethod: "PHONE|EMAIL|SMS|WHATSAPP", // Enum
    notes: string             // Optional
}
```

### If Property Image Upload Returns 400

**Common issues**:
- [ ] File size > 5MB?
- [ ] File not an image (jpg, png, gif, webp)?
- [ ] FormData not being used?
- [ ] Headers not set correctly?

**Correct implementation**:
```javascript
const formData = new FormData();
formData.append('file', file); // file from <input type="file">

api.post(`/properties/${propertyId}/images`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
```

---

## 📝 Error Message Translation

| Backend Error | Meaning | Solution |
|---------------|---------|----------|
| "Invalid request" | Something wrong with format | Check all fields |
| "Missing field 'xyz'" | Required field not sent | Add the field |
| "Invalid email" | Email format wrong | Use valid email |
| "Password too short" | Password < 6 chars | Use longer password |
| "Email already exists" | User registered already | Use different email |
| "Invalid date format" | Date not YYYY-MM-DD | Fix date format |
| "Invalid HTTP method" | Using wrong method | Check POST/GET/PUT/DELETE |
| "Not found" | Resource doesn't exist | Check ID/path |
| "Unauthorized" | Not logged in | Login first |
| "Forbidden" | Don't have permission | Check user role |

---

## 💡 Pro Tips

### Tip 1: Use Axios Interceptor for Debugging
```javascript
api.interceptors.response.use(
    response => response,
    error => {
        console.log('API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method,
        });
        return Promise.reject(error);
    }
);
```

### Tip 2: Test API Directly
Use Postman or curl to test endpoints:
```bash
# Test registration with query parameters
curl -X POST "http://localhost:8080/api/auth/register?firstName=John&lastName=Doe&email=john@test.com&password=pass123&phone=%2B1234567890" \
  -H "Content-Type: application/json"

# Test with JSON body
curl -X POST "http://localhost:8080/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@test.com","password":"pass123","phone":"+1234567890"}'
```

### Tip 3: Check Backend Logs
Look at backend server console for Spring Boot validation errors.

---

## 🆘 Still Having Issues?

### Provide These Details:
1. **Which action fails?** (register, login, add favorite, etc.)
2. **Full error message** from console
3. **Network tab details**:
   - Request URL
   - Request method
   - Request body
   - Response status
   - Response body
4. **Backend error message** from server logs

### Then We Can:
1. Identify exact format mismatch
2. Update api.js with correct endpoint format
3. Test and verify fix

---

**Remember**: The 400 error means "I don't understand your request format"

The solution is always: **Send data in the format the backend expects**

Check backend code → Understand format → Update frontend → Test ✅

---

**Last Updated**: January 27, 2026
