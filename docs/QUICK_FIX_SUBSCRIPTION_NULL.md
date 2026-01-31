# ⚡ Quick Fix - Subscription Type NULL Error

**Issue**: `Column 'subscription_type' cannot be null`  
**Cause**: Backend not handling subscriptionType field  
**Status**: Frontend correct, backend needs 3 fixes  
**Time**: 5 minutes

---

## 🎯 3-Step Backend Fix

### STEP 1: UserRequest.java
Add this field:
```java
@Enumerated(EnumType.STRING)
private SubscriptionType subscriptionType;
```

### STEP 2: AuthController.java
In register() method, add:
```java
if (userRequest.getSubscriptionType() == null) {
    userRequest.setSubscriptionType(SubscriptionType.FREE);
}
```

### STEP 3: UserService.java
In createUser() method, add:
```java
if (userRequest.getSubscriptionType() != null) {
    user.setSubscriptionType(userRequest.getSubscriptionType());
} else {
    user.setSubscriptionType(SubscriptionType.FREE);
}
```

---

## ✅ Then

1. Save all files
2. Run: `mvn clean install`
3. Run: `mvn spring-boot:run`
4. Test registration at http://localhost:3001/register

---

## 📊 What Happens

**Before Fix**:
- Frontend sends: `subscriptionType: 'FREE'` ✅
- Backend receives: subscriptionType = NULL ❌
- Database: Cannot insert NULL ❌

**After Fix**:
- Frontend sends: `subscriptionType: 'FREE'` ✅
- Backend receives: subscriptionType = 'FREE' ✅
- Database: Inserts 'FREE' successfully ✅

---

**That's it! Registration will work after these fixes.** 🎉
