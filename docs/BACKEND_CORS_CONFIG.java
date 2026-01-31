package com.realestate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

/**
 * CORS Configuration for AWS Deployment
 *
 * This configuration allows:
 * - Local development (localhost:3000)
 * - AWS S3 deployment (your S3 bucket URL)
 * - Backend API access (port 8080)
 *
 * IMPORTANT: Update the allowed origins with your actual AWS URLs
 */
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        // Local development
                        "http://localhost:3000",
                        "http://localhost:3001",

                        // AWS S3 Static Website
                        "http://realestate-frontend.s3-website-us-east-1.amazonaws.com",

                        // AWS EC2 Backend (if needed)
                        "http://13.220.57.64:8080",
                        "http://13.220.57.64",

                        // Add your custom domain here if you have one
                        // "https://yourdomain.com",
                        // "https://www.yourdomain.com"

                        // CloudFront distribution (if using)
                        // "https://d1234567890.cloudfront.net"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600); // Cache preflight requests for 1 hour
            }
        };
    }

    /**
     * Alternative CORS configuration using CorsFilter
     * Use this if the above method doesn't work
     */
    // @Bean
    // public CorsFilter corsFilter() {
    //     UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    //     CorsConfiguration config = new CorsConfiguration();
    //     config.setAllowCredentials(true);
    //     config.setAllowedOriginPatterns(Arrays.asList(
    //         "http://localhost:*",
    //         "http://*.s3-website-*.amazonaws.com",
    //         "https://*.cloudfront.net"
    //     ));
    //     config.setAllowedHeaders(Arrays.asList("*"));
    //     config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    //     config.setMaxAge(3600L);
    //     source.registerCorsConfiguration("/api/**", config);
    //     return new CorsFilter(source);
    // }
}

/**
 * USAGE INSTRUCTIONS:
 *
 * 1. Copy this file to: src/main/java/com/realestate/config/CorsConfig.java
 *
 * 2. Update the allowed origins with your actual URLs:
 *    - Your S3 bucket URL
 *    - Your CloudFront URL (if using)
 *    - Your custom domain (if you have one)
 *
 * 3. Rebuild and restart your backend:
 *    mvn clean package
 *    java -jar target/backend.jar
 *
 * 4. Test CORS:
 *    curl -H "Origin: http://realestate-frontend.s3-website-us-east-1.amazonaws.com" \
 *         -H "Access-Control-Request-Method: GET" \
 *         -H "Access-Control-Request-Headers: Content-Type" \
 *         -X OPTIONS \
 *         http://13.220.57.64:8080/api/properties/available
 *
 * 5. Deploy to AWS EC2 and test from browser
 *
 * SECURITY NOTES:
 * - Never use "*" for allowedOrigins in production
 * - Always specify exact origins
 * - Use HTTPS in production
 * - Restrict allowedMethods to only what you need
 *
 * FOR PRODUCTION:
 * - Use environment variables for URLs
 * - Enable HTTPS/TLS
 * - Use security groups to restrict access
 * - Consider using AWS API Gateway
 */
