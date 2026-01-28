# ⚠️ Backend Issue - SubscriptionType NOT Null Constraint

**Issue**: Registration fails because `subscription_type` column receives NULL value  
**Root Cause**: Backend registration controller not properly handling subscriptionType field  
**Status**: Frontend is correct, Backend needs fix

---

## 🐛 The Problem

**Error**: 
```
Column 'subscription_type' cannot be null
[INSERT into users (...,subscription_type,...)]
```

**What's Happening**:
1. Frontend sends: `subscriptionType: 'FREE'` ✅
2. Backend receives request ✅
3. Backend attempts to create User ❌
4. User table requires `subscription_type` NOT NULL ❌
5. No value is saved → NULL → CONSTRAINT VIOLATION ❌

---

## 🔍 Root Cause Analysis

The User model has:
```java
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private SubscriptionType subscriptionType = SubscriptionType.FREE;
```

**Problem**: The default value in the Java class (`= SubscriptionType.FREE`) doesn't apply when deserializing JSON if the field is NULL in the request.

**Why it's NULL**:
- The backend UserController/AuthController is not properly mapping the `subscriptionType` field from JSON to the User object
- Spring might not be deserializing the enum correctly
- Or the DTO/request mapping is missing this field

---

## ✅ Frontend is Correct

The frontend is sending:
```json
{
  "firstName": "...",
  "lastName": "...",
  "email": "...",
  "password": "...",
  "confirmPassword": "...",
  "phone": "...",
  "userType": "BUYER",
  "subscriptionType": "FREE"  ✅ Correct field name & value
}
```

**Status**: ✅ Frontend code is correct

---

## 🔧 Backend Fix Required

### The Issue
The backend registration controller (likely `AuthController`) is not properly handling the `subscriptionType` field. Here's what needs to be checked/fixed on the backend:

### Option 1: Update AuthController/UserController
Make sure the registration method properly sets the subscriptionType:

```java
@PostMapping("/register")
public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody UserRequest userRequest) {
    try {
        // Ensure subscriptionType is set
        if (userRequest.getSubscriptionType() == null) {
            userRequest.setSubscriptionType(SubscriptionType.FREE);
        }
        
        User user = userService.createUser(userRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", userService.toUserResponse(user)));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
    }
}
```

### Option 2: Update UserRequest DTO
Ensure the UserRequest DTO has the subscriptionType field:

```java
@Data
public class UserRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String confirmPassword;
    private String phone;
    private UserType userType;
    
    @Enumerated(EnumType.STRING)
    private SubscriptionType subscriptionType = SubscriptionType.FREE;  // Add this
    
    // ... getters and setters
}
```

### Option 3: Update UserService
Ensure the service sets a default if none provided:

```java
public User createUser(UserRequest userRequest) {
    User user = new User();
    
    // ... other fields ...
    
    // Set subscription type with default
    if (userRequest.getSubscriptionType() != null) {
        user.setSubscriptionType(userRequest.getSubscriptionType());
    } else {
        user.setSubscriptionType(SubscriptionType.FREE);  // Default
    }
    
    return userRepository.save(user);
}
```

---

## 📋 What to Check on Backend

1. **UserRequest DTO**: Does it have `subscriptionType` field?
   - [ ] Field exists
   - [ ] Has getter/setter
   - [ ] Has @Enumerated(EnumType.STRING) if needed
   - [ ] Has default value

2. **AuthController/UserController**: Is subscriptionType being handled?
   - [ ] Field is accepted in register endpoint
   - [ ] Default is set if not provided
   - [ ] Properly passed to UserService

3. **UserService**: Does createUser handle subscriptionType?
   - [ ] Field is set on User object
   - [ ] Default value applied if null
   - [ ] User is saved with subscriptionType

4. **User Entity**: Is the field properly decorated?
   - [ ] @Enumerated(EnumType.STRING) present
   - [ ] @Column(nullable = false) present
   - [ ] Field is properly named

---

## 🎯 Summary

**Frontend Status**: ✅ Correct - Sending `subscriptionType: 'FREE'`

**Backend Status**: ❌ Issue - Not properly receiving/handling subscriptionType

**Next Steps**:
1. Check if UserRequest DTO has subscriptionType field
2. Check if AuthController properly handles this field
3. Check if UserService applies default if null
4. Add null-checks and defaults in the registration flow

---

## 📞 Testing After Backend Fix

Once the backend is fixed:

1. Go to: http://localhost:3001/register
2. Fill form with any data
3. Click "Create Account"
4. Should succeed ✅

---

## 💡 Alternative Quick Fix (Temporary)

If backend changes take time, you could:
1. Have backend User table set a default value at database level
2. Use a database migration to update the constraint
3. Or modify the User model to not require subscriptionType during registration

```sql
ALTER TABLE users 
MODIFY subscription_type VARCHAR(255) DEFAULT 'FREE' NOT NULL;
```

---

**Note**: The frontend is sending the correct data. The issue is entirely on the backend side in how it's handling the subscriptionType field during user registration.
