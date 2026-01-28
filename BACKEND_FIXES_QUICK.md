# EXACT CODE TO COPY-PASTE

## UserRequest.java - Add this field

```java
@Enumerated(EnumType.STRING)
private SubscriptionType subscriptionType;
```

Import:
```java
import com.realestate.model.SubscriptionType;
```

---

## AuthController.java - In register() method add

```java
if (userRequest.getSubscriptionType() == null) {
    userRequest.setSubscriptionType(SubscriptionType.FREE);
}
```

---

## UserService.java - In createUser() before save()

```java
if (userRequest.getSubscriptionType() != null) {
    user.setSubscriptionType(userRequest.getSubscriptionType());
} else {
    user.setSubscriptionType(SubscriptionType.FREE);
}
```

---

## Then run

```bash
mvn clean install
mvn spring-boot:run
```

Test: http://localhost:3001/register ✅
