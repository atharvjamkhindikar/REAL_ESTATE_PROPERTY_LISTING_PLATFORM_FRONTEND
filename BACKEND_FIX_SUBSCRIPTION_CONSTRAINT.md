# 🔧 Backend Fix - Subscription Type NULL Constraint Error

**Error**: `Column 'subscription_type' cannot be null`  
**Cause**: Backend registration not properly handling subscriptionType field  
**Status**: Frontend is sending data correctly, backend needs fix  
**Fix Time**: 5-10 minutes

---

## 🐛 Problem Analysis

### Error Details
```
INSERT into users (...,subscription_type,...) values (...,?,...)
Column 'subscription_type' cannot be null
```

### Root Cause
The backend User registration controller is not mapping the `subscriptionType` field from the JSON request to the User entity. The field receives NULL, violating the database NOT NULL constraint.

---

## ✅ Frontend is Correct

**Frontend sends**:
```json
{
  "subscriptionType": "FREE"  ← Correct!
}
```

**Frontend code** (Register.js line 85):
```javascript
subscriptionType: 'FREE',  // Default subscription type
```

**No changes needed on frontend** ✅

---

## 🔧 Backend Fixes Required

Three locations need to be checked/fixed:

### FIX #1: UserRequest DTO

**File**: `src/main/java/com/realestate/dto/UserRequest.java`

**Check if this field exists**:
```java
@Enumerated(EnumType.STRING)
private SubscriptionType subscriptionType;
```

**If missing, add it**:
```java
package com.realestate.dto;

import com.realestate.model.SubscriptionType;
import com.realestate.model.UserType;
import jakarta.validation.constraints.*;

@Data
public class UserRequest {
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;
    
    @NotBlank(message = "Phone is required")
    private String phone;
    
    @NotNull(message = "User type is required")
    private UserType userType;
    
    // ⭐ ADD THIS FIELD (if missing):
    @Enumerated(EnumType.STRING)
    private SubscriptionType subscriptionType;
    
    // Getters and setters (auto-generate with @Data or Lombok)
}
```

---

### FIX #2: AuthController Register Method

**File**: `src/main/java/com/realestate/controller/AuthController.java`

**Find the register method and update it**:

```java
@PostMapping("/register")
public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody UserRequest userRequest) {
    try {
        // ⭐ ADD THIS - Ensure subscriptionType is set
        if (userRequest.getSubscriptionType() == null) {
            userRequest.setSubscriptionType(SubscriptionType.FREE);
        }
        
        User user = userService.createUser(userRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", userService.toUserResponse(user)));
    } catch (RuntimeException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
    }
}
```

---

### FIX #3: UserService.createUser()

**File**: `src/main/java/com/realestate/service/UserService.java`

**Find the createUser method and ensure subscriptionType is set**:

```java
public User createUser(UserRequest userRequest) {
    // Check if email already exists
    if (userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
        throw new DuplicateResourceException("User", "email", userRequest.getEmail());
    }

    User user = new User();
    user.setFirstName(userRequest.getFirstName());
    user.setLastName(userRequest.getLastName());
    user.setEmail(userRequest.getEmail());
    user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
    user.setPhone(userRequest.getPhone());
    user.setUserType(userRequest.getUserType());
    user.setActive(true);
    
    // ⭐ ADD THIS - Set subscriptionType
    if (userRequest.getSubscriptionType() != null) {
        user.setSubscriptionType(userRequest.getSubscriptionType());
    } else {
        user.setSubscriptionType(SubscriptionType.FREE);  // Default
    }

    return userRepository.save(user);
}
```

---

## 📋 Implementation Checklist

### Step 1: Update UserRequest DTO
- [ ] Open `UserRequest.java`
- [ ] Check for `subscriptionType` field
- [ ] Add field if missing with `@Enumerated(EnumType.STRING)` annotation
- [ ] Ensure getter/setter exist (or use @Data from Lombok)
- [ ] Save file

### Step 2: Update AuthController
- [ ] Open `AuthController.java`
- [ ] Find `register()` method
- [ ] Add null-check before calling `userService.createUser()`
- [ ] Set default to `SubscriptionType.FREE` if null
- [ ] Save file

### Step 3: Update UserService
- [ ] Open `UserService.java`
- [ ] Find `createUser()` method
- [ ] Add line to set subscriptionType on user object
- [ ] Add null-check with default if needed
- [ ] Save file

### Step 4: Rebuild
- [ ] Run: `mvn clean install`
- [ ] Or rebuild in IDE

### Step 5: Restart Backend
- [ ] Stop backend server
- [ ] Run: `mvn spring-boot:run`
- [ ] Wait for "Started Application" message

### Step 6: Test
- [ ] Frontend refresh: http://localhost:3001/register
- [ ] Fill registration form
- [ ] Click "Create Account"
- [ ] Should succeed ✅

---

## 🔍 Verification

After applying fixes, verify:

**Check 1: Backend Starts Without Errors**
```
Started Application in X seconds
Tomcat initialized with port(s): 8080
No ERROR messages in logs
```

**Check 2: Registration Works**
- Frontend: http://localhost:3001/register
- Fill form with test data
- Click "Create Account"
- Should see success message ✅

**Check 3: User Created in Database**
- Check database: `SELECT * FROM users WHERE email = 'test@example.com'`
- Should have subscription_type = 'FREE'
- Should have all other fields filled

---

## 💡 Why This Works

1. **Frontend sends** `subscriptionType: 'FREE'` ✅
2. **UserRequest DTO** has field to receive it ✅
3. **AuthController** ensures it's not null ✅
4. **UserService** explicitly sets it on User ✅
5. **User entity** has `@Column(nullable = false)` ✅
6. **Database** receives 'FREE' value ✅
7. **Insert succeeds** ✅

---

## 🆘 If Still Failing

### Error: "Cannot find method setSubscriptionType"
- **Solution**: Check if User model has the setter
- Generate getters/setters using IDE or Lombok

### Error: "subscriptionType field not found"
- **Solution**: Check UserRequest DTO has the field
- Ensure import: `import com.realestate.model.SubscriptionType;`

### Error: "SubscriptionType enum not found"
- **Solution**: Check enum exists in model package
- File should be: `src/main/java/com/realestate/model/SubscriptionType.java`

---

## 📝 Summary

| Component | Check | Action |
|-----------|-------|--------|
| UserRequest DTO | Has subscriptionType field? | Add if missing |
| AuthController | Sets default if null? | Add null-check |
| UserService | Sets on user object? | Add setter call |
| User Model | Has subscription_type column? | Should exist |
| Database | Has NOT NULL constraint? | Should exist |

---

## ✅ Success Indicators

Once fixed:
- ✅ Registration page loads
- ✅ Fill form and submit
- ✅ "Registration successful!" message
- ✅ Redirect to login
- ✅ Can login with new account
- ✅ No database errors

---

**Apply these 3 fixes and registration will work!** 🚀
