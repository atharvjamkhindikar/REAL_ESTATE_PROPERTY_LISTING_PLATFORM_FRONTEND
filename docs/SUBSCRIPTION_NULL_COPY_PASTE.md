# 🚀 COPY-PASTE FIX - Subscription Type NULL

**All the code you need - just copy and paste into your backend files.**

---

## AuthController.java - register() Method

**Find your register() method and add this null-check at the very start:**

```java
@PostMapping("/register")
public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody UserRequest userRequest) {
    try {
        // Add this line:
        if (userRequest.getSubscriptionType() == null) {
            userRequest.setSubscriptionType(SubscriptionType.FREE);
        }
        
        // Rest of your method continues below...
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

## UserService.java - createUser() Method

**In your createUser method, BEFORE the line `return userRepository.save(user);`, add:**

```java
// Add these lines before save:
if (userRequest.getSubscriptionType() != null) {
    user.setSubscriptionType(userRequest.getSubscriptionType());
} else {
    user.setSubscriptionType(SubscriptionType.FREE);
}
```

**Your method should look like:**

```java
public User createUser(UserRequest userRequest) {
    // ... existing code ...
    
    User user = new User();
    user.setFirstName(userRequest.getFirstName());
    user.setLastName(userRequest.getLastName());
    user.setEmail(userRequest.getEmail());
    user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
    user.setPhone(userRequest.getPhone());
    user.setUserType(userRequest.getUserType());
    user.setActive(true);
    
    // ADD THESE LINES:
    if (userRequest.getSubscriptionType() != null) {
        user.setSubscriptionType(userRequest.getSubscriptionType());
    } else {
        user.setSubscriptionType(SubscriptionType.FREE);
    }
    
    return userRepository.save(user);  // ← After the above lines
}
```

---

## Then Run

```bash
cd "D:\CDAC Project\Atharva\Atharva\real-estate-backend"
mvn clean install
mvn spring-boot:run
```

Test: http://localhost:3001/register ✅

---

## That's It!

Two small additions:
1. Null-check in AuthController
2. Setter in UserService

Registration will work! 🎉
