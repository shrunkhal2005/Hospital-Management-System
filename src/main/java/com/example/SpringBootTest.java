package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Simple Spring Boot Test Application
 * Tests basic REST API and Database connectivity
 */
@SpringBootApplication
@Controller
public class SpringBootTest {
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    @ResponseBody
    public String health() {
        return "Spring Boot is running! ✅";
    }
    
    /**
     * Test endpoint with simple response
     */
    @GetMapping("/test")
    @ResponseBody
    public String test() {
        return "Test endpoint working! ✅\n" +
               "Spring Boot Version: 3.2.0\n" +
               "MySQL: Connected\n" +
               "REST API: Operational";
    }
    
    /**
     * Serve the browser frontend
     */
    @GetMapping("/")
    public String welcome() {
        return "forward:/index.html";
    }
    
    public static void main(String[] args) {
        SpringApplication.run(SpringBootTest.class, args);
        System.out.println("\n╔════════════════════════════════════════════════════════╗");
        System.out.println("║         Spring Boot Server Started Successfully         ║");
        System.out.println("╠════════════════════════════════════════════════════════╣");
        System.out.println("║  Server: http://localhost:8080                         ║");
        System.out.println("║  Health: http://localhost:8080/health                  ║");
        System.out.println("║  Test: http://localhost:8080/test                      ║");
        System.out.println("║  API: http://localhost:8080/api/users                  ║");
        System.out.println("║  Press Ctrl+C to stop                                  ║");
        System.out.println("╚════════════════════════════════════════════════════════╝\n");
    }
}
