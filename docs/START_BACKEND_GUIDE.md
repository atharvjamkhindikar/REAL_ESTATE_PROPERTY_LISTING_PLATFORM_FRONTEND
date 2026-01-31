# How to Start Your Backend Server

## Current Issue
Your frontend is showing `ERR_CONNECTION_REFUSED` because the backend server at `http://localhost:8080` is not running.

## Solution: Start the Backend

### Option 1: If Using IntelliJ IDEA or Eclipse
1. Open your backend project (Spring Boot application)
2. Find the main application class (usually named `RealEstateApplication.java` or similar)
3. Right-click on it and select "Run"
4. Wait for the server to start (you should see "Started Application in X seconds")

### Option 2: Using Command Line (Maven)
```bash
cd path/to/your/backend/project
mvn spring-boot:run
```

### Option 3: Using Command Line (Gradle)
```bash
cd path/to/your/backend/project
./gradlew bootRun
```

### Option 4: Using JAR file
```bash
cd path/to/your/backend/project
java -jar target/real-estate-backend-0.0.1-SNAPSHOT.jar
```

## Verify Backend is Running

1. Open your browser and go to: `http://localhost:8080/api/properties/available`
2. You should see JSON data (not an error)

## Alternative: Use AWS Deployment

If you want to use your AWS deployment instead of localhost:

### Update `.env` file:
```
REACT_APP_API_URL=http://13.220.57.64:8080/api
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
```

### Then restart your frontend:
```bash
npm start
```

## MySQL Database Requirements

Make sure your MySQL database is also running:
- MySQL should be running on port 3306
- Database name should match your application.properties
- Credentials should be correct

## Check application.properties

Your backend's `src/main/resources/application.properties` should have:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/realestate_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
server.port=8080
```

## Troubleshooting

### Port Already in Use
If you get "Port 8080 is already in use":
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -i :8080
kill -9 <PID>
```

### MySQL Connection Error
- Start MySQL service
- Verify credentials
- Check if database exists

## Quick Test Command

Test if backend is accessible:
```bash
curl http://localhost:8080/api/properties/available
```

If you see JSON data, backend is working! ✅
